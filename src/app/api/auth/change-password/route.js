import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';
import { getUserFromCookies } from '@/lib/getUserFromCookies';

export async function PUT(req) {
	try {
		await dbConnect();

		const userPayload = await getUserFromCookies(req);
		if (!userPayload || !userPayload.sub) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { oldPassword, newPassword } = await req.json();

		if (!newPassword) {
			return NextResponse.json(
				{ error: 'New password required' },
				{ status: 400 },
			);
		}

		const user = await User.findById(userPayload.sub);
		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		// Case 1: Email/Password user
		if (user.password) {
			if (!oldPassword) {
				return NextResponse.json(
					{ error: 'Old password required' },
					{ status: 400 },
				);
			}

			const isMatch = await bcrypt.compare(oldPassword, user.password);
			if (!isMatch) {
				return NextResponse.json(
					{ error: 'Incorrect old password' },
					{ status: 400 },
				);
			}
		} else {
			//  Case 2: Google/OAuth user
			// They don’t have oldPassword to verify allow them to "set" a password
			if (oldPassword) {
				return NextResponse.json(
					{ error: 'Google users don’t need old password' },
					{ status: 400 },
				);
			}
		}

		//  Set/Update new password
		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(newPassword, salt);
		await user.save();

		return NextResponse.json({
			message: user.password
				? 'Password updated successfully'
				: 'Password set successfully (Google account linked)',
		});
	} catch (err) {
		console.error('PUT /api/change-password error', err);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}
