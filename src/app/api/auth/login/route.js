import jwt from 'jsonwebtoken';
import { getDb } from '@/lib/mongo.js';
import { createSession, enforceDeviceLimit } from '@/services/sessions.js';

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
const JWT_EXPIRES_IN = '30d';

export default async function handler(req, res) {
	if (req.method !== 'POST')
		return res.status(405).json({ error: 'Method not allowed' });

	const { email, password } = req.body;
	if (!email || !password)
		return res.status(400).json({ error: 'Missing credentials' });

	const db = await getDb();
	const users = db.collection('users');

	const user = await users.findOne({ email });
	if (!user) return res.status(401).json({ error: 'Invalid credentials' });

	const passwordsMatch = password === user.password;
	if (!passwordsMatch)
		return res.status(401).json({ error: 'Invalid credentials' });

	// create session record
	const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
	const userAgent = req.headers['user-agent'] || '';
	const session = await createSession({
		userId: user._id.toString(),
		ip,
		userAgent,
	});

	// optionally enforce device limit now (will invalidate older sessions)
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

	// set cookie (httpOnly) for JWT and sessionId (helps middleware)
	const cookieOptions = [
		`token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${
			30 * 24 * 60 * 60
		}`,
		`sessionId=${session._id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${
			30 * 24 * 60 * 60
		}`,
	];
	res.setHeader('Set-Cookie', cookieOptions);

	// return user (avoid sending password)
	const safeUser = {
		_id: user._id,
		email: user.email,
		name: user.name,
		role: user.role,
	};
	return res.json({ user: safeUser, token });
}
