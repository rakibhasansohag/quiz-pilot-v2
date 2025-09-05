import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(req) {
	try {
		const body = await req.json();
		const { name, email, password } = body;

		if (!name || !email || !password) {
			return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
		}

		const db = await getDb();
		const existing = await db
			.collection('users')
			.findOne({ email: email.toLowerCase() });
		if (existing) {
			return NextResponse.json(
				{ error: 'User already exists' },
				{ status: 409 },
			);
		}

		// hash password
		const saltRounds = 10;
		const hashed = await bcrypt.hash(password, saltRounds);

		const now = new Date();
		const userDoc = {
			name,
			email: email.toLowerCase(),
			hashedPassword: hashed,
			createdAt: now,
			updatedAt: now,
		};

		const result = await db.collection('users').insertOne(userDoc);

		return NextResponse.json(
			{ success: true, userId: result.insertedId },
			{ status: 201 },
		);
	} catch (err) {
		console.error('signup error', err);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}
