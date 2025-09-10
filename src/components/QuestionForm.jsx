'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Select from 'react-select';
import {
	Select as ShadSelect,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'react-hot-toast';
import { useTheme } from 'next-themes';
import { getReactSelectStyles } from '@/lib/reactSelectStyles';

const schema = z.object({
	categoryId: z.string().optional(),
	type: z.enum(['mcq', 'tf']).optional(),
	text: z.string().min(5, 'Question text required'),
	options: z.array(z.string()).optional(),
	correctIndex: z.preprocess(
		(v) => Number(v),
		z.number().int().nonnegative().optional(),
	),
	timeLimitSec: z.number().int().positive().optional().nullable(),
	difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});

export default function QuestionForm({
	defaultValues = null,
	onSaved = () => {},
}) {
	const [categories, setCategories] = useState([]);
	const [loadingCats, setLoadingCats] = useState(true);
	const [mounted, setMounted] = useState(false);

	const { theme } = useTheme();
	const isDark = theme === 'dark';

	const isEdit = !!defaultValues;
	const initialType = defaultValues?.type || 'mcq';
	const [qType, setQType] = useState(initialType);
	const [lastMcqOptions, setLastMcqOptions] = useState([]);

	const initialFormValues = isEdit
		? {
				categoryId: defaultValues.categoryId || '',
				type: defaultValues.type || 'mcq',
				text: defaultValues.text || '',
				correctIndex:
					typeof defaultValues.correctIndex === 'number'
						? defaultValues.correctIndex + 1
						: 1,
				timeLimitSec: defaultValues.timeLimitSec ?? null,
				options:
					defaultValues.options ||
					(initialType === 'tf' ? ['True', 'False'] : ['', '', '', '']),
				difficulty: defaultValues?.difficulty || 'easy',
		  }
		: {
				categoryId: '',
				type: 'mcq',
				text: '',
				correctIndex: 1,
				timeLimitSec: 30,
				options: ['', '', '', ''],
				difficulty: 'easy',
		  };

	const {
		register,
		control,
		handleSubmit,
		watch,
		setValue,
		getValues,
		formState: { errors, isSubmitting },
	} = useForm({
		resolver: zodResolver(schema),
		defaultValues: initialFormValues,
	});

	const { fields, append, remove, replace } = useFieldArray({
		control,
		name: 'options',
	});

	// fetch categories
	async function fetchCategories() {
		setLoadingCats(true);
		try {
			const res = await fetch('/api/categories');
			const data = await res.json();
			if (!res.ok) throw new Error(data?.error || 'Failed to fetch categories');
			const opts = (data.categories || []).map((c) => ({
				value: c._id,
				label: c.name,
			}));
			setCategories(opts);
		} catch (err) {
			console.error('fetchCategories error', err);
			toast.error('Failed to load categories');
		} finally {
			setLoadingCats(false);
		}
	}

	useEffect(() => {
		setMounted(true);
		fetchCategories();
		setValue('type', qType, { shouldValidate: false });
		if (!isEdit && qType === 'tf') {
			replace(['True', 'False']);
			setValue('correctIndex', 1);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		setValue('type', qType);
		if (qType === 'tf') {
			const cur = getValues('options') || [];
			if (
				cur.length > 0 &&
				!cur.every((opt) => opt === 'True' || opt === 'False')
			) {
				setLastMcqOptions(cur);
			}
			if (!isEdit || cur.length === 0) {
				replace(['True', 'False']);
				setValue('correctIndex', getValues('correctIndex') ?? 1);
			}
		} else {
			if (lastMcqOptions.length) {
				replace(lastMcqOptions);
			} else {
				if (isEdit && defaultValues?.options?.length) {
					replace(defaultValues.options);
				} else {
					replace(['', '', '', '']);
				}
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [qType]);

	function addOption() {
		const cur = getValues('options') || [];
		if ((cur || []).length >= 4) {
			toast.error('Maximum 4 options allowed for MCQ');
			return;
		}
		append('');
	}
	function removeOption(idx) {
		if (qType === 'tf') return;
		remove(idx);
	}

	function normalizeText(t = '') {
		return t.trim().replace(/\s+/g, ' ');
	}

	async function onSubmit(values) {
		try {
			const text = normalizeText(values.text || '');
			if (!text || text.length < 5) {
				toast.error('Question text too short');
				return;
			}

			const body = {};
			if (isEdit) {
				body.text = text;
				body.timeLimitSec = values.timeLimitSec ?? null;
			} else {
				body.categoryId = values.categoryId;
				body.type = qType;
				body.text = text;
				body.timeLimitSec = values.timeLimitSec ?? null;
				body.difficulty = (values.difficulty || 'easy').toLowerCase();
			}

			if (qType === 'mcq') {
				const optsRaw = values.options || [];
				const opts = optsRaw.map((s) => (s || '').trim()).filter(Boolean);
				if (opts.length < 2) {
					toast.error('Provide at least 2 non-empty options');
					return;
				}
				if (opts.length > 4) {
					toast.error('Maximum 4 options allowed');
					return;
				}
				body.options = opts;
				const uiIdx = Number(values.correctIndex || 1);
				if (Number.isNaN(uiIdx) || uiIdx < 1 || uiIdx > opts.length) {
					toast.error(`Correct option must be between 1 and ${opts.length}`);
					return;
				}
				body.correctIndex = uiIdx - 1;
			} else {
				const uiIdx = Number(values.correctIndex || 1);
				if (![1, 2].includes(uiIdx)) {
					toast.error('Select True (1) or False (2)');
					return;
				}
				body.options = ['True', 'False'];
				body.correctIndex = uiIdx - 1;
			}

			if (!isEdit && !body.categoryId) {
				toast.error('Choose a category');
				return;
			}

			const endpoint = isEdit
				? `/api/questions/${defaultValues._id}`
				: '/api/questions';
			const method = isEdit ? 'PUT' : 'POST';

			const res = await fetch(endpoint, {
				method,
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(body),
			});
			const data = await res.json();

			if (!res.ok) {
				if (res.status === 401)
					toast.error(data.error || 'Unauthorized (admin only)');
				else if (res.status === 409)
					toast.error(data.error || 'Duplicate question text');
				else toast.error(data.error || `Save failed (${res.status})`);
				return;
			}

			toast.success('Saved successfully');
			onSaved(data);
		} catch (err) {
			console.error('onSubmit error', err);
			toast.error('Server error');
		}
	}

	// react-select value mapping
	const selectedCatOption = useMemo(
		() => categories.find((c) => c.value === watch('categoryId')) || null,
		[categories, watch('categoryId')],
	);

	return (
		<Card>
			<CardHeader>
				<CardTitle>{isEdit ? 'Edit Question' : 'Create Question'}</CardTitle>
			</CardHeader>

			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
					<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
						<div>
							<Label>Category</Label>
							<div className='mt-2'>
								{mounted ? (
									<Select
										className='basic-single'
										classNamePrefix='rs'
										placeholder='Select category...'
										isLoading={loadingCats}
										isDisabled={isEdit}
										onChange={(opt) => setValue('categoryId', opt?.value || '')}
										options={categories}
										value={selectedCatOption}
										menuPortalTarget={
											typeof document !== 'undefined'
												? document.body
												: undefined
										}
										styles={getReactSelectStyles(isDark)}
										isClearable
										inputId='category-select'
									/>
								) : (
									<div className='p-2 rounded border bg-muted text-sm text-muted-foreground'>
										Loading categories…
									</div>
								)}
							</div>
						</div>

						<div>
							<Label>Difficulty</Label>
							<div className='mt-2'>
								<Controller
									name='difficulty'
									control={control}
									render={({ field }) => (
										<ShadSelect
											value={field.value || undefined}
											onValueChange={(v) => field.onChange(v)}
											disabled={isEdit}
										>
											<SelectTrigger className='w-full'>
												<SelectValue placeholder='Select difficulty' />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='easy'>Easy</SelectItem>
												<SelectItem value='medium'>Medium</SelectItem>
												<SelectItem value='hard'>Hard</SelectItem>
											</SelectContent>
										</ShadSelect>
									)}
								/>
							</div>
						</div>
					</div>

					{/* question text */}
					<div>
						<Label>Question text</Label>
						<Textarea {...register('text')} className='mt-1' />
						{errors.text && (
							<p className='text-sm text-red-500 mt-1'>{errors.text.message}</p>
						)}
					</div>

					{/* Type tabs, options etc.  */}
					<div>
						<Label>Type</Label>
						<Tabs
							value={qType}
							onValueChange={(v) => {
								if (!isEdit) setQType(v);
							}}
						>
							<TabsList className='mt-2'>
								<TabsTrigger value='mcq'>MCQ</TabsTrigger>
								<TabsTrigger value='tf'>True / False</TabsTrigger>
							</TabsList>

							<TabsContent value='mcq' className='mt-3'>
								<div className='space-y-2'>
									<Label>Options</Label>
									<div className='space-y-2'>
										{fields.map((f, i) => (
											<div key={f.id} className='flex gap-2 items-center'>
												<Input
													{...register(`options.${i}`)}
													className='mt-1'
													placeholder={`Option ${i + 1}`}
													defaultValue={f}
												/>
												<div className='text-sm text-muted-foreground'>
													#{i + 1}
												</div>
												<Button
													type='button'
													size='sm'
													variant='ghost'
													onClick={() => removeOption(i)}
												>
													Remove
												</Button>
											</div>
										))}
										<div>
											<Button
												type='button'
												onClick={addOption}
												disabled={(fields || []).length >= 4}
											>
												Add option
											</Button>
											<span className='ml-2 text-sm text-muted-foreground'>
												{(fields || []).length}/4
											</span>
										</div>
									</div>

									<div className='mt-2'>
										<Label>Correct option (enter 1 - {fields.length})</Label>
										<Input
											type='number'
											{...register('correctIndex', { valueAsNumber: true })}
											className='mt-1 w-32'
											min={1}
											max={fields.length}
										/>
									</div>
								</div>
							</TabsContent>

							<TabsContent value='tf' className='mt-3'>
								<div>
									<Label>Correct answer</Label>
									<div className='flex gap-3 mt-2'>
										<Controller
											control={control}
											name='correctIndex'
											defaultValue={getValues('correctIndex') ?? 1}
											render={({ field }) => (
												<>
													<label className='flex items-center gap-2'>
														<input
															type='radio'
															value={1}
															checked={Number(field.value) === 1}
															onChange={() => field.onChange(1)}
														/>{' '}
														True (1)
													</label>
													<label className='flex items-center gap-2'>
														<input
															type='radio'
															value={2}
															checked={Number(field.value) === 2}
															onChange={() => field.onChange(2)}
														/>{' '}
														False (2)
													</label>
												</>
											)}
										/>
									</div>
								</div>
							</TabsContent>
						</Tabs>
					</div>

					<div>
						<Label>Time limit (sec, optional)</Label>
						<Input
							type='number'
							{...register('timeLimitSec', { valueAsNumber: true })}
							className='mt-1 w-40'
						/>
					</div>

					<div className='flex gap-2'>
						<Button
							type='submit'
							disabled={isSubmitting || (!isEdit && !watch('categoryId'))}
						>
							{isSubmitting
								? 'Saving...'
								: isEdit
								? 'Update question'
								: 'Save Question'}
						</Button>
						{!isEdit && !watch('categoryId') && (
							<div className='text-sm text-muted-foreground self-center'>
								Choose category to enable save
							</div>
						)}
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
