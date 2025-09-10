'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function QuizAttemptPage() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const startAttempt = async () => {
      const categoryId = params.get('category');
      const difficulty = params.get('difficulty');
      const numQuestions = parseInt(params.get('amount') || '5', 10);

      const res = await fetch('/api/quiz/start', {
        method: 'POST',
        body: JSON.stringify({
          categoryId,
          numQuestions,
          strategy: 'fixed',
          fixedDifficulty: difficulty,
        }),
      });
      const data = await res.json();

      if (data.ok) {
        router.replace(`/quiz/attempt/${data.attemptId}`);
      }
    };

    startAttempt();
  }, [params, router]);

  return <p>Preparing your quiz...</p>;
}
