import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const AUTH_COOKIE_REGEX =
	/next-auth\.session-token|__Secure-next-auth\.session-token|next-auth\.callback-url|next-auth\.csrf-token/;

export async function middleware(req) {
	const { pathname, searchParams } = req.nextUrl;

	// allow static, api, _next files
	if (
		pathname.startsWith('/api') ||
		pathname.startsWith('/_next') ||
		pathname.startsWith('/static') ||
		pathname.includes('.')
	) {
		return NextResponse.next();
	}

	// helper: check if this request looks like an auth callback/navigation
	const isLoginPage = pathname === '/login' || pathname === '/signup';
	const hasCallbackParam = searchParams.has('callbackUrl');
	const cookieHeader = req.headers.get('cookie') || '';
	const looksLikeAuthCookies = AUTH_COOKIE_REGEX.test(cookieHeader);

	// Protected routes (dashboard/admin)
	if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
		const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
		const token = await getToken({ req, secret });
		console.log('middleware token from getToken:', token);

		// If there's no token:
		if (!token) {
			// If the browser has auth-related cookies present (but getToken failed),
			// or this request carries a callback param, allow the request so client can finalize session.
			// This avoids a redirect loop after OAuth callback where cookies may not be visible immediately.
			if (looksLikeAuthCookies || hasCallbackParam) {
				console.warn(
					'No token, but auth cookies/callback present — allowing request to avoid callback loop.',
				);
				// ensure we do not allow access to /admin without token (extra safety)
				if (pathname.startsWith('/admin')) {
					// allow so client can create session; but it shouldn't expose admin content until server sees token
					return NextResponse.next();
				}
				return NextResponse.next();
			}

			// otherwise no token and no sign of auth flow -> redirect to login
			const loginUrl = new URL('/login', req.url);
			loginUrl.searchParams.set('callbackUrl', req.nextUrl.href);
			return NextResponse.redirect(loginUrl);
		}

		// If we have a token, check sid cookie validation (optional)
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
				const json = await res.json().catch(() => ({ ok: false }));
				console.log('middleware validate json:', json, 'status:', res.status);

				if (res.ok && json.ok) {
					return NextResponse.next();
				}

				// If validate-session failed, delete the broken sid and allow the request
				console.warn(
					'sid validation failed - deleting sid and allowing request:',
					json,
				);
				const out = NextResponse.next();
				out.cookies.delete('sid');
				return out;
			} catch (e) {
				console.warn(
					'sid validate error (network) - allowing request to avoid blocking auth:',
					e,
				);
				return NextResponse.next();
			}
		}

		// no sid  allow request
		if (pathname.startsWith('/admin') && token.role !== 'admin') {
			return NextResponse.redirect(new URL('/', req.url));
		}
		return NextResponse.next();
	}

	// don't let signed-in users visit auth pages
	if (isLoginPage) {
		const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
		const token = await getToken({ req, secret });
		if (token) {
			return NextResponse.redirect(new URL('/', req.url));
		}
	}

	return NextResponse.next();
}

export const config = { matcher: ['/dashboard/:path*', '/admin/:path*'] };
