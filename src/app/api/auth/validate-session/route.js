import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getDb } from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;

export async function POST(req) {
	try {
		// try to get token from cookie header or body if provided
		const cookieHeader = req.headers.get('cookie') || '';
		// parse token from cookie string (simple parse)
		const tokenCookie = cookieHeader
			.split(';')
			.map((s) => s.trim())
			.find((s) => s.startsWith('token='));

		let token = tokenCookie ? tokenCookie.split('=')[1] : null;

		// if no cookie token, try body
		let body = {};
		try {
			body = await req.json();
		} catch (e) {
			body = {};
		}
		if (!token && body.token) token = body.token;

		// if still no token -> unauthorized
		if (!token) {
			return NextResponse.json(
				{ ok: false, error: 'No token' },
				{ status: 401 },
			);
		}

		// verify token (server-side uses jsonwebtoken)
		let decoded;
		try {
			decoded = jwt.verify(token, JWT_SECRET);
		} catch (e) {
			return NextResponse.json(
				{ ok: false, error: 'Invalid token' },
				{ status: 401 },
			);
		}

		const { sub, sid } = decoded || {};
		if (!sub || !sid) {
			return NextResponse.json(
				{ ok: false, error: 'Malformed token' },
				{ status: 401 },
			);
		}

		// check DB sessions for active and not expired
		const db = await getDb();
		const sessions = db.collection('sessions');
		const now = new Date();

		const s = await sessions.findOne({
			_id: sid,
			userId: sub,
			active: true,
			expiresAt: { $gt: now },
		});

		if (!s) {
			return NextResponse.json(
				{ ok: false, error: 'Session invalid' },
				{ status: 200 },
			);
		}

		// session ok
		return NextResponse.json({ ok: true, sessionId: s._id }, { status: 200 });
	} catch (err) {
		console.error('validate-session error', err);
		return NextResponse.json(
			{ ok: false, error: 'Server error' },
			{ status: 500 },
		);
	}
}
