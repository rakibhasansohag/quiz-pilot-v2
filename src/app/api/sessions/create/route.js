import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { createSession, enforceDeviceLimit } from '@/services/session';

const SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;

export async function POST(req) {
	try {
		const token = await getToken({ req, secret: SECRET });
		if (!token?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}
		const userId = token.id;

		// get client IP (Try x-forwarded-for first)
		const ip =
			req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';

		const userAgent = req.headers.get('user-agent') || '';

		const ttlSeconds = parseInt(
			process.env.SESSION_TTL_SECONDS || String(30 * 24 * 60 * 60),
			10,
		);

		const session = await createSession({
			userId,
			ip,
			userAgent,
			ttlSeconds,
		});

		const maxDevices = parseInt(process.env.MAX_DEVICES || '3', 10);
		try {
			await enforceDeviceLimit(userId, maxDevices);
		} catch (e) {
			// don't block creation on enforcement failure
			console.warn('enforceDeviceLimit error', e);
		}

		return NextResponse.json({ ok: true, session });
	} catch (err) {
		console.error('POST /api/sessions/create error', err);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}
