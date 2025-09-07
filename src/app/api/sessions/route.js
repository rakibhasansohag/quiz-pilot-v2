// src/app/api/sessions/route.js
import { getDb } from '@/lib/mongodb';
import { parse } from 'cookie';
import jwt from 'jsonwebtoken';
import { UAParser } from 'ua-parser-js'; // <-- use named import

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(req) {
	try {
		// read cookie header and extract token safely
		const cookieHeader = req.headers.get('cookie') || '';
		const cookies = parse(cookieHeader);
		const token = cookies.token;

		if (!token) throw new Error('No token');

		// verify token (server side)
		const decoded = jwt.verify(token, JWT_SECRET);

		const db = await getDb();
		const sessions = await db
			.collection('sessions')
			.find({ userId: decoded.sub, active: true })
			.sort({ lastSeenAt: -1 })
			.toArray();

		// enrich with UA info
		const enriched = sessions.map((s) => {
			const parser = new UAParser(s.userAgent || '');
			const ua = parser.getResult();

			// safe join helpers
			const osName = ua.os?.name || '';
			const osVersion = ua.os?.version || '';
			const os =
				[osName, osVersion].filter(Boolean).join(' ').trim() || 'Unknown OS';

			const browserName = ua.browser?.name || '';
			const browserVersion = ua.browser?.version || '';
			const browser =
				[browserName, browserVersion].filter(Boolean).join(' ').trim() ||
				'Unknown Browser';

			// device display (model/type/vendor)
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
				isCurrent: s._id === decoded.sid,
				userAgent: s.userAgent || '',
			};
		});

		return new Response(JSON.stringify({ sessions: enriched }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (err) {
		console.error('GET /api/sessions error', err);
		// return empty array as before (you did that earlier)
		return new Response(JSON.stringify({ sessions: [] }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}
