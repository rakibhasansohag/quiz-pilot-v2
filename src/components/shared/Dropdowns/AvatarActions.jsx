'use client';
import React from 'react';
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';

/**
 * AvatarActions
 * - If `children` is provided, it will be used as the clickable trigger (via asChild).
 *   This allows you to wrap the avatar image/div so clicking the image opens the menu.
 * - If no children provided, it falls back to rendering the small button (backwards compatible).
 */
export default function AvatarActions({
	onChange,
	type,
	onDelete,
	label = 'Image',
	children,
}) {
	return (
		<DropdownMenu>
			{/* If children exist, use them as the trigger; otherwise render default button */}
			{children ? (
				<DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
			) : (
				<DropdownMenuTrigger asChild>
					<Button variant='default' size='sm' aria-label={`${label} actions`}>
						{type === 'cover' ? (
							<MoreHorizontal />
						) : (
							<MoreHorizontal className='rotate-90' />
						)}
					</Button>
				</DropdownMenuTrigger>
			)}

			<DropdownMenuContent align='end'>
				<DropdownMenuItem
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						if (typeof onChange === 'function') onChange();
					}}
				>
					Change
				</DropdownMenuItem>

				<DropdownMenuItem
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						if (typeof onDelete === 'function') onDelete();
					}}
				>
					Remove
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
