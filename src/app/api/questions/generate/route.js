import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import { getDb } from '@/lib/mongodb';
import { getUserFromCookies } from '@/lib/getUserFromCookies';

// normalize text for dedupe
function normalizeText(s = '') {
	return s
		.replace(/[^\w\s]/g, '')
		.trim()
		.replace(/\s+/g, ' ')
		.toLowerCase();
}
function textHash(norm) {
	return crypto.createHash('sha256').update(norm).digest('hex');
}
function shuffleWithIndex(arr = [], correctIdx = 0) {
	const items = arr.map((v, i) => ({ v, i }));
	for (let i = items.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[items[i], items[j]] = [items[j], items[i]];
	}
	const newOptions = items.map((x) => x.v);
	const newCorrectIndex = items.findIndex((x) => x.i === correctIdx);
	return { newOptions, newCorrectIndex };
}

function safeParseAI(outputText) {
	if (!outputText || typeof outputText !== 'string') return null;
	try {
		return JSON.parse(outputText);
	} catch (e) {
		const m = outputText.match(/(\[.*\]|\{.*\})/s);
		if (m) {
			try {
				return JSON.parse(m[1]);
			} catch (e2) {
				return null;
			}
		}
		return null;
	}
}

// extract textual content from diverse SDK responses
function extractTextFromResponse(resp) {
	if (!resp) return '';
	if (typeof resp === 'string') return resp;
	if (resp.text) return resp.text;
	if (resp.output_text) return resp.output_text;
	if (Array.isArray(resp.candidates) && resp.candidates.length) {
		const cand = resp.candidates[0];
		if (cand?.text) return cand.text;
		if (Array.isArray(cand?.content)) {
			for (const c of cand.content) {
				if (typeof c === 'string') return c;
				if (c?.type === 'output_text' && c?.text) return c.text;
			}
		}
	}
	if (Array.isArray(resp.output) && resp.output.length) {
		return resp.output
			.map((o) => (o?.text ? o.text : JSON.stringify(o)))
			.join('\n');
	}
	return JSON.stringify(resp);
}

export async function POST(req) {
	try {
		const user = await getUserFromCookies(req);
		if (!user || user.role !== 'admin') {
			return NextResponse.json(
				{ error: "You don't have permission" },
				{ status: 401 },
			);
		}

		const body = await req.json();
		const {
			topic,
			categoryId,
			type = 'mcq',
			difficulty = 'easy',
			count = 5,
			timeLimitSec = 30,
			diversify = false,
			seedPrompts = [],
			preview = false,
			// when inserting from preview, clients will pass `candidates` array
			candidates: incomingCandidates = undefined,
		} = body;

		if (
			preview === false &&
			Array.isArray(incomingCandidates) &&
			incomingCandidates.length === 0
		) {
			return NextResponse.json({ ok: true, insertedQuestions: [] });
		}

		// if preview mode requires topic and category, but when inserting from preview we already have candidates - categoryId still required
		if (!categoryId)
			return NextResponse.json(
				{ error: 'categoryId required' },
				{ status: 400 },
			);

		const db = await getDb();
		const category = await db
			.collection('categories')
			.findOne({ _id: new ObjectId(categoryId) });
		if (!category)
			return NextResponse.json(
				{ error: 'Category not found' },
				{ status: 404 },
			);

		const maxCount = 50;
		const want = Math.min(Number(count) || 1, maxCount);

		const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

		// build prompt for generation
		function buildPrompt(batch) {
			return `
You are an expert exam writer. Generate ${batch} ${
				type === 'mcq' ? 'multiple-choice' : 'true/false'
			} questions about the topic: "${topic || ''}".
Requirements:
- Return a JSON array like [{ "text": "...", "options": ["a","b","c","d"], "correctIndex": 0, "difficulty": "${difficulty}", "timeLimitSec": ${timeLimitSec} }, ...]
- For MCQ provide exactly 4 options and one correctIndex (0-based).
- For TF return options ["True","False"] and correctIndex 0 or 1.
- Keep each question short to medium length, unique wording, and avoid duplicates.
- Do not include extraneous text. Output strict JSON only.
${
	Array.isArray(seedPrompts) && seedPrompts.length
		? `Examples:\n${seedPrompts.join('\n')}`
		: ''
}
Use different phrasing across questions.
`;
		}

		// function to call AI and return parsed candidates
		async function callAI(batchSize) {
			const prompt = buildPrompt(batchSize);
			const temperature = diversify ? 0.8 : 0.6;
			const resp = await ai.models.generateContent({
				model: 'gemini-2.5-flash',
				contents: prompt,
				config: { thinkingConfig: { thinkingBudget: 0 }, temperature },
			});
			const raw = extractTextFromResponse(resp);
			const parsed = safeParseAI(raw);
			if (!Array.isArray(parsed)) {
				console.warn('AI response not parsable JSON array', raw);
				return [];
			}
			// minimal normalization for preview candidates
			return parsed.map((q) => ({
				text: (q.text || '').trim(),
				options: q.options || (type === 'tf' ? ['True', 'False'] : []),
				correctIndex: Number.isInteger?.call
					? Number(q.correctIndex)
					: Number(q.correctIndex || 0),
				difficulty: q.difficulty || difficulty,
				timeLimitSec: q.timeLimitSec ?? timeLimitSec,
			}));
		}

		// If the client sent candidates (inserting previewed items)
		if (Array.isArray(incomingCandidates) && incomingCandidates.length) {
			const inserted = [];
			for (const q of incomingCandidates) {
				if (!q || typeof q.text !== 'string') continue;
				// validate MCQ/TF shape
				if (type === 'mcq') {
					if (!Array.isArray(q.options) || q.options.length !== 4) continue;
					if (
						!Number.isInteger(q.correctIndex) ||
						q.correctIndex < 0 ||
						q.correctIndex >= q.options.length
					)
						continue;
				} else {
					q.options = ['True', 'False'];
					if (![0, 1].includes(Number(q.correctIndex)))
						q.correctIndex =
							q.correctIndex === true || q.correct === 'True' ? 0 : 1;
				}

				const norm = normalizeText(q.text);
				const h = textHash(norm);

				// duplicate check
				const exists = await db
					.collection('questions')
					.findOne({ categoryId: category._id, textHash: h });
				if (exists) continue;

				// shuffle on insert and recompute correctIndex
				let options = q.options;
				let correctIndex = Number(q.correctIndex) || 0;
				if (type === 'mcq') {
					const { newOptions, newCorrectIndex } = shuffleWithIndex(
						options,
						correctIndex,
					);
					options = newOptions;
					correctIndex = newCorrectIndex;
				}

				const now = new Date();
				const doc = {
					categoryId: category._id,
					categoryName: category.name,
					type,
					difficulty: q.difficulty || difficulty,
					text: q.text.trim(),
					textNormalized: norm,
					textHash: h,
					options,
					correctIndex,
					timeLimitSec: q.timeLimitSec ?? timeLimitSec,
					status: 'published',
					createdBy: user.sub,
					createdByEmail: user.email,
					updatedByEmail: null,
					createdAt: now,
					updatedAt: now,
				};

				try {
					const res = await db.collection('questions').insertOne(doc);
					inserted.push({ ...doc, _id: res.insertedId.toString() });
				} catch (e) {
					if (e?.code === 11000) continue; // duplicate race
					console.error('insert error', e);
				}
			}

			if (inserted.length) {
				await db
					.collection('categories')
					.updateOne(
						{ _id: category._id },
						{ $inc: { totalQuizzes: inserted.length } },
					);
			}
			return NextResponse.json({ ok: true, insertedQuestions: inserted });
		}

		// Preview mode - generate candidates and return them (no insert)
		if (preview) {
			// choose batches
			const batches = [];
			if (diversify) {
				const pieces = Math.min(3, want);
				const base = Math.floor(want / pieces);
				let rem = want % pieces;
				for (let i = 0; i < pieces; i++) {
					batches.push(base + (rem > 0 ? 1 : 0));
					if (rem) rem--;
				}
			} else {
				batches.push(want);
			}

			const all = [];
			for (const b of batches) {
				const out = await callAI(b);
				// ensure uniqueness inside the candidate pool by normalized text
				const seen = new Set(all.map((x) => normalizeText(x.text)));
				for (const item of out) {
					const n = normalizeText(item.text);
					if (!seen.has(n)) {
						all.push(item);
						seen.add(n);
					}
				}
			}
			return NextResponse.json({ ok: true, candidates: all });
		}

		// otherwise: generate and insert directly (legacy behavior)
		// (call AI once with want and insert)
		const generated = await callAI(want);
		const insertedQuestions = [];
		for (const q of generated) {
			if (!q || typeof q.text !== 'string') continue;
			if (type === 'mcq') {
				if (!Array.isArray(q.options) || q.options.length !== 4) continue;
			} else {
				q.options = ['True', 'False'];
			}
			const norm = normalizeText(q.text);
			const h = textHash(norm);
			const exists = await db
				.collection('questions')
				.findOne({ categoryId: category._id, textHash: h });
			if (exists) continue;
			let options = q.options;
			let correctIndex = Number(q.correctIndex) || 0;
			if (type === 'mcq') {
				const { newOptions, newCorrectIndex } = shuffleWithIndex(
					options,
					correctIndex,
				);
				options = newOptions;
				correctIndex = newCorrectIndex;
			}
			const now = new Date();
			const doc = {
				categoryId: category._id,
				categoryName: category.name,
				type,
				difficulty: q.difficulty || difficulty,
				text: q.text.trim(),
				textNormalized: norm,
				textHash: h,
				options,
				correctIndex,
				timeLimitSec: q.timeLimitSec ?? timeLimitSec,
				status: 'published',
				createdBy: user.sub,
				createdByEmail: user.email,
				updatedByEmail: null,
				createdAt: now,
				updatedAt: now,
			};
			try {
				const res = await db.collection('questions').insertOne(doc);
				insertedQuestions.push({ ...doc, _id: res.insertedId.toString() });
			} catch (e) {
				if (e?.code === 11000) continue;
				console.error('insert error', e);
			}
		}
		if (insertedQuestions.length) {
			await db
				.collection('categories')
				.updateOne(
					{ _id: category._id },
					{ $inc: { totalQuizzes: insertedQuestions.length } },
				);
		}
		return NextResponse.json({ ok: true, insertedQuestions });
	} catch (err) {
		console.error('POST /api/questions/generate error', err);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}
