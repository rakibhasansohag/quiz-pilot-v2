'use client';

import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';
import Select from 'react-select';
import { useTheme } from 'next-themes';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { getReactSelectStyles } from '@/lib/reactSelectStyles';

export default function GenerateQuestionsPage() {
	const { theme } = useTheme();
	const isDark = theme === 'dark';

	const [categories, setCategories] = useState([]);
	const [loadingCats, setLoadingCats] = useState(true);
	const [topic, setTopic] = useState('');
	const [type, setType] = useState('mcq');
	const [difficulty, setDifficulty] = useState('easy');
	const [count, setCount] = useState(5);
	const [categoryId, setCategoryId] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	// preview & control
	const [seedPrompts, setSeedPrompts] = useState('');
	const [diversify, setDiversify] = useState(false);
	const [previewOpen, setPreviewOpen] = useState(false);
	const [candidates, setCandidates] = useState([]); // array of AI questions (preview)
	const [checked, setChecked] = useState({}); // map idx -> bool
	const [isInserting, setIsInserting] = useState(false);

	useEffect(() => {
		fetchCategories();
	}, []);

	async function fetchCategories() {
		setLoadingCats(true);
		try {
			const res = await fetch('/api/categories');
			const data = await res.json();
			const opts = (data.categories || []).map((c) => ({
				value: c._id,
				label: c.name,
			}));
			setCategories(opts);
		} catch (err) {
			console.error(err);
			toast.error('Failed to load categories');
		} finally {
			setLoadingCats(false);
		}
	}

	const selectedCatOption = useMemo(
		() => categories.find((c) => c.value === categoryId) || null,
		[categories, categoryId],
	);

	// Preview request: ask AI and return candidates (no insert)
	async function handlePreview() {
		if (!topic || !categoryId)
			return toast.error('Topic and category required');
		setIsSubmitting(true);
		try {
			const res = await fetch('/api/questions/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					topic,
					categoryId,
					type,
					difficulty,
					count,
					diversify,
					preview: true,
					seedPrompts: seedPrompts
						.split('\n')
						.map((s) => s.trim())
						.filter(Boolean),
				}),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || 'Failed to preview');
			// data.candidates is an array of candidate objects
			setCandidates(data.candidates || []);
			// set all checked true by default
			const initial = {};
			(data.candidates || []).forEach((_, i) => (initial[i] = true));
			setChecked(initial);
			setPreviewOpen(true);
		} catch (err) {
			console.error(err);
			toast.error(err.message || 'Error generating preview');
		} finally {
			setIsSubmitting(false);
		}
	}

	// Insert selected candidates
	async function handleInsertSelected() {
		const idxs = Object.keys(checked).filter((k) => checked[k]);
		if (!idxs.length)
			return toast.error('Select at least one question to insert');

		const selected = idxs.map((k) => candidates[Number(k)]).filter(Boolean);
		setIsInserting(true);
		try {
			const res = await fetch('/api/questions/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					preview: false,
					candidates: selected,
					categoryId,
				}),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || 'Failed to insert');
			const inserted = data.insertedQuestions || [];
			toast.success(`Inserted ${inserted.length} question(s)`);
			setPreviewOpen(false);
			setCandidates([]);
			setChecked({});
			// optional: navigate or refresh list
		} catch (err) {
			console.error(err);
			toast.error(err.message || 'Insert failed');
		} finally {
			setIsInserting(false);
		}
	}

	// toggle single candidate selection
	function toggleCheck(i) {
		setChecked((prev) => ({ ...prev, [i]: !prev[i] }));
	}

	// helper to display options nicely
	function renderOptions(opts = []) {
		return opts.map((o, i) => (
			<div
				key={i}
				className='text-sm px-2 py-1 rounded-md bg-muted/20 dark:bg-muted/10'
			>
				<strong className='mr-2'> {String.fromCharCode(65 + i)}.</strong> {o}
			</div>
		));
	}

	return (
		<>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.35 }}
				className='p-0 max-w-7xl mx-auto'
			>
				<Card className='dark:bg-slate-800 bg-white shadow-md'>
					<CardHeader>
						<CardTitle>Generate Questions with AI</CardTitle>
					</CardHeader>

					<CardContent className='space-y-4'>
						{/* Category */}
						<div>
							<Label>Category</Label>
							<Select
								isLoading={loadingCats}
								options={categories}
								onChange={(opt) => setCategoryId(opt?.value || '')}
								styles={getReactSelectStyles(isDark)}
								value={selectedCatOption}
								placeholder='Select category...'
								menuPortalTarget={
									typeof document !== 'undefined' ? document.body : undefined
								}
							/>
						</div>

						{/* Topic */}
						<div>
							<Label>Topic</Label>
							<Input
								value={topic}
								onChange={(e) => setTopic(e.target.value)}
								placeholder='e.g., JavaScript arrays — ask about outputs, edge-cases, methods'
							/>
							<p className='text-sm text-muted-foreground mt-1'>
								Tip: focused topics give better AI results.
							</p>
						</div>

						{/* Type + Difficulty + Count */}
						<div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
							<div>
								<Label>Type</Label>
								<select
									value={type}
									onChange={(e) => setType(e.target.value)}
									className='border rounded p-2 w-full dark:bg-slate-700 dark:text-white'
								>
									<option value='mcq'>MCQ</option>
									<option value='tf'>True/False</option>
								</select>
							</div>

							<div>
								<Label>Difficulty</Label>
								<select
									value={difficulty}
									onChange={(e) => setDifficulty(e.target.value)}
									className='border rounded p-2 w-full dark:bg-slate-700 dark:text-white'
								>
									<option value='easy'>Easy</option>
									<option value='medium'>Medium</option>
									<option value='hard'>Hard</option>
								</select>
							</div>

							<div>
								<Label>Count</Label>
								<Input
									type='number'
									min={1}
									max={50}
									value={count}
									onChange={(e) => setCount(Number(e.target.value))}
								/>
								<p className='text-sm text-muted-foreground mt-1'>
									Recommended 1–10 for quality review.
								</p>
							</div>
						</div>

						{/* Seed prompts */}
						<div>
							<Label>Extra context / example lines (optional)</Label>
							<Textarea
								value={seedPrompts}
								onChange={(e) => setSeedPrompts(e.target.value)}
								placeholder={`Optional: give 1–5 example questions (one per line) to guide AI. Example:
What is the output of console.log([1,2].map(x=>x*2))?
Which array method returns a new array without mutating the original?
`}
							/>
							<p className='text-sm text-muted-foreground mt-1'>
								Use examples to mimic your style/level.
							</p>
						</div>

						{/* Diversify */}
						<div className='flex items-center gap-2'>
							<input
								id='div'
								type='checkbox'
								checked={diversify}
								onChange={() => setDiversify((v) => !v)}
								className='w-4 h-4'
							/>
							<label htmlFor='div' className='text-sm'>
								Make outputs more varied (slower)
							</label>
						</div>

						{/* Buttons */}
						<div className='flex gap-2 flex-col sm:flex-row'>
							<Button
								onClick={handlePreview}
								disabled={isSubmitting || !categoryId || !topic}
								className='w-full sm:w-auto'
							>
								{isSubmitting ? 'Generating preview...' : 'Preview Questions'}
							</Button>

							<Button
								variant='ghost'
								onClick={() => {
									setTopic('');
									setSeedPrompts('');
									setCount(5);
									setDiversify(false);
								}}
							>
								Reset
							</Button>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Preview Modal */}
			<Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
				<DialogContent className='max-w-5xl w-full'>
					<DialogHeader>
						<DialogTitle className='flex items-center justify-between'>
							<span>Preview Questions ({candidates.length})</span>
							<span className='text-sm text-muted-foreground'>
								Review & select then insert
							</span>
						</DialogTitle>
					</DialogHeader>

					<div className='space-y-4 max-h-[60vh] overflow-auto p-2'>
						{candidates.length === 0 && (
							<div className='text-center text-sm text-muted-foreground'>
								No candidates.
							</div>
						)}
						{candidates.map((q, i) => (
							<div
								key={i}
								className='border rounded p-3 bg-white/50 dark:bg-slate-800'
							>
								<div className='flex items-start gap-3'>
									<Checkbox
										checked={Boolean(checked[i])}
										onCheckedChange={() => toggleCheck(i)}
									/>
									<div className='flex-1'>
										<div className='text-sm font-medium mb-1'>{q.text}</div>
										<div className='grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2'>
											{q.options && renderOptions(q.options)}
										</div>
										<div className='text-xs text-muted-foreground flex gap-4'>
											<div>Difficulty: {q.difficulty || difficulty}</div>
											<div>Time: {q.timeLimitSec ?? '30'}s</div>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>

					<DialogFooter className='flex flex-col sm:flex-row gap-2'>
						<div className='flex-1'>
							<Button
								variant='ghost'
								onClick={() => {
									setChecked(() =>
										candidates.reduce(
											(acc, _, i) => ({ ...acc, [i]: true }),
											{},
										),
									);
								}}
							>
								Select All
							</Button>
							<Button
								variant='ghost'
								onClick={() => {
									setChecked({});
								}}
							>
								Clear All
							</Button>
						</div>

						<div className='flex gap-2'>
							<Button onClick={() => setPreviewOpen(false)}>Cancel</Button>
							<Button onClick={handleInsertSelected} disabled={isInserting}>
								{isInserting ? 'Inserting...' : 'Insert Selected'}
							</Button>
						</div>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
