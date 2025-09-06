'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

export default function SocialLinks() {
	const { register, handleSubmit, reset } = useForm({
		defaultValues: {
			social: {},
		},
	});

	useEffect(() => {
		(async () => {
			const res = await fetch('/api/profile');
			const data = await res.json();
			if (res.ok) {
				reset({ social: data.user.profile?.social || {} });
			}
		})();
	}, [reset]);

	async function onSubmit(values) {
		try {
			const payload = { profile: { social: values.social } };
			const res = await fetch('/api/profile', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			const json = await res.json();
			if (!res.ok) {
				toast.error(json.error || 'Update failed');
				return;
			}
			toast.success('Socials updated');
			// update local form from server response
			reset({ social: json.user.profile?.social || {} });
		} catch (err) {
			console.error(err);
			toast.error('Server error');
		}
	}

	return (
		<Card>
			<CardHeader>
				<h3 className='text-lg font-medium'>Social profiles</h3>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={handleSubmit(onSubmit)}
					className='grid grid-cols-1 gap-4 max-w-2xl'
				>
					<div>
						<Label>Facebook</Label>
						<Input
							{...register('social.facebook')}
							placeholder='https://facebook.com/...'
						/>
					</div>
					<div>
						<Label>Twitter</Label>
						<Input
							{...register('social.twitter')}
							placeholder='https://twitter.com/...'
						/>
					</div>
					<div>
						<Label>LinkedIn</Label>
						<Input
							{...register('social.linkedin')}
							placeholder='https://linkedin.com/...'
						/>
					</div>
					<div>
						<Label>Website</Label>
						<Input {...register('social.website')} placeholder='https://...' />
					</div>

					<div className='flex gap-3'>
						<Button type='submit'>Save socials</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
