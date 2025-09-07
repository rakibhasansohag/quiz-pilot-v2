import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getUserFromCookies } from '@/lib/getUserFromCookies';

const schema = z.object({
	title: z.string().min(3),
	categoryId: z.string(),
	questionIds: z.array(z.string()).min(1),
	difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});

// POINT: ---------- IT"S FOR PREMADE ADMIN ONLY --------------
export async function POST(req) {
	const body = await req.json();
	const parsed = schema.safeParse(body);
	if (!parsed.success)
		return NextResponse.json(
			{ error: parsed.error.issues[0].message },
			{ status: 400 },
		);

	const user = await getUserFromCookies(req);
	if (!user || user.role !== 'admin')
		return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

	const { title, categoryId, questionIds, difficulty } = parsed.data;
	const db = await getDb();

	const quizDoc = {
		title,
		categoryId: new ObjectId(categoryId),
		questionIds: questionIds.map((id) => new ObjectId(id)),
		difficulty: difficulty || null,
		createdBy: user.sub,
		createdByEmail: user.email,
		createdAt: new Date(),
	};

	const res = await db.collection('quizzes').insertOne(quizDoc);

	// increment category.totalQuizzes
	await db
		.collection('categories')
		.updateOne(
			{ _id: new ObjectId(categoryId) },
			{ $inc: { totalQuizzes: 1 } },
		);

	return NextResponse.json(
		{ ok: true, quizId: res.insertedId.toString() },
		{ status: 201 },
	);
}
