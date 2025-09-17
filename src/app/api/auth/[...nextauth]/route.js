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
				try {
					console.log('authorize called with:', { email: credentials?.email });
					if (!credentials) return null;
					const email = String(credentials.email || '').toLowerCase();
					const password = String(credentials.password || '');
					if (!email || !password) return null;

					const db = await getDb();
					const user = await db.collection('users').findOne({ email });
					console.log('authorize - found user:', !!user);

					if (!user) return null;
					const isValid = await bcrypt.compare(password, user.hashedPassword);
					if (!isValid) return null;

					return {
						id: String(user._id),
						name: user.name || user.profile?.name || null,
						email: user.email,
						picture: user.profile?.avatar || null,
						role: user.role || 'user',
						// dbId intentionally not required here — will be set in signIn callback for oauth flows
					};
				} catch (err) {
					console.error('authorize error:', err);
					return null;
				}
			},
		}),
	],

	// Use JWT sessions (default when no database); encryption enabled by secret
	session: { strategy: 'jwt' },

	// Ensure we use a stable secret - fallback to AUTH_SECRET if set
	secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,

	// Optional: enable explicit jwt encryption (NextAuth will already encrypt with secret)
	jwt: {
		encryption: true,
	},

	pages: {
		signIn: '/login',
	},

	callbacks: {
		async signIn({ user, account, profile }) {
			try {
				console.log('signIn callback:', { user, provider: account?.provider });
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

				// Put DB id + role onto user so jwt() can include it
				user.dbId = u._id.toString();
				user.role = u.role || 'user';

				console.log('signIn upsert complete:', {
					dbId: user.dbId,
					role: user.role,
				});
				return true;
			} catch (err) {
				console.error('signIn callback error:', err);
				return false;
			}
		},

		async jwt({ token, user }) {
			try {
				console.log(
					'jwt callback incoming token:',
					token,
					'user:',
					user ? true : false,
				);
				if (user) {
					token.id = user.dbId ?? user.id ?? token.sub;
					token.email = user.email ?? token.email;
					token.name = user.name ?? token.name;
					token.picture = user.picture ?? token.picture;
					token.role = user.role ?? token.role;
				} else if (!token.id && token.email) {
					// fallback lookup
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
				console.log('jwt returning token:', token);
				return token;
			} catch (e) {
				console.error('jwt callback error:', e);
				return token;
			}
		},

		async session({ session, token }) {
			try {
				console.log('session callback, token:', token);
				session.user = session.user || {};
				session.user.id = token.id;
				session.user.email = token.email || session.user.email;
				session.user.name = token.name || session.user.name;
				session.user.image = token.picture || session.user.image;
				session.user.role = token.role || session.user.role;
				session.user.sid = token.sid;
				console.log('session returned:', session);
				return session;
			} catch (e) {
				console.error('session callback error:', e);
				return session;
			}
		},
	},
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
