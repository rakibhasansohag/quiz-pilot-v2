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

	// Protected routes
	if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
		const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
		const token = await getToken({ req, secret });
		console.log('middleware token from getToken:', token);

		// No token -> redirect to login as before
		if (!token) {
			const loginUrl = new URL('/login', req.url);
			loginUrl.searchParams.set('callbackUrl', req.nextUrl.href);
			return NextResponse.redirect(loginUrl);
		}

		// If there's a token, check sid cookie if present
		const sid = req.cookies.get?.('sid')?.value ?? null;
		console.log('middleware sid cookie:', sid);

		if (sid) {
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
				console.log('middleware validate res status:', res.status);
				const json = await res.json().catch(() => ({ ok: false }));
				console.log('middleware validate json:', json);

				// If validation succeeds, proceed normally
				if (res.ok && json.ok) {
					return NextResponse.next();
				}

				console.warn(
					'sid validation failed; deleting sid and allowing client to recreate it',
					json,
				);
				const out = NextResponse.next();
				out.cookies.delete('sid');
				return out;
			} catch (e) {
				console.warn('sid validate error (network):', e);
				// allow request so client can handle session recreation
				return NextResponse.next();
			}
		}

		// If sid missing, allow request so client can create one after page load.
		if (pathname.startsWith('/admin') && token.role !== 'admin') {
			return NextResponse.redirect(new URL('/', req.url));
		}
		return NextResponse.next();
	}

	// Prevent signed-in users visiting auth pages
	if (pathname === '/login' || pathname === '/signup') {
		const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
		const token = await getToken({ req, secret });
		if (token) return NextResponse.redirect(new URL('/', req.url));
	}

	return NextResponse.next();
}

export const config = { matcher: ['/dashboard/:path*', '/admin/:path*'] };
