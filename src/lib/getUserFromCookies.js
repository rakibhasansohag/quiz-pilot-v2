import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export function getUserFromCookies() {
	const cookieStore = cookies();
	const token = cookieStore.get('token')?.value;
	if (!token) return null;

	try {
		return jwt.verify(
			token,
			process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
		);
	} catch (e) {
		return null;
	}
}
