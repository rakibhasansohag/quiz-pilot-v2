import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || process.env.MONGODB_URL;

if (!uri) throw new Error('MONGODB_URI or MONGODB_URL not set in .env');

const dbNameFromEnv = process.env.MONGODB_DB || undefined;

let cached =
	global._mongoCache ||
	(global._mongoCache = { client: null, db: null, promise: null });

async function connectToMongo() {
	if (cached.db) return cached.db;
	if (!cached.promise) {
		const client = new MongoClient(uri, {});
		cached.promise = client.connect().then((c) => {
			cached.client = c;
			cached.db = dbNameFromEnv ? c.db(dbNameFromEnv) : c.db();
			return cached.db;
		});
	}
	return cached.promise;
}

export async function getDb() {
	const db = await connectToMongo();
	// debug
	if (process.env.NODE_ENV === 'development') {
		console.log('MongoDB connected to DB:', db.databaseName);
		global._mongoDb = db;
	}
	return db;
}
