'use client';
import React from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Tooltip } from '@/components/ui/tooltip';

export function AvatarStack({ users = [] }) {
	if (!users || users.length === 0) {
		return (
			<Avatar size={32} className='bg-slate-200'>
				?
			</Avatar>
		);
	}
	const show = users.slice(0, 5);
	return (
		<div className='flex -space-x-2 items-center'>
			{show.map((u, i) => (
				<Tooltip
					key={i}
					content={`${u.displayName ?? 'Unknown'} • ${u.bestScore ?? ''}`}
				>
					<div className='relative z-[1]'>
						<Avatar
							src={u.avatarUrl || undefined}
							alt={u.displayName || 'user'}
							className='w-8 h-8 ring-2 ring-white'
						/>
					</div>
				</Tooltip>
			))}
			{users.length > 5 && (
				<div className='ml-2 text-xs text-muted-foreground'>
					+{users.length - 5}
				</div>
			)}
		</div>
	);
}
