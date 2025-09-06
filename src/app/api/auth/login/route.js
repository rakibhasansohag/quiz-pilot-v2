import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/mongodb';
import { createSession, enforceDeviceLimit } from '@/services/session';

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
const JWT_EXPIRES_IN = '30d';
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

export async function POST(req) {
	try {
		const body = await req.json();
		const { email, password } = body;
		if (!email || !password) {
			return new Response(JSON.stringify({ error: 'Missing credentials' }), {
				status: 400,
			});
		}

		const db = await getDb();
		const users = db.collection('users');

		const user = await users.findOne({ email: email.toLowerCase() });
		if (!user)
			return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
				status: 401,
			});

		const hashed = user.hashedPassword || user.password || null;
		if (!hashed)
			return new Response(JSON.stringify({ error: 'Server error' }), {
				status: 500,
			});

		const passwordsMatch = await bcrypt.compare(password, hashed);
		if (!passwordsMatch)
			return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
				status: 401,
			});

		const ip = req.headers.get('x-forwarded-for') || '';
		const userAgent = req.headers.get('user-agent') || '';
		const session = await createSession({
			userId: user._id.toString(),
			ip,
			userAgent,
			ttlSeconds: SESSION_TTL_SECONDS,
		});

		await enforceDeviceLimit(
			user._id.toString(),
			parseInt(process.env.MAX_DEVICES || '3', 10),
		);

		const tokenPayload = {
			sub: user._id.toString(),
			email: user.email,
			role: user.role || 'user',
			sid: session._id,
		};
		const token = jwt.sign(tokenPayload, JWT_SECRET, {
			expiresIn: JWT_EXPIRES_IN,
		});

		const safeUser = {
			_id: user._id,
			email: user.email,
			name: user.name,
			role: user.role,
		};

		return new Response(JSON.stringify({ user: safeUser, token }), {
			status: 200,
			headers: {
				'Set-Cookie': `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}`,
				'Content-Type': 'application/json',
			},
		});
	} catch (err) {
		console.error('login error', err);
		return new Response(JSON.stringify({ error: 'Server error' }), {
			status: 500,
		});
	}
}
