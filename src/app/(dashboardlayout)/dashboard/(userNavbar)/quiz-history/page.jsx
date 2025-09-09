'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';
import { Loader2, RotateCcw } from 'lucide-react';
import Text from '@/components/shared/Typography/Text';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

const rowVariants = {
	hidden: { opacity: 0, y: 12 },
	visible: { opacity: 1, y: 0 },
};

function getMaxScore(a) {
	return a.maxScore ?? a.numQuestions ?? a.questions?.length ?? null;
}
function isPerfect(a) {
	const max = getMaxScore(a);
	return typeof a.score === 'number' && max !== null && a.score >= max;
}

export default function QuizHistoryPage() {
	const router = useRouter();

	const [attempts, setAttempts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [retaking, setRetaking] = useState(null);
	const [query, setQuery] = useState('');
	const [filterDifficulty, setFilterDifficulty] = useState('all');

	useEffect(() => {
		fetchHistory();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	async function fetchHistory() {
		try {
			setLoading(true);
			console.log('[History] fetching /api/quiz/history');
			const res = await fetch('/api/quiz/history');
			const data = await res.json();
			console.debug('[History] response', res.status, data);
			if (!res.ok) {
				throw new Error(data?.error || 'Failed to fetch history');
			}
			// expect { attempts: [...] }
			setAttempts(data.attempts || []);
		} catch (err) {
			console.error('[History] fetch error', err);
			toast.error(err.message || 'Failed to load quiz history');
		} finally {
			setLoading(false);
		}
	}

	// RETAKE: call dedicated retake endpoint which updates the existing attempt
	async function handleRetake(attempt) {
		if (!attempt?.attemptId) return;
		// guard: don't allow retaking perfect scores
		if (isPerfect(attempt)) {
			toast('Perfect score — retake disabled', { icon: '🎉' });
			return;
		}

		// prevent double-clicks
		if (retaking) return;

		setRetaking(attempt.attemptId);
		// capture toast id so we can replace it
		const tId = toast.loading('Preparing retake...');

		try {
			console.log('[History] retake attempt', attempt.attemptId, attempt);

			const res = await fetch(`/api/quiz/attempt/${attempt.attemptId}/retake`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
			});

			const data = await res.json();
			console.debug('[History] retake result', res.status, data);

			if (!res.ok || data?.ok === false) {
				const msg = data?.message || data?.error || 'Could not prepare retake';
				toast.error(msg, { id: tId });
				setRetaking(null);
				return;
			}

			// success: replace toast and navigate to same attempt (updated in-place)
			toast.success('Retake prepared — opening attempt...', { id: tId });

			// small delay so the user sees toast before navigation
			setTimeout(() => {
				router.push(`/quiz/attempt/${attempt.attemptId}`);
			}, 300);
		} catch (err) {
			console.error('[History] retake error', err);
			toast.error(err.message || 'Retake failed', { id: tId });
			setRetaking(null);
		}
	}

	// client-side filters
	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		return attempts.filter((a) => {
			if (filterDifficulty !== 'all') {
				if ((a.fixedDifficulty || '').toLowerCase() !== filterDifficulty)
					return false;
			}
			if (!q) return true;
			const cat = (a.categoryName || '').toLowerCase();
			const id = (a.attemptId || '').toLowerCase();
			const scoreStr = String(a.score ?? '').toLowerCase();
			return cat.includes(q) || id.includes(q) || scoreStr.includes(q);
		});
	}, [attempts, query, filterDifficulty]);

	return (
		<section className='w-full'>
			{/* heading */}
			<div className='mb-6 space-y-2 text-center'>
				<Text
					tag='heading'
					text='📜 Quiz History'
					className='text-2xl md:text-3xl font-bold'
				/>
				<Text
					tag='paragraph'
					text="Your past quiz attempts. Click 'Retake' to reset the same attempt (no new history entry)."
				/>
			</div>

			{/* filters */}
			<div className='flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-4'>
				<div className='flex gap-3 w-full sm:w-auto'>
					<input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder='Search by category, id or score...'
						className='px-3 py-2 border rounded-md w-full sm:w-[360px]'
						aria-label='Search attempts'
					/>
					<select
						value={filterDifficulty}
						onChange={(e) => setFilterDifficulty(e.target.value)}
						className='px-3 py-2 border rounded-md'
						aria-label='Filter difficulty'
					>
						<option value='all'>All difficulties</option>
						<option value='easy'>Easy</option>
						<option value='medium'>Medium</option>
						<option value='hard'>Hard</option>
					</select>
				</div>

				<div className='flex gap-2'>
					<Button
						variant='ghost'
						onClick={() => {
							fetchHistory();
						}}
					>
						<RotateCcw className='mr-2' /> Refresh
					</Button>
				</div>
			</div>

			{/* table */}
			<div className='overflow-x-auto rounded-md'>
				<Table className='min-w-full border-collapse text-sm sm:text-base'>
					<TableHeader>
						<TableRow className='bg-primary text-white'>
							<TableHead className='text-center font-semibold py-4 px-6 text-white'>
								No
							</TableHead>
							<TableHead className='text-center font-semibold py-4 px-6 text-white'>
								Type
							</TableHead>
							<TableHead className='text-center font-semibold py-4 px-6 text-white'>
								Category
							</TableHead>
							<TableHead className='text-center font-semibold py-4 px-6 text-white'>
								Difficulty
							</TableHead>
							<TableHead className='text-center font-semibold py-4 px-6 text-white'>
								Score
							</TableHead>
							<TableHead className='text-center font-semibold py-4 px-6 text-white'>
								Attempted At
							</TableHead>
							<TableHead className='text-center font-semibold py-4 px-6 text-white'>
								Actions
							</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan='7' className='text-center py-8'>
									<div className='flex justify-center items-center gap-3'>
										<Loader2 className='w-6 h-6 animate-spin text-indigo-600' />
										<span className='text-gray-500 text-lg'>
											Loading quiz history...
										</span>
									</div>
								</TableCell>
							</TableRow>
						) : filtered.length === 0 ? (
							<TableRow>
								<TableCell colSpan='7' className='text-center py-10'>
									<div className='text-gray-600'>
										No attempts found. Try <strong>Start a Quiz</strong> to
										create your first attempt.
									</div>
								</TableCell>
							</TableRow>
						) : (
							filtered.map((a, idx) => {
								const perfect = isPerfect(a);
							
								return (
									<motion.tr
										key={a?.attemptId}
										variants={rowVariants}
										initial='hidden'
										animate='visible'
										transition={{ duration: 0.25, delay: idx * 0.02 }}
										className={`text-center ${
											idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'
										} hover:bg-indigo-50/30`}
									>
										<TableCell className='py-4 px-6'>{idx + 1}</TableCell>
										<TableCell className='py-4 px-6'>
											{a.strategy || 'fixed'}
										</TableCell>
										<TableCell className='py-4 px-6'>
											{a.categoryName || a.categoryId || '—'}
										</TableCell>
										<TableCell className='py-4 px-6'>
											{a.fixedDifficulty || '—'}
										</TableCell>
										<TableCell className='py-4 px-6'>
											<span className='bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold shadow'>
												{a.score == null
													? '—'
													: `${a.score} / ${getMaxScore(a) ?? '—'}`}
											</span>
										</TableCell>
										<TableCell className='py-4 px-6'>
											<span className='text-gray-600'>
												{a.startedAt
													? new Date(a.startedAt).toLocaleString()
													: '—'}
											</span>
										</TableCell>

										<TableCell className='py-4 px-6 flex justify-center gap-3'>
											<Button
												variant='outline'
												onClick={() =>
													router.push(`/quiz/attempt/${a.attemptId}/result`)
												}
												title='View result'
											>
												View
											</Button>

											<Button
												onClick={() => handleRetake(a)}
												disabled={retaking === a.attemptId || perfect}
												title={
													perfect
														? 'Perfect score — retake disabled'
														: 'Retake this attempt'
												}
											>
												{retaking === a.attemptId ? (
													<span className='inline-flex items-center'>
														<Loader2 className='w-4 h-4 mr-2 animate-spin' />{' '}
														Preparing...
													</span>
												) : perfect ? (
													'Perfect Score'
												) : (
													'Retake'
												)}
											</Button>
										</TableCell>
									</motion.tr>
								);
							})
						)}
					</TableBody>
				</Table>
			</div>
		</section>
	);
}
