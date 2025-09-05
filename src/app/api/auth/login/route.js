import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/mongodb';
import { createSession, enforceDeviceLimit } from '@/services/sessions.js';

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
const JWT_EXPIRES_IN = '30d';
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

export default async function handler(req, res) {
	try {
		if (req.method !== 'POST') {
			res.setHeader('Allow', 'POST');
			return res.status(405).json({ error: 'Method not allowed' });
		}

		const { email, password } = req.body;
		if (!email || !password)
			return res.status(400).json({ error: 'Missing credentials' });

		const db = await getDb();
		const users = db.collection('users');

		// find by lowercase email
		const user = await users.findOne({ email: email.toLowerCase() });
		if (!user) return res.status(401).json({ error: 'Invalid credentials' });

		// make sure stored field name matches your signup (hashedPassword)
		const hashed = user.hashedPassword || user.password || null;
		if (!hashed) {
			console.error('User has no hashed password field', user._id);
			return res.status(500).json({ error: 'Server error' });
		}

		const passwordsMatch = await bcrypt.compare(password, hashed);
		if (!passwordsMatch)
			return res.status(401).json({ error: 'Invalid credentials' });

		// create session record (server-side)
		const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
		const userAgent = req.headers['user-agent'] || '';
		const session = await createSession({
			userId: user._id.toString(),
			ip,
			userAgent,
			ttlSeconds: SESSION_TTL_SECONDS,
		});

		// enforce device limit (invalidates oldest sessions if needed)
		await enforceDeviceLimit(
			user._id.toString(),
			parseInt(process.env.MAX_DEVICES || '3', 10),
		);

		// issue JWT with session id (sid)
		const tokenPayload = {
			sub: user._id.toString(),
			email: user.email,
			role: user.role || 'user',
			sid: session._id,
		};
		const token = jwt.sign(tokenPayload, JWT_SECRET, {
			expiresIn: JWT_EXPIRES_IN,
		});

		// cookie options
		const maxAge = SESSION_TTL_SECONDS; // seconds
		const isProd = process.env.NODE_ENV === 'production';
		const secureFlag = isProd ? '; Secure' : '';
		const cookieCommon = `Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secureFlag}`;

		const cookieOptions = [
			`token=${token}; ${cookieCommon}`,
			`sessionId=${session._id}; ${cookieCommon}`,
		];

		// set cookies
		res.setHeader('Set-Cookie', cookieOptions);

		// return safe user object
		const safeUser = {
			_id: user._id,
			email: user.email,
			name: user.name,
			role: user.role,
		};

		return res.status(200).json({ user: safeUser, token });
	} catch (err) {
		console.error('login error', err);
		return res.status(500).json({ error: 'Server error' });
	}
}
