'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import moment from 'moment';
import { Clock, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function QuizAttemptIdPage() {
	const { attemptId } = useParams();
	const router = useRouter();

	// Attempt & UI state
	const [attempt, setAttempt] = useState(null);
	const [loading, setLoading] = useState(true);
	const [currentQ, setCurrentQ] = useState(0);

	const [answersMap, setAnswersMap] = useState({});
	const [selectedIdx, setSelectedIdx] = useState(null); // current question selection (mirror of answersMap[currentQ])
	const [timeLeft, setTimeLeft] = useState(0);
	const [submitting, setSubmitting] = useState(false);

	const timerRef = useRef(null);

	// Load attempt once
	useEffect(() => {
		if (!attemptId) return;
		let mounted = true;

		async function loadAttempt() {
			try {
				setLoading(true);
				console.log('[Quiz] fetching attempt:', attemptId);
				const res = await fetch(`/api/quiz/attempt/${attemptId}`);
				const data = await res.json();
				if (!res.ok) {
					console.error('Failed to fetch attempt', data);
					throw new Error(data.error || 'Failed to load attempt');
				}
				if (!mounted) return;

				setAttempt(data.attempt || null);

				// compute total time from questions
				const total = (data.attempt?.questions || []).reduce(
					(s, q) => s + (q.timeLimitSec ?? 60),
					0,
				);
				setTimeLeft(total || 60);

				// restore any previously saved answers (server might return them)
				const initialMap = {};
				(data.attempt?.questions || []).forEach((q) => {
					if (q.selectedIndex != null) initialMap[q.qid] = q.selectedIndex;
				});
				setAnswersMap(initialMap);

				// set selectedIdx from first question if answer present
				const firstQ = data.attempt?.questions?.[0];
				setSelectedIdx(
					firstQ && initialMap[firstQ.qid] != null
						? initialMap[firstQ.qid]
						: null,
				);

				setCurrentQ(0);
				console.log('[Quiz] attempt loaded, totalTime:', total);
			} catch (err) {
				console.error('[Quiz] loadAttempt error', err);
				toast.error(err.message || 'Unable to load quiz');
			} finally {
				if (mounted) setLoading(false);
			}
		}

		loadAttempt();
		return () => {
			mounted = false;
			clearInterval(timerRef.current);
		};
	}, [attemptId]);

	// Timer: decrement every second
	useEffect(() => {
		if (!attempt || timeLeft <= 0) return;
		timerRef.current = setInterval(() => setTimeLeft((t) => t - 1), 1000);
		return () => clearInterval(timerRef.current);
	}, [attempt, timeLeft]);

	// When time runs out: force submit
	useEffect(() => {
		if (!attempt) return;
		if (timeLeft <= 0) {
			console.log('[Quiz] time expired, forcing submit', attemptId);
			toast('Time is up — submitting...', { icon: <Clock /> });
			handleSubmit(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [timeLeft, attempt]);

	if (loading) {
		// nicer loading screen with animated text
		return (
			<div className='min-h-[60vh] flex items-center justify-center'>
				<motion.div
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					className='text-center'
				>
					<div className='inline-flex items-center justify-center gap-3 bg-white/5 p-4 rounded-2xl shadow'>
						<Loader className='animate-spin' />
						<div>
							<div className='text-lg font-semibold'>
								Preparing your quiz...
							</div>
							<div className='text-sm text-slate-400'>
								Fetching questions & getting things ready.
							</div>
						</div>
					</div>
				</motion.div>
			</div>
		);
	}

	if (!attempt) {
		return <div className='p-6 text-center'>Quiz not found or expired.</div>;
	}

	if (!attempt.questions?.length) {
		return (
			<div className='p-6 text-center'>No questions found in this quiz.</div>
		);
	}

	const totalQuestions = attempt.questions.length;
	const q = attempt.questions[currentQ];

	// When the user selects an option: set both local selectedIdx and answersMap
	const handleSelect = (idx) => {
		setSelectedIdx(idx);
		setAnswersMap((prev) => ({ ...prev, [q.qid]: idx }));
	};

	// Back navigation: restore selectedIdx of previous question
	const handleBack = () => {
		if (currentQ <= 0) return;
		const prev = currentQ - 1;
		setCurrentQ(prev);
		const prevQ = attempt.questions[prev];
		const restored = answersMap[prevQ.qid];
		setSelectedIdx(restored != null ? restored : null);
	};

	// Next button, or Submit if last
	const handleNext = async () => {
		if (selectedIdx == null) {
			toast.error('Please select an option before continuing');
			return;
		}

		// save already done on handleSelect (answersMap); just move to next or submit
		if (currentQ + 1 >= totalQuestions) {
			await handleSubmit(false);
		} else {
			// animate transition by flipping key on motion.div
			const next = currentQ + 1;
			setCurrentQ(next);
			const nextQ = attempt.questions[next];
			const restored = answersMap[nextQ.qid];
			setSelectedIdx(restored != null ? restored : null);
		}
	};

	// Build final answers array from answersMap (and ensure current selection included)
	const buildFinalAnswers = () => {
		// copy existing map and ensure current selection (selectedIdx) is included
		const map = { ...answersMap };
		if (selectedIdx != null) map[q.qid] = selectedIdx;

		return attempt.questions.map((qq) => ({
			qid: qq.qid,
			selectedIndex: map[qq.qid] ?? null,
		}));
	};

	// Final submit handler (isForced = true when time ran out)
	const handleSubmit = async (isForced = false) => {
		if (submitting) {
			console.log('[Quiz] already submitting, ignoring duplicate');
			return;
		}

		// If not forced and user hasn't selected current, prevent submit until selection
		if (!isForced && selectedIdx == null) {
			toast.error('Please select an option before submitting.');
			return;
		}

		setSubmitting(true);
		const toastId = toast.loading('Submitting your quiz...');

		try {
			const finalAnswers = buildFinalAnswers();
			console.log('[Quiz] finalAnswers:', finalAnswers);

			const res = await fetch(`/api/quiz/attempt/${attemptId}/submit`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ answers: finalAnswers }),
			});
			const data = await res.json();
			if (!res.ok || !data.ok) {
				console.error('[Quiz] submit failed', data);
				throw new Error(data.error || 'Submit failed');
			}

			toast.success('Submitted! Redirecting to results...', { id: toastId });
			// very small delay so toast shows
			setTimeout(() => {
				router.push(`/quiz/attempt/${attemptId}/result`);
			}, 350);
		} catch (err) {
			console.error('[Quiz] submit error', err);
			toast.error(err.message || 'Failed to submit', { id: toastId });
			// still try to redirect to results to show whatever saved state exists:
			setTimeout(() => router.push(`/quiz/attempt/${attemptId}/result`), 800);
		} finally {
			setSubmitting(false);
		}
	};

	const answeredCount = Object.keys(answersMap).filter(
		(k) => answersMap[k] != null,
	).length;
	const timeTotal =
		attempt.questions.reduce((s, qq) => s + (qq.timeLimitSec ?? 60), 0) || 1;
	const timeFraction = Math.max(0, Math.min(1, timeLeft / timeTotal));
	const lowTime = timeLeft <= Math.min(15, Math.ceil(timeTotal * 0.15)); // low time indicator

	return (
		<div className='max-w-2xl mx-auto p-6'>
			{/* header: question progress and timer */}
			<div className='mb-4'>
				<div className='flex items-center justify-between'>
					<div>
						<div className='text-sm text-slate-400'>Question</div>
						<div className='font-semibold text-lg'>
							{currentQ + 1} / {totalQuestions}
						</div>
					</div>

					<div className='flex items-center gap-3'>
						<div className='text-right'>
							<div className='text-xs text-slate-400'>Time left</div>
							<div
								className={`font-mono font-semibold ${
									lowTime ? 'text-rose-500' : 'text-slate-700'
								}`}
							>
								⏳ {moment.utc(Math.max(0, timeLeft) * 1000).format('mm:ss')}
							</div>
						</div>
						<div className='w-16 h-9 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-lg p-2'>
							<Clock size={18} />
						</div>
					</div>
				</div>

				{/* animated progress bar */}
				<div className='mt-3 h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden'>
					<motion.div
						initial={false}
						animate={{ width: `${timeFraction * 100}%` }}
						transition={{ ease: 'linear', duration: 0.6 }}
						className={`h-full ${lowTime ? 'bg-rose-500' : 'bg-indigo-600'}`}
						style={{ transformOrigin: 'left' }}
					/>
				</div>

				{/* answered dots */}
				<div className='mt-3 flex items-center gap-2'>
					{attempt.questions.map((_qq, i) => {
						const completed = answersMap[_qq.qid] != null;
						return (
							<div
								key={_qq.qid}
								title={`Question ${i + 1} ${
									completed ? 'answered' : 'not answered'
								}`}
								className={`w-3 h-3 rounded-full ${
									completed ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
								}`}
							/>
						);
					})}
					<div className='ml-2 text-xs text-slate-500'>
						Answered: {answeredCount}/{totalQuestions}
					</div>
				</div>
			</div>

			{/* question card with animated transitions */}
			<div className='bg-white dark:bg-slate-900 p-6 rounded-2xl shadow'>
				<AnimatePresence mode='wait'>
					<motion.div
						key={q.qid}
						initial={{ opacity: 0, x: 16, scale: 0.995 }}
						animate={{ opacity: 1, x: 0, scale: 1 }}
						exit={{ opacity: 0, x: -12, scale: 0.995 }}
						transition={{ duration: 0.28 }}
					>
						<div className='mb-4'>
							<div className='text-slate-500 text-sm'>
								{q.difficulty ? q.difficulty.toUpperCase() : 'QUESTION'}
							</div>
							<h2 className='text-xl font-semibold mt-1'>{q.text}</h2>
						</div>

						<div className='space-y-3'>
							{q.options.map((opt, idx) => {
								const isSelected = selectedIdx === idx;
								return (
									<motion.button
										key={idx}
										onClick={() => handleSelect(idx)}
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
										layout
										className={`w-full text-left rounded-lg p-3 border shadow-sm flex items-center justify-between
                      ${
												isSelected
													? 'bg-indigo-600 text-white border-indigo-600'
													: 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700'
											}
                      disabled:opacity-60`}
										disabled={submitting}
										aria-pressed={isSelected}
									>
										<div className='flex items-center gap-3'>
											<div
												className={`w-8 h-8 rounded-full flex items-center justify-center border ${
													isSelected
														? 'bg-white/10 border-white/20'
														: 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700'
												}`}
											>
												<div
													className={`font-semibold ${
														isSelected
															? 'text-white'
															: 'text-slate-700 dark:text-slate-200'
													}`}
												>
													{String.fromCharCode(65 + idx)}
												</div>
											</div>
											<div className='text-sm'>{opt}</div>
										</div>

										<div className='text-xs text-slate-400'>
											{/* optional meta */}
										</div>
									</motion.button>
								);
							})}
						</div>

						{/* actions */}
						<div className='mt-6 flex items-center justify-between'>
							<div>
								{currentQ > 0 && (
									<Button
										variant='outline'
										onClick={handleBack}
										disabled={submitting}
									>
										Back
									</Button>
								)}
							</div>

							<div className='flex items-center gap-3'>
								{/* helper text when button disabled */}
								<div className='text-sm text-slate-400'>
									{selectedIdx == null ? 'Select an option to continue' : ''}
								</div>

								<button
									onClick={handleNext}
									disabled={submitting || selectedIdx == null}
									className={`inline-flex items-center px-4 py-2 rounded-md text-white ${
										submitting
											? 'bg-rose-600'
											: 'bg-indigo-600 hover:bg-indigo-700'
									} disabled:opacity-60`}
								>
									{submitting ? (
										<>
											<Loader className='mr-2 animate-spin' /> Submitting...
										</>
									) : (
										<>
											{currentQ + 1 === totalQuestions ? 'Submit Quiz' : 'Next'}
										</>
									)}
								</button>
							</div>
						</div>
					</motion.div>
				</AnimatePresence>
			</div>
		</div>
	);
}
