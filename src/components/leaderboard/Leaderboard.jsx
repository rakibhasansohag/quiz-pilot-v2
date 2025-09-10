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
import Select from 'react-select';
import {
  Select as ShadSelect,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { useTheme } from 'next-themes';
import { getReactSelectStyles } from '@/lib/reactSelectStyles';

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

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(initialCategory);
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [numQuestions, setNumQuestions] = useState(initialNumQuestions);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBoard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, difficulty, numQuestions]);

  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to fetch categories');
      setCategories(data.categories || []);
    } catch (err) {
      console.error('fetch categories', err);
    }
  }

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

  const rnd = arr => arr[Math.floor(Math.random() * arr.length)];

  function pickRandom() {
    const pickCat = categories.length ? rnd(categories)._id : '';
    const pickDiff = rnd(DIFFICULTIES);
    const pickAmt = rnd(AMOUNTS);
    setCategory(pickCat);
    setDifficulty(pickDiff);
    setNumQuestions(pickAmt);
  }

  // top group stack
  const topScore = list?.length ? list[0].bestScore : null;
  const topGroup = list.filter(it => it.bestScore === topScore).slice(0, 5);

  function handleReset() {
    setCategory(initialCategory);
    setDifficulty(initialDifficulty);
    setNumQuestions(initialNumQuestions);
  }

  console.log('list', list);

  return (
		<Card className='p-4 w-full'>
			<div className='flex items-center justify-between mb-4'>
				{/* left side */}
				<div>
					<h3 className='text-lg font-semibold'>Leaderboard</h3>
					{stats ? (
						<div className='flex gap-4 text-xs text-slate-500 mt-1'>
							<div>
								Total players:{' '}
								<span className='font-medium'>{stats.totalPlayers}</span>
							</div>
							<div>
								Total attempts:{' '}
								<span className='font-medium'>{stats.totalAttempts}</span>
							</div>
							<div>
								Avg score: <span className='font-medium'>{stats.avgScore}</span>
							</div>
						</div>
					) : (
						<p className='text-sm text-slate-500'>
							By category • difficulty • questions
						</p>
					)}
				</div>

				{/* right side */}
				<div className='flex items-center gap-3'>
					{currentUserRank ? (
						<div className='text-sm'>
							Your rank <span className='font-medium'>{currentUserRank}</span>
						</div>
					) : (
						<div className='text-xs text-slate-400'>
							you can just pick a random one
						</div>
					)}

					<Button variant='outline' size='sm' onClick={pickRandom}>
						🎲 Random
					</Button>
				</div>
			</div>

			{/* controls */}
			<div className='flex gap-2 items-center mb-4'>
				{/* category with react-select */}
				<div className='min-w-[200px]'>
					<Select
						classNamePrefix='rs'
						placeholder='All categories'
						value={
							categories.find((c) => c._id === category)
								? {
										value: category,
										label: categories.find((c) => c._id === category).name,
								  }
								: null
						}
						onChange={(opt) => setCategory(opt?.value || '')}
						options={categories.map((c) => ({ value: c._id, label: c.name }))}
						styles={getReactSelectStyles(isDark)}
						isClearable
					/>
				</div>

				{/* difficulty with shadcn select */}
				<ShadSelect
					value={difficulty || 'all'}
					onValueChange={(val) => setDifficulty(val === 'all' ? '' : val)}
				>
					<SelectTrigger className='w-[140px]'>
						<SelectValue placeholder='All difficulties' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='all'>All difficulties</SelectItem>
						{DIFFICULTIES.map((d) => (
							<SelectItem key={d} value={d}>
								{d}
							</SelectItem>
						))}
					</SelectContent>
				</ShadSelect>

				{/* numQuestions with shadcn select */}
				<ShadSelect
					value={String(numQuestions)}
					onValueChange={(v) => setNumQuestions(Number(v))}
				>
					<SelectTrigger className='w-[150px]'>
						<SelectValue placeholder='Questions' />
					</SelectTrigger>
					<SelectContent>
						{AMOUNTS.map((n) => (
							<SelectItem key={n} value={String(n)}>
								{n} questions
							</SelectItem>
						))}
					</SelectContent>
				</ShadSelect>

				<Button variant='destructive' size='sm' onClick={handleReset}>
					Reset
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
											<div className='inline-block' style={{ zIndex: 10 + i }}>
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
												<div className='text-xs text-muted-foreground'>
													{u.categoryName}
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
												<div className='text-xs text-muted-foreground'>
													{u.categoryName}
												</div>
											</div>
										</TooltipContent>
									</Tooltip>

									<div className='flex-1'>
										<div className='font-medium'>
											{u.displayName || 'Anonymous'}
										</div>
										<div className='text-xs text-slate-500'>
											{u.categoryName || u.categoryId || 'Unknown'} •{' '}
											{u.difficulty}
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
