'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

export default function CreateSessionOnSignIn() {
	const { status } = useSession();
	const calledRef = useRef(false);

	useEffect(() => {
		if (status === 'authenticated' && !calledRef.current) {
			calledRef.current = true;
			(async () => {
				try {
					const res = await fetch('/api/sessions/create', {
						method: 'POST',
						credentials: 'include',
					});
					if (res.ok) {
						const json = await res.json();
						const sid = json?.session?._id;
						if (sid) {
							// store sid in client accessible cookie for UI (expires in 30 days)
							document.cookie = `sid=${sid}; path=/; max-age=${
								60 * 60 * 24 * 30
							}`;
						}
					}
				} catch (e) {
					console.error('CreateSessionOnSignIn error', e);
				}
			})();
		}
	}, [status]);

	return null;
}
