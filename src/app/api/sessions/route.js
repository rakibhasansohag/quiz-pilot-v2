import { getDb } from '@/lib/mongodb';
import { getToken } from 'next-auth/jwt';
import { parse } from 'cookie';
import { UAParser } from 'ua-parser-js';

const SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;

export async function GET(req) {
	try {
		const token = await getToken({ req, secret: SECRET });
		if (!token?.id)
			return new Response(JSON.stringify({ sessions: [] }), { status: 200 });

		const userId = token.id;

		const cookieHeader = req.headers.get('cookie') || '';
		const cookies = parse(cookieHeader);
		const currentSid = cookies.sid || null;

		const db = await getDb();
		const sessions = await db
			.collection('sessions')
			.find({ userId, active: true })
			.sort({ lastSeenAt: -1 })
			.toArray();

		const enriched = sessions.map((s) => {
			const parser = new UAParser(s.userAgent || '');
			const ua = parser.getResult();

			const osName = ua.os?.name || '';
			const osVersion = ua.os?.version || '';
			const os =
				[osName, osVersion].filter(Boolean).join(' ').trim() || 'Unknown OS';

			const browserName = ua.browser?.name || '';
			const browserVersion = ua.browser?.version || '';
			const browser =
				[browserName, browserVersion].filter(Boolean).join(' ').trim() ||
				'Unknown Browser';

			const deviceModel = ua.device?.model || '';
			const deviceType = ua.device?.type || '';
			const deviceVendor = ua.device?.vendor || '';
			const deviceParts = [deviceVendor, deviceModel, deviceType].filter(
				Boolean,
			);
			const device = deviceParts.join(' ') || 'PC';

			return {
				_id: s._id,
				ip: s.ip,
				lastSeenAt: s.lastSeenAt,
				createdAt: s.createdAt,
				device,
				os,
				browser,
				isCurrent: String(s._id) === String(currentSid),
				userAgent: s.userAgent || '',
			};
		});

		return new Response(JSON.stringify({ sessions: enriched }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (err) {
		console.error('GET /api/sessions error', err);
		return new Response(JSON.stringify({ sessions: [] }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}
