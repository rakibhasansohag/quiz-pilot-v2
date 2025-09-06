USER_OBJECT = {
	_id: 'ObjectId',
	email: 'string (unique, immutable)',
	password: 'string (hashed)',
	role: "enum['user', 'admin']",
	profile: {
		name: 'string',
		avatar: 'string (URL)',
		bio: 'string',
	},
	loginHistory: [
		{
			device: 'string',
			ip: 'string',
			timestamp: 'Date',
		},
	],
	createdAt: 'Date',
	updatedAt: 'Date',
};

CATEGORIES_OBJECT = {
	_id: ObjectId,
	name: 'string (unique)',
	description: 'string',
	createdBy: 'string (userId) | null',
	createdByEmail: 'string | null',
	updatedByEmail: 'string | null',
	totalQuizzes: 0,
	totalAttempts: 0,
	createdAt: ISODate,
	updatedAt: ISODate,
};

QUESTION_OBJECT = {
	_id: ObjectId,
	categoryId: ObjectId,
	categoryName: 'string', // denormalized for fast reads (optional)
	type: 'mcq' | 'tf', // question type
	difficulty: 'easy' | 'medium' | 'hard',
	text: 'What is X?',
	options: ['A', 'B', 'C', 'D'], // for `tf` can be ["True","False"] OR you can omit
	correctIndex: 1, // index into options OR for tf use correct = true/false
	timeLimitSec: 30, // optional per-question timer
	createdBy: 'string (userId)',
	createdByEmail: 'string',
	status: 'published' | 'draft' | 'archived',
	createdAt: ISODate,
};

QUIZ_OBJECT = {
	_id: 'ObjectId',
	title: 'string',
	description: 'string',
	category: 'ObjectId (ref: Category)',
	questions: ['ObjectId (ref: Question)'],
	timeLimit: 'number (seconds)',
	difficulty: "enum['easy', 'medium', 'hard']",
	createdBy: 'ObjectId (ref: User)',
	attempts: 'number',
	averageScore: 'number',
};

QUIZ_ATTEMPT_OBJECT = {
	_id: 'ObjectId',
	userId: 'ObjectId (ref: User)',
	quizId: 'ObjectId (ref: Quiz)',
	answers: [
		{
			questionId: 'ObjectId',
			selectedOption: 'number',
			isCorrect: 'boolean',
			timeTaken: 'number (seconds)',
		},
	],
	score: 'number',
	totalQuestions: 'number',
	accuracy: 'number (%)',
	timeTaken: 'number (seconds)',
	completedAt: 'Date',
};

LEADERBOARD_OBJECT = {
	_id: 'ObjectId',
	category: 'ObjectId (ref: Category)',
	rankings: [
		{
			userId: 'ObjectId (ref: User)',
			score: 'number',
			accuracy: 'number',
			attempts: 'number',
		},
	],
	updatedAt: 'Date',
};

AI_RECOMMENDATION_OBJECT = {
	_id: 'ObjectId',
	userId: 'ObjectId (ref: User)',
	weakCategories: ['ObjectId (ref: Category)'],
	recommendedQuizzes: ['ObjectId (ref: Quiz)'],
	insights: {
		weakestCategory: 'ObjectId (ref: Category)',
		averageAccuracy: 'number',
		comparisonToPeers: 'string',
	},
	generatedAt: 'Date',
};

TEMPORARY_INVITE_OBJECT = {
	_id: 'ObjectId',
	email: 'string',
	token: 'string (unique)',
	invitedBy: 'ObjectId (ref: User)',
	expiresAt: 'Date',
	used: 'boolean',
};

RESULT_OBJECT = {
	_id: ObjectId,
	userId: 'string',
	userEmail: 'string',
	categoryId: ObjectId,
	score: 7,
	total: 10,
	accuracy: 0.7,
	timeTakenSec: 123,
	answers: [
		{ questionId: ObjectId, selectedIndex: 2, correct: true, timeSec: 10 },
		{ questionId: ObjectId, selectedIndex: 2, correct: true, timeSec: 10 },
	],
	createdAt: ISODate,
};
