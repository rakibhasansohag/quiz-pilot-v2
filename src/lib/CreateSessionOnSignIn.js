'use client';
import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

export default function CreateSessionOnSignIn() {
	const { status } = useSession();
	const calledRef = useRef(false);

	useEffect(() => {
		if (status === 'authenticated' && !calledRef.current) {
			calledRef.current = true;
			fetch('/api/sessions/create', {
				method: 'POST',
				credentials: 'include',
			}).catch(console.error);
		}
	}, [status]);

	return null;
}
