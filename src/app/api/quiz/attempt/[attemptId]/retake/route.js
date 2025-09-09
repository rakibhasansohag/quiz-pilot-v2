import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getDb } from '@/lib/mongodb';

const SECRET = process.env.NEXTAUTH_SECRET;

export async function POST(req, { params }) {
	try {
		console.log('--- Starting /api/quiz/attempt/[attemptId]/retake ---');

		const token = await getToken({ req, secret: SECRET });
		if (!token?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}
		const attemptId = params.attemptId;
		if (!attemptId) {
			return NextResponse.json(
				{ error: 'Attempt ID required' },
				{ status: 400 },
			);
		}

		const db = await getDb();
		const attempt = await db.collection('attempts').findOne({ attemptId });
		if (!attempt)
			return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
		if (String(attempt.userId) !== String(token.id))
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

		const maxScore =
			attempt.maxScore ??
			attempt.numQuestions ??
			attempt.questions?.length ??
			0;
		if (typeof attempt.score === 'number' && attempt.score >= maxScore) {
			return NextResponse.json(
				{
					ok: false,
					message: 'Attempt already has full score — cannot retake.',
				},
				{ status: 400 },
			);
		}

		const resetQuestions = (attempt.questions || []).map((q) => ({
			qid: q.qid,
			text: q.text,
			options: q.options,
			timeLimitSec: q.timeLimitSec ?? null,
			difficulty: q.difficulty ?? null,
			correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : null,
		}));

		const now = new Date();
		const newExpires = new Date(
			Date.now() + (attempt.ttlSeconds ?? 3600) * 1000,
		);

		await db.collection('attempts').updateOne(
			{ attemptId },
			{
				$set: {
					questions: resetQuestions,
					answers: [],
					score: null,
					startedAt: now,
					completedAt: null,
					expiresAt: newExpires,
				},
			},
		);

		console.log('Attempt reset for retake:', attemptId);
		return NextResponse.json({
			ok: true,
			attemptId,
			lastUpdated: new Date().toISOString(),
		});
	} catch (err) {
		console.error('Retake error:', err);
		return NextResponse.json(
			{ error: 'Server error during retake' },
			{ status: 500 },
		);
	}
}
