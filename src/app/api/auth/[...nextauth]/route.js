import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getDb } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export const authOptions = {
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		}),
		CredentialsProvider({
			id: 'credentials',
			name: 'Credentials',
			credentials: {
				email: { label: 'Email', type: 'text' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				if (!credentials) return null;
				const email = String(credentials.email || '').toLowerCase();
				const password = String(credentials.password || '');
				if (!email || !password) return null;

				const db = await getDb();
				const user = await db.collection('users').findOne({ email });
				if (!user) return null;

				const isValid = await bcrypt.compare(password, user.hashedPassword);
				if (!isValid) return null;

				return {
					id: String(user._id),
					name: user.name || user.profile?.name || null,
					email: user.email,
					picture: user.profile?.avatar || null,
					role: user.role || 'user',
				};
			},
		}),
	],

	session: { strategy: 'jwt' },
	secret: process.env.NEXTAUTH_SECRET,
	pages: {
		signIn: '/login',
	},

	callbacks: {
		// signIn: keep your existing create-or-update logic but ensure no silent false return
		async signIn({ user, account, profile }) {
			try {
				if (!user?.email) return false;
				const db = await getDb();
				const users = db.collection('users');
				const email = (user.email || '').toLowerCase();
				let u = await users.findOne({ email });
				const now = new Date();
				if (!u) {
					const doc = {
						email,
						name: user.name || profile?.name || '',
						hashedPassword: null,
						role: 'user',
						profile: {
							name: user.name || profile?.name || '',
							avatar: user.picture || profile?.picture || null,
							coverPhoto: null,
							bio: null,
							phone: null,
							username: null,
							social: {},
						},
						createdAt: now,
						updatedAt: now,
					};
					const r = await users.insertOne(doc);
					u = { ...doc, _id: r.insertedId };
				} else {
					const set = {
						updatedAt: now,
						'profile.name': user.name || u.profile?.name || u.name || '',
					};
					if (user.picture) set['profile.avatar'] = user.picture;
					await users.updateOne({ _id: u._id }, { $set: set });
				}

				// store DB id and role on the "user" object so jwt() can pick it up
				user.dbId = u._id.toString();
				user.role = u.role || 'user';
				return true;
			} catch (err) {
				console.error('signIn error', err);
				return false;
			}
		},

		// jwt: set token.id from user.dbId OR lookup by email fallback
		async jwt({ token, user }) {
			if (user) {
				// on first sign in, user is present
				token.id = user.dbId ?? user.id ?? token.sub;
				token.email = user.email ?? token.email;
				token.name = user.name ?? token.name;
				token.picture = user.picture ?? token.picture;
				token.role = user.role ?? token.role;
			} else if (!token.id && token.email) {
				// fallback: find by email in DB to get _id
				try {
					const db = await getDb();
					const u = await db
						.collection('users')
						.findOne({ email: token.email });
					if (u) token.id = u._id.toString();
				} catch (e) {
					console.warn('jwt fallback db lookup failed', e);
				}
			}
			return token;
		},

		// session: expose token.id as session.user.id (client-side)
		async session({ session, token }) {
			session.user = session.user || {};
			session.user.id = token.id;
			session.user.email = token.email || session.user.email;
			session.user.name = token.name || session.user.name;
			session.user.image = token.picture || session.user.image;
			session.user.role = token.role || session.user.role;

			return session;
		},
	},
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
