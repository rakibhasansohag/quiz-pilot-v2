import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { v4 as uuidv4 } from 'uuid';

export function normalizeDifficulty(d) {
	if (!d) return null;
	d = String(d).toLowerCase();
	if (['easy', 'medium', 'hard'].includes(d)) return d;
	return null;
}

/**
 * Pick `count` random questions matching filter. Returns array of questions
 * with only needed fields (options, text, correctIndex, timeLimitSec, _id).
 */
export async function pickQuestions({
	categoryId = null,
	difficulties = [],
	count = 10,
}) {
	const db = await getDb();
	const match = { status: 'published' };
	if (categoryId) match.categoryId = new ObjectId(categoryId);
	if (Array.isArray(difficulties) && difficulties.length) {
		match.difficulty = { $in: difficulties };
	}
	const pipeline = [
		{ $match: match },
		{ $sample: { size: count } },
		// project only safe fields
		{
			$project: {
				text: 1,
				options: 1,
				correctIndex: 1,
				timeLimitSec: 1,
				categoryId: 1,
				categoryName: 1,
				difficulty: 1,
			},
		},
	];
	const docs = await db.collection('questions').aggregate(pipeline).toArray();
	return docs.map((q) => ({
		qid: q._id.toString(),
		text: q.text,
		options: q.options || [],
		correctIndex: q.correctIndex,
		timeLimitSec: q.timeLimitSec ?? null,
		difficulty: q.difficulty,
		categoryId: q.categoryId ? q.categoryId.toString() : null,
	}));
}

/**
 * Create an attempt document by selecting questions according to strategy.
 * Returns attempt doc (inserted).
 */
export async function createAttempt({
	userId,
	categoryId = null,
	numQuestions = 10,
	strategy = 'fixed',
	fixedDifficulty = 'medium',
	ttlSeconds = 60 * 60,
}) {
	const db = await getDb();

	let questions = [];

	if (strategy === 'fixed') {
		const dif = normalizeDifficulty(fixedDifficulty) || 'medium';
		questions = await pickQuestions({
			categoryId,
			difficulties: [dif],
			count: numQuestions,
		});
	} else if (strategy === 'progressive') {
		// split: first third easy, second third medium, last third hard
		const n = Number(numQuestions) || 10;
		const nEasy = Math.ceil(n * 0.33);
		const nMedium = Math.ceil(n * 0.33);
		const nHard = n - nEasy - nMedium;
		const parts = [];
		if (nEasy)
			parts.push(
				...(await pickQuestions({
					categoryId,
					difficulties: ['easy'],
					count: nEasy,
				})),
			);
		if (nMedium)
			parts.push(
				...(await pickQuestions({
					categoryId,
					difficulties: ['medium'],
					count: nMedium,
				})),
			);
		if (nHard)
			parts.push(
				...(await pickQuestions({
					categoryId,
					difficulties: ['hard'],
					count: nHard,
				})),
			);
		// shuffle parts to mix order (optional)
		questions = parts.sort(() => Math.random() - 0.5).slice(0, n);
	} else {
		// random across all difficulties
		questions = await pickQuestions({
			categoryId,
			difficulties: [],
			count: numQuestions,
		});
	}

	// remove any accidental duplicates (by qid)
	const seen = new Set();
	questions = questions.filter((q) => {
		if (seen.has(q.qid)) return false;
		seen.add(q.qid);
		return true;
	});

	// build attempt doc
	const now = new Date();
	const attempt = {
		_id: uuidv4(),
		userId: String(userId),
		categoryId: categoryId ? String(categoryId) : null,
		strategy,
		fixedDifficulty: fixedDifficulty || null,
		numQuestions: questions.length,
		questions,
		startedAt: now,
		completedAt: null,
		answers: [],
		score: null,
		maxScore: questions.length,
		ttlSeconds,
		expiresAt: new Date(now.getTime() + ttlSeconds * 1000),
	};

	await db.collection('attempts').insertOne(attempt);
	// increment category totalAttempts if categoryId present
	if (categoryId) {
		try {
			await db
				.collection('categories')
				.updateOne(
					{ _id: new ObjectId(categoryId) },
					{ $inc: { totalAttempts: 1 } },
				);
		} catch (e) {
			/* ignore */
		}
	}

	return attempt;
}

/**
 * Grade attempt: calculates score, sets answers and completedAt.
 * Expects answersArg: [{ qid, selectedIndex }]
 */
export async function gradeAttempt({ attemptId, answersArg }) {
	const db = await getDb();
	const attempt = await db.collection('attempts').findOne({ _id: attemptId });
	if (!attempt) throw new Error('Attempt not found');

	if (attempt.completedAt) {
		throw new Error('Attempt already completed');
	}

	// map questions by id
	const qMap = new Map(attempt.questions.map((q) => [String(q.qid), q]));
	const answers = [];
	let correctCount = 0;

	for (const a of answersArg || []) {
		const qid = String(a.qid);
		const selectedIndex =
			typeof a.selectedIndex === 'number' ? a.selectedIndex : null;
		const q = qMap.get(qid);
		if (!q) continue;
		const correct = selectedIndex !== null && selectedIndex === q.correctIndex;
		if (correct) correctCount++;
		answers.push({ qid, selectedIndex, correct, answeredAt: new Date() });
	}

	const now = new Date();
	const score = correctCount;
	const maxScore = attempt.maxScore || attempt.questions.length;

	await db.collection('attempts').updateOne(
		{ _id: attemptId },
		{
			$set: {
				completedAt: now,
				answers,
				score,
				maxScore,
				durationSec: Math.round((now - attempt.startedAt) / 1000),
			},
		},
	);

	// Optionally update leaderboard collection or compute on demand.
	// For simplicity we store one entry into "scores" collection:
	try {
		await db.collection('scores').insertOne({
			attemptId,
			userId: attempt.userId,
			categoryId: attempt.categoryId,
			score,
			maxScore,
			createdAt: now,
		});
	} catch (e) {}

	return { score, maxScore, correctCount, total: attempt.questions.length };
}
