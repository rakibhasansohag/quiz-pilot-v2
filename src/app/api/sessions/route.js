import { NextResponse } from 'next/server';
import { getActiveSessions } from '@/services/session';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;

function getUserFromToken(req) {
	const cookie = req.headers.get('cookie') || '';
	const token = cookie.split(';').find((c) => c.trim().startsWith('token='));
	if (!token) return null;
	try {
		return jwt.verify(token.split('=')[1], JWT_SECRET);
	} catch {
		return null;
	}
}

export async function GET(req) {
	const user = await getUserFromToken(req);
	if (!user) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const sessions = await getActiveSessions(user.sub);
	return NextResponse.json({ sessions });
}
