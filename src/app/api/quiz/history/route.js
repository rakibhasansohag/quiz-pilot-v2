import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getDb } from '@/lib/mongodb';

const SECRET = process.env.NEXTAUTH_SECRET;

/**
 * GET /api/quiz/history
 * returns attempts for the authenticated user
 * safe fields only (no question secrets)
 */

export async function GET(req) {
	try {
		console.log('--- Starting /api/quiz/history ---');

		// auth
		const token = await getToken({ req, secret: SECRET });
		if (!token?.id) {
			console.log('Unauthorized: no token');
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}
		const userId = token.id;
		console.log('Authenticated user:', userId);

		const db = await getDb();

		// fetch attempts for user, newest first
		const attemptsCursor = db
			.collection('attempts')
			.find({ userId })
			.sort({ startedAt: -1 })
			.limit(200); // avoid huge responses
		const attempts = await attemptsCursor.toArray();

		// fetch categories once and map id to name (safe lookup)
		const catsArr = await db.collection('categories').find({}).toArray();
		const catById = {};
		catsArr.forEach((c) => {
			// ensure string key
			catById[String(c._id)] = c.name || c.title || null;
		});

		// prepare safe list to return
		const safeAttempts = attempts.map((a) => {
			return {
				attemptId: a.attemptId,
				strategy: a.strategy ?? 'fixed',
				fixedDifficulty: a.fixedDifficulty ?? null,
				categoryId: a.categoryId ?? null,
				categoryName: catById[String(a.categoryId)] ?? null,
				numQuestions: a.numQuestions ?? a.questions?.length ?? 0,
				startedAt: a.startedAt ?? null,
				completedAt: a.completedAt ?? null,
				score: a.score ?? null,
				maxScore: a.maxScore ?? a.numQuestions ?? a.questions?.length ?? 0,
				ttlSeconds: a.ttlSeconds ?? null,
				expiresAt: a.expiresAt ?? null,
				// Point:  lightweight summary (don't include full questions)
			};
		});

		console.log('Returning', safeAttempts.length, 'attempts for user');
		return NextResponse.json({ ok: true, attempts: safeAttempts });
	} catch (err) {
		console.error('GET /api/quiz/history error:', err);
		return NextResponse.json(
			{ error: 'Server error fetching quiz history' },
			{ status: 500 },
		);
	}
}
