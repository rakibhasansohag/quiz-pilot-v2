import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getDb } from '@/lib/mongodb';

const SECRET = process.env.NEXTAUTH_SECRET;

/**
 * GET /api/quiz/topicAccuracy
 * returns category-wise accuracy for the authenticated user
 */

export async function GET(req) {
  try {
    console.log('--- Starting /api/quiz/topicAccuracy ---');

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
      .limit(500); // adjust limit if needed
    const attempts = await attemptsCursor.toArray();

    // fetch categories once
    const catsArr = await db.collection('categories').find({}).toArray();
    const catById = {};
    catsArr.forEach((c) => {
      catById[String(c._id)] = c.name || c.title || null;
    });

    // calculate category-wise accuracy
    const categoryStats = {};
    attempts.forEach((a) => {
      const catId = a.categoryId ? String(a.categoryId) : 'unknown';
      if (!categoryStats[catId]) {
        categoryStats[catId] = { categoryName: catById[catId] || 'Unknown', totalScore: 0, totalMax: 0 };
      }
      categoryStats[catId].totalScore += a.score ?? 0;
      categoryStats[catId].totalMax += a.maxScore ?? (a.numQuestions ?? 0);
    });

    // prepare result
    const accuracyPerCategory = Object.values(categoryStats).map((c) => ({
      category: c.categoryName,
      accuracy: c.totalMax > 0 ? (c.totalScore / c.totalMax) * 100 : 0, // percentage
    }));

    console.log('Returning accuracy for', accuracyPerCategory.length, 'categories');
    return NextResponse.json({ ok: true, accuracy: accuracyPerCategory });
  } catch (err) {
    console.error('GET /api/quiz/topicAccuracy error:', err);
    return NextResponse.json(
      { error: 'Server error fetching topic accuracy' },
      { status: 500 },
    );
  }
}
