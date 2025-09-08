import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getDb } from '@/lib/mongodb';
const SECRET = process.env.NEXTAUTH_SECRET;

export async function GET(req, { params }) {
	try {
		console.log('--- Starting /api/quiz/attempt/[attemptId] ---');

		const token = await getToken({ req, secret: SECRET });
		if (!token?.id) {
			console.log('Unauthorized: No token or missing user id');
			return NextResponse.json(
				{ error: 'You must be logged in to view this attempt' },
				{ status: 401 },
			);
		}
		console.log('Authenticated user:', token.id);

		// ERROR: IF it needs an await we will use that if break the choosing the questions for the quiz we will need to await
		const attemptId = params.attemptId;
		if (!attemptId) {
			console.log('Error: attemptId not provided in route');
			return NextResponse.json(
				{ error: 'Attempt ID is required' },
				{ status: 400 },
			);
		}
		console.log('Fetching attemptId:', attemptId);

		const db = await getDb();
		const attempt = await db.collection('attempts').findOne({ attemptId });
		if (!attempt) {
			console.log('No attempt found with id:', attemptId);
			return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
		}
		console.log('Attempt found:', {
			attemptId: attempt.attemptId,
			numQuestions: attempt.questions?.length || 0,
		});

		if (String(attempt.userId) !== String(token.id)) {
			console.log('Forbidden: Attempt does not belong to this user', {
				attemptUserId: attempt.userId,
				tokenId: token.id,
			});
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		// If attempt already graded (completedAt), we can safely send correctIndex too so result page can show answers;
		// If attempt not completed, DO NOT send correctIndex.
		const sendCorrect = !!attempt.completedAt;

		const safeQuestions = (attempt.questions || []).map((q) => {
			const base = {
				qid: q.qid,
				text: q.text,
				options: q.options,
				timeLimitSec: q.timeLimitSec ?? null,
				difficulty: q.difficulty ?? null,
				selectedIndex:
					typeof q.selectedIndex === 'number' ? q.selectedIndex : null,
				isCorrect: typeof q.isCorrect === 'boolean' ? q.isCorrect : null,
			};
			if (sendCorrect)
				base.correctIndex =
					typeof q.correctIndex === 'number' ? q.correctIndex : null;
			return base;
		});

		const out = {
			attemptId: attempt.attemptId,
			userId: attempt.userId,
			categoryId: attempt.categoryId,
			numQuestions: attempt.numQuestions ?? safeQuestions.length,
			startedAt: attempt.startedAt,
			completedAt: attempt.completedAt || null,
			questions: safeQuestions,
			expiresAt: attempt.expiresAt,
			score: attempt.score ?? null,
		};

		console.log('Returning attempt object:', {
			attemptId: out.attemptId,
			questions: out.questions.length,
			completed: !!out.completedAt,
		});
		return NextResponse.json({ ok: true, attempt: out });
	} catch (err) {
		console.error('GET /api/quiz/attempt/[attemptId] error:', err);
		return NextResponse.json(
			{ error: 'Server error. Please try again later.' },
			{ status: 500 },
		);
	}
}
