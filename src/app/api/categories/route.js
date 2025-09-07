import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/mongodb';

import { getUserFromCookies } from '@/lib/getUserFromCookies';

const createSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters').max(100),
	description: z.string().max(1000).optional().nullable(),
});

export async function GET(req) {
	try {
		const db = await getDb();
		const categories = await db
			.collection('categories')
			.find({})
			.sort({ name: 1 })
			.toArray();

		// return categories (convert ObjectId to string for safety)
		const sanitized = categories.map((c) => ({
			_id: c._id.toString(),
			name: c.name,
			description: c.description || '',
			createdBy: c.createdBy ? c.createdBy.toString() : null,
			totalQuizzes: c.totalQuizzes ?? 0,
			totalAttempts: c.totalAttempts ?? 0,
			createdAt: c.createdAt,
			updatedAt: c.updatedAt,
			createdByEmail: c.createdByEmail || '',
		}));

		return NextResponse.json({ categories: sanitized });
	} catch (err) {
		console.error('GET /api/categories error', err);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}

export async function POST(req) {
	try {
		const body = await req.json();

		const token = await getUserFromCookies(req);

		console.log('token', token);

		if (!token || token.role !== 'admin') {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		const parsed = createSchema.safeParse(body);
		if (!parsed.success) {
			const first = parsed.error.issues[0];
			return NextResponse.json({ error: first.message }, { status: 400 });
		}

		const { name, description } = parsed.data;
		const db = await getDb();

		// unique name check (case-insensitive)
		const existing = await db
			.collection('categories')
			.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
		if (existing) {
			return NextResponse.json(
				{ error: 'Category name already exists' },
				{ status: 409 },
			);
		}

		let createdBy = null;
		try {
			if (token && token.sub) createdBy = token.sub;
		} catch (e) {
			// ignore token parsing errors - creation allowed for anonymous
			console.error('Error parsing token', e);
		}

		const now = new Date();
		const doc = {
			name: name.trim(),
			description: description?.trim() || '',
			createdBy: createdBy, // string (userId) or null
			createdByEmail: token ? token.email : null,
			totalQuizzes: 0,
			totalAttempts: 0,
			createdAt: now,
			updatedAt: now,
			updatedByEmail: null, // when another admin update the category it will be passed here
		};

		const res = await db.collection('categories').insertOne(doc);

		return NextResponse.json(
			{
				ok: true,
				category: {
					_id: res.insertedId.toString(),
					...doc,
				},
			},
			{ status: 201 },
		);
	} catch (err) {
		console.error('POST /api/categories error', err);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}
