'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function QuizResultPage() {
	const { attemptId } = useParams();
	const [attempt, setAttempt] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchAttempt() {
			try {
				setLoading(true);
				const res = await fetch(`/api/quiz/attempt/${attemptId}`);
				const data = await res.json();
				if (!res.ok) throw new Error(data.error || 'Failed to fetch attempt');
				setAttempt(data.attempt);
			} catch (err) {
				console.error('Error loading result:', err);
			} finally {
				setLoading(false);
			}
		}
		fetchAttempt();
	}, [attemptId]);

	if (loading) return <p>Loading results...</p>;
	if (!attempt) return <p>Result not found.</p>;

	const total = attempt.numQuestions || (attempt.questions?.length ?? 0);
	const score = attempt.score ?? 0;

	return (
		<div className='p-6 max-w-3xl mx-auto'>
			<h2 className='text-2xl font-bold mb-4'>Quiz Result</h2>
			<p className='mb-4'>
				Score: <strong>{score}</strong> / {total}
			</p>

			{attempt.questions.map((q, i) => (
				<div
					key={q.qid}
					className={`mb-4 p-4 rounded border ${
						q.selectedIndex == null ? 'border-yellow-400 bg-yellow-50' : ''
					}`}
				>
					<p className='font-semibold mb-2'>
						{i + 1}. {q.text}
					</p>

					{q.options.map((opt, idx) => {
						const isUserChoice = q.selectedIndex === idx;
						const isCorrect = q.correctIndex === idx;
						return (
							<div
								key={idx}
								className={`p-2 rounded my-1
                  ${isCorrect ? 'bg-green-200 border-green-400' : ''}
                  ${
										isUserChoice && !isCorrect
											? 'bg-red-200 border-red-400'
											: ''
									}`}
							>
								{opt}
								{isUserChoice && !isCorrect ? (
									<span className='ml-2 text-sm'>(Your choice)</span>
								) : null}
								{isCorrect ? (
									<span className='ml-2 text-sm'>(Correct)</span>
								) : null}
								{q.selectedIndex == null ? (
									<span className='ml-2 text-sm text-yellow-800'>
										(Not answered)
									</span>
								) : null}
							</div>
						);
					})}
				</div>
			))}
		</div>
	);
}
