import { getToken } from 'next-auth/jwt';

const SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;

/**
 * Server helper: pass the incoming Request (or an object with headers).
 * Returns the NextAuth token payload (or null).
 */
export async function getUserFromCookies(req) {
	if (!req) return null;
	try {
		const token = await getToken({ req, secret: SECRET });
		return token || null;
	} catch (err) {
		console.error('getUserFromCookies error', err);
		return null;
	}
}
