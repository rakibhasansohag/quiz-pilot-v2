import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
	const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

	console.log('middleware token', token);

	const { pathname } = req.nextUrl;

	// Public paths
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
		if (!token) {
			const loginUrl = new URL('/login', req.url);
			loginUrl.searchParams.set('callbackUrl', req.nextUrl.href);
			return NextResponse.redirect(loginUrl);
		}

		// Admin check
		if (pathname.startsWith('/admin') && token.role !== 'admin') {
			return NextResponse.redirect(new URL('/', req.url));
		}
	}

	// Prevent logged in users from visiting login/signup
	if ((pathname === '/login' || pathname === '/signup') && token) {
		return NextResponse.redirect(new URL('/dashboard', req.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/dashboard/:path*', '/admin/:path*'],
};
