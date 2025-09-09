import { ObjectId } from 'mongodb';

const MAX_Q = 20;

/**
 * updateLeaderboard(db, attempt, userInfo)
 * - attempt: the attempt DB doc (must include categoryId, requestedNumQuestions?, numQuestions, score, startedAt, completedAt)
 * - userInfo: optional { displayName, avatarUrl, name }
 *
 * Behavior:
 * - chooses grouping key: { categoryId, categoryName, difficulty, numQuestions }.
 * - numQuestions used: attempt.requestedNumQuestions || attempt.numQuestions || questions.length
 * - upserts per-user leaderboard doc and recomputes group stats in leaderboard_stats.
 */

export async function updateLeaderboard(db, attempt, userInfo = {}) {
	if (!db || !attempt) throw new Error('db and attempt required');

	const categoryId = String(attempt.categoryId ?? '');
	// get categoryName from categories collection if possible
	let categoryName = null;
	if (categoryId) {
		try {
			const cat = await db
				.collection('categories')
				.findOne({ _id: new ObjectId(categoryId) })
				.catch(() => null);
			if (cat) categoryName = cat.name;
		} catch (e) {
			const cat = await db
				.collection('categories')
				.findOne({ _id: categoryId })
				.catch(() => null);
			if (cat) categoryName = cat.name;
		}
	}

	// difficulty prefer attempt.fixedDifficulty then attempt.difficulty
	const difficulty = attempt.fixedDifficulty ?? attempt.difficulty ?? 'Any';

	// use requestedNumQuestions if present (user selected number), else actual attempt.numQuestions
	const requested = Number(attempt.requestedNumQuestions ?? 0) || null;
	const actual =
		Number(attempt.numQuestions ?? attempt.questions?.length ?? 0) || 0;
	const numQuestions = Math.min(requested || actual || 0, MAX_Q);

	const userId = String(attempt.userId);
	const score = Number(attempt.score ?? 0);
	const attemptId = attempt.attemptId ?? null;
	const now = new Date();

	// compute time in ms if possible
	let timeMs = null;
	try {
		if (attempt.startedAt && attempt.completedAt) {
			const s = new Date(attempt.startedAt).getTime();
			const e = new Date(attempt.completedAt).getTime();
			if (!Number.isNaN(s) && !Number.isNaN(e)) timeMs = Math.max(0, e - s);
		}
	} catch (e) {}

	const displayName = userInfo.displayName ?? userInfo.name ?? null;
	const avatarUrl = userInfo.avatarUrl ?? userInfo.avatar ?? null;

	const groupFilter = { categoryId, difficulty, numQuestions };

	// upsert per-user leaderboard
	const lbFilter = { ...groupFilter, userId };
	const existing = await db.collection('leaderboard').findOne(lbFilter);

	if (!existing) {
		const doc = {
			...lbFilter,
			categoryName: categoryName ?? null,
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
				...(categoryName ? { categoryName } : {}),
				...(displayName ? { displayName } : {}),
				...(avatarUrl ? { avatarUrl } : {}),
			},
		};

		// update best score/time if better
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

	// recompute group stats in leaderboard_stats
	// participantsCount = number of unique users for group
	const participantsCount = await db
		.collection('leaderboard')
		.countDocuments(groupFilter);

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
		categoryName: categoryName ?? null,
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

	const perUser = await db.collection('leaderboard').findOne(lbFilter);
	const freshStats = await db
		.collection('leaderboard_stats')
		.findOne(groupFilter);

	return { perUser, stats: freshStats };
}
