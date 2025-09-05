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

				// find user in DB
				const db = await getDb();
				const user = await db.collection('users').findOne({ email });
				if (!user) return null;

				const isValid = await bcrypt.compare(password, user.hashedPassword);
				if (!isValid) return null;

				// Return object that will be stored in JWT session
				return {
					id: String(user._id),
					name: user.name,
					email: user.email,
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
		async jwt({ token, user }) {
			// On initial sign in, user is available
			if (user) {
				token.id = user.id ?? token.sub;
				token.email = user.email ?? token.email;
				token.name = user.name ?? token.name;
			}
			return token;
		},
		async session({ session, token }) {
			session.user = session.user || {};
			// attach id and email to session.user
			session.user.id = token.id;
			session.user.email = token.email;
			session.user.name = token.name;
			return session;
		},
		async redirect({ url, baseUrl }) {
			// Prefer the provided url if it's absolute and same origin
			try {
				if (url) {
					const parsed = new URL(url, baseUrl);
					// Allow same-origin or relative paths
					if (parsed.origin === baseUrl || url.startsWith('/')) {
						// If it was a relative path, return it (NextAuth accepts relative)
						// If absolute and same origin, return the pathname+search
						return url.startsWith('/') ? url : parsed.href;
					}
				}
			} catch (e) {
				// ignore invalid URLs
			}
			// fallback
			return '/products';
		},
	},
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
