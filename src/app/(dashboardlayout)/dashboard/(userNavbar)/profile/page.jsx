'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useState } from 'react';

import ProfileDetails from './components/ProfileDetails';
import SocialLinks from './components/SocialLinks';
import SecuritySettings from './components/SecuritySettings';

export default function ProfilePage() {
	const [activeTab, setActiveTab] = useState('profile');
	const [hoveredTab, setHoveredTab] = useState(null);

	const tabs = [
		{ value: 'profile', label: 'Profile', index: 0 },
		{ value: 'social', label: 'Social', index: 1 },
		{ value: 'security', label: 'Security', index: 2 },
	];

	// Get the index of active tab
	const activeIndex = tabs.find((tab) => tab.value === activeTab)?.index || 0;
	const hoveredIndex = hoveredTab
		? tabs.find((tab) => tab.value === hoveredTab)?.index
		: null;

	// TODO : FIX the always data fetching whenever the tab changes we want to added the data to the cache

	return (
		<Tabs
			value={activeTab}
			onValueChange={setActiveTab}
			className='container mx-auto mt-10'
		>
			<div className='relative w-fit mx-auto'>
				{/* Custom animated tab container */}
				<div className='relative flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1'>
					{/* Active tab sliding background */}
					<div
						className='absolute top-1 bottom-1 w-24 bg-slate-300 dark:bg-slate-600 rounded-lg transition-all duration-500 ease-[cubic-bezier(0.33,0.83,0.99,0.98)] z-10'
						style={{
							transform: `translateX(${activeIndex * 96}px)`, // 96px = w-24
						}}
					/>

					{/* Hover effect background */}
					{hoveredIndex !== null && hoveredIndex !== activeIndex && (
						<div
							className='absolute top-1 bottom-1 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg transition-all duration-200 ease-out z-0'
							style={{
								transform: `translateX(${hoveredIndex * 96}px)`,
							}}
						/>
					)}

					{/* Top accent bar */}
					<div
						className='absolute top-0 h-1 w-24 bg-slate-800 dark:bg-slate-200 rounded-b-full transition-all duration-500 ease-[cubic-bezier(0.33,0.83,0.99,0.98)] z-20'
						style={{
							transform: `translateX(${activeIndex * 96}px)`,
						}}
					/>

					{/* Bottom accent bar */}
					<div
						className='absolute bottom-0 h-1 w-24 bg-slate-800 dark:bg-slate-200 rounded-t-full transition-all duration-500 ease-[cubic-bezier(0.33,0.83,0.99,0.98)] z-20'
						style={{
							transform: `translateX(${activeIndex * 96}px)`,
						}}
					/>

					{/* Tab buttons */}
					{tabs.map((tab) => (
						<button
							key={tab.value}
							onClick={() => setActiveTab(tab.value)}
							onMouseEnter={() => setHoveredTab(tab.value)}
							onMouseLeave={() => setHoveredTab(null)}
							className={`
								relative z-30 w-24 h-12 px-4 py-3 text-sm font-medium rounded-lg
								transition-colors duration-300 ease-out
								focus:outline-none outline-none border-none
								${
									activeTab === tab.value
										? 'text-black dark:text-white'
										: 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
								}
							`}
						>
							<span className='block truncate'>{tab.label}</span>
						</button>
					))}
				</div>

				{/* Hidden shadcn TabsList for accessibility */}
				<TabsList className='sr-only'>
					{tabs.map((tab) => (
						<TabsTrigger key={tab.value} value={tab.value}>
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>
			</div>

			<TabsContent value='profile' className='mt-6'>
				<ProfileDetails />
			</TabsContent>

			<TabsContent value='social' className='mt-6'>
				<SocialLinks />
			</TabsContent>

			<TabsContent value='security' className='mt-6'>
				<SecuritySettings />
			</TabsContent>
		</Tabs>
	);
}
