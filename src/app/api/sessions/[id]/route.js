import { getDb } from '@/lib/mongodb';

export async function DELETE(req, { params }) {
	try {
		const { id } = await params;
		const db = await getDb();

		await db
			.collection('sessions')
			.updateOne(
				{ _id: id },
				{ $set: { active: false, invalidatedAt: new Date() } },
			);

		return new Response(JSON.stringify({ ok: true }), { status: 200 });
	} catch (err) {
		console.error(err);
		return new Response(JSON.stringify({ error: 'Failed to revoke session' }), {
			status: 500,
		});
	}
}
