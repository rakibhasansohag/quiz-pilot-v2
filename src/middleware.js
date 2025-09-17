// file: /middleware.js
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
		// ensure secret comes from same env name used in NextAuth
		const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
		const token = await getToken({ req, secret });
		console.log('middleware token from getToken:', token);

		if (!token) {
			const loginUrl = new URL('/login', req.url);
			loginUrl.searchParams.set('callbackUrl', req.nextUrl.href);
			return NextResponse.redirect(loginUrl);
		}

		// optional sid check (your existing logic)
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
