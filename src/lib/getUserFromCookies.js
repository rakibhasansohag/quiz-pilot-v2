import { getToken } from 'next-auth/jwt';

export async function getUserFromCookies(req) {
	return await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
}
