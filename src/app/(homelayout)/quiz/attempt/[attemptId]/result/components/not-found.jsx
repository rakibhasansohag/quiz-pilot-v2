import { motion } from 'motion/react';
import Link from 'next/link';

export default function ResultNotFound({ msg }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
    >
      <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Result Not Found</h2>
      <p className="text-gray-500 mb-6">
        {msg || 'We could not find a quiz result with this ID.'}
      </p>
      <Link
        href="/quiz"
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow"
      >
        Back to Quiz
      </Link>
    </motion.div>
  );
}
