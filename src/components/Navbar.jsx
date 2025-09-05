'use client';

import Link from 'next/link';
import Image from 'next/image';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
	const { data: session, status } = useSession();

	return (
		<nav className='bg-white/80 dark:bg-slate-900 border-b'>
			<div className='container mx-auto px-4 py-3 flex items-center justify-between'>
				<div className='flex items-center gap-4'>
					<Link href='/' className='font-bold text-lg'>
						Quiz Pilot
					</Link>
					<Link href='/Quizes' className='text-sm text-muted-foreground'>
						Quizes
					</Link>
				</div>

				<div className='flex items-center gap-3'>
					{/* Theme toggle */}
					<ThemeToggle />

					{status === 'loading' ? null : session ? (
						<>
							<Link href='/dashboard/add-product'>
								<Button>Add</Button>
							</Link>

							<div className='flex items-center gap-2'>
								{session.user?.image && (
									<Image
										src={session.user.image}
										alt={session.user?.name || 'avatar'}
										width={36}
										height={36}
										className='rounded-full'
									/>
								)}
								<span className='hidden sm:inline-block text-sm'>
									{session.user?.name}
								</span>
							</div>

							<Button onClick={() => signOut({ callbackUrl: '/' })}>
								Sign out
							</Button>
						</>
					) : (
						<Link href='/login'> Login </Link>
					)}
				</div>
			</div>
		</nav>
	);
}
