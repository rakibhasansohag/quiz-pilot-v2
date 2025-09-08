import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function POST(req) {
	try {
		const body = await req.json().catch(() => null);
		if (!body || !body.sub || !body.sid)
			return NextResponse.json({ ok: false }, { status: 400 });

		const db = await getDb();
		const sessions = db.collection('sessions');

		// find active session by id and userId
		const s = await sessions.findOne({
			_id: String(body.sid),
			userId: String(body.sub),
			active: true,
		});

		if (!s) return NextResponse.json({ ok: false }, { status: 401 });

		// optionally check expiresAt > now
		if (s.expiresAt && new Date(s.expiresAt) <= new Date()) {
			return NextResponse.json({ ok: false }, { status: 401 });
		}

		return NextResponse.json({ ok: true });
	} catch (err) {
		console.error('POST /api/auth/validate-session error', err);
		return NextResponse.json({ ok: false }, { status: 500 });
	}
}
