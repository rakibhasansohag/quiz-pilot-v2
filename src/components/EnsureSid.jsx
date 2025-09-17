'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

/**
 * EnsureSid
 * - Called client-side after NextAuth session is visible.
 * - Calls /api/sessions/create once to ensure a server session (sid cookie) exists.
 * - Uses a ref + localStorage to avoid repeated calls.
 */
export default function EnsureSid() {
	const { data: session, status } = useSession();
	const calledRef = useRef(false);

	useEffect(() => {
		if (status !== 'authenticated') return;
		if (calledRef.current) return;

		const userId = session?.user?.id;
		if (!userId) return;

		// Avoid repeated calls across tabs / navigations for same user
		const key = `sid_created_${userId}`;
		if (typeof window !== 'undefined' && window.localStorage?.getItem(key)) {
			calledRef.current = true;
			return;
		}

		// If session already contains sid (optional) skip
		if (session?.user?.sid) {
			try {
				window.localStorage?.setItem(key, '1');
			} catch {}
			calledRef.current = true;
			return;
		}

		// create server session (will set sid cookie via Set-Cookie)
		(async () => {
			calledRef.current = true;
			try {
				const res = await fetch('/api/sessions/create', {
					method: 'POST',
					credentials: 'include',
				});
				const json = await res.json().catch(() => null);
				console.log('EnsureSid - /api/sessions/create ->', json);
				if (res.ok && json?.ok) {
					try {
						window.localStorage?.setItem(key, '1');
					} catch {}
				} else {
					try {
						window.localStorage?.removeItem(key);
					} catch {}
				}
			} catch (err) {
				console.warn('EnsureSid error:', err);
				try {
					window.localStorage?.removeItem(key);
				} catch {}
			}
		})();
	}, [session, status]);

	return null;
}
