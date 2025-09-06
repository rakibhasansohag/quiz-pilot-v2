import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;

function getUserFromToken(req) {
	const cookie = req.headers.get('cookie') || '';
	const token = cookie.split(';').find((c) => c.trim().startsWith('token='));
	if (!token) return null;
	try {
		return jwt.verify(token.split('=')[1], JWT_SECRET);
	} catch {
		return null;
	}
}

export async function POST(req) {
	const user = await getUserFromToken(req);
	if (!user) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { current, newPassword } = await req.json();
	if (!current || !newPassword) {
		return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
	}

	const db = await getDb();
	const users = db.collection('users');
	const dbUser = await users.findOne({ _id: new ObjectId(user.sub) });

	if (!dbUser) {
		return NextResponse.json({ error: 'User not found' }, { status: 404 });
	}

	const hashed = dbUser.hashedPassword || dbUser.password;
	const match = await bcrypt.compare(current, hashed);
	if (!match) {
		return NextResponse.json(
			{ error: 'Invalid current password' },
			{ status: 400 },
		);
	}

	const newHashed = await bcrypt.hash(newPassword, 10);
	await users.updateOne(
		{ _id: dbUser._id },
		{ $set: { hashedPassword: newHashed, updatedAt: new Date() } },
	);

	return NextResponse.json({ ok: true });
}
