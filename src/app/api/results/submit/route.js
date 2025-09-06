import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getUserFromCookies } from '@/lib/getUserFromCookies';

const schema = z.object({
	categoryId: z.string(),
	score: z.number().int().min(0),
	total: z.number().int().min(1),
	timeTakenSec: z.number().int().min(0),
	answers: z.array(
		z.object({
			questionId: z.string(),
			selectedIndex: z.number().optional(),
			correct: z.boolean(),
		}),
	),
});

// TODO: WILL UPDAED THIS AFTER THE QUIZ IS FINISHED
export async function POST(req) {
	const parsedBody = await req.json();
	const parsed = schema.safeParse(parsedBody);
	if (!parsed.success)
		return NextResponse.json(
			{ error: parsed.error.issues[0].message },
			{ status: 400 },
		);

	const user = await getUserFromCookies();
	if (!user)
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

	const db = await getDb();
	const { categoryId, score, total, timeTakenSec, answers } = parsed.data;

	const resultDoc = {
		userId: user.sub,
		userEmail: user.email,
		categoryId: new ObjectId(categoryId),
		score,
		total,
		accuracy: score / total,
		timeTakenSec,
		answers: answers.map((a) => ({
			...a,
			questionId: new ObjectId(a.questionId),
		})),
		createdAt: new Date(),
	};

	await db.collection('results').insertOne(resultDoc);

	// increment category totalAttempts
	await db
		.collection('categories')
		.updateOne(
			{ _id: new ObjectId(categoryId) },
			{ $inc: { totalAttempts: 1 } },
		);

	// update leaderboard (upsert)
	await db.collection('leaderboard').updateOne(
		{ categoryId: new ObjectId(categoryId), userId: user.sub },
		{
			$inc: { attempts: 1 },
			$max: { bestScore: score },
			$set: { userEmail: user.email, lastAttemptAt: new Date() },
		},
		{ upsert: true },
	);

	return NextResponse.json({ ok: true });
}
