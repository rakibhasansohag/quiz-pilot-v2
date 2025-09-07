'use client';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import CreateSessionOnSignIn from '@/lib/CreateSessionOnSignIn';

export default function Providers({ children, session }) {
	return (
		<SessionProvider session={session}>
			<ThemeProvider attribute='class'>
				{children}
				<CreateSessionOnSignIn />
				<Toaster position='top-right' />
			</ThemeProvider>
		</SessionProvider>
	);
}
