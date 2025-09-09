import { ObjectId } from 'mongodb';

export async function getUserById(db, userId) {
	if (!db || !userId) return null;
	try {
		let q;
		// if valid ObjectId, try that first
		if (ObjectId.isValid(String(userId))) {
			q = { _id: new ObjectId(String(userId)) };
			const byId = await db.collection('users').findOne(q);
			if (byId) {
				return {
					id: String(byId._id),
					name: byId?.profile?.name ?? byId.name ?? byId.displayName ?? null,
					avatarUrl:
						byId?.profile?.avatar ?? byId.avatarUrl ?? byId.avatar ?? null,
					email: byId.email ?? null,
				};
			}
		}

		// fallback: try common alternative keys
		const alt =
			(await db.collection('users').findOne({ id: userId })) ||
			(await db.collection('users').findOne({ email: userId })) ||
			(await db.collection('users').findOne({ _id: String(userId) }));

		if (!alt) return null;

		return {
			id: String(alt._id ?? alt.id),
			name: alt?.profile?.name ?? alt.name ?? alt.displayName ?? null,
			avatarUrl: alt?.profile?.avatar ?? alt.avatarUrl ?? alt.avatar ?? null,
			email: alt.email ?? null,
		};
	} catch (err) {
		console.error('getUserById error', err);
		return null;
	}
}
