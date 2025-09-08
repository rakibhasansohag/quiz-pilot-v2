import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET() {
    try {
        const db = await getDb();

        const users = await db
            .collection('users')
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        const out = users.map((u) => ({
            name: u.name,
            email: u.email,
            // format createdAt nicely as YYYY-MM-DD HH:mm:ss
            createdAt: new Date(u.createdAt).toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
            }),
            quizAttempt: 0, // default since not in DB yet
        }));

        return NextResponse.json({ users: out });
    } catch (err) {
        console.error('GET /api/users error', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
