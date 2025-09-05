import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export async function getUserFromCookies() {
	const cookieStore = cookies();
	const token = cookieStore.get('token')?.value;

	if (!token) return null;

	try {
		const { payload } = await jwtVerify(
			token,
			new TextEncoder().encode(
				process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
			),
		);
		return payload;
	} catch (e) {
		console.error('JWT verify failed', e);
		return null;
	}
}
