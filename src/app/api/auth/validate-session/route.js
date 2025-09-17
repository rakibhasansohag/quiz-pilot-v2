// file: /app/api/auth/validate-session/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function POST(req) {
	try {
		// Read the body exactly once into a variable
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
		const sess = await db.collection('sessions').findOne({ sub, sid });

		if (!sess) {
			return NextResponse.json(
				{ ok: false, error: 'not_found' },
				{ status: 401 },
			);
		}

		return NextResponse.json({ ok: true }, { status: 200 });
	} catch (err) {
		console.error('/api/auth/validate-session error', err);
		return NextResponse.json(
			{ ok: false, error: 'server_error' },
			{ status: 500 },
		);
	}
}
