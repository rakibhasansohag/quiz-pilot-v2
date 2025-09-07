import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import { getUserFromCookies } from '@/lib/getUserFromCookies';
import { getDb } from '@/lib/mongodb';

export async function POST(req) {
	try {
		const db = await getDb();
		const users = db.collection('users');

		const userPayload = await getUserFromCookies(req);
		console.log(userPayload);
		if (!userPayload || !userPayload.email) {
			return NextResponse.json(
				{ error: 'Unauthorized Access' },
				{ status: 401 },
			);
		}

		const { oldPassword, newPassword } = await req.json();

		if (!newPassword) {
			return NextResponse.json(
				{ error: 'New password required' },
				{ status: 400 },
			);
		}

		console.log('userPayload', userPayload);

		// Use findOne with an email query to find the user
		const user = await users.findOne({ email: userPayload.email });
		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		// Case 1: Email/Password user
		// Use user.hashedPassword to check if a password exists
		if (user.hashedPassword) {
			if (!oldPassword) {
				return NextResponse.json(
					{ error: 'Old password required' },
					{ status: 400 },
				);
			}

			// Compare the old password with the hashed password
			const isMatch = await bcrypt.compare(oldPassword, user.hashedPassword);
			if (!isMatch) {
				return NextResponse.json(
					{ error: 'Incorrect old password' },
					{ status: 400 },
				);
			}
		} else {
			// Case 2: Google/OAuth user
			// They don’t have oldPassword to verify, allow them to "set" a password
			if (oldPassword) {
				return NextResponse.json(
					{ error: 'Google users don’t need old password' },
					{ status: 400 },
				);
			}
		}

		// Set/Update new password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(newPassword, salt);

		await users.updateOne(
			{ email: userPayload.email },
			{ $set: { hashedPassword: hashedPassword, updatedAt: new Date() } },
		);

		return NextResponse.json({
			message: 'Password updated successfully',
		});
	} catch (err) {
		console.error('PUT /api/change-password error', err);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}
