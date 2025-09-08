import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(req, { params }) {
	const { categoryId } = params;
	const db = await getDb();

	const topUsers = await db
		.collection('leaderboard')
		.find({ categoryId })
		.sort({ percentage: -1 })
		.limit(3)
		.toArray();

	return NextResponse.json({ ok: true, topUsers });
}
