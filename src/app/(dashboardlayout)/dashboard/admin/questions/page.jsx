'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { CardContent } from '@/components/ui/card';
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

import ReactSelect from 'react-select';
import {
	Select as ShadSelect,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from '@/components/ui/select';
import { useTheme } from 'next-themes';
import { getReactSelectStyles } from '@/lib/reactSelectStyles';

const DIFFICULTIES = ['easy', 'medium', 'hard'];

export default function QuestionsListPage() {
	const router = useRouter();
	const { theme } = useTheme();
	const isDark = theme === 'dark';

	// filters / UI state
	const [categories, setCategories] = useState([]); // react-select options
	const [category, setCategory] = useState(null);
	const [difficulty, setDifficulty] = useState(''); // '' | 'easy' | 'medium' | 'hard'
	const [search, setSearch] = useState('');

	// data
	const [questions, setQuestions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [editing, setEditing] = useState(null);
	const [deleteTarget, setDeleteTarget] = useState(null);

	// debounced query simple
	const [debouncedQuery, setDebouncedQuery] = useState(search);
	useEffect(() => {
		const t = setTimeout(() => setDebouncedQuery(search.trim()), 350);
		return () => clearTimeout(t);
	}, [search]);

	// load categories once
	useEffect(() => {
		let mounted = true;
		async function loadCats() {
			try {
				const res = await fetch('/api/categories');
				const data = await res.json();
				if (!res.ok)
					throw new Error(data?.error || 'Failed to load categories');
				if (!mounted) return;
				const opts = (data.categories || []).map((c) => ({
					value: c._id,
					label: c.name,
				}));
				setCategories(opts);
			} catch (err) {
				console.error('fetch categories', err);
			}
		}
		loadCats();
		return () => (mounted = false);
	}, []);

	// build URL
	const buildFetchUrl = useCallback(() => {
		const params = new URLSearchParams();
		if (debouncedQuery) params.set('q', debouncedQuery); // server filters text
		if (category?.value) params.set('categoryId', category.value);
		if (difficulty) params.set('difficulty', difficulty);
		params.set('limit', '200');
		return `/api/questions?${params.toString()}`;
	}, [debouncedQuery, category, difficulty]);

	// fetch questions whenever filters change
	useEffect(() => {
		let abort = false;
		async function fetchList() {
			setLoading(true);
			try {
				const url = buildFetchUrl();
				const res = await fetch(url, { credentials: 'include' });
				const data = await res.json();
				if (abort) return;
				if (!res.ok) {
					toast.error(data.error || 'Failed to load questions');
					setQuestions([]);
				} else {
					setQuestions(data.questions || []);
				}
			} catch (err) {
				if (!abort) {
					console.error('fetch questions', err);
					toast.error('Server error');
				}
			} finally {
				if (!abort) setLoading(false);
			}
		}
		fetchList();
		return () => (abort = true);
	}, [buildFetchUrl]);

	// actions
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
				// refetch list
				const url = buildFetchUrl();
				const r = await fetch(url, { credentials: 'include' });
				if (r.ok) {
					const d = await r.json();
					setQuestions(d.questions || []);
				}
			}
		} catch (err) {
			console.error(err);
			toast.error('Server error');
		} finally {
			setDeleteTarget(null);
		}
	}

	const clearFilters = () => {
		setCategory(null);
		setDifficulty('');
		setSearch('');
	};

	return (
		<div className='w-full mx-auto px-4'>
			{/* Header */}
			<div className='mb-6'>
				<div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
					{/* left: title + stats */}
					<div className='flex items-start md:items-center gap-4'>
						<div>
							<h2 className='text-2xl font-semibold tracking-tight'>
								Questions
							</h2>
							<p className='text-sm text-slate-500'>Manage question bank</p>
						</div>
						<div className='hidden sm:flex flex-col text-xs text-slate-500 ml-2'>
							<span>
								Results:{' '}
								<strong className='text-slate-700 dark:text-slate-200'>
									{questions.length}
								</strong>
							</span>
						</div>
					</div>

					{/* right: filters */}
					<div className='w-full md:w-auto'>
						<div className='flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3'>
							{/* category: react-select */}
							<div className='w-full sm:w-[260px]'>
								<ReactSelect
									classNamePrefix='rs'
									value={category}
									onChange={(opt) => setCategory(opt || null)}
									options={categories}
									placeholder='All categories'
									isClearable
									styles={getReactSelectStyles(isDark)}
									menuPortalTarget={
										typeof document !== 'undefined' ? document.body : undefined
									}
									menuPosition='fixed'
									isSearchable
								/>
							</div>

							{/* difficulty: shadcn select */}
							<div className='w-full sm:w-[150px]'>
								<ShadSelect
									value={difficulty ?? 'all'}
									onValueChange={(val) =>
										setDifficulty(val === 'all' ? '' : val)
									}
								>
									<SelectTrigger className='w-full'>
										<SelectValue placeholder='All difficulties' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='all'>All difficulties</SelectItem>
										{DIFFICULTIES.map((d) => (
											<SelectItem key={d} value={d}>
												{d.charAt(0).toUpperCase() + d.slice(1)}
											</SelectItem>
										))}
									</SelectContent>
								</ShadSelect>
							</div>

							{/* search */}
							<div className='relative flex-1 min-w-[160px]'>
								<Input
									type='text'
									placeholder='Search question text...'
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									className='pl-10'
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

							<div className='flex gap-2'>
								<Button
									onClick={() =>
										router.push('/dashboard/admin/questions/create')
									}
								>
									Create
								</Button>
								<Button variant='ghost' onClick={clearFilters}>
									Clear
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* List */}
			<CardContent className={'px-0'}>
				{loading ? (
					<div className='py-6'>
						<SliktonLoader count={9} variant='card' />
					</div>
				) : questions.length === 0 ? (
					<div className='text-center text-red-500 animate-pulse'>
						No matching questions found
					</div>
				) : (
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
						{questions.map((q) => (
							<div
								key={q._id}
								className='group relative flex flex-col justify-between rounded-xl border border-gray-100 dark:border-gray-950 p-6 bg-gray-50 dark:bg-zinc-800 shadow-sm hover:shadow-md transition-transform duration-200 transform hover:-translate-y-1'
							>
								<div>
									<h3 className='font-semibold text-lg text-gray-900 dark:text-gray-200 leading-snug group-hover:text-primary transition-colors duration-200 line-clamp-2'>
										{q.text}
									</h3>

									<div className='flex flex-wrap gap-2 mt-3'>
										<span className='bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-medium border'>
											{q.categoryName}
										</span>
										<span className='bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-medium capitalize border'>
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

									<div className='mt-3 text-xs text-gray-400'>
										By: {q.createdByEmail || 'Unknown'}
									</div>
								</div>

								<div className='flex flex-col sm:flex-row justify-between items-stretch sm:items-center mt-5 gap-3 w-full'>
									<Dialog
										open={!!editing && editing._id === q._id}
										onOpenChange={(v) => !v && setEditing(null)}
									>
										<DialogTrigger asChild>
											<Button
												size='sm'
												variant='outline'
												className='w-full sm:w-auto px-4'
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
													const url = buildFetchUrl();
													fetch(url, { credentials: 'include' })
														.then((r) => r.json())
														.then((d) => {
															if (r.ok) setQuestions(d.questions || []);
														})
														.catch(() => {});
												}}
											/>
											<DialogFooter>
												<DialogClose asChild>
													<Button variant='ghost'>Close</Button>
												</DialogClose>
											</DialogFooter>
										</DialogContent>
									</Dialog>

									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button
												size='sm'
												variant='destructive'
												className='w-full sm:w-auto px-4'
												onClick={() => confirmDelete(q)}
											>
												Delete
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent className='max-w-sm w-full'>
											<AlertDialogHeader>
												<AlertDialogTitle>Confirm delete</AlertDialogTitle>
												<p className='text-gray-500 text-sm'>
													Are you sure? This action cannot be undone.
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
		</div>
	);
}
