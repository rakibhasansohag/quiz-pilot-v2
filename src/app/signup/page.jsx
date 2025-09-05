'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

const signupSchema = z
	.object({
		name: z.string().min(2, 'Name must be at least 2 characters'),
		email: z.string().email('Invalid email address'),
		password: z.string().min(6, 'Password must be at least 6 characters'),
		confirm: z.string().min(1, 'Please confirm your password'),
	})
	.refine((data) => data.password === data.confirm, {
		path: ['confirm'],
		message: 'Passwords do not match',
	});

export default function SignupPage() {
	const router = useRouter();
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
	} = useForm({
		resolver: zodResolver(signupSchema),
		defaultValues: { name: '', email: '', password: '', confirm: '' },
	});

	async function onSubmit(values) {
		try {
			const res = await fetch('/api/auth/signup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: values.name,
					email: values.email,
					password: values.password,
				}),
			});
			const data = await res.json();
			if (res.status === 201) {
				toast.success('Account created. Please login.');
				reset();
				setTimeout(() => router.push('/login'), 700);
			} else {
				toast.error(data?.error || 'Signup failed');
			}
		} catch (err) {
			console.error(err);
			toast.error('Server error');
		}
	}

	return (
		<div className='min-h-screen flex items-center justify-center p-4 '>
			<Card className='w-full max-w-lg'>
				<CardHeader>
					<CardTitle className='text-center'>Create your account</CardTitle>
				</CardHeader>

				<CardContent>
					<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
						<div>
							<Label htmlFor='name'>Full name</Label>
							<Input
								id='name'
								placeholder='Your full name'
								{...register('name')}
								className='mt-1'
							/>
							{errors.name && (
								<p className='text-sm text-red-500 mt-1'>
									{errors.name.message}
								</p>
							)}
						</div>

						<div>
							<Label htmlFor='email'>Email</Label>
							<Input
								id='email'
								type='email'
								placeholder='you@example.com'
								{...register('email')}
								className='mt-1'
							/>
							{errors.email && (
								<p className='text-sm text-red-500 mt-1'>
									{errors.email.message}
								</p>
							)}
						</div>

						<div>
							<Label htmlFor='password'>Password</Label>
							<Input
								id='password'
								type='password'
								placeholder='At least 6 characters'
								{...register('password')}
								className='mt-1'
							/>
							{errors.password && (
								<p className='text-sm text-red-500 mt-1'>
									{errors.password.message}
								</p>
							)}
						</div>

						<div>
							<Label htmlFor='confirm'>Confirm Password</Label>
							<Input
								id='confirm'
								type='password'
								placeholder='Repeat password'
								{...register('confirm')}
								className='mt-1'
							/>
							{errors.confirm && (
								<p className='text-sm text-red-500 mt-1'>
									{errors.confirm.message}
								</p>
							)}
						</div>
						<div className='flex flex-col'>
							<p
							   className='flex-start mb-5'
								variant='ghost'
								onClick={() => router.push('/login')}
								disabled={isSubmitting}
							>
								Already have an account?
							</p>

							<Button type='submit' disabled={isSubmitting}>
								{isSubmitting ? 'Creating...' : 'Create account'}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
			<div>
				hello
			</div>
		</div>
	);
}
