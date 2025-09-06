import { NextResponse } from 'next/server';
import { getCloudinary } from '@/lib/cloudinary';

// NOTE: This route expects a multipart/form-data POST with "file" and optional "folder".
// Example client: const fd = new FormData(); fd.append('file', file); fd.append('folder','profiles/avatar');

export async function POST(req) {
	try {
		const cloudinary = getCloudinary();

		const form = await req.formData();
		const file = form.get('file');
		const folder = form.get('folder') ? String(form.get('folder')) : 'profiles';
		if (!file || typeof file === 'string') {
			return NextResponse.json({ error: 'No file provided' }, { status: 400 });
		}

		// Read file into buffer
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		const mime = file.type || 'application/octet-stream';
		// convert to data URI to upload to cloudinary without extra libs
		const base64 = buffer.toString('base64');
		const dataUri = `data:${mime};base64,${base64}`;

		// Upload to Cloudinary under folder: `${process.env.CLOUDINARY_FOLDER_BASE}/${folder}`
		const folderPath = `${
			process.env.CLOUDINARY_FOLDER_BASE || 'quiz-pilot'
		}/${folder}`;

		const uploadResult = await cloudinary.uploader.upload(dataUri, {
			folder: folderPath,
			// TODO: add width/height/quality transformations if needed:
			// transformation: [{ width: 1200, crop: 'limit' }],
		});

		return NextResponse.json({
			ok: true,
			url: uploadResult.secure_url,
			raw: uploadResult,
		});
	} catch (err) {
		console.error('Upload error', err);
		return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
	}
}
