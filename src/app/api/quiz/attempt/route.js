import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getDb } from '@/lib/mongodb';
const SECRET = process.env.NEXTAUTH_SECRET;

export async function GET(req) {
	const token = await getToken({ req, secret: SECRET });
	if (!token?.id) return NextResponse.json({ attempts: [] });

	const db = await getDb();
	const attempts = await db
		.collection('attempts')
		.find({ userId: String(token.id) })
		.sort({ startedAt: -1 })
		.limit(50)
		.toArray();

	// return summary list
	const out = attempts.map((a) => ({
		attemptId: a._id,
		score: a.score,
		maxScore: a.maxScore,
		startedAt: a.startedAt,
		completedAt: a.completedAt,
		categoryId: a.categoryId,
	}));

	return NextResponse.json({ attempts: out });
}
