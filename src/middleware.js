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

	const isLoginPage = pathname === '/login' || pathname === '/signup';
	const hasCallbackParam = searchParams.has('callbackUrl');
	const cookieHeader = req.headers.get('cookie') || '';
	const looksLikeAuthCookies = AUTH_COOKIE_REGEX.test(cookieHeader);

	// protect dashboard + admin
	if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
		const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
		const token = await getToken({ req, secret });
		console.log('middleware token from getToken:', token);

		if (!token) {
			if (looksLikeAuthCookies || hasCallbackParam) {
				console.warn(
					'No token, but auth cookies/callback present — allowing request to avoid callback loop.',
				);
				return NextResponse.next();
			}
			const loginUrl = new URL('/login', req.url);
			loginUrl.searchParams.set('callbackUrl', req.nextUrl.href);
			return NextResponse.redirect(loginUrl);
		}

		// sid cookie check
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
					// additional role check goes here after validation
					if (
						(pathname.startsWith('/dashboard/admin') ||
							pathname.startsWith('/admin')) &&
						token.role !== 'admin'
					) {
						return NextResponse.redirect(new URL('/', req.url));
					}
					return NextResponse.next();
				}

				console.warn('sid validation failed - deleting sid:', json);
				const out = NextResponse.next();
				out.cookies.delete('sid');
				return out;
			} catch (e) {
				console.warn('sid validate error (network) - allowing request:', e);
				return NextResponse.next();
			}
		}

		// no sid but still allow (avoid blocking auth flow)
		if (
			(pathname.startsWith('/dashboard/admin') ||
				pathname.startsWith('/admin')) &&
			token.role !== 'admin'
		) {
			return NextResponse.redirect(new URL('/', req.url));
		}
		return NextResponse.next();
	}

	// stop signed-in users from seeing login/signup
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
