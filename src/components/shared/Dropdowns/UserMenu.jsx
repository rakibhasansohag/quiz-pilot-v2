'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { User, LayoutDashboard, LogOut, History } from 'lucide-react';


function getSidFromCookie() {
	if (typeof document === 'undefined') return null;
	const m = document.cookie.match(/(?:^|; )sid=([^;]+)/);
	return m ? decodeURIComponent(m[1]) : null;
}

export default function UserMenu() {
	const { data: session, status } = useSession();
	const user = session?.user;

	if (status === 'loading') return null;

	const tokenSid =
		session?.user?.sid ||
		session?.sid ||
		session?.user?.tokenSid ||
		getSidFromCookie();

	async function handleLogout(sid) {
		try {
			// revoke server session record if sid available
			if (sid) {
				await fetch(`/api/sessions/${sid}`, { method: 'DELETE' }).catch((e) =>
					console.warn('revoke session failed', e),
				);
			}
		} catch (e) {
			console.warn('Failed to revoke session record', e);
		} finally {
			// sign out via next-auth (clears cookie + client session)
			await signOut({ callbackUrl: '/' });
		}
	}

	if (!user) {
		return (
			<Link href='/login'>
				<Button
					size='sm'
					className='bg-primary text-white hidden md:inline-flex items-center gap-2'
				>
					Login
				</Button>
			</Link>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					className='flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
					aria-label='User menu'
				>
					{user.image ? (
						<Image
							src={user.image}
							alt={user.name || 'User'}
							width={36}
							height={36}
							className='rounded-full object-cover'
						/>
					) : (
						<div className='w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium'>
							{user.name ? user.name[0].toUpperCase() : 'U'}
						</div>
					)}
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align='end' className='w-56 py-1'>
				{/* Profile */}
				<DropdownMenuItem asChild>
					<Link
						href='/dashboard/profile'
						className='flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-slate-100 cursor-pointer'
					>
						<User size={16} />
						<span>Profile</span>
					</Link>
				</DropdownMenuItem>

				{/* History */}
				<DropdownMenuItem asChild>
					<Link
						href='/dashboard/history'
						className='flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-slate-100 cursor-pointer'
					>
						<History size={16} />
						<span>History</span>
					</Link>
				</DropdownMenuItem>

				<DropdownMenuSeparator className='my-1' />

				{/* Logout (call handler via arrow to avoid immediate invocation) */}
				<DropdownMenuItem asChild>
					<button
						type='button'
						onClick={() => handleLogout(tokenSid)}
						className='w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-slate-100 cursor-pointer'
					>
						<LogOut size={16} />
						<span>Logout</span>
					</button>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
