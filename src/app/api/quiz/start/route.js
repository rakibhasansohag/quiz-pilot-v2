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
			console.log('Unauthorized: no token');
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

		// normalize difficulty
		const difficulty = fixedDifficulty
			? String(fixedDifficulty).toLowerCase()
			: null;

		// If categoryId missing or 'random', pick a category server-side that has >= 1 available question
		if (!categoryId || categoryId === 'random') {
			console.log(
				'No category requested or random requested — sampling a category with available questions',
			);

			// Build question match filter (server-side)
			const match = { status: 'published' };
			if (difficulty) {
				match.difficulty = difficulty;
			}

			// Use aggregation to group by categoryId and sample one (only categories with at least one match)
			const agg = [
				{ $match: match },
				{ $group: { _id: '$categoryId', count: { $sum: 1 } } },
				{ $match: { count: { $gt: 0 } } },
				{ $sample: { size: 1 } },
			];

			const sample = await db.collection('questions').aggregate(agg).toArray();
			if (!sample || !sample.length) {
				console.log(
					'No categories found with matching questions (server random).',
				);
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
				'hasCount:',
				sample[0].count,
			);
		}

		// Build query for fetching questions for chosen category
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
				message:
					'No questions found in this category. Please try another one later!',
			});
		}

		// pick random N
		const count = Math.min(questions.length, Number(numQuestions) || 5);
		const shuffled = questions.sort(() => 0.5 - Math.random());
		const selected = shuffled.slice(0, count);
		console.log(`Selected ${selected.length} random questions`);

		// prepare attempt (DO NOT leak correctIndex to client on GET; but storing here is ok server-side)
		const attempt = {
			attemptId: crypto.randomUUID(),
			userId: token.id,
			categoryId,
			numQuestions: selected.length,
			questions: selected.map((q) => ({
				qid: q._id.toString(),
				text: q.text,
				options: q.options,
				timeLimitSec: q.timeLimitSec,
				difficulty: q.difficulty,
				// store correctIndex server-side (so user can grade later)
				correctIndex:
					typeof q.correctIndex === 'number' ? q.correctIndex : null,
			})),
			startedAt: new Date(),
			expiresAt: new Date(Date.now() + 60 * 60 * 1000),
			answers: [],
			score: null,
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
