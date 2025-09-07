'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import AvatarActions from '@/components/shared/Dropdowns/AvatarActions';
import ConfirmDeleteModal from '@/components/shared/Modals/ConfirmDeleteModal';

export default function ProfileDetails() {
	const { register, handleSubmit, reset, setValue, watch, getValues } = useForm(
		{
			defaultValues: {
				profile: {
					name: '',
					username: '',
					avatar: '',
					coverPhoto: '',
					bio: '',
					phone: '',
				},
				social: {},
			},
		},
	);

	const [loading, setLoading] = useState(false);
	const [user, setUser] = useState(null);
	const [delType, setDelType] = useState(null);
	const [openConfirm, setOpenConfirm] = useState(false);
	const [uploadingAvatar, setUploadingAvatar] = useState(false);
	const [uploadingCover, setUploadingCover] = useState(false);
	const coverInputRef = useRef(null);
	const avatarInputRef = useRef(null);

	const avatarUrl = watch('profile.avatar') || '';
	const coverUrl = watch('profile.coverPhoto') || '';

	useEffect(() => {
		fetchProfile();
	}, []);

	async function fetchProfile() {
		try {
			const res = await fetch('/api/profile');
			const data = await res.json();
			if (!res.ok) {
				toast.error(data.error || 'Failed to load profile');
				return;
			}
			setUser(data.user);
			reset({
				profile: {
					name: data.user.profile?.name || '',
					username: data.user.profile?.username || '',
					avatar: data.user.profile?.avatar || '',
					coverPhoto: data.user.profile?.coverPhoto || '',
					bio: data.user.profile?.bio || '',
					phone: data.user.profile?.phone || '',
				},
				social: data.user.profile?.social || {},
			});
		} catch (err) {
			console.error(err);
			toast.error('Server error');
		}
	}

	async function uploadFile(file, folder = 'profiles') {
		const fd = new FormData();
		fd.append('file', file);
		fd.append('folder', folder);
		const res = await fetch('/api/upload', { method: 'POST', body: fd });
		const json = await res.json();
		if (!res.ok) throw new Error(json.error || 'Upload failed');
		return json.url;
	}

	async function submitProfile(values) {
		setLoading(true);
		try {
			const payload = {
				profile: {
					name: values.profile.name || null,
					username: values.profile.username || null,
					avatar: values.profile.avatar || null,
					coverPhoto: values.profile.coverPhoto || null,
					bio: values.profile.bio || null,
					phone: values.profile.phone || null,
				},
				social: values.social,
			};
			const res = await fetch('/api/profile', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			const data = await res.json();
			if (!res.ok) {
				toast.error(data.error || 'Update failed');
				return data;
			}
			toast.success('Profile updated');
			// refresh server state to be safe
			await fetchProfile();
			return data;
		} catch (err) {
			console.error(err);
			toast.error('Server error');
			throw err;
		} finally {
			setLoading(false);
		}
	}

	async function handleAvatarChange(e) {
		const f = e.target.files?.[0];
		if (!f) return;
		setUploadingAvatar(true);
		try {
			const url = await uploadFile(f, 'avatar');
			setValue('profile.avatar', url, { shouldTouch: true });
			toast.success('Avatar uploaded, saving...');

			await submitProfile(getValues());
		} catch (err) {
			console.error(err);
			toast.error('Upload failed');
		} finally {
			setUploadingAvatar(false);
		}
	}

	async function handleCoverChange(e) {
		const f = e.target.files?.[0];
		if (!f) return;
		setUploadingCover(true);
		try {
			const url = await uploadFile(f, 'cover');
			setValue('profile.coverPhoto', url, { shouldTouch: true });
			toast.success('Cover uploaded, saving...');

			await submitProfile(getValues());
		} catch (err) {
			console.error(err);
			toast.error('Upload failed');
		} finally {
			setUploadingCover(false);
		}
	}

	async function confirmDelete() {
		setOpenConfirm(false);
		if (!delType) return;
		if (delType === 'avatar')
			setValue('profile.avatar', '', { shouldTouch: true });
		if (delType === 'cover')
			setValue('profile.coverPhoto', '', { shouldTouch: true });
		// auto-save deletion
		await submitProfile(getValues());
		setDelType(null);
		toast.success(`${delType === 'avatar' ? 'Avatar' : 'Cover'} removed`);
	}

	const avatarFallback = (user?.profile?.name || 'U')[0]?.toUpperCase() || 'U';

	return (
		<Card className={'!pt-0'}>
			{/* cover area */}
			<div className='relative'>
				<div className=' h-44 md:h-72  w-full bg-gray-100 rounded-t-md overflow-hidden relative'>
					{coverUrl ? (
						<div className='relative w-full h-full'>
							<Image
								src={coverUrl}
								alt='cover'
								fill
								style={{ objectFit: 'cover' }}
								sizes='(max-width: 768px) 100vw, 1200px'
							/>
						</div>
					) : (
						<div className='w-full h-full flex items-center justify-center text-gray-400'>
							Cover placeholder
						</div>
					)}
				</div>

				{/* cover upload overlay */}
				{uploadingCover && (
					<div className='absolute inset-0 flex items-center justify-center bg-black/30'>
						<div className='animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent'></div>
					</div>
				)}

				<div className='absolute right-4 top-3 flex items-center gap-2'>
					<AvatarActions
						onChange={() => coverInputRef.current?.click()}
						onDelete={() => {
							setDelType('cover');
							setOpenConfirm(true);
						}}
						label='Cover'
						type='cover'
					/>
					<input
						ref={coverInputRef}
						type='file'
						accept='image/*'
						onChange={handleCoverChange}
						className='hidden'
					/>
				</div>
			</div>

			<CardContent className='pt-6 '>
				<div className='flex items-start gap-6'>
					<div className='relative left-1/12'>
						<AvatarActions
							onChange={() => avatarInputRef.current?.click()}
							onDelete={() => {
								setDelType('avatar');
								setOpenConfirm(true);
							}}
						>
							<div className='w-28 h-28 md:w-40 md:h-40 rounded-full overflow-hidden shadow -mt-36 bg-white relative cursor-pointer'>
								{avatarUrl ? (
									<Image
										src={avatarUrl}
										alt='avatar'
										width={200}
										height={200}
										style={{ objectFit: 'cover' }}
									/>
								) : (
									<div className='w-full h-full flex items-center justify-center bg-slate-200 text-2xl'>
										<span>{avatarFallback}</span>
									</div>
								)}

								{/* avatar upload overlay (spinner) */}
								{uploadingAvatar && (
									<div className='absolute inset-0 flex items-center justify-center bg-black/40 rounded-full'>
										<div className='animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent'></div>
									</div>
								)}
							</div>
						</AvatarActions>

						<input
							ref={avatarInputRef}
							type='file'
							accept='image/*'
							onChange={handleAvatarChange}
							className='hidden'
						/>
					</div>
				</div>

				<form
					onSubmit={handleSubmit(submitProfile)}
					className='flex-1 space-y-4 mt-5'
				>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div>
							<Label>Name</Label>
							<Input {...register('profile.name')} placeholder='Full name' />
						</div>

						<div>
							<Label>Username</Label>
							<Input {...register('profile.username')} placeholder='username' />
						</div>

						<div className='md:col-span-2'>
							<Label>Bio</Label>
							<Textarea {...register('profile.bio')} placeholder='Short bio' />
						</div>

						<div>
							<Label>Phone</Label>
							<Input {...register('profile.phone')} placeholder='Phone' />
						</div>
						<div>
							<Label>Email</Label>

							<Input value={user?.email ?? ''} placeholder='Email' disabled />
						</div>
					</div>

					<div className='flex gap-3'>
						<Button type='submit' disabled={loading}>
							{loading ? 'Saving...' : 'Save profile'}
						</Button>
					</div>
				</form>
			</CardContent>

			<ConfirmDeleteModal
				open={openConfirm}
				onClose={() => setOpenConfirm(false)}
				title={`Delete ${delType === 'avatar' ? 'avatar' : 'cover photo'}?`}
				onConfirm={confirmDelete}
			/>
		</Card>
	);
}
