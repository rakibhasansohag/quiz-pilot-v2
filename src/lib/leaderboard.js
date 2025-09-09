import { ObjectId } from 'mongodb';

/**
 * updateLeaderboard(db, attempt, userInfo)
 * - attempt: DB attempt object (must include attemptId, userId, categoryId, fixedDifficulty or difficulty, numQuestions, score, startedAt, completedAt)
 * - userInfo: { displayName, avatarUrl } optional
 *
 * Behavior:
 * - groupKey: { categoryId, difficulty, numQuestions } where numQuestions is capped to MAX_Q (20)
 * - upserts a per-user leaderboard document (one doc per user per group)
 * - recomputes group stats (participants, average score, total attempts, topScore) and stores them in `leaderboard_stats` collection
 */
const MAX_Q = 20;

export async function updateLeaderboard(db, attempt, userInfo = {}) {
	if (!db || !attempt) throw new Error('db and attempt required');

	const categoryId = String(attempt.categoryId ?? '');
	// normalize difficulty string (store as Title case or exact as used elsewhere)
	const difficulty = attempt.fixedDifficulty ?? attempt.difficulty ?? 'Any';
	const numQuestions = Math.min(
		Number(attempt.numQuestions ?? attempt.questions?.length ?? 0) || 0,
		MAX_Q,
	);
	const userId = String(attempt.userId);
	const score = Number(attempt.score ?? 0);
	const attemptId = attempt.attemptId ?? null;
	const now = new Date();

	// time in ms (if available)
	let timeMs = null;
	if (attempt.startedAt && attempt.completedAt) {
		try {
			const s = new Date(attempt.startedAt).getTime();
			const e = new Date(attempt.completedAt).getTime();
			if (!Number.isNaN(s) && !Number.isNaN(e)) timeMs = Math.max(0, e - s);
		} catch {}
	}

	const displayName = userInfo.displayName ?? userInfo.name ?? null;
	const avatarUrl = userInfo.avatarUrl ?? userInfo.avatar ?? null;

	const groupFilter = {
		categoryId,
		difficulty,
		numQuestions,
	};

	// Upsert per-user leaderboard doc
	const lbFilter = { ...groupFilter, userId };
	const existing = await db.collection('leaderboard').findOne(lbFilter);

	if (!existing) {
		const doc = {
			...lbFilter,
			displayName: displayName ?? null,
			avatarUrl: avatarUrl ?? null,
			bestScore: score,
			bestTimeMs: typeof timeMs === 'number' ? timeMs : null,
			bestAttemptId: attemptId,
			attempts: 1,
			lastAttemptAt: now,
			createdAt: now,
		};
		await db.collection('leaderboard').insertOne(doc);
	} else {
		const updateOps = {
			$inc: { attempts: 1 },
			$set: {
				lastAttemptAt: now,
				...(displayName ? { displayName } : {}),
				...(avatarUrl ? { avatarUrl } : {}),
			},
		};

		// best-score/time logic
		if (typeof existing.bestScore !== 'number' || score > existing.bestScore) {
			updateOps.$set.bestScore = score;
			updateOps.$set.bestAttemptId = attemptId;
			if (typeof timeMs === 'number') updateOps.$set.bestTimeMs = timeMs;
		} else if (score === existing.bestScore && typeof timeMs === 'number') {
			if (existing.bestTimeMs == null || timeMs < existing.bestTimeMs) {
				updateOps.$set.bestTimeMs = timeMs;
				updateOps.$set.bestAttemptId = attemptId;
			}
		}

		await db
			.collection('leaderboard')
			.updateOne({ _id: existing._id }, updateOps);
	}

	// Recompute group-level stats and persist in leaderboard_stats collection
	const participantsCount = await db
		.collection('leaderboard')
		.countDocuments(groupFilter);

	// compute aggregated values for this group using aggregation
	const agg = await db
		.collection('leaderboard')
		.aggregate([
			{ $match: groupFilter },
			{
				$group: {
					_id: null,
					topScore: { $max: '$bestScore' },
					avgScore: { $avg: '$bestScore' },
					totalAttempts: { $sum: '$attempts' },
					minTimeMs: { $min: '$bestTimeMs' },
				},
			},
		])
		.toArray();

	const stats = agg[0] || {
		topScore: null,
		avgScore: null,
		totalAttempts: 0,
		minTimeMs: null,
	};

	const statsDoc = {
		...groupFilter,
		participantsCount,
		topScore: stats.topScore ?? null,
		avgScore: stats.avgScore != null ? Number(stats.avgScore.toFixed(2)) : null,
		totalAttempts: stats.totalAttempts ?? 0,
		bestTimeMs: stats.minTimeMs ?? null,
		updatedAt: now,
	};

	await db
		.collection('leaderboard_stats')
		.updateOne(
			groupFilter,
			{ $set: statsDoc, $setOnInsert: { createdAt: now } },
			{ upsert: true },
		);

	// return both the per-user doc and stats for immediate use
	const perUser = await db.collection('leaderboard').findOne(lbFilter);
	const freshStats = await db
		.collection('leaderboard_stats')
		.findOne(groupFilter);

	return { perUser, stats: freshStats };
}
