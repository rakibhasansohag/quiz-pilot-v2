import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
	const { pathname } = req.nextUrl;

	if (
		pathname.startsWith('/api') ||
		pathname.startsWith('/_next') ||
		pathname.startsWith('/static') ||
		pathname.includes('.')
	) {
		return NextResponse.next();
	}

	// protected paths
	if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
		const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
		console.log('token from middleware', token);
		if (!token) {
			const loginUrl = new URL('/login', req.url);
			loginUrl.searchParams.set('callbackUrl', req.nextUrl.href);
			return NextResponse.redirect(loginUrl);
		}

		console.log('token', token);

		const sid = req.cookies.get('sid')?.value ?? null;

		console.log('sid', sid);

		// ERROR GOT SOMETHING
		if (sid) {
			// validate server-side
			try {
				const validateUrl = new URL('/api/auth/validate-session', req.url);
				const res = await fetch(validateUrl.toString(), {
					method: 'POST',
					headers: {
						'content-type': 'application/json',
						cookie: req.headers.get('cookie') || '',
					},
					body: JSON.stringify({ sub: token.id ?? token.sub, sid }),
				});
				console.log('validate res', res);

				const json = await res.json().catch(() => ({ ok: false }));
				console.log('validate json', json);
				if (!res.ok || !json.ok) {
					const loginUrl = new URL('/login', req.url);
					loginUrl.searchParams.set('callbackUrl', req.nextUrl.href);
					const out = NextResponse.redirect(loginUrl);
					out.cookies.delete('sid');
					return out;
				}
			} catch (e) {
				console.warn('sid validate error', e);
			}
		}
		// If sid missing, allow request so client can create it after page load.
		if (pathname.startsWith('/admin') && token.role !== 'admin') {
			return NextResponse.redirect(new URL('/', req.url));
		}
		return NextResponse.next();
	}

	// Don't let signed-in users visit /login or /signup
	if (pathname === '/login' || pathname === '/signup') {
		const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
		if (token) return NextResponse.redirect(new URL('/', req.url));
	}

	return NextResponse.next();
}

export const config = { matcher: ['/dashboard/:path*', '/admin/:path*'] };
