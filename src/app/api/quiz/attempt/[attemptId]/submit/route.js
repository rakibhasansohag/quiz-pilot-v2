import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getDb } from '@/lib/mongodb';
const SECRET = process.env.NEXTAUTH_SECRET;

export async function POST(req, { params }) {
	try {
		console.log('--- Starting /api/quiz/attempt/[attemptId]/submit ---');

		const token = await getToken({ req, secret: SECRET });
		if (!token?.id) {
			console.log('Unauthorized: no token');
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}
		console.log('Authenticated user:', token.id);

		const attemptId = params.attemptId;
		if (!attemptId) {
			console.log('Error: attemptId not provided in route');
			return NextResponse.json(
				{ error: 'Attempt ID required' },
				{ status: 400 },
			);
		}
		console.log('Attempt ID to grade:', attemptId);

		const body = await req.json().catch(() => ({}));
		const { answers = [] } = body;
		console.log('Answers received:', answers);

		const db = await getDb();
		const attempt = await db.collection('attempts').findOne({ attemptId });
		if (!attempt) {
			console.log('Attempt not found in DB for grading:', attemptId);
			return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
		}

		if (attempt.completedAt) {
			console.log('Attempt already graded:', attemptId);
			return NextResponse.json(
				{ error: 'Attempt already completed' },
				{ status: 400 },
			);
		}

		// Grade: look up each stored question.correctIndex (kept in DB at start)
		let score = 0;
		const gradedQuestions = (attempt.questions || []).map((q) => {
			const userAns = answers.find((a) => a.qid === q.qid);
			const selectedIndex =
				typeof userAns?.selectedIndex === 'number'
					? userAns.selectedIndex
					: null;
			const correctIndex =
				typeof q.correctIndex === 'number' ? q.correctIndex : null;
			const isCorrect =
				selectedIndex !== null &&
				correctIndex !== null &&
				selectedIndex === correctIndex;
			if (isCorrect) score += 1;

			return {
				...q, // includes correctIndex in DB
				selectedIndex,
				isCorrect,
			};
		});

		const completedAt = new Date();
		await db.collection('attempts').updateOne(
			{ attemptId },
			{
				$set: {
					answers,
					completedAt,
					score,
					questions: gradedQuestions,
				},
			},
		);

		console.log('Attempt updated in DB');

		// Return graded attempt (this contains correctIndex now so results view can display)
		return NextResponse.json({
			ok: true,
			result: {
				attemptId,
				userId: attempt.userId,
				categoryId: attempt.categoryId,
				numQuestions: attempt.numQuestions,
				startedAt: attempt.startedAt,
				completedAt,
				score,
				questions: gradedQuestions.map((q) => ({
					qid: q.qid,
					text: q.text,
					options: q.options,
					timeLimitSec: q.timeLimitSec,
					difficulty: q.difficulty,
					selectedIndex: q.selectedIndex,
					correctIndex: q.correctIndex,
					isCorrect: q.isCorrect,
				})),
			},
		});
	} catch (err) {
		console.error('POST gradeAttempt Error:', err);
		return NextResponse.json(
			{ error: err.message || 'Failed to grade' },
			{ status: 500 },
		);
	}
}
