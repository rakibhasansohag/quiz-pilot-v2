import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { getUserFromCookies } from '@/lib/getUserFromCookies';

const createSchema = z.object({
	categoryId: z.string().nonempty(),
	type: z.enum(['mcq', 'tf']),
	difficulty: z.enum(['easy', 'medium', 'hard']).optional().default('easy'),
	text: z.string().min(5).max(2000),
	options: z.array(z.string().min(1)).optional(),
	correctIndex: z.number().int().nonnegative(),
	timeLimitSec: z.number().int().positive().optional().nullable(),
	status: z
		.enum(['published', 'draft', 'archived'])
		.optional()
		.default('published'),
});

export async function GET(req) {
	try {
		const url = new URL(req.url);
		const categoryId = url.searchParams.get('categoryId') || null;
		const q = url.searchParams.get('q') || null;
		const limit = Math.min(Number(url.searchParams.get('limit') || 50), 200);

		const db = await getDb();
		const match = {};
		if (categoryId && ObjectId.isValid(categoryId))
			match.categoryId = new ObjectId(categoryId);
		if (q) match.text = { $regex: q, $options: 'i' };

		const docs = await db
			.collection('questions')
			.find(match)
			.sort({ createdAt: -1 })
			.limit(limit)
			.toArray();

		const out = docs.map((d) => ({
			_id: d._id.toString(),
			categoryId: d.categoryId.toString(),
			categoryName: d.categoryName || '',
			type: d.type,
			difficulty: d.difficulty,
			text: d.text,
			options: d.options || [],
			correctIndex: d.correctIndex,
			timeLimitSec: d.timeLimitSec ?? null,
			status: d.status,
			createdBy: d.createdBy || null,
			createdByEmail: d.createdByEmail || null,
			updatedByEmail: d.updatedByEmail || null,
			createdAt: d.createdAt,
			updatedAt: d.updatedAt,
		}));

		return NextResponse.json({ questions: out });
	} catch (err) {
		console.error('GET /api/questions error', err);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}

export async function POST(req) {
	try {
		const user = await getUserFromCookies(req);
		if (!user)
			return NextResponse.json(
				{ error: 'Authentication required' },
				{ status: 401 },
			);

		const body = await req.json();
		const parsed = createSchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json(
				{ error: parsed.error.issues[0].message },
				{ status: 400 },
			);
		}
		const payload = parsed.data;

		// type-specific validation
		if (payload.type === 'mcq') {
			const opts = Array.isArray(payload.options)
				? payload.options.map((s) => (s || '').trim()).filter(Boolean)
				: [];
			if (opts.length < 2)
				return NextResponse.json(
					{ error: 'MCQ requires at least 2 options' },
					{ status: 400 },
				);
			if (opts.length > 4)
				return NextResponse.json(
					{ error: 'MCQ allows a maximum of 4 options' },
					{ status: 400 },
				);
			if (
				typeof payload.correctIndex !== 'number' ||
				payload.correctIndex < 0 ||
				payload.correctIndex >= opts.length
			) {
				return NextResponse.json(
					{ error: 'Please choose a valid choice for provided options' },
					{ status: 400 },
				);
			}
			payload.options = opts;
		} else {
			// tf
			payload.options = ['True', 'False'];
			if (![0, 1].includes(payload.correctIndex))
				return NextResponse.json(
					{ error: 'correctIndex must be 0 or 1 for TF' },
					{ status: 400 },
				);
		}

		// db ops
		const db = await getDb();
		if (!ObjectId.isValid(payload.categoryId))
			return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
		const category = await db
			.collection('categories')
			.findOne({ _id: new ObjectId(payload.categoryId) });
		if (!category)
			return NextResponse.json(
				{ error: 'Category not found' },
				{ status: 404 },
			);

		// uniqueness check per category
		const existing = await db.collection('questions').findOne({
			categoryId: category._id,
			text: { $regex: `^${payload.text}$`, $options: 'i' },
		});
		if (existing)
			return NextResponse.json(
				{ error: 'Duplicate question text' },
				{ status: 409 },
			);

		const now = new Date();
		const doc = {
			categoryId: category._id,
			categoryName: category.name,
			type: payload.type,
			difficulty: payload.difficulty,
			text: payload.text.trim(),
			options: payload.options,
			correctIndex: payload.correctIndex,
			timeLimitSec: payload.timeLimitSec ?? null,
			status: payload.status,
			createdBy: user.sub,
			createdByEmail: user.email,
			updatedByEmail: null,
			createdAt: now,
			updatedAt: now,
		};

		const resInsert = await db.collection('questions').insertOne(doc);

		// increment category totalQuizzes
		await db
			.collection('categories')
			.updateOne({ _id: category._id }, { $inc: { totalQuizzes: 1 } });

		return NextResponse.json({ ok: true, questions: doc }, { status: 201 });
	} catch (err) {
		console.error('POST /api/questions error', err);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}
