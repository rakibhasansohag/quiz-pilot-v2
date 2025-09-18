'use client';
import { useRouter } from 'next/navigation';
import Select from 'react-select';
import { useState, useEffect, useMemo } from 'react';
import { useTheme } from 'next-themes';
import CountUp from 'react-countup';
import {
	Select as ShadSelect,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import ResponsiveWidthProvider from '@/components/shared/ResponsiveWidthProvider/ResponsiveWidthProvider';
import Lottie from 'lottie-react';
import techSlidingLottie from '../../../components/techSlidingLottie.json';
import Text from '@/components/shared/Typography/Text';
import { Loader, Sparkles, Play, Shuffle, X } from 'lucide-react';
import { getReactSelectStyles } from '@/lib/reactSelectStyles';

export default function QuizSetup() {
	const router = useRouter();
	const { theme } = useTheme();
	const isDark = theme === 'dark';

	const [difficulty, setDifficulty] = useState('');
	const [selectedCategory, setSelectedCategory] = useState(null);
	const [selectedAmount, setSelectedAmount] = useState('');

	const [categories, setCategories] = useState([]);
	const [loadingCats, setLoadingCats] = useState(true);
	const [fetchCatsError, setFetchCatsError] = useState(null);

	// Dynamic stats
	const [stats, setStats] = useState({
		totalUsers: 0,
		totalAttempts: 0,
		totalCategories: 0,
		totalQuestions: 0,
	});
	const [loadingStats, setLoadingStats] = useState(true);

	// UI states
	const [openPanel, setOpenPanel] = useState(false);
	const [starting, setStarting] = useState(false);
	const [serverErrorMessage, setServerErrorMessage] = useState(null);
	const [preparing, setPreparing] = useState(false);

	const difficulties = ['Easy', 'Medium', 'Hard'];
	const amounts = [
		{ value: '5', label: '5 Questions' },
		{ value: '10', label: '10 Questions' },
		{ value: '15', label: '15 Questions' },
		{ value: '20', label: '20 Questions' },
	];

	// Fetch categories
	useEffect(() => {
		let mounted = true;
		async function fetchCategories() {
			setLoadingCats(true);
			setFetchCatsError(null);
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

	// Fetch dynamic stats
	useEffect(() => {
		const fetchStats = async () => {
			try {
				const res = await fetch('/api/stats');
				const data = await res.json();
				if (data.success) {
					setStats(data.data);
				}
			} catch (error) {
				console.error('Failed to fetch stats:', error);
			} finally {
				setLoadingStats(false);
			}
		};
		fetchStats();
	}, []);

	const resetPanel = () => {
		setDifficulty('');
		setSelectedCategory(null);
		setSelectedAmount('');
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
		setSelectedAmount(randomAmount.value);
		setServerErrorMessage(null);
		if (!openPanel) {
			setOpenPanel(true);
		}
	};

	const startQuiz = async () => {
		setServerErrorMessage(null);
		if (!difficulty || !selectedCategory || !selectedAmount) {
			setServerErrorMessage('Please select difficulty, category and amount.');
			return;
		}
		const payload = {
			categoryId: selectedCategory.value,
			numQuestions: parseInt(selectedAmount, 10),
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

	const reactSelectStyles = useMemo(
		() => getReactSelectStyles(isDark),
		[isDark],
	);

	return (
		<ResponsiveWidthProvider>
			<div className='sm:py-16 md:py-32 overflow-hidden flex items-center justify-center py-4 sm:px-4'>
				<div className='w-full max-w-7xl mx-auto h-full'>
					<div className='grid lg:grid-cols-2 gap-8 items-center h-full'>
						{/* Left: Visual Section */}
						<AnimatePresence mode='wait'>
							{!openPanel ? (
								<motion.div
									key='visual'
									initial={{ opacity: 0, x: -50 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: -50 }}
									transition={{ duration: 0.6 }}
									className='flex flex-col items-center justify-center space-y-8 h-full'
								>
									{/* Decorative background */}
									<div className='relative'>
										<div className='absolute inset-0 bg-gradient-to-r from-purple-400/20 via-blue-400/20 to-indigo-400/20 rounded-full blur-3xl transform -rotate-6'></div>
										<Lottie
											animationData={techSlidingLottie}
											className='relative z-10 max-w-lg mx-auto'
											style={{ maxHeight: 400 }}
										/>
									</div>

									{/* Dynamic Stats */}
									<motion.div
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.6, delay: 0.3 }}
										className='grid grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-2xl'
									>
										<div className='text-center p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/20'>
											<div className='text-2xl font-bold text-indigo-600 dark:text-indigo-400'>
												{loadingStats ? (
													'...'
												) : (
													<CountUp
														start={0}
														end={stats.totalQuestions}
														duration={2}
													/>
												)}
												+
											</div>
											<div className='text-xs text-gray-600 dark:text-gray-400 mt-1'>
												Questions
											</div>
										</div>
										<div className='text-center p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/20'>
											<div className='text-2xl font-bold text-purple-600 dark:text-purple-400'>
												{loadingStats ? (
													'...'
												) : (
													<CountUp
														start={0}
														end={stats.totalCategories}
														duration={2.2}
													/>
												)}
												+
											</div>
											<div className='text-xs text-gray-600 dark:text-gray-400 mt-1'>
												Categories
											</div>
										</div>
										<div className='text-center p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/20'>
											<div className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
												{loadingStats ? (
													'...'
												) : (
													<CountUp
														start={0}
														end={stats.totalAttempts}
														duration={2.5}
													/>
												)}
												+
											</div>
											<div className='text-xs text-gray-600 dark:text-gray-400 mt-1'>
												Attempts
											</div>
										</div>
										<div className='text-center p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/20'>
											<div className='text-2xl font-bold text-green-600 dark:text-green-400'>
												{loadingStats ? (
													'...'
												) : (
													<CountUp
														start={0}
														end={stats.totalUsers}
														duration={2.7}
													/>
												)}
												+
											</div>
											<div className='text-xs text-gray-600 dark:text-gray-400 mt-1'>
												Users
											</div>
										</div>
									</motion.div>
								</motion.div>
							) : (
								<motion.div
									key='quiz-form'
									initial={{ opacity: 0, scale: 0.9 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.9 }}
									transition={{ duration: 0.5 }}
									className='h-full flex items-center justify-center'
								>
									{/* Quiz Setup Form */}
									<div className='relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl shadow-md p-6 w-full max-w-2xl  pb-16 overflow-visible '>
										{/* Close button */}
										<button
											onClick={() => {
												setOpenPanel(false);
												resetPanel();
											}}
											className='absolute top-4 right-4 z-20 p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
										>
											<X className='w-4 h-4' />
										</button>

										{/* Decorative background */}
										<div className='absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-100/50 to-transparent dark:from-indigo-900/20 rounded-full blur-3xl'></div>

										<div className='relative z-10 space-y-6'>
											{/* Section Title */}
											<div className='text-center'>
												<h2 className='text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2'>
													Customize Your Quiz
												</h2>
												<p className='text-gray-600 dark:text-gray-400'>
													Choose your preferences for the perfect quiz
													experience
												</p>
											</div>

											{/* Difficulty Selection */}
											<div className='space-y-4'>
												<div className='flex items-center gap-2'>
													<div className='w-2 h-2 bg-indigo-500 rounded-full'></div>
													<h3 className='text-xl font-semibold text-gray-900 dark:text-gray-100'>
														Difficulty Level
													</h3>
												</div>
												<div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
													{difficulties.map((level) => (
														<motion.button
															key={level}
															whileHover={{ scale: 1.02, y: -2 }}
															whileTap={{ scale: 0.98 }}
															onClick={() => setDifficulty(level)}
															className={`relative p-4 rounded-2xl border-2 text-center transition-all duration-300 font-medium ${
																difficulty === level
																	? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 shadow-lg transform scale-105'
																	: 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/50'
															}`}
															type='button'
															aria-pressed={difficulty === level}
														>
															{difficulty === level && (
																<div className='absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl'></div>
															)}
															<div className='relative z-10'>
																<div
																	className={`text-lg ${
																		difficulty === level
																			? 'text-indigo-700 dark:text-indigo-300'
																			: 'text-gray-700 dark:text-gray-300'
																	}`}
																>
																	{level}
																</div>
																<div
																	className={`text-xs mt-1 ${
																		difficulty === level
																			? 'text-indigo-600 dark:text-indigo-400'
																			: 'text-gray-500 dark:text-gray-500'
																	}`}
																>
																	{level === 'Easy' && 'Perfect for beginners'}
																	{level === 'Medium' && 'Balanced challenge'}
																	{level === 'Hard' && 'Expert level test'}
																</div>
															</div>
														</motion.button>
													))}
												</div>
											</div>

											{/* Category Selection */}

											<div className='space-y-4'>
												<div className='flex items-center gap-2'>
													<div className='w-2 h-2 bg-purple-500 rounded-full'></div>
													<h3 className='text-xl font-semibold text-gray-900 dark:text-gray-100'>
														Quiz Category
													</h3>
												</div>
												<div className='relative'>
													<Select
														isLoading={loadingCats}
														options={categories}
														onChange={(option) => setSelectedCategory(option)}
														styles={{
															...reactSelectStyles,
															control: (provided, state) => ({
																...reactSelectStyles.control(provided, state),
																minHeight: '56px',
																borderRadius: '16px',
																border: '2px solid',
																borderColor: state.isFocused
																	? '#6366f1'
																	: '#e5e7eb',
																boxShadow: state.isFocused
																	? '0 0 0 3px rgba(99, 102, 241, 0.1)'
																	: 'none',
																'&:hover': {
																	borderColor: '#6366f1',
																},
															}),
															valueContainer: (provided) => ({
																...provided,
																padding: '0 16px',
															}),
														}}
														value={selectedCategory}
														placeholder='Choose a category that interests you...'
														isClearable
														isSearchable={true}
													/>
												</div>
												{fetchCatsError && (
													<motion.div
														initial={{ opacity: 0, y: -10 }}
														animate={{ opacity: 1, y: 0 }}
														className='bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl p-3 text-red-700 dark:text-red-300 text-sm'
													>
														{fetchCatsError}
													</motion.div>
												)}
											</div>
											{/* Amount Selection */}
											<div className='space-y-4'>
												<div className='flex items-center gap-2'>
													<div className='w-2 h-2 bg-blue-500 rounded-full'></div>
													<h3 className='text-xl font-semibold text-gray-900 dark:text-gray-100'>
														Number of Questions
													</h3>
												</div>
												<ShadSelect
													value={selectedAmount}
													onValueChange={setSelectedAmount}
													className='w-full'
												>
													<SelectTrigger className='h-14 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-all duration-300 w-full'>
														<SelectValue
															placeholder='Select the number of questions'
															className='truncate text-sm sm:text-base'
														/>
													</SelectTrigger>
													<SelectContent className='rounded-xl max-h-60'>
														{amounts.map((amount) => (
															<SelectItem
																key={amount.value}
																value={amount.value}
																className='rounded-lg'
															>
																{amount.label}
															</SelectItem>
														))}
													</SelectContent>
												</ShadSelect>
											</div>

											{/* Error Messages */}
											{serverErrorMessage && (
												<motion.div
													initial={{ opacity: 0, scale: 0.95 }}
													animate={{ opacity: 1, scale: 1 }}
													className='bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/50 dark:to-orange-950/50 border-l-4 border-yellow-400 rounded-xl p-4'
												>
													<p className='text-sm font-medium text-yellow-800 dark:text-yellow-200'>
														{serverErrorMessage}
													</p>
												</motion.div>
											)}

											{/* Preparing State */}
											{preparing && (
												<motion.div
													initial={{ opacity: 0, scale: 0.95 }}
													animate={{ opacity: 1, scale: 1 }}
													className='bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border-l-4 border-indigo-500 rounded-xl p-6'
												>
													<div className='flex items-center justify-center space-x-4'>
														<Loader className='animate-spin h-6 w-6 text-indigo-600' />
														<div className='text-center'>
															<div className='font-semibold text-indigo-900 dark:text-indigo-200 mb-1'>
																Preparing your quiz...
															</div>
															<div className='text-sm text-indigo-700 dark:text-indigo-300'>
																We&apos;re setting up the perfect questions for
																you!
															</div>
														</div>
													</div>
												</motion.div>
											)}

											{/* Action Buttons */}
											<div className='flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700'>
												<div className='flex gap-3'>
													<Button
														variant='ghost'
														className='px-6 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800'
														onClick={() => {
															resetPanel();
															setOpenPanel(false);
														}}
														disabled={starting || preparing}
													>
														Cancel
													</Button>

													<Button
														variant='outline'
														className='px-6 py-2 rounded-xl border-2'
														onClick={tryRandomCategory}
														disabled={
															starting || preparing || !categories.length
														}
													>
														<Shuffle className='w-4 h-4 mr-2' />
														Randomize
													</Button>
												</div>

												<Button
													disabled={
														!difficulty ||
														!selectedCategory ||
														!selectedAmount ||
														starting ||
														preparing
													}
													className='group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
													onClick={startQuiz}
												>
													{starting ? (
														<span className='inline-flex items-center'>
															<Loader className='mr-2 animate-spin h-4 w-4' />
															Preparing...
														</span>
													) : (
														<span className='inline-flex items-center'>
															<Play className='w-4 h-4 mr-2 group-hover:animate-pulse' />
															Start Quiz
														</span>
													)}
												</Button>
											</div>
										</div>
									</div>
								</motion.div>
							)}
						</AnimatePresence>

						{/* Right: Hero Content */}
						<motion.div
							initial={{ opacity: 0, x: 50 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							className='flex flex-col justify-center space-y-8 h-full'
						>
							{/* Hero Content */}
							<div className='text-center lg:text-left space-y-6'>
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.6, delay: 0.4 }}
								>
									<Text tag='heading' text='Quiz Quest' />
									<div className='mt-4'>
										<Text
											tag='subheading'
											text='Test your knowledge & challenge yourself with interactive quizzes!'
										/>
									</div>
								</motion.div>
								<p className='text-sm font-medium text-indigo-500 dark:text-indigo-400 mb-2'>
									You can start fresh or let us pick something random for you
								</p>

								{/* CTA Buttons */}
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.6, delay: 0.5 }}
									className='flex flex-col sm:flex-row gap-4 justify-center lg:justify-start'
								>
									<Button
										size='lg'
										className='group relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-8 py-4 rounded-2xl'
										onClick={() => {
											setOpenPanel(!openPanel);
											if (!openPanel) {
												setServerErrorMessage(null);
											}
										}}
									>
										<Play className='w-5 h-5 mr-2 animate-pulse' />
										{openPanel ? 'Close Setup' : 'Start Your Quiz'}
									</Button>

									<Button
										variant='outline'
										size='lg'
										className='group border-2 border-indigo-200 dark:border-indigo-700 hover:border-indigo-400 dark:hover:border-indigo-500 px-8 py-4 rounded-2xl transition-all duration-300 hover:bg-indigo-50 dark:hover:bg-indigo-950'
										onClick={tryRandomCategory}
									>
										<Sparkles className='w-5 h-5 mr-2 group-hover:animate-spin' />
										Try Random Quiz
									</Button>
								</motion.div>
							</div>
						</motion.div>
					</div>
				</div>
			</div>
		</ResponsiveWidthProvider>
	);
}
