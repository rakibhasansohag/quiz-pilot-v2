import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getToken } from 'next-auth/jwt';

const SECRET = process.env.NEXTAUTH_SECRET;
const DEFAULT_NUMQ = 20;

export async function GET(req) {
	try {
		const db = await getDb();
		const url = new URL(req.url);
		const categoryId = url.searchParams.get('categoryId') ?? '';
		const difficulty = url.searchParams.get('difficulty') ?? '';
		// default to 20 if missing
		const numQuestions = url.searchParams.get('numQuestions')
			? Number(url.searchParams.get('numQuestions'))
			: DEFAULT_NUMQ;

		const page = Math.max(1, Number(url.searchParams.get('page') || 1));
		const limit = Math.min(50, Number(url.searchParams.get('limit') || 25));
		const skip = (page - 1) * limit;

		const filter = {};
		if (categoryId) filter.categoryId = String(categoryId);
		if (difficulty) filter.difficulty = String(difficulty);
		if (typeof numQuestions === 'number')
			filter.numQuestions = Number(numQuestions);

		// sort: bestScore desc, bestTimeMs asc (nulls last), lastAttemptAt desc
		const list = await db
			.collection('leaderboard')
			.find(filter)
			.sort({ bestScore: -1, bestTimeMs: 1, lastAttemptAt: -1 })
			.skip(skip)
			.limit(limit)
			.toArray();

		// get group stats
		const stats =
			(await db.collection('leaderboard_stats').findOne(filter)) || null;

		// try to get current user token
		let token = null;
		try {
			token = await getToken({ req, secret: SECRET });
		} catch {}

		const currentUserId = token?.id ?? null;

		// compute current user's rank (if present) — cheap approach for small scale
		let currentUserRank = null;
		if (currentUserId) {
			// If user exists in leaderboard for this group, compute strictly better count
			const userDoc = await db
				.collection('leaderboard')
				.findOne({ ...filter, userId: currentUserId });
			if (userDoc) {
				// count documents strictly better: higher bestScore OR same score and lower bestTimeMs
				const betterFilter = {
					...filter,
					$or: [
						{ bestScore: { $gt: userDoc.bestScore } },
						{
							$and: [
								{ bestScore: userDoc.bestScore },
								{
									$or: [
										{
											bestTimeMs: {
												$lt: userDoc.bestTimeMs ?? Number.MAX_SAFE_INTEGER,
											},
										},
										{ bestTimeMs: null },
									],
								},
							],
						},
					],
				};
				const betterCount = await db
					.collection('leaderboard')
					.countDocuments(betterFilter);
				currentUserRank = betterCount + 1;
			}
		}

		const total = await db.collection('leaderboard').countDocuments(filter);

		return NextResponse.json({
			ok: true,
			page,
			limit,
			total,
			filter: { categoryId, difficulty, numQuestions },
			stats,
			list,
			currentUserId,
			currentUserRank,
		});
	} catch (err) {
		console.error('GET /api/leaderboard error', err);
		return NextResponse.json(
			{ ok: false, error: 'Server error' },
			{ status: 500 },
		);
	}
}
