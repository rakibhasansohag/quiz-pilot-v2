'use client';
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const AMOUNTS = [5, 10, 15, 20];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

function fmtMs(ms) {
	if (ms == null) return '—';
	const s = Math.round(ms / 1000);
	return `${s}s`;
}

export default function Leaderboard({
	initialCategory = '',
	initialDifficulty = '',
	initialNumQuestions = 20,
	limit = 25,
}) {
	const [loading, setLoading] = useState(true);
	const [list, setList] = useState([]);
	const [stats, setStats] = useState(null);
	const [currentUserId, setCurrentUserId] = useState(null);
	const [currentUserRank, setCurrentUserRank] = useState(null);

	const [category, setCategory] = useState(initialCategory);
	const [difficulty, setDifficulty] = useState(initialDifficulty);
	const [numQuestions, setNumQuestions] = useState(initialNumQuestions);

	useEffect(() => {
		fetchBoard();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [category, difficulty, numQuestions]);

	async function fetchBoard() {
		setLoading(true);
		try {
			const params = new URLSearchParams();
			if (category) params.set('categoryId', category);
			if (difficulty) params.set('difficulty', difficulty);
			if (numQuestions) params.set('numQuestions', String(numQuestions));
			params.set('limit', String(limit));
			const res = await fetch(`/api/leaderboard?${params.toString()}`);
			const data = await res.json();
			if (!res.ok || !data.ok) throw new Error(data?.error || 'Failed to load');
			setList(data.list || []);
			setStats(data.stats || null);
			setCurrentUserId(data.currentUserId || null);
			setCurrentUserRank(data.currentUserRank || null);
		} catch (err) {
			console.error('fetch leaderboard error', err);
		} finally {
			setLoading(false);
		}
	}

	// top group stack
	const topScore = list?.length ? list[0].bestScore : null;
	const topGroup = list.filter((it) => it.bestScore === topScore).slice(0, 5);

	return (
		<Card className='p-4 w-full'>
			<div className='flex items-start justify-between mb-3'>
				<div>
					<h3 className='text-lg font-semibold'>Leaderboard</h3>
					<p className='text-sm text-slate-500'>
						By category • difficulty • questions
					</p>
				</div>
				<div className='text-right text-sm'>
					{currentUserRank ? (
						<div>
							Your rank <span className='font-medium'>{currentUserRank}</span>
						</div>
					) : (
						<div className='text-xs text-slate-400'>
							Sign in to see your rank
						</div>
					)}
				</div>
			</div>

			{/* controls */}
			<div className='flex gap-2 items-center mb-4'>
				<select
					value={difficulty}
					onChange={(e) => setDifficulty(e.target.value)}
					className='px-2 py-1 border rounded'
				>
					<option value=''>All difficulties</option>
					{DIFFICULTIES.map((d) => (
						<option key={d} value={d}>
							{d}
						</option>
					))}
				</select>

				<select
					value={numQuestions}
					onChange={(e) => setNumQuestions(Number(e.target.value))}
					className='px-2 py-1 border rounded'
				>
					{AMOUNTS.map((n) => (
						<option key={n} value={n}>
							{n} questions
						</option>
					))}
				</select>

				<div className='ml-auto text-xs text-slate-500'>
					{stats ? (
						<div>
							<div>
								Participants: <strong>{stats.participantsCount ?? '—'}</strong>
							</div>
							<div>
								Avg score: <strong>{stats.avgScore ?? '—'}</strong>
							</div>
						</div>
					) : (
						<div>Loading stats…</div>
					)}
				</div>

				<Button variant='ghost' onClick={fetchBoard}>
					Refresh
				</Button>
			</div>

			{loading ? (
				<div className='py-6 flex justify-center items-center'>
					<Loader2 className='animate-spin mr-2' /> Loading...
				</div>
			) : list.length === 0 ? (
				<div className='py-6 text-center text-sm text-slate-500'>
					No results yet for this filter.
				</div>
			) : (
				<>
					{topGroup.length > 0 && (
						<div className='mb-4 flex items-center gap-4'>
							<div className='flex -space-x-3'>
								{topGroup.map((u, i) => (
									<Tooltip key={u.userId}>
										<TooltipTrigger asChild>
											<div
												className={`inline-block`}
												style={{ zIndex: 10 + i }}
											>
												<Avatar
													className={`w-10 h-10 ring-2 ring-white ${
														u.userId === currentUserId ? 'ring-indigo-500' : ''
													}`}
												>
													{u.avatarUrl ? (
														<AvatarImage src={u.avatarUrl} />
													) : (
														<AvatarFallback>
															{(u.displayName || 'U')[0]}
														</AvatarFallback>
													)}
												</Avatar>
											</div>
										</TooltipTrigger>
										<TooltipContent>
											<div className='text-sm'>
												<div className='font-medium'>
													{u.displayName || 'Anonymous'}
												</div>
												<div className='text-xs text-slate-500'>
													{u.bestScore} / {u.numQuestions} •{' '}
													{fmtMs(u.bestTimeMs)}
												</div>
											</div>
										</TooltipContent>
									</Tooltip>
								))}
							</div>
							<div>
								<div className='text-sm text-slate-500'>Top scoring</div>
								<div className='font-semibold'>
									{topGroup.length > 1 ? `${topGroup.length} tied` : 'Top'}
								</div>
							</div>
						</div>
					)}

					<div className='space-y-2'>
						{list.map((u, idx) => {
							const rank = idx + 1;
							const me = currentUserId && u.userId === currentUserId;
							return (
								<div
									key={u._id}
									className={`flex items-center gap-3 p-2 rounded-md ${
										me ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'bg-white/60'
									}`}
								>
									<div className='w-10 text-center font-medium'>{rank}</div>

									<Tooltip>
										<TooltipTrigger asChild>
											<div>
												<Avatar
													className={`w-10 h-10 ${
														me ? 'ring-2 ring-indigo-500' : ''
													}`}
												>
													{u.avatarUrl ? (
														<AvatarImage src={u.avatarUrl} />
													) : (
														<AvatarFallback>
															{(u.displayName || 'U')[0]}
														</AvatarFallback>
													)}
												</Avatar>
											</div>
										</TooltipTrigger>
										<TooltipContent>
											<div className='text-sm'>
												<div className='font-medium'>
													{u.displayName || 'Anonymous'}
												</div>
												<div className='text-xs text-slate-500'>
													{u.bestScore} / {u.numQuestions} •{' '}
													{fmtMs(u.bestTimeMs)}
												</div>
												<div className='text-xs text-muted-foreground'>
													Attempts: {u.attempts}
												</div>
											</div>
										</TooltipContent>
									</Tooltip>

									<div className='flex-1'>
										<div className='font-medium'>
											{u.displayName || 'Anonymous'}
										</div>
										<div className='text-xs text-slate-500'>
											{u.name} • {u.difficulty}
										</div>
									</div>

									<div className='text-right'>
										<div className='font-semibold'>{u.bestScore}</div>
										<div className='text-xs text-slate-500'>
											{fmtMs(u.bestTimeMs)}
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</>
			)}
		</Card>
	);
}
