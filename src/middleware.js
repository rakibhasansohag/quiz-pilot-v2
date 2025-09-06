import { NextResponse } from 'next/server';
import { getUserFromCookies } from './lib/getUserFromCookies';

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

	if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
		const user = await getUserFromCookies();

		console.log('User in middleware:', user);

		if (!user) {
			const loginUrl = new URL('/login', req.url);
			loginUrl.searchParams.set('callbackUrl', req.nextUrl.href);
			return NextResponse.redirect(loginUrl);
		}

		if (pathname.startsWith('/admin') && user.role !== 'admin') {
			return NextResponse.redirect(new URL('/', req.url));
		}

		return NextResponse.next();
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/dashboard/:path*', '/admin/:path*'],
};
