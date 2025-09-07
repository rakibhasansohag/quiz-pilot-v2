import { NextResponse } from 'next/server';
import { getUserFromCookies } from './lib/getUserFromCookies';

export async function middleware(req) {
	const { pathname } = req.nextUrl;

	// allow public/static/api/_next assets
	if (
		pathname.startsWith('/api') ||
		pathname.startsWith('/_next') ||
		pathname.startsWith('/static') ||
		pathname.includes('.')
	) {
		return NextResponse.next();
	}

	if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
		try {
			// decode token in Edge (jose)
			const user = await getUserFromCookies();

			// no token / invalid JWT -> redirect to login
			if (!user) {
				const loginUrl = new URL('/login', req.url);
				loginUrl.searchParams.set('callbackUrl', req.nextUrl.href);
				const res = NextResponse.redirect(loginUrl);
				// remove token cookie client-side (in response)
				res.cookies.delete('token');
				return res;
			}

			// call server-side endpoint to check session DB
			// forward cookies so the server endpoint can also access token if needed
			const validateUrl = new URL('/api/auth/validate-session', req.url);
			const validateRes = await fetch(validateUrl.toString(), {
				method: 'POST',
				headers: {
					// forward cookie header (so server can verify if needed)
					cookie: req.headers.get('cookie') || '',
					'content-type': 'application/json',
				},

				body: JSON.stringify({ sub: user.sub, sid: user.sid }),
			});

			// expect JSON { ok: true } if session valid
			const json = await validateRes.json().catch(() => ({ ok: false }));

			if (!validateRes.ok || !json.ok) {
				const loginUrl = new URL('/login', req.url);
				loginUrl.searchParams.set('callbackUrl', req.nextUrl.href);
				const res = NextResponse.redirect(loginUrl);
				res.cookies.delete('token');
				return res;
			}

			// extra role guard for /admin
			if (pathname.startsWith('/admin') && user.role !== 'admin') {
				return NextResponse.redirect(new URL('/', req.url));
			}

			return NextResponse.next();
		} catch (err) {
			console.error('Middleware auth error:', err);
			const loginUrl = new URL('/login', req.url);
			loginUrl.searchParams.set('callbackUrl', req.nextUrl.href);
			const res = NextResponse.redirect(loginUrl);
			res.cookies.delete('token');
			return res;
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/dashboard/:path*', '/admin/:path*'],
};
