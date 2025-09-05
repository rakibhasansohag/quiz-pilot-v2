import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

export async function middleware(req) {
	const { pathname } = req.nextUrl;

	// allow public assets / api / _next / static files
	if (
		pathname.startsWith('/api') ||
		pathname.startsWith('/_next') ||
		pathname.startsWith('/static') ||
		pathname.includes('.')
	) {
		return NextResponse.next();
	}

	// Protect dashboard and admin subpaths
	if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
		const token = await getToken({ req, secret: NEXTAUTH_SECRET });
		if (!token) {
			const loginUrl = new URL('/login', req.url);
			loginUrl.searchParams.set('callbackUrl', req.nextUrl.href);
			return NextResponse.redirect(loginUrl);
		}

		// only allow admin to access /admin
		if (pathname.startsWith('/admin') && token.role !== 'admin') {
			return NextResponse.redirect(new URL('/', req.url));
		}

		// if you want NO regular user to access dashboard at all:
		// if (token.role !== 'admin') return NextResponse.redirect(new URL('/', req.url));

		return NextResponse.next();
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/dashboard/:path*', '/admin/:path*'],
};
