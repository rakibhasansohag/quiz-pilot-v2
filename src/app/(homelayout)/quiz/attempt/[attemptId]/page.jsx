'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import moment from 'moment';
import { Clock, Loader } from 'lucide-react';

/**
 * Quiz attempt page
 * - UX: user must select option -> click Next (or Submit).
 * - Submit button is disabled while sending; shows loader.
 * - Shows toast while submitting and on success/failure.
 * - If time runs out, forces submit (includes current selection).
 */
export default function QuizAttemptIdPage() {
	const { attemptId } = useParams();
	const router = useRouter();

	const [attempt, setAttempt] = useState(null);
	const [currentQ, setCurrentQ] = useState(0);
	const [selectedIdx, setSelectedIdx] = useState(null);
	const [answers, setAnswers] = useState([]);
	const [timeLeft, setTimeLeft] = useState(0);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const timerRef = useRef(null);

	// load attempt
	useEffect(() => {
		if (!attemptId) return;
		let mounted = true;

		async function loadAttempt() {
			try {
				console.log('Fetching attempt:', attemptId);
				setLoading(true);
				const res = await fetch(`/api/quiz/attempt/${attemptId}`);
				const data = await res.json();
				if (!res.ok) {
					console.error('Failed to fetch attempt', data);
					throw new Error(data.error || 'Failed to load attempt');
				}
				if (!mounted) return;
				setAttempt(data.attempt);
				// total time = sum of per-question timers
				const totalTime = (data.attempt.questions || []).reduce(
					(s, q) => s + (q.timeLimitSec || 60),
					0,
				);
				setTimeLeft(totalTime || 60);
				setAnswers([]);
				setCurrentQ(0);
				setSelectedIdx(null);
				console.log(
					'Attempt loaded:',
					data.attempt.attemptId,
					'totalTime:',
					totalTime,
				);
			} catch (err) {
				console.error('loadAttempt error:', err);
				toast.error(err.message || 'Could not load quiz');
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

	// total countdown
	useEffect(() => {
		if (!attempt || timeLeft <= 0) return;
		timerRef.current = setInterval(() => setTimeLeft((t) => t - 1), 1000);
		return () => clearInterval(timerRef.current);
	}, [attempt, timeLeft]);

	// when time finishes ==> force submit
	useEffect(() => {
		if (!attempt) return;
		if (timeLeft <= 0) {
			console.log('Time expired — forcing submit for attempt', attemptId);
			toast('Time is up — submitting...', { icon: <Clock /> });
			// call submit, pass a flag so the function knows it's forced
			doSubmit(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [timeLeft, attempt]);

	if (loading) return <p>Loading quiz...</p>;
	if (!attempt) return <p>Quiz not found.</p>;
	if (!attempt.questions || !attempt.questions.length)
		return <p>No questions in this quiz.</p>;

	const q = attempt.questions[currentQ];

	// select an option
	const handleSelect = (idx) => {
		setSelectedIdx(idx);
	};

	// Save current selection
	const saveCurrentAnswer = () => {
		const curAns = { qid: q.qid, selectedIndex: selectedIdx };
		setAnswers((prev) => {
			const copy = [...prev];
			const idx = copy.findIndex((a) => a.qid === curAns.qid);
			if (idx >= 0) copy[idx] = curAns;
			else copy.push(curAns);
			return copy;
		});
	};

	// Next button
	const handleNext = async () => {
		if (selectedIdx === null) {
			toast.error('Please select an option before continuing');
			return;
		}
		// save
		saveCurrentAnswer();
		setSelectedIdx(null);

		// if last question, submit
		if (currentQ + 1 >= attempt.questions.length) {
			await doSubmit(false);
		} else {
			setCurrentQ((c) => c + 1);
		}
	};

	// Do final submit. isForced: true when time expired.
	const doSubmit = async (isForced = false) => {
		if (submitting) {
			console.log('Already submitting — ignore duplicate');
			return;
		}

		setSubmitting(true);
		console.log('Submitting attempt:', attemptId, 'isForced:', isForced);

		// build final answers array
		let finalAnswers = answers.slice();
		if (selectedIdx !== null) {
			// include current question's selection
			const existing = finalAnswers.findIndex((a) => a.qid === q.qid);
			if (existing >= 0)
				finalAnswers[existing] = { qid: q.qid, selectedIndex: selectedIdx };
			else finalAnswers.push({ qid: q.qid, selectedIndex: selectedIdx });
		}

		// show a persistent loading toast
		const toastId = toast.loading('Submitting your quiz...');

		try {
			const res = await fetch(`/api/quiz/attempt/${attemptId}/submit`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ answers: finalAnswers }),
			});

			const data = await res.json();
			if (!res.ok || !data.ok) {
				console.error('Submit failed', data);
				throw new Error(data.error || 'Submit failed');
			}

			toast.success('Submitted! Redirecting to results...', { id: toastId });
			console.log(
				'Submit successful, redirecting to result for attempt:',
				attemptId,
			);

			// small delay so user sees the toast
			setTimeout(() => {
				router.push(`/quiz/attempt/${attemptId}/result`);
			}, 400);
		} catch (err) {
			console.error('doSubmit error:', err);
			toast.error(err.message || 'Failed to submit', { id: toastId });
			// if forced and error, still direct them to results page optionally:
			router.push(`/quiz/attempt/${attemptId}/result`);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className='max-w-2xl mx-auto p-6 space-y-4'>
			<div className='flex justify-between mb-3'>
				<p className='font-bold'>
					Question {currentQ + 1} of {attempt.questions.length}
				</p>
				<p className='text-red-500'>
					⏳ {moment.utc(Math.max(0, timeLeft) * 1000).format('mm:ss')}
				</p>
			</div>

			<h2 className='text-xl font-semibold mb-3'>{q.text}</h2>

			<div className='space-y-4'>
				{q.options.map((opt, idx) => (
					<Button
						key={idx}
						onClick={() => handleSelect(idx)}
						className={`w-full text-left ${
							selectedIdx === idx ? 'bg-blue-600 text-white' : ''
						}`}
						disabled={submitting} // disable selections while submitting
					>
						{opt}
					</Button>
				))}
			</div>

			<div className='mt-4 flex justify-between items-center'>
				<div>
					{currentQ > 0 && (
						<Button
							variant='outline'
							onClick={() => {
								setCurrentQ((c) => c - 1);
								setSelectedIdx(null);
							}}
							disabled={submitting}
						>
							Back
						</Button>
					)}
				</div>

				<div>
					{/* Submit/Next button shows loader when submitting and is disabled */}
					<button
						onClick={handleNext}
						disabled={submitting}
						className={`inline-flex items-center px-4 py-2 rounded-md bg-slate-800 text-white hover:bg-slate-900 disabled:opacity-60`}
					>
						{submitting ? (
							<>
								<Loader className='mr-2' />
								Submitting...
							</>
						) : (
							<>
								{currentQ + 1 === attempt.questions.length
									? 'Submit Quiz'
									: 'Next'}
							</>
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
