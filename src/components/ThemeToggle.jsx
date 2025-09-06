'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export default function ThemeToggle() {
	const { theme, setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		// render an invisible button to avoid layout shift (or a simple placeholder)
		return <div className='w-10 h-10' aria-hidden />;
	}

	const isDark = resolvedTheme === 'dark';

	return (
		<Button
			variant='ghost'
			onClick={() => setTheme(isDark ? 'light' : 'dark')}
			aria-label='Toggle theme'
			className='w-10 h-10 p-2 cursor-pointer'
		>
			{isDark ? (
				// Sun icon (for switching to light)
				<svg
					xmlns='http://www.w3.org/2000/svg'
					className='w-5 h-5'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
				>
					<circle
						cx='12'
						cy='12'
						r='4'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
					<path
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
						d='M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41'
					/>
				</svg>
			) : (
				// Moon icon (for switching to dark)
				<svg
					xmlns='http://www.w3.org/2000/svg'
					className='w-5 h-5'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
				>
					<path
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
						d='M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z'
					/>
				</svg>
			)}
		</Button>
	);
}
