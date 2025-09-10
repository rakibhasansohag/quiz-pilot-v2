import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getDb } from '@/lib/mongodb';
import moment from 'moment';

const SECRET = process.env.NEXTAUTH_SECRET;

/**
 * GET /api/quiz/history/monthly
 * returns quiz count per month for past 6 months for the authenticated user
 */
export async function GET(req) {
  try {
    const token = await getToken({ req, secret: SECRET });
    if (!token?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = token.id;

    const db = await getDb();

    // fetch all attempts for the user
    const attempts = await db
      .collection('attempts')
      .find({ userId })
      .toArray();

    // prepare last 6 months array
    const months = [];
    for (let i = 5; i >= 0; i--) {
      months.push(moment().subtract(i, 'months').format('MMM')); // "Jan", "Feb", etc.
    }

    // initialize counts
    const quizCount = {};
    months.forEach(m => { quizCount[m] = 0; });

    // count attempts per month
    attempts.forEach(a => {
      if (!a.startedAt) return;
      const month = moment(a.startedAt).format('MMM');
      if (quizCount.hasOwnProperty(month)) {
        quizCount[month] += 1;
      }
    });

    // prepare response for BarChart
    const monthlyData = months.map(m => ({
      month: m,
      quizzes: quizCount[m],
    }));

    return NextResponse.json({ ok: true, quizHistory: monthlyData });
  } catch (err) {
    console.error('GET /api/quiz/history/monthly error:', err);
    return NextResponse.json(
      { error: 'Server error fetching monthly quiz history' },
      { status: 500 }
    );
  }
}
