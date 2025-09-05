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
	_id: 'ObjectId',
	name: 'string (unique)',
	description: 'string',
	createdBy: 'ObjectId (ref: User)',
	totalQuizzes: 'number',
	totalAttempts: 'number',
};

QUESTION_OBJECT = {
	_id: 'ObjectId',
	text: 'string',
	type: "enum['mcq', 'true_false']",
	options: [
		{
			id: 'number',
			text: 'string',
		},
	],
	correctAnswer: 'number (option id)',
	category: 'ObjectId (ref: Category)',
	difficulty: "enum['easy', 'medium', 'hard']",
	explanation: 'string',
	createdBy: 'ObjectId (ref: User)',
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
