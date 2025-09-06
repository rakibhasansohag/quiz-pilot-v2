import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET() {
	const token = cookies().get('token')?.value;
	if (!token) return NextResponse.json({ user: null });

	try {
		const decoded = jwt.verify(
			token,
			process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
		);
		return NextResponse.json({ user: decoded });
	} catch {
		return NextResponse.json({ user: null });
	}
}
