import crypto from 'crypto';
import { getDb } from '@/lib/mongodb';

const SESSIONS_COLLECTION = 'sessions';
const MAX_DEVICES_DEFAULT = 3;

/**
 * Build a stable fingerprint string for a device.
 * We use ip + userAgent (trimmed) and SHA256-hash it to a short key.
 */
function deviceFingerprint(ip = '', userAgent = '') {
	const plain = `${ip}|${(userAgent || '').replace(/\s+/g, ' ').trim()}`;
	return crypto.createHash('sha256').update(plain).digest('hex'); // 64 hex chars
}

export async function createOrUpdateSession({
	userId,
	ip,
	userAgent,
	ttlSeconds = 60 * 60 * 24 * 30,
}) {
	const db = await getDb();
	const sessions = db.collection(SESSIONS_COLLECTION);

	const fp = deviceFingerprint(ip, userAgent);
	const now = new Date();
	const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);

	// Try to find an active session with same fingerprint for this user
	const existing = await sessions.findOne({
		userId,
		fingerprint: fp,
		active: true,
	});

	if (existing) {
		// Update lastSeenAt and expiresAt
		await sessions.updateOne(
			{ _id: existing._id },
			{
				$set: {
					lastSeenAt: now,
					expiresAt,
					ip: ip || existing.ip,
					userAgent: userAgent || existing.userAgent,
				},
			},
		);
		// return updated session doc
		const updated = await sessions.findOne({ _id: existing._id });
		return updated;
	}

	// create new session
	const sessionId =
		(crypto.randomUUID && crypto.randomUUID()) ||
		crypto.randomBytes(16).toString('hex');
	const session = {
		_id: sessionId,
		userId,
		fingerprint: fp,
		ip: ip || null,
		userAgent: userAgent || null,
		createdAt: now,
		lastSeenAt: now,
		expiresAt,
		active: true,
	};

	await sessions.insertOne(session);

	// ensure TTL index on expiresAt (safe to call repeatedly)
	try {
		await sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
	} catch (e) {
		// ignore
	}

	return session;
}

export async function touchSession(sessionId) {
	if (!sessionId) return;
	const db = await getDb();
	return db
		.collection(SESSIONS_COLLECTION)
		.updateOne(
			{ _id: sessionId, active: true },
			{ $set: { lastSeenAt: new Date() } },
		);
}

export async function getActiveSessions(userId) {
	const db = await getDb();
	const now = new Date();
	return db
		.collection(SESSIONS_COLLECTION)
		.find({ userId, active: true, expiresAt: { $gt: now } })
		.sort({ lastSeenAt: -1 })
		.toArray();
}

export async function invalidateSession(sessionId) {
	const db = await getDb();
	return db
		.collection(SESSIONS_COLLECTION)
		.updateOne(
			{ _id: sessionId },
			{ $set: { active: false, invalidatedAt: new Date() } },
		);
}

export async function enforceDeviceLimit(
	userId,
	maxDevices = MAX_DEVICES_DEFAULT,
) {
	const active = await getActiveSessions(userId);
	if (active.length <= maxDevices) return { ok: true, removed: [] };

	const toRemove = active.slice(maxDevices); // oldest
	const removedIds = toRemove.map((s) => s._id);

	await (await getDb())
		.collection(SESSIONS_COLLECTION)
		.updateMany(
			{ _id: { $in: removedIds } },
			{ $set: { active: false, invalidatedAt: new Date() } },
		);

	return { ok: true, removed: removedIds };
}

export async function isSessionValid(sessionId) {
	if (!sessionId) return false;
	const db = await getDb();
	const now = new Date();
	const s = await db.collection(SESSIONS_COLLECTION).findOne({
		_id: sessionId,
		active: true,
		expiresAt: { $gt: now },
	});
	return !!s;
}
