import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getToken } from 'next-auth/jwt';

const SECRET = process.env.NEXTAUTH_SECRET;

export async function POST(req) {
	try {
		console.log('--- Starting /api/quiz/start ---');
		const token = await getToken({ req, secret: SECRET });
		if (!token?.id) {
			return NextResponse.json(
				{ error: 'You must be logged in to start a quiz' },
				{ status: 401 },
			);
		}
		console.log('Authenticated user:', token.id);

		const body = await req.json().catch(() => ({}));
		let { categoryId, numQuestions = 5, fixedDifficulty } = body;
		console.log('Request body:', { categoryId, numQuestions, fixedDifficulty });

		const db = await getDb();
		const difficulty = fixedDifficulty
			? String(fixedDifficulty).toLowerCase()
			: null;

		// allow "random" categoryId from client to pick a category server-side with available questions
		if (!categoryId || categoryId === 'random') {
			const match = { status: 'published' };
			if (difficulty) match.difficulty = difficulty;

			const agg = [
				{ $match: match },
				{ $group: { _id: '$categoryId', count: { $sum: 1 } } },
				{ $match: { count: { $gt: 0 } } },
				{ $sample: { size: 1 } },
			];
			const sample = await db.collection('questions').aggregate(agg).toArray();
			if (!sample || !sample.length) {
				return NextResponse.json({
					ok: false,
					message:
						'No questions found for the selected difficulty. Try different options.',
				});
			}
			categoryId = String(sample[0]._id);
			console.log(
				'Server-chosen categoryId:',
				categoryId,
				'count:',
				sample[0].count,
			);
		}

		const query = {
			categoryId: new ObjectId(categoryId),
			status: 'published',
			...(difficulty ? { difficulty } : {}),
		};

		const questions = await db.collection('questions').find(query).toArray();
		console.log(
			`Found ${questions.length} questions for category ${categoryId}`,
		);

		if (!questions.length) {
			return NextResponse.json({
				ok: false,
				message: 'No questions found in this category.',
			});
		}

		const count = Math.min(questions.length, Number(numQuestions) || 5);
		const shuffled = questions.sort(() => 0.5 - Math.random());
		const selected = shuffled.slice(0, count);

		const attempt = {
			attemptId: crypto.randomUUID(),
			userId: token.id,
			categoryId,
			strategy: 'fixed',
			fixedDifficulty: fixedDifficulty || null,
			numQuestions: selected.length,
			questions: selected.map((q) => ({
				qid: q._id.toString(),
				text: q.text,
				options: q.options,
				timeLimitSec: q.timeLimitSec ?? null,
				difficulty: q.difficulty ?? null,
				correctIndex:
					typeof q.correctIndex === 'number' ? q.correctIndex : null,
			})),
			startedAt: new Date(),
			expiresAt: new Date(Date.now() + 60 * 60 * 1000),
			ttlSeconds: 3600,
			answers: [],
			score: null,
			completedAt: null,
		};

		await db.collection('attempts').insertOne(attempt);
		console.log('Attempt inserted successfully into DB:', attempt.attemptId);

		return NextResponse.json({
			ok: true,
			attemptId: attempt.attemptId,
			attempt,
		});
	} catch (err) {
		console.error('Error in /api/quiz/start:', err);
		return NextResponse.json(
			{ error: 'Server error. Please try again later.' },
			{ status: 500 },
		);
	}
}
