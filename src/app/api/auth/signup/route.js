import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

const signupSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters'),
	email: z.string().email('Invalid email address'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(req) {
	try {
		const body = await req.json();

		// Validate payload
		const parse = signupSchema.safeParse(body);
		if (!parse.success) {
			const firstError = parse.error.issues[0];
			return NextResponse.json({ error: firstError.message }, { status: 400 });
		}
		const { name, email, password } = parse.data;

		const db = await getDb();

		// check email uniqueness
		const existing = await db
			.collection('users')
			.findOne({ email: email.toLowerCase() });
		if (existing) {
			return NextResponse.json(
				{ error: 'Email already registered' },
				{ status: 409 },
			);
		}

		// hash password
		const saltRounds = 10;
		const hashed = await bcrypt.hash(password, saltRounds);

		const now = new Date();
		const userDoc = {
			name: name.trim(),
			email: email.toLowerCase(),
			hashedPassword: hashed,
			role: 'user',
			createdAt: now,
			updatedAt: now,
		};

		const result = await db.collection('users').insertOne(userDoc);

		// return minimal success payload
		return NextResponse.json(
			{ success: true, userId: result.insertedId },
			{ status: 201 },
		);
	} catch (err) {
		console.error('signup error', err);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}
