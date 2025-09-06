import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
	secure: true,
});

export function getCloudinary() {
	if (!process.env.CLOUDINARY_CLOUD_NAME) {
		throw new Error('CLOUDINARY_CLOUD_NAME not set');
	}
	return cloudinary;
}
