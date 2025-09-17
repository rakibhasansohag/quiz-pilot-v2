import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function POST(req) {
	try {
		// read body once
		const body = await req.json();
		console.log('/api/auth/validate-session called, body:', body);

		const { sub, sid } = body || {};
		if (!sub || !sid) {
			return NextResponse.json(
				{ ok: false, error: 'missing_params' },
				{ status: 400 },
			);
		}

		const db = await getDb();
		const now = new Date();

		// find session by _id (sid) and userId (sub) and ensure active and not expired
		const sess = await db.collection('sessions').findOne({
			_id: sid,
			userId: sub,
			active: true,
			expiresAt: { $gt: now },
		});

		if (!sess) {
			console.log('/api/auth/validate-session: session not found or expired', {
				sub,
				sid,
			});
			return NextResponse.json(
				{ ok: false, error: 'not_found' },
				{ status: 401 },
			);
		}

		// optional: update lastSeenAt
		await db
			.collection('sessions')
			.updateOne({ _id: sid }, { $set: { lastSeenAt: now } });

		return NextResponse.json({ ok: true }, { status: 200 });
	} catch (err) {
		console.error('/api/auth/validate-session error', err);
		return NextResponse.json(
			{ ok: false, error: 'server_error' },
			{ status: 500 },
		);
	}
}
