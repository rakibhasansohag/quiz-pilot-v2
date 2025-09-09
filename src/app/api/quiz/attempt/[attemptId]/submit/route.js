import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getDb } from '@/lib/mongodb';
import { updateLeaderboard } from '@/lib/leaderboard';
import { getUserById } from '@/lib/user';

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

		// Grade
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
				...q,
				selectedIndex,
				isCorrect,
			};
		});

		const completedAt = new Date();

		// persist graded attempt
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

		console.log(
			'Attempt updated in DB; fetching updated attempt for leaderboard...',
		);

		// fetch the updated attempt back (so it has completedAt and score)
		const updatedAttempt = await db
			.collection('attempts')
			.findOne({ attemptId });
		if (!updatedAttempt) {
			console.error('Unexpected: updated attempt disappeared');
			return NextResponse.json({ error: 'Server error' }, { status: 500 });
		}

		// fetch user info
		const userInfo = (await getUserById(db, updatedAttempt.userId)) || {};

		// update leaderboard only after attempt is completed and stored
		try {
			await updateLeaderboard(db, updatedAttempt, {
				displayName: userInfo.name,
				avatarUrl: userInfo.avatarUrl,
			});
		} catch (lbErr) {
			console.error('updateLeaderboard failed:', lbErr);
		}

		// Respond with a consistent payload
		return NextResponse.json({
			ok: true,
			attemptId,
			result: {
				attemptId,
				userId: updatedAttempt.userId,
				categoryId: updatedAttempt.categoryId,
				numQuestions: updatedAttempt.numQuestions,
				startedAt: updatedAttempt.startedAt,
				completedAt: updatedAttempt.completedAt,
				score: updatedAttempt.score,
				questions: updatedAttempt.questions.map((q) => ({
					qid: q.qid,
					text: q.text,
					options: q.options,
					timeLimitSec: q.timeLimitSec ?? null,
					difficulty: q.difficulty ?? null,
					selectedIndex:
						typeof q.selectedIndex === 'number' ? q.selectedIndex : null,
					correctIndex:
						typeof q.correctIndex === 'number' ? q.correctIndex : null,
					isCorrect: typeof q.isCorrect === 'boolean' ? q.isCorrect : null,
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
