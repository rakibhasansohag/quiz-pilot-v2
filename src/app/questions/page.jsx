'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

export default function QuestionsListPage() {
	const [questions, setQuestions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [editing, setEditing] = useState(null);
	const [deleteTarget, setDeleteTarget] = useState(null);

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

	return (
		<div className='p-6 max-w-5xl mx-auto'>
			<div className='flex items-center justify-between mb-4'>
				<h2 className='text-2xl font-semibold'>Questions</h2>
				<Button onClick={() => (window.location.href = '/questions/create')}>
					Create
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>All Questions</CardTitle>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div>Loading...</div>
					) : questions.length === 0 ? (
						<div>No questions yet</div>
					) : (
						<div className='space-y-4'>
							{questions.map((q) => (
								<div
									key={q._id}
									className='p-4 border rounded flex justify-between items-start'
								>
									<div>
										<div className='font-medium'>{q.text}</div>
										<div className='text-sm text-muted-foreground'>
											{q.categoryName} • {q.type} • {q.difficulty}
										</div>
										<div className='text-xs text-muted-foreground'>
											By: {q.createdByEmail || 'Unknown'}
										</div>
									</div>

									<div className='flex gap-2'>
										<Dialog
											open={!!editing && editing._id === q._id}
											onOpenChange={(v) => {
												if (!v) setEditing(null);
											}}
										>
											<DialogTrigger asChild>
												<Button size='sm' onClick={() => openEdit(q)}>
													Edit
												</Button>
											</DialogTrigger>
											<DialogContent>
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

										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button
													size='sm'
													variant='destructive'
													onClick={() => confirmDelete(q)}
												>
													Delete
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>Confirm delete</AlertDialogTitle>
													<p>Delete this question? This cannot be undone.</p>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel
														onClick={() => setDeleteTarget(null)}
													>
														Cancel
													</AlertDialogCancel>
													<AlertDialogAction onClick={performDelete}>
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
