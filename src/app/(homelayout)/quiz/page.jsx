'use client';
import { useRouter } from 'next/navigation';
import Select from 'react-select';
import { useState, useEffect, useMemo } from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import ResponsiveWidthProvider from '@/components/shared/ResponsiveWidthProvider/ResponsiveWidthProvider';
import Lottie from 'lottie-react';
import techSlidingLottie from '../../../components/techSlidingLottie.json';
import Text from '@/components/shared/Typography/Text';
import { Loader } from 'lucide-react';

export default function QuizSetup() {
	const router = useRouter();

	const [difficulty, setDifficulty] = useState('');
	const [selectedCategory, setSelectedCategory] = useState(null);
	const [selectedAmount, setSelectedAmount] = useState(null);

	const [categories, setCategories] = useState([]);
	const [loadingCats, setLoadingCats] = useState(true);
	const [fetchCatsError, setFetchCatsError] = useState(null);

	const [open, setOpen] = useState(false);
	const [starting, setStarting] = useState(false);
	const [serverErrorMessage, setServerErrorMessage] = useState(null);
	const [preparing, setPreparing] = useState(false);

	const difficulties = ['Easy', 'Medium', 'Hard'];
	const amounts = [
		{ value: 5, label: '5 Questions' },
		{ value: 10, label: '10 Questions' },
		{ value: 15, label: '15 Questions' },
		{ value: 20, label: '20 Questions' },
	];

	useEffect(() => {
		let mounted = true;
		async function fetchCategories() {
			setLoadingCats(true);
			setFetchCatsError(null);
			try {
				console.log('Fetching categories from /api/categories');
				const res = await fetch('/api/categories');
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data?.error || 'Failed to load categories');
				}
				if (!mounted) return;
				const opts = (data.categories || []).map((c) => ({
					value: c._id,
					label: c.name,
				}));
				setCategories(opts);
				console.log('Categories loaded:', opts.length);
			} catch (err) {
				console.error('fetchCategories error', err);
				if (!mounted) return;
				setFetchCatsError(err.message || 'Failed to load categories');
			} finally {
				if (mounted) setLoadingCats(false);
			}
		}
		fetchCategories();
		return () => {
			mounted = false;
		};
	}, []);

	// dark mode detection
	const [isDark, setIsDark] = useState(() => {
		try {
			if (
				typeof document !== 'undefined' &&
				document.documentElement.classList.contains('dark')
			)
				return true;
			if (typeof window !== 'undefined' && window.matchMedia)
				return window.matchMedia('(prefers-color-scheme: dark)').matches;
			return false;
		} catch {
			return false;
		}
	});

	useEffect(() => {
		if (typeof window !== 'undefined' && window.matchMedia) {
			const mq = window.matchMedia('(prefers-color-scheme: dark)');
			const handler = (e) => setIsDark(e.matches);
			try {
				mq.addEventListener?.('change', handler);
				mq.addListener?.(handler);
			} catch {}
			const observer = new MutationObserver(() => {
				setIsDark(document.documentElement.classList.contains('dark'));
			});
			observer.observe(document.documentElement, {
				attributes: true,
				attributeFilter: ['class'],
			});
			return () => {
				try {
					mq.removeEventListener?.('change', handler);
					mq.removeListener?.(handler);
				} catch {}
				observer.disconnect();
			};
		}
	}, []);

	// react-select style overrides
	const reactSelectStyles = useMemo(() => {
		const baseBg = isDark ? '#0b1220' : '#ffffff';
		const baseBorder = isDark ? '#243444' : '#e5e7eb';
		const text = isDark ? '#e6eef8' : '#0f172a';
		const placeholder = isDark ? '#94a3b8' : '#6b7280';
		const menuBg = isDark ? '#07121b' : '#fff';
		const optionHover = isDark ? '#12303f' : '#f3f4f6';

		// use extreme z-index to beat any overlay
		const PORTAL_Z = 2147483647;

		return {
			control: (base, state) => ({
				...base,
				background: baseBg,
				borderColor: state.isFocused ? '#64748b' : baseBorder,
				boxShadow: 'none',
				minHeight: '44px',
				transition: 'background-color 150ms, border-color 150ms',
				color: text,
			}),
			singleValue: (base) => ({ ...base, color: text }),
			input: (base) => ({ ...base, color: text }),
			placeholder: (base) => ({ ...base, color: placeholder }),
			menu: (base) => ({
				...base,
				background: menuBg,
				color: text,
				zIndex: PORTAL_Z,
				boxShadow: '0 8px 20px rgba(2,6,23,0.3)',
				pointerEvents: 'auto',
			}),
			menuPortal: (base) => ({
				...base,
				zIndex: PORTAL_Z,
				pointerEvents: 'auto',
			}),
			menuList: (base) => ({
				...base,
				maxHeight: '320px',
				overflowY: 'auto',
				WebkitOverflowScrolling: 'touch',
			}),
			option: (base, state) => ({
				...base,
				background: state.isFocused ? optionHover : 'transparent',
				color: text,
				cursor: 'pointer',
				transition: 'background-color 120ms ease, transform 80ms',
				transform: state.isFocused ? 'translateX(2px)' : 'none',
				padding: '10px 12px',
			}),
			groupHeading: (base) => ({ ...base, color: text }),
			indicatorsContainer: (base) => ({ ...base, color: text }),
		};
	}, [isDark]);

	const resetDialog = () => {
		setDifficulty('');
		setSelectedCategory(null);
		setSelectedAmount(null);
		setServerErrorMessage(null);
		setStarting(false);
		setPreparing(false);
	};

	const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];

	const tryRandomCategory = () => {
		if (!categories || !categories.length) {
			setServerErrorMessage('No categories loaded yet — please try again.');
			return;
		}
		const randomCategory = rnd(categories);
		const randomDifficulty = rnd(difficulties);
		const randomAmount = rnd(amounts);
		setSelectedCategory(randomCategory);
		setDifficulty(randomDifficulty);
		setSelectedAmount(randomAmount);
		setServerErrorMessage(null);
	};

	const startQuiz = async () => {
		setServerErrorMessage(null);
		if (!difficulty || !selectedCategory || !selectedAmount) {
			setServerErrorMessage('Please select difficulty, category and amount.');
			return;
		}
		const payload = {
			categoryId: selectedCategory.value,
			numQuestions: selectedAmount.value,
			fixedDifficulty: difficulty,
		};

		try {
			setStarting(true);
			const res = await fetch('/api/quiz/start', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			const data = await res.json();

			if (!res.ok || data?.ok === false) {
				const msg =
					data?.message ||
					data?.error ||
					'No questions available. Try different options.';
				setServerErrorMessage(msg);
				setStarting(false);
				return;
			}

			const attemptId = data.attemptId || data?.attempt?.attemptId;
			if (!attemptId) {
				setServerErrorMessage('Unexpected server response. Please try again.');
				setStarting(false);
				return;
			}

			setPreparing(true);
			setTimeout(() => {
				router.push(`/quiz/attempt/${attemptId}`);
			}, 450);
		} catch (err) {
			console.error('startQuiz error:', err);
			setServerErrorMessage(err.message || 'Server error. Please try again.');
			setStarting(false);
			setPreparing(false);
		}
	};

	// Point: TO debug react-select portal for dark and light mode
	const handleMenuOpen = (menuIsOpen, menuNode) => {
		setTimeout(() => {
			const el =
				document.querySelector('.rs__menu') ||
				document.querySelector('.react-select__menu');
			if (el) {
				console.log(
					'react-select portal element found:',
					el,
					'zIndex:',
					window.getComputedStyle(el).zIndex,
				);
			} else {
				console.log('react-select portal element not found in DOM yet');
			}
		}, 50);
	};

	return (
		<ResponsiveWidthProvider>
			<section className='grid items-center gap-5 md:grid-cols-2 my-5 px-4'>
				<div className='flex items-center justify-center'>
					<Lottie
						animationData={techSlidingLottie}
						className='max-w-[60vh] mx-auto'
						style={{ maxHeight: 420 }}
					/>
				</div>

				<div className='px-2'>
					<div className='max-w-2xl mx-auto rounded-2xl space-y-2 mb-8'>
						<Text tag='heading' text='Quiz Quest' />
						<Text
							tag='subheading'
							text='Test your knowledge & challenge yourself!'
						/>
					</div>

					<Dialog
						open={open}
						onOpenChange={(v) => {
							setOpen(v);
							if (!v) resetDialog();
						}}
					>
						<DialogTrigger asChild>
							<Button size='lg' className='rounded-2xl shadow-md px-6 py-3'>
								Start a Quiz
							</Button>
						</DialogTrigger>

						<DialogContent className='w-full max-w-3xl sm:max-w-lg md:max-w-md rounded-2xl shadow-lg p-4 sm:p-6'>
							<DialogHeader>
								<DialogTitle className='text-xl font-bold text-center'>
									Choose Your Quiz
								</DialogTitle>
							</DialogHeader>

							<motion.div
								initial={{ opacity: 0, y: 12 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.28 }}
								className='space-y-6 mt-4'
							>
								<div>
									<h2 className='text-lg font-medium mb-2'>
										Select Difficulty
									</h2>
									<div className='flex gap-3 flex-wrap'>
										{difficulties.map((level) => (
											<motion.button
												key={level}
												whileHover={{ scale: 1.03 }}
												whileTap={{ scale: 0.98 }}
												onClick={() => setDifficulty(level)}
												className={`px-4 py-2 rounded-xl border text-sm ${
													difficulty === level
														? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
														: 'bg-transparent'
												}`}
												type='button'
												aria-pressed={difficulty === level}
											>
												{level}
											</motion.button>
										))}
									</div>
								</div>

								<div>
									<h2 className='text-lg font-medium mb-2'>Select Category</h2>
									<Select
										className='basic-single w-full text-sm'
										classNamePrefix='rs'
										placeholder='Question Category'
										isClearable
										isLoading={loadingCats}
										onChange={(option) => {
											console.log('category onChange option:', option);
											setSelectedCategory(option);
										}}
										onMenuOpen={() => handleMenuOpen(true)}
										onMenuClose={() => handleMenuOpen(false)}
										options={categories}
										value={selectedCategory}
										styles={reactSelectStyles}
										menuPortalTarget={
											typeof document !== 'undefined'
												? document.body
												: undefined
										}
										menuPosition='fixed'
										menuPlacement='auto'
										menuShouldBlockScroll={false}
										isSearchable={false}
										inputId='quiz-category-select'
										aria-label='Select question category'
									/>
									{fetchCatsError ? (
										<div className='mt-2 text-sm text-red-500'>
											{fetchCatsError}
										</div>
									) : null}
								</div>

								<div>
									<h2 className='text-lg font-medium mb-2'>Select Amount</h2>
									<Select
										className='basic-single w-full text-sm'
										classNamePrefix='rs'
										placeholder='Question Amount'
										isClearable
										onChange={(option) => {
											console.log('amount onChange:', option);
											setSelectedAmount(option);
										}}
										options={amounts}
										value={selectedAmount}
										styles={reactSelectStyles}
										menuPortalTarget={
											typeof document !== 'undefined'
												? document.body
												: undefined
										}
										menuPosition='fixed'
										menuPlacement='auto'
										menuShouldBlockScroll={false}
										isSearchable={false}
										inputId='quiz-amount-select'
										aria-label='Select amount'
									/>
								</div>

								{serverErrorMessage ? (
									<div className='rounded-lg p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-sm text-yellow-800 dark:text-yellow-200'>
										<strong>Heads up:</strong> {serverErrorMessage}
									</div>
								) : null}

								{preparing ? (
									<div className='rounded-lg p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 text-center'>
										<div className='flex items-center justify-center space-x-3'>
											<Loader className='animate-spin' />
											<div>
												<div className='font-medium'>
													Preparing your quiz...
												</div>
												<div className='text-sm text-slate-600 dark:text-slate-300'>
													We&apos;re almost ready — you&apos;ll be redirected
													shortly.
												</div>
											</div>
										</div>
									</div>
								) : null}

								<div className='flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4'>
									<div className='flex gap-3'>
										<Button
											variant='outline'
											onClick={() => {
												setOpen(false);
												resetDialog();
											}}
											disabled={starting || preparing}
										>
											Cancel
										</Button>

										<Button
											variant='ghost'
											onClick={tryRandomCategory}
											disabled={starting || preparing || !categories.length}
											title='Pick a random category, difficulty and amount'
										>
											Try a random quiz
										</Button>
									</div>

									<div className='ml-auto'>
										<Button
											disabled={
												!difficulty ||
												!selectedCategory ||
												!selectedAmount ||
												starting ||
												preparing
											}
											className='px-6 py-2 rounded-xl shadow-md'
											onClick={startQuiz}
										>
											{starting ? (
												<span className='inline-flex items-center'>
													<Loader className='mr-2 animate-spin' size={16} />{' '}
													Preparing...
												</span>
											) : (
												'Start Quiz'
											)}
										</Button>
									</div>
								</div>
							</motion.div>
						</DialogContent>
					</Dialog>
				</div>
			</section>
		</ResponsiveWidthProvider>
	);
}
