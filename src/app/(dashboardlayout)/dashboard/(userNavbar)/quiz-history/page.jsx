'use client';

import { motion } from 'motion/react';
import Text from '@/components/shared/Typography/Text';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import React, { useEffect, useState } from 'react';
import { Loader2, Eye, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const tableVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, staggerChildren: 0.08 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

const QuizHistory = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchList();
  }, []);

  // ===>> not working date !
  async function fetchList() {
    setLoading(true);
    try {
      const res = await fetch('/api/questions', { credentials: 'include' });
      const data = await res.json();
      if (res.ok) setQuestions(data.questions || []);
      else toast.error(data.error || 'Failed to load');
    } catch (err) {
      console.error(err);
      toast.error('Server error');
    } finally {
      setLoading(false);
    }
  }

  // Delete function ===>> not working
  async function handleDelete(id) {
    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setQuestions(prev => prev.filter(q => q._id !== id));
        toast.success('Question deleted successfully!');
      } else {
        toast.error('Failed to delete question!');
      }
    } catch (err) {
      toast.error('Server error!');
    }
  }

  return (
    <section className="w-full ">
      {/* Heading */}
      <div className="mb-9 space-y-2 text-center">
        <Text
          tag={'heading'}
          text="📜 Quiz History"
          className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white"
        />
        <Text
          tag={'paragraph'}
          text="View your past quiz attempts, scores, and categories."
          className="text-gray-600 dark:text-gray-300"
        />
      </div>

      {/* Table Container */}
      <motion.div
        className="overflow-x-auto rounded-md"
        variants={tableVariants}
        initial="hidden"
        animate="visible"
      >
        <Table className="min-w-full border-collapse text-sm sm:text-base">
          {/* Table Head */}
          <TableHeader>
            <TableRow className="bg-primary text-white dark:text-gray-200">
              <TableHead className="text-center font-semibold py-4 px-6 text-white dark:text-gray-200">
                No
              </TableHead>
              <TableHead className="text-center font-semibold py-4 px-6 text-white dark:text-gray-200">
                Type
              </TableHead>
              <TableHead className="text-center font-semibold py-4 px-6 text-white dark:text-gray-200">
                Category
              </TableHead>
              <TableHead className="text-center font-semibold py-4 px-6 text-white dark:text-gray-200">
                Score
              </TableHead>
              <TableHead className="text-center font-semibold py-4 px-6 text-white dark:text-gray-200">
                Attempted At
              </TableHead>
              <TableHead className="text-center font-semibold py-4 px-6 text-white dark:text-gray-200">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan="6" className="text-center py-8">
                  <div className="flex justify-center items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                    <span className="text-gray-500 text-lg">
                      Loading quiz history...
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : questions.length === 0 ? (
              <TableRow>
                <TableCell colSpan="6" className="text-center py-10">
                  <span className="text-gray-500 text-lg">
                    No quiz attempts found!
                  </span>
                </TableCell>
              </TableRow>
            ) : (
              questions.map((question, idx) => (
                <motion.tr
                  key={idx}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className={`text-center ${
                    idx % 2 === 0
                      ? 'bg-gray-50 dark:bg-gray-900/50'
                      : 'bg-white dark:bg-gray-900'
                  } hover:bg-indigo-50/20 dark:hover:bg-zinc-800 transition-colors`}
                >
                  <TableCell className="py-4 px-6">{idx + 1}</TableCell>
                  <TableCell className="py-4 px-6">{question.type}</TableCell>
                  <TableCell className="py-4 px-6">
                    {question.categoryName}
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold shadow">
                      {question.score || 'N/A'}
                    </span>
                  </TableCell>

                  <TableCell className="py-4 px-6">
                    <span className="text-gray-600 dark:text-gray-300">
                      {question.attemptedAt || '—'}
                    </span>
                  </TableCell>

                  <TableCell className="py-4 px-6 flex justify-center gap-5 flex-wrap">
                    {/* View Button */}
                    <button className="border text-black dark:text-gray-200 hover:bg-purple-200 dark:hover:bg-purple-300 hover:rounded-md dark:hover:text-black px-3 py-1  flex items-center gap-2 transition-all duration-700">
                      <Eye className="w-4 h-4" /> View
                    </button>

                    {/* Delete Button with Popup */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className=" text-red-600 dark:text-red-500  px-3 py-1 hover:rounded-2xl hover:shadow transition-all duration-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete this quiz attempt from your history.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(question._id)}
                            className="bg-red-600 dark:bg-red-500 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>
    </section>
  );
};

export default QuizHistory;
