'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';
import { CheckCircle, XCircle, ArrowLeft, Repeat, History } from 'lucide-react';
import ResultNotFound from './components/not-found';

export default function QuizResultPage() {
  const { attemptId } = useParams();
  const router = useRouter();

  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!attemptId) return;
    let mounted = true;

    async function fetchAttempt() {
      try {
        setLoading(true);
        setErrorMsg(null);
        const res = await fetch(`/api/quiz/attempt/${attemptId}`);
        const data = await res.json();
        // if (!res.ok || data?.ok === false) {
        //   const msg = data?.error || data?.message || 'Failed to load results';
        //   throw new Error(msg);
        //   return <ResultNotFound message={msg} />;
        //   setNotFoundMsg(msg); // ✅ set state
        //   return;
        // }

        if (!res.ok || data?.ok === false) {
          const msg = data?.error || data?.message || 'Failed to load results';
          if (mounted) setNotFoundMsg(msg); // ✅ state update
          return;
        }
        if (!mounted) return;
        setAttempt(data.attempt);
      } catch (err) {
        console.error('[Result] fetch error', err);
        setErrorMsg(err.message || 'Unable to load result');
        toast.error(err.message || 'Unable to load result');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchAttempt();
    return () => {
      mounted = false;
    };
  }, [attemptId]);

  const total = attempt?.numQuestions ?? attempt?.questions?.length ?? 0;
  const score = attempt?.score ?? 0;
  const percent = total ? Math.round((score / total) * 100) : 0;

  // counts for UI
  const counts = useMemo(() => {
    const qs = attempt?.questions ?? [];
    return {
      all: qs.length,
      correct: qs.filter(q => q.isCorrect === true).length,
      incorrect: qs.filter(q => q.isCorrect === false).length,
      unanswered: qs.filter(q => q.selectedIndex == null).length,
    };
  }, [attempt?.questions]);

  // derived arrays by filter (note: explicit checks for isCorrect)
  const filteredQuestions = useMemo(() => {
    const qs = attempt?.questions ?? [];
    if (filter === 'all') return qs;
    if (filter === 'correct') return qs.filter(q => q.isCorrect === true);
    if (filter === 'incorrect') return qs.filter(q => q.isCorrect === false);
    if (filter === 'unanswered') return qs.filter(q => q.selectedIndex == null);
    return qs;
  }, [attempt?.questions, filter]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 p-4 rounded-lg bg-white/5 shadow">
            <svg
              className="animate-spin h-6 w-6 text-indigo-600"
              viewBox="0 0 24 24"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray="60"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div>
              <div className="font-semibold">Loading results…</div>
              <div className="text-sm text-slate-400">
                Fetching your attempt summary
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center">
        <div className="mb-4 text-rose-600 font-semibold">Error</div>
        <div className="mb-6 text-sm text-rose-700 bg-rose-50 p-4 rounded">
          {errorMsg}
        </div>
        <div className="flex justify-center gap-3">
          <button
            className="px-4 py-2 rounded bg-indigo-600 text-white"
            onClick={() => router.push('/quiz')}
          >
            Back to quizzes
          </button>
          <button
            className="px-4 py-2 rounded border"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!attempt) {
    return <div className="p-6 text-center">No result found.</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header summary */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quiz Result</h1>
          <p className="text-sm text-slate-500 mt-1">
            Attempt ID:{' '}
            <span className="font-mono text-xs">{attempt.attemptId}</span>
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-xs text-slate-400">Score</div>
            <div className="text-lg font-semibold">
              {score} / {total}
            </div>
          </div>

          <div className="w-36">
            <div className="text-xs text-slate-400">Percentage</div>
            <div className="mt-1 flex items-center gap-3">
              <div className="relative w-14 h-14">
                <svg className="w-14 h-14" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#E6EEF8"
                    strokeWidth="3.5"
                  />
                  <path
                    strokeLinecap="round"
                    fill="none"
                    stroke="#6366F1"
                    strokeWidth="3.5"
                    strokeDasharray={`${percent}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-semibold text-sm">
                  {percent}%
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <button
              className="inline-flex items-center gap-2 px-3 py-2 rounded border hover:bg-slate-50"
              onClick={() => router.back()}
              title="Go back"
            >
              <ArrowLeft size={16} /> Back
            </button>
          </div>
        </div>
      </div>

      {/* Actions & filters */}
      <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            className={`px-3 py-1 rounded ${
              filter === 'all' ? 'bg-indigo-600 text-white' : 'border'
            }`}
            onClick={() => setFilter('all')}
            aria-pressed={filter === 'all'}
            title={`Show all (${counts.all})`}
          >
            All ({counts.all})
          </button>

          <button
            className={`px-3 py-1 rounded ${
              filter === 'correct' ? 'bg-green-600 text-white' : 'border'
            }`}
            onClick={() => setFilter('correct')}
            aria-pressed={filter === 'correct'}
            title={`Show correct (${counts.correct})`}
          >
            Correct ({counts.correct})
          </button>

          <button
            className={`px-3 py-1 rounded ${
              filter === 'incorrect' ? 'bg-rose-600 text-white' : 'border'
            }`}
            onClick={() => setFilter('incorrect')}
            aria-pressed={filter === 'incorrect'}
            title={`Show incorrect (${counts.incorrect})`}
          >
            Incorrect ({counts.incorrect})
          </button>

          <button
            className={`px-3 py-1 rounded ${
              filter === 'unanswered' ? 'bg-yellow-400 text-black' : 'border'
            }`}
            onClick={() => setFilter('unanswered')}
            aria-pressed={filter === 'unanswered'}
            title={`Show unanswered (${counts.unanswered})`}
          >
            Unanswered ({counts.unanswered})
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="px-3 py-1 rounded border inline-flex items-center gap-2"
            onClick={() => router.push(`/quiz/attempt/${attempt.attemptId}`)}
            title="Review attempt page"
          >
            <Repeat size={14} /> Review
          </button>

          <button
            className="px-3 py-1 rounded bg-indigo-600 text-white flex gap-2 items-center justify-center"
            onClick={() => router.push('/dashboard/quiz-history')}
          >
            <History size={18} /> Quizzes history
          </button>
        </div>
      </div>

      {/* Detailed questions */}
      <div className="mt-6 space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="p-4 rounded border bg-yellow-50 text-sm">
            No questions match this filter.
          </div>
        ) : null}

        {filteredQuestions.map((q, i) => {
          const selected = q.selectedIndex;
          const correct = q.correctIndex;
          const isAnswered = selected != null;

          return (
            <motion.div
              key={q.qid}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: i * 0.03 }}
              className={`rounded-lg p-4 border ${
                !isAnswered
                  ? 'border-yellow-300 bg-yellow-50'
                  : 'bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-slate-500">
                    Question {attempt.questions.indexOf(q) + 1}
                  </div>
                  <div className="font-semibold mt-1">{q.text}</div>
                </div>

                <div className="text-sm text-right">
                  {isAnswered ? (
                    q.isCorrect ? (
                      <div className="inline-flex items-center gap-2 text-green-700">
                        <CheckCircle /> Correct
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 text-rose-700">
                        <XCircle /> Incorrect
                      </div>
                    )
                  ) : (
                    <div className="inline-flex items-center gap-2 text-yellow-800">
                      Not answered
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {q.options.map((opt, idx) => {
                  const isCorrect = idx === correct;
                  const isUserChoice = idx === selected;
                  const base =
                    'p-2 rounded-md flex items-center justify-between';
                  const correctCls = isCorrect
                    ? 'bg-green-100 border border-green-300'
                    : '';
                  const wrongUserCls =
                    isUserChoice && !isCorrect
                      ? 'bg-rose-100 border border-rose-300'
                      : '';
                  const neutral =
                    !isCorrect && !(isUserChoice && !isCorrect)
                      ? 'bg-white dark:bg-slate-800'
                      : '';

                  return (
                    <div
                      key={idx}
                      className={`${base} ${
                        correctCls || wrongUserCls || neutral
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`font-semibold w-7 flex items-center justify-center rounded-full ${
                            isCorrect ? 'text-green-700' : 'text-slate-600'
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <div className="text-sm">{opt}</div>
                      </div>

                      <div className="text-sm">
                        {isUserChoice && isCorrect ? (
                          <span className="text-green-700 font-medium">
                            (Your answer — Correct)
                          </span>
                        ) : isUserChoice && !isCorrect ? (
                          <span className="text-rose-700 font-medium">
                            (Your answer)
                          </span>
                        ) : isCorrect ? (
                          <span className="text-green-700 font-medium">
                            (Correct)
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
