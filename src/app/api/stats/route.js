import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDb();

    // Count documents instead of fetching all data
    const totalUsers = await db.collection('users').countDocuments();
    const totalQuizzes = await db.collection('attempts').countDocuments();
    const totalCategories = await db.collection('categories').countDocuments();
    const totalQuestions = await db.collection('questions').countDocuments();

		return NextResponse.json({
			success: true,
			data: {
				totalUsers,
				totalQuizzes,
				totalCategories,
				totalQuestions,
			},
		});
  } catch (error) {
    console.error('GET /api/stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
