import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { createOrUpdateSession, enforceDeviceLimit } from '@/services/session';

const SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;

export async function POST(req) {
	try {
		const token = await getToken({ req, secret: SECRET });
		if (!token?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}
		const userId = String(token.id);
		const ip =
			req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
		const userAgent = req.headers.get('user-agent') || '';

		const ttlSeconds = parseInt(
			process.env.SESSION_TTL_SECONDS || String(30 * 24 * 60 * 60),
			10,
		);

		// createOrUpdateSession returns the session document (existing or created)
		const session = await createOrUpdateSession({
			userId,
			ip,
			userAgent,
			ttlSeconds,
		});

		// enforce device limit (non-blocking)
		try {
			await enforceDeviceLimit(
				userId,
				parseInt(process.env.MAX_DEVICES || '3', 10),
			);
		} catch (e) {
			console.warn('enforceDeviceLimit error', e);
		}

		const res = NextResponse.json({ ok: true, session }, { status: 200 });

		// set readable sid cookie (not HttpOnly) so middleware & client can read it
		res.cookies.set('sid', String(session._id), {
			path: '/',
			maxAge: ttlSeconds,
			sameSite: 'lax',
			httpOnly: true, // cannot be read by JS (secure)
			secure: process.env.NODE_ENV === 'production', // only sent over HTTPS in prod
		});

		return res;
	} catch (err) {
		console.error('POST /api/sessions/create error', err);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}
