'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import QuestionForm from '@/components/QuestionForm';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import SliktonLoader from '@/components/SliktonLoader';
import { useRouter } from 'next/navigation';

export default function QuestionsListPage() {
	const [questions, setQuestions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [editing, setEditing] = useState(null);
	const [deleteTarget, setDeleteTarget] = useState(null);
	const [search, setSearch] = useState('');
	const router = useRouter();

	useEffect(() => {
		fetchList();
	}, []);

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

	function openEdit(q) {
		setEditing(q);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	async function confirmDelete(q) {
		setDeleteTarget(q);
	}

	async function performDelete() {
		if (!deleteTarget) return;
		try {
			const res = await fetch(`/api/questions/${deleteTarget._id}`, {
				method: 'DELETE',
				credentials: 'include',
			});
			const data = await res.json();
			if (!res.ok) {
				toast.error(data.error || 'Delete failed');
			} else {
				toast.success('Deleted');
				fetchList();
			}
		} catch (err) {
			console.error(err);
			toast.error('Server error');
		} finally {
			setDeleteTarget(null);
		}
	}

	// Filtered questions based on search
	const filteredQuestions = questions.filter((q) => {
		const lowerSearch = search.toLowerCase();
		return (
			q.text?.toLowerCase().includes(lowerSearch) ||
			q.categoryName?.toLowerCase().includes(lowerSearch) ||
			q.type?.toLowerCase().includes(lowerSearch) ||
			q.difficulty?.toLowerCase().includes(lowerSearch)
		);
	});

	return (
		<div className='max-w-7xl my-10 mx-auto'>
			{/* Header + Search */}
			<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
				<h2 className='text-2xl font-semibold tracking-tight'>Questions</h2>

				{/* Search Input */}
				<div className='relative w-full sm:w-1/3'>
					<Input
						type='text'
						placeholder='Search questions...'
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className='pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary transition-all'
					/>
					<svg
						className='absolute left-3 top-2.5 h-5 w-5 text-gray-400'
						fill='none'
						stroke='currentColor'
						strokeWidth={2}
						viewBox='0 0 24 24'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							d='M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z'
						/>
					</svg>
				</div>

				<Button onClick={() => router.push('/dashboard/questions/create')}>
					Create Question
				</Button>
			</div>

			{/* Questions List */}
			<Card>
				<CardHeader>
					<CardTitle>All Questions</CardTitle>
				</CardHeader>
				<CardContent>
					{loading ? (
						<SliktonLoader count={6} variant='card' />
					) : filteredQuestions.length === 0 ? (
						<div className='text-center text-red-500 animate-pulse'>
							No matching questions found
						</div>
					) : (
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
							{filteredQuestions.map((q) => (
								<div
									key={q._id}
									className='group relative flex flex-col justify-between rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-sm transition-all duration-300 ease-in-out transform hover:-translate-y-1.5'
								>
									{/* Question Header */}
									<div>
										<h3 className='font-semibold text-lg text-gray-900 leading-snug group-hover:text-primary transition-colors duration-200 line-clamp-2'>
											{q.text}
										</h3>

										{/* Metadata */}
										<div className='flex flex-wrap gap-2 mt-3'>
											<span className='bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium border'>
												{q.categoryName}
											</span>
											<span className='bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium capitalize border'>
												{q.type}
											</span>
											<span
												className={`px-3 py-1 rounded-full text-xs font-medium border ${
													q.difficulty === 'hard'
														? 'bg-red-100 text-red-700 border-red-300'
														: q.difficulty === 'medium'
														? 'bg-yellow-100 text-yellow-700 border-yellow-300'
														: 'bg-green-100 text-green-700 border-green-300'
												}`}
											>
												{q.difficulty}
											</span>
										</div>

										{/* Author Info */}
										<div className='mt-3 text-xs text-gray-400'>
											By: {q.createdByEmail || 'Unknown'}
										</div>
									</div>

									{/* Buttons */}
									{/* Buttons */}
									<div className='flex flex-col sm:flex-row justify-between items-stretch sm:items-center mt-5 gap-3 w-full'>
										{/* Edit Button */}
										<Dialog
											open={!!editing && editing._id === q._id}
											onOpenChange={(v) => {
												if (!v) setEditing(null);
											}}
										>
											<DialogTrigger asChild>
												<Button
													size='sm'
													variant='outline'
													className='w-full sm:w-auto px-4 hover:bg-primary hover:text-white transition-all duration-200'
													onClick={() => openEdit(q)}
												>
													Edit
												</Button>
											</DialogTrigger>
											<DialogContent className='max-w-lg w-full'>
												<DialogHeader>
													<DialogTitle>Edit Question</DialogTitle>
												</DialogHeader>
												<QuestionForm
													defaultValues={q}
													onSaved={() => {
														setEditing(null);
														fetchList();
													}}
												/>
												<DialogFooter>
													<DialogClose asChild>
														<Button variant='ghost'>Close</Button>
													</DialogClose>
												</DialogFooter>
											</DialogContent>
										</Dialog>

										{/* Delete Button */}
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button
													size='sm'
													variant='destructive'
													className='w-full sm:w-auto px-4 transition-all duration-200'
													onClick={() => confirmDelete(q)}
												>
													Delete
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent className='max-w-sm w-full'>
												<AlertDialogHeader>
													<AlertDialogTitle>Confirm delete</AlertDialogTitle>
													<p className='text-gray-500 text-sm'>
														Are you sure you want to delete this question? This
														action cannot be undone.
													</p>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel
														className='w-full sm:w-auto'
														onClick={() => setDeleteTarget(null)}
													>
														Cancel
													</AlertDialogCancel>
													<AlertDialogAction
														className='w-full sm:w-auto'
														onClick={performDelete}
													>
														Delete
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
