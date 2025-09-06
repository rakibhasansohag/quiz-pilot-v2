import { NextResponse } from 'next/server';
import { invalidateSession } from '@/services/session';
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

export async function DELETE(req, { params }) {
	const user = getUserFromToken(req);
	if (!user) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { id } = params;
	if (!id) {
		return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
	}

	await invalidateSession(id);
	return NextResponse.json({ ok: true });
}
