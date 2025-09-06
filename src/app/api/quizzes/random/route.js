import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const schema = z.object({
	categoryId: z.string().nonempty(),
	difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
	limit: z.number().int().min(1).max(50).optional().default(10),
});

export async function POST(req) {
	const body = await req.json();
	const parsed = schema.safeParse(body);
	if (!parsed.success)
		return NextResponse.json(
			{ error: parsed.error.issues[0].message },
			{ status: 400 },
		);

	const { categoryId, difficulty, limit } = parsed.data;
	const db = await getDb();

	const match = { categoryId: new ObjectId(categoryId), status: 'published' };
	if (difficulty) match.difficulty = difficulty;

	const pipeline = [
		{ $match: match },
		{ $sample: { size: limit } },
		// optional: project to remove correct answer
		{ $project: { correctIndex: 0 } },
	];

	const questions = await db
		.collection('questions')
		.aggregate(pipeline)
		.toArray();

	// return questions (convert ObjectId to string)
	const out = questions.map((q) => ({
		_id: q._id.toString(),
		categoryId: q.categoryId.toString(),
		type: q.type,
		difficulty: q.difficulty,
		text: q.text,
		options: q.options,
		timeLimitSec: q.timeLimitSec || null,
	}));

	return NextResponse.json({ questions: out });
}
