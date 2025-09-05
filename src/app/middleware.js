import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../lib/mongo.js';

const SESSIONS_COLLECTION = 'sessions';
const MAX_DEVICES_DEFAULT = 3;

export async function createSession({
	userId,
	ip,
	userAgent,
	ttlSeconds = 60 * 60 * 24 * 30,
}) {
	const db = await getDb();
	const sessions = db.collection(SESSIONS_COLLECTION);
	const sessionId = uuidv4();
	const now = new Date();
	const session = {
		_id: sessionId,
		userId,
		ip: ip || null,
		userAgent: userAgent || null,
		createdAt: now,
		lastSeenAt: now,
		expiresAt: new Date(now.getTime() + ttlSeconds * 1000),
		active: true,
	};
	await sessions.insertOne(session);
	return session;
}

export async function touchSession(sessionId) {
	const db = await getDb();
	const sessions = db.collection(SESSIONS_COLLECTION);
	await sessions.updateOne(
		{ _id: sessionId, active: true },
		{ $set: { lastSeenAt: new Date() } },
	);
}

export async function getActiveSessions(userId) {
	const db = await getDb();
	const sessions = db.collection(SESSIONS_COLLECTION);
	// only active and not expired
	const now = new Date();
	return sessions
		.find({ userId, active: true, expiresAt: { $gt: now } })
		.sort({ lastSeenAt: -1 })
		.toArray();
}

export async function invalidateSession(sessionId) {
	const db = await getDb();
	const sessions = db.collection(SESSIONS_COLLECTION);
	return sessions.updateOne(
		{ _id: sessionId },
		{ $set: { active: false, invalidatedAt: new Date() } },
	);
}

export async function enforceDeviceLimit(
	userId,
	maxDevices = MAX_DEVICES_DEFAULT,
) {
	const db = await getDb();
	const sessions = db.collection(SESSIONS_COLLECTION);
	const active = await getActiveSessions(userId);
	if (active.length <= maxDevices) return { ok: true, removed: [] };

	// remove oldest sessions until length == maxDevices
	const toRemove = active.slice(maxDevices); // oldest lastSeenAt
	const removedIds = toRemove.map((s) => s._id);
	await sessions.updateMany(
		{ _id: { $in: removedIds } },
		{ $set: { active: false, invalidatedAt: new Date() } },
	);
	return { ok: true, removed: removedIds };
}

export async function isSessionValid(sessionId) {
	if (!sessionId) return false;
	const db = await getDb();
	const sessions = db.collection(SESSIONS_COLLECTION);
	const now = new Date();
	const s = await sessions.findOne({
		_id: sessionId,
		active: true,
		expiresAt: { $gt: now },
	});
	return !!s;
}
