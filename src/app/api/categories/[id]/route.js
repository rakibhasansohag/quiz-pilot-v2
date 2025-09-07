import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';

import { getUserFromCookies } from '@/lib/getUserFromCookies';

const updateSchema = z.object({
	name: z.string().min(2).max(100).optional(),
	description: z.string().max(1000).optional().nullable(),
	// totalQuizzes and totalAttempts updates should be internal from quiz APIs,
	// but allow admin to set them if absolutely needed (optional)
	totalQuizzes: z.number().int().nonnegative().optional(),
	totalAttempts: z.number().int().nonnegative().optional(),
});

async function requireAdmin(req) {
	const user = await getUserFromCookies(req);
	console.log('decoded user:', user);
	if (!user || user.role !== 'admin') {
		throw NextResponse.json({ error: 'Forbidden' }, { status: 403 });
	}
	return user;
}

export async function GET(req, { params }) {
	try {
		const id = params.id;
		if (!ObjectId.isValid(id))
			return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

		const db = await getDb();
		const cat = await db
			.collection('categories')
			.findOne({ _id: new ObjectId(id) });
		if (!cat) return NextResponse.json({ error: 'Not found' }, { status: 404 });

		return NextResponse.json({
			category: {
				_id: cat._id.toString(),
				name: cat.name,
				description: cat.description || '',
				createdBy: cat.createdBy ? cat.createdBy.toString() : null,
				totalQuizzes: cat.totalQuizzes ?? 0,
				totalAttempts: cat.totalAttempts ?? 0,
				createdAt: cat.createdAt,
				updatedAt: cat.updatedAt,
			},
		});
	} catch (err) {
		console.error('GET /api/categories/[id] error', err);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}

export async function PUT(req, { params }) {
	try {
		// only admin can update categories
		const user = await requireAdmin(req);

		const id = params.id;
		if (!ObjectId.isValid(id))
			return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

		const body = await req.json();
		const parsed = updateSchema.safeParse(body);
		if (!parsed.success) {
			const first = parsed.error.issues[0];
			return NextResponse.json({ error: first.message }, { status: 400 });
		}

		const db = await getDb();

		// prepare updates and stamp who updated
		const updates = {
			...parsed.data,
			updatedAt: new Date(),
			updatedByEmail: user.email || null,
			updatedBy: user.sub || null,
		};

		// if updating name, ensure uniqueness (case-insensitive)
		if (updates.name) {
			const existing = await db.collection('categories').findOne({
				name: { $regex: `^${updates.name}$`, $options: 'i' },
				_id: { $ne: new ObjectId(id) },
			});
			if (existing)
				return NextResponse.json(
					{ error: 'Category name already exists' },
					{ status: 409 },
				);
		}

		await db
			.collection('categories')
			.updateOne({ _id: new ObjectId(id) }, { $set: updates });

		const updated = await db
			.collection('categories')
			.findOne({ _id: new ObjectId(id) });

		return NextResponse.json({
			ok: true,
			category: {
				_id: updated._id.toString(),
				name: updated.name,
				description: updated.description || '',
				updatedByEmail: updated.updatedByEmail || null,
				updatedBy: updated.updatedBy || null,
				totalQuizzes: updated.totalQuizzes ?? 0,
				totalAttempts: updated.totalAttempts ?? 0,
				createdAt: updated.createdAt,
				updatedAt: updated.updatedAt,
			},
		});
	} catch (err) {
		// if requireAdmin threw a NextResponse, rethrow it to return early
		if (err instanceof NextResponse) throw err;
		console.error('PUT /api/categories/[id] error', err);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}

export async function DELETE(req, { params }) {
	try {
		// only admin can delete categories
		await requireAdmin(req);

		const id = params.id;
		if (!ObjectId.isValid(id))
			return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

		const db = await getDb();

		// optionally: ensure no quizzes exist for this category (or handle cascade)
		// const quizCount = await db.collection('questions').countDocuments({ categoryId: id });
		// if (quizCount > 0) return NextResponse.json({ error: 'Cannot delete: quizzes exist' }, { status: 400 });

		const r = await db
			.collection('categories')
			.deleteOne({ _id: new ObjectId(id) });
		if (r.deletedCount === 0)
			return NextResponse.json({ error: 'Not found' }, { status: 404 });

		return NextResponse.json({ ok: true });
	} catch (err) {
		if (err instanceof NextResponse) throw err;
		console.error('DELETE /api/categories/[id] error', err);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}
