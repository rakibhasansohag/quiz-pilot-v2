// /app/api/stats/route.js
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import moment from "moment";

export async function GET() {
  try {
    const db = await getDb();

    // ----- 1. Stats -----
    const totalUsers = await db.collection("users").countDocuments();
    const newUsers30d = await db
      .collection("users")
      .countDocuments({
        createdAt: { $gte: new Date(moment().subtract(30, "days")) },
      });

    const totalQuizzesTaken = await db.collection("attempts").countDocuments();

    const quizzesCreated30d = await db
      .collection("questions")
      .countDocuments({
        createdAt: { $gte: new Date(moment().subtract(30, "days")) },
      });

    const stats = [
      { name: "Total Users", value: totalUsers },
      { name: "New Users (30d)", value: newUsers30d },
      { name: "Total Quizzes Taken", value: totalQuizzesTaken },
      { name: "Quizzes Created (30d)", value: quizzesCreated30d },
    ];

    // ----- 2. Monthly Growth -----
    const usersByMonth = await db
      .collection("users")
      .aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const attemptsByMonth = await db
      .collection("attempts")
      .aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$startedAt" },
              month: { $month: "$startedAt" },
            },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    // Map users and attempts into { "YYYY-MM": count }
    const userMap = {};
    usersByMonth.forEach((u) => {
      const key = `${u._id.year}-${u._id.month}`;
      userMap[key] = u.count;
    });

    const quizMap = {};
    attemptsByMonth.forEach((a) => {
      const key = `${a._id.year}-${a._id.month}`;
      quizMap[key] = a.count;
    });

    // Ensure last 6 months always included
    const monthlyGrowth = [];
    for (let i = 5; i >= 0; i--) {
      const m = moment().subtract(i, "months");
      const key = `${m.year()}-${m.month() + 1}`; // month is 0-based in moment
      monthlyGrowth.push({
        month: m.format("MMM"),
        users: userMap[key] || 0,
        quizzes: quizMap[key] || 0,
      });
    }

    return NextResponse.json({ stats, monthlyGrowth });
  } catch (err) {
    console.error("GET /api/stats error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
