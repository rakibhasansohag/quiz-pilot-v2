import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { getUserFromCookies } from '@/lib/getUserFromCookies';

const updateSchema = z.object({
	text: z.string().min(5).max(2000).optional(),
	options: z.array(z.string().min(1)).max(4).optional(),
	correctIndex: z.number().int().nonnegative().optional(), // server-side expects 0-based
	timeLimitSec: z.number().int().positive().optional().nullable(),
	status: z.enum(['published', 'draft', 'archived']).optional(),
});

async function assertOwnerOrAdmin(questionDoc, req) {
	const user = await getUserFromCookies(req);
	console.log('inside the user', user);
	if (!user) return { ok: false, status: 401, message: 'Unauthorized' };
	if (user.role === 'admin') return { ok: true, user };
	if (questionDoc.createdBy && questionDoc.createdBy.toString() === user.sub)
		return { ok: true, user };
	return { ok: false, status: 403, message: 'Forbidden' };
}

export async function GET(req, { params }) {
	try {
		const id = params.id;
		if (!ObjectId.isValid(id))
			return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

		const db = await getDb();
		const q = await db
			.collection('questions')
			.findOne({ _id: new ObjectId(id) });
		if (!q) return NextResponse.json({ error: 'Not found' }, { status: 404 });

		return NextResponse.json({
			question: {
				_id: q._id.toString(),
				categoryId: q.categoryId.toString(),
				categoryName: q.categoryName || '',
				type: q.type,
				difficulty: q.difficulty,
				text: q.text,
				options: q.options || [],
				correctIndex: q.correctIndex,
				timeLimitSec: q.timeLimitSec ?? null,
				status: q.status,
				createdBy: q.createdBy || null,
				createdByEmail: q.createdByEmail || null,
				updatedByEmail: q.updatedByEmail || null,
				createdAt: q.createdAt,
				updatedAt: q.updatedAt,
			},
		});
	} catch (err) {
		console.error('GET /api/questions/[id] error', err);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}

export async function PUT(req, { params }) {
	try {
		const id = params.id;
		if (!ObjectId.isValid(id))
			return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

		const db = await getDb();
		const existing = await db
			.collection('questions')
			.findOne({ _id: new ObjectId(id) });
		if (!existing)
			return NextResponse.json({ error: 'Not found' }, { status: 404 });

		const auth = await assertOwnerOrAdmin(existing, req);

		if (!auth.ok)
			return NextResponse.json(
				{ error: auth.message || 'Forbidden' },
				{ status: auth.status },
			);

		const body = await req.json();
		const parsed = updateSchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json(
				{ error: parsed.error.issues[0].message },
				{ status: 400 },
			);
		}
		const data = parsed.data;

		// If options present for MCQ, sanitize and ensure 2..4 items
		const updates = { updatedAt: new Date() };

		if (data.text !== undefined) {
			// uniqueness within same category
			const dup = await db.collection('questions').findOne({
				categoryId: existing.categoryId,
				text: { $regex: `^${data.text}$`, $options: 'i' },
				_id: { $ne: existing._id },
			});
			if (dup)
				return NextResponse.json(
					{ error: 'Duplicate question text' },
					{ status: 409 },
				);
			updates.text = data.text;
		}

		if (Array.isArray(data.options)) {
			const opts = data.options.map((s) => s.trim()).filter(Boolean);
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
			updates.options = opts;
		}

		// correctIndex validation (server expects 0-based)
		if (typeof data.correctIndex === 'number') {
			const optsToCheck =
				updates.options ||
				existing.options ||
				(existing.type === 'tf' ? ['True', 'False'] : []);
			if (!Array.isArray(optsToCheck) || optsToCheck.length === 0) {
				return NextResponse.json(
					{ error: 'Question has no options to validate correctIndex' },
					{ status: 400 },
				);
			}
			if (data.correctIndex < 0 || data.correctIndex >= optsToCheck.length) {
				return NextResponse.json(
					{ error: `correctIndex out of range (0..${optsToCheck.length - 1})` },
					{ status: 400 },
				);
			}
			updates.correctIndex = data.correctIndex;
		}

		if (data.timeLimitSec !== undefined)
			updates.timeLimitSec = data.timeLimitSec;
		if (data.status !== undefined) updates.status = data.status;

		const user = await getUserFromCookies();
		updates.updatedBy = user ? user.sub : null;
		updates.updatedByEmail = user ? user.email : null;

		await db
			.collection('questions')
			.updateOne({ _id: existing._id }, { $set: updates });

		const updated = await db
			.collection('questions')
			.findOne({ _id: existing._id });

		return NextResponse.json({
			ok: true,
			question: {
				_id: updated._id.toString(),
				categoryId: updated.categoryId.toString(),
				categoryName: updated.categoryName || '',
				type: updated.type,
				difficulty: updated.difficulty,
				text: updated.text,
				options: updated.options || [],
				correctIndex: updated.correctIndex,
				timeLimitSec: updated.timeLimitSec ?? null,
				status: updated.status,
				createdBy: updated.createdBy || null,
				createdByEmail: updated.createdByEmail || null,
				updatedByEmail: updated.updatedByEmail || null,
				createdAt: updated.createdAt,
				updatedAt: updated.updatedAt,
			},
		});
	} catch (err) {
		console.error('PUT /api/questions/[id] error', err);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}

export async function DELETE(req, { params }) {
	try {
		const id = params.id;
		if (!ObjectId.isValid(id))
			return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

		const db = await getDb();
		const existing = await db
			.collection('questions')
			.findOne({ _id: new ObjectId(id) });
		if (!existing)
			return NextResponse.json({ error: 'Not found' }, { status: 404 });

		const auth = await assertOwnerOrAdmin(existing, req);
		if (!auth.ok)
			return NextResponse.json(
				{ error: auth.message || 'Forbidden' },
				{ status: auth.status },
			);

		const r = await db.collection('questions').deleteOne({ _id: existing._id });
		if (r.deletedCount === 1) {
			// decrement category.totalQuizzes
			await db
				.collection('categories')
				.updateOne(
					{ _id: existing.categoryId },
					{ $inc: { totalQuizzes: -1 } },
				);
		}

		return NextResponse.json({ ok: true });
	} catch (err) {
		console.error('DELETE /api/questions/[id] error', err);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}
