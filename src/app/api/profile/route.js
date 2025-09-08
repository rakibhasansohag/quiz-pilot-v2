import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { getUserFromCookies } from '@/lib/getUserFromCookies';

/**
 * Helper: pick allowed profile fields from an object
 */
function pickProfileFields(obj) {
	if (!obj || typeof obj !== 'object') return {};
	const out = {};
	if (typeof obj.name === 'string') out.name = obj.name;
	if (obj.avatar === null || typeof obj.avatar === 'string')
		out.avatar = obj.avatar;
	if (obj.coverPhoto === null || typeof obj.coverPhoto === 'string')
		out.coverPhoto = obj.coverPhoto;
	if (typeof obj.bio === 'string') out.bio = obj.bio;
	if (typeof obj.phone === 'string') out.phone = obj.phone;
	if (obj.username === null || typeof obj.username === 'string')
		out.username = obj.username;

	return out;
}

/**
 * Helper: sanitize social map (only string values)
 */
function sanitizeSocial(obj) {
	if (!obj || typeof obj !== 'object') return {};
	const out = {};
	for (const k of Object.keys(obj)) {
		if (obj[k] == null) continue;
		if (typeof obj[k] === 'string') out[k] = obj[k];
		else out[k] = String(obj[k]);
	}
	return out;
}

export async function GET(req) {
	try {
		const userPayload = await getUserFromCookies(req);

		if (!userPayload || !userPayload.email) {
			return NextResponse.json(
				{ error: 'Unauthorized Access' },
				{ status: 401 },
			);
		}

		console.log(userPayload);

		const db = await getDb();
		const users = db.collection('users');
		const u = await users.findOne({ email: userPayload.email });
		if (!u) return NextResponse.json({ error: 'Not found' }, { status: 404 });

		const userOut = {
			_id: u._id.toString(),
			email: u.email,
			role: u.role || 'user',
			profile: u.profile || {},
			loginHistory: u.loginHistory || [],
			createdAt: u.createdAt,
			updatedAt: u.updatedAt,
		};

		return NextResponse.json({ ok: true, user: userOut });
	} catch (err) {
		console.error('GET /api/profile error', err);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}

export async function PUT(req) {
	try {
		const userPayload = await getUserFromCookies(req);
		if (!userPayload || !userPayload.email) {
			return NextResponse.json(
				{ error: 'Unauthorized Access' },
				{ status: 401 },
			);
		}

		// parse JSON body
		let body;
		try {
			body = await req.json();
		} catch (e) {
			return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
		}

		// defensive: body must be an object
		if (!body || typeof body !== 'object') {
			return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
		}

		const db = await getDb();
		const users = db.collection('users');

		// fetch current doc to merge safely
		const current = await users.findOne({ email: userPayload.email });
		if (!current)
			return NextResponse.json({ error: 'No User Found' }, { status: 404 });

		// Build new profile object by merging current.profile with allowed incoming fields
		const currentProfile = current.profile || {};

		// pick explicit profile fields if provided
		const incomingProfile = pickProfileFields(body.profile);

		// pick social from either top-level `social` or profile.social if provided
		const incomingSocialFromTop = sanitizeSocial(body.social);
		const incomingSocialFromProfile = sanitizeSocial(
			(body.profile && body.profile.social) || {},
		);

		const mergedSocial = {
			...(currentProfile.social || {}),
			...incomingSocialFromProfile,
			...incomingSocialFromTop,
		};

		// Compose final profile
		const newProfile = {
			...currentProfile,
			...incomingProfile,
			// attach social if there are any entries (keep existing if not updated)
			...(Object.keys(mergedSocial).length ? { social: mergedSocial } : {}),
		};

		// username uniqueness check if username changed
		if (
			typeof newProfile.username === 'string' &&
			newProfile.username !== currentProfile.username
		) {
			const existing = await users.findOne({
				'profile.username': newProfile.username,
				email: { $ne: userPayload.email },
			});
			if (existing) {
				return NextResponse.json(
					{ error: 'Username already in use' },
					{ status: 409 },
				);
			}
		}

		const updates = {
			updatedAt: new Date(),
			profile: newProfile,
		};

		// perform update and return the updated doc
		const r = await users.findOneAndUpdate(
			{ email: userPayload.email },
			{ $set: updates },
			{ returnDocument: 'after' },
		);

		let updated = r && r.value ? r.value : null;
		if (!updated) {
			updated = await users.findOne({ email: userPayload.email });
			if (!updated) {
				return NextResponse.json(
					{ error: 'User not found after update' },
					{ status: 404 },
				);
			}
		}

		const out = {
			_id: updated._id.toString(),
			email: updated.email,
			role: updated.role,
			profile: updated.profile || {},
			loginHistory: updated.loginHistory || [],
			updatedAt: updated.updatedAt,
		};

		return NextResponse.json({ ok: true, user: out });
	} catch (err) {
		console.error('PUT /api/profile error', err);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}
