import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getDb } from '@/lib/mongodb';
const SECRET = process.env.NEXTAUTH_SECRET;

export async function GET(req, { params }) {
	try {
		console.log('--- Starting /api/quiz/attempt/[attemptId] ---');
		const token = await getToken({ req, secret: SECRET });
		if (!token?.id) {
			return NextResponse.json(
				{ error: 'You must be logged in to view this attempt' },
				{ status: 401 },
			);
		}

		const attemptId = await params.attemptId;
		if (!attemptId) {
			return NextResponse.json(
				{ error: 'Attempt ID is required' },
				{ status: 400 },
			);
		}

		const db = await getDb();
		const attempt = await db.collection('attempts').findOne({ attemptId });
		if (!attempt) {
			return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
		}

		if (String(attempt.userId) !== String(token.id)) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		const sendCorrect = !!attempt.completedAt;
		const safeQuestions = (attempt.questions || []).map((q) => {
			const base = {
				qid: q.qid,
				text: q.text,
				options: q.options,
				timeLimitSec: q.timeLimitSec ?? null,
				difficulty: q.difficulty ?? null,
				selectedIndex:
					typeof q.selectedIndex === 'number'
						? q.selectedIndex
						: q.selectedIndex ?? null,
				isCorrect:
					typeof q.isCorrect === 'boolean' ? q.isCorrect : q.isCorrect ?? null,
			};
			if (sendCorrect)
				base.correctIndex =
					typeof q.correctIndex === 'number' ? q.correctIndex : null;
			return base;
		});

		const out = {
			ok: true,
			attempt: {
				attemptId: attempt.attemptId,
				userId: attempt.userId,
				categoryId: attempt.categoryId,
				strategy: attempt.strategy || 'fixed',
				fixedDifficulty: attempt.fixedDifficulty || null,
				numQuestions: attempt.numQuestions ?? safeQuestions.length,
				startedAt: attempt.startedAt,
				completedAt: attempt.completedAt || null,
				questions: safeQuestions,
				expiresAt: attempt.expiresAt,
				score: attempt.score ?? null,
			},
		};

		console.log('Returning attempt object:', {
			attemptId: attempt.attemptId,
			questions: safeQuestions.length,
			completed: !!attempt.completedAt,
		});
		return NextResponse.json(out);
	} catch (err) {
		console.error('GET /api/quiz/attempt/[attemptId] error:', err);
		return NextResponse.json(
			{ error: 'Server error. Please try again later.' },
			{ status: 500 },
		);
	}
}
