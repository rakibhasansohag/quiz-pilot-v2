'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import Google from '@/components/google/Google';
import { useState } from 'react';
import animation from '@/components/animation';
import Lottie from 'lottie-react';

export default function LoginPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);

	// If already signed in, redirect away from /login
	useEffect(() => {
		if (status === 'authenticated') {
			router.push('/dashboard');
		}
	}, [status, router]);

	async function handleSubmit(e) {
		e.preventDefault();
		setLoading(true);

		const res = await signIn('credentials', {
			redirect: false,
			email,
			password,
			callbackUrl: '/dashboard',
		});

		setLoading(false);

		if (res?.error) {
			toast.error(res.error || 'Login failed');
			return;
		}
		// if success, NextAuth will set session cookie; redirect
		if (res?.ok) {
			toast.success('Login successful');
			router.push(res.url || '/dashboard');
		}
	}

	return (
		<div className='min-h-screen flex items-center justify-center p-4 lg:gap-15'>
			<Card className='w-full max-w-lg flex'>
				<CardHeader>
					<CardTitle className='text-center'>Log in</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className='space-y-4'>
						<div>
							<Label htmlFor='email'>Email</Label>
							<Input
								id='email'
								type='email'
								placeholder='you@example.com'
								className='mt-1'
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>
						<div>
							<Label htmlFor='password'>Password</Label>
							<Input
								id='password'
								type='password'
								placeholder='At least 6 characters'
								className='mt-1'
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>

						<div className='flex flex-col'>
							<p
								className='flex-start mb-5'
								onClick={() => router.push('/signup')}
							>
								Create a new account?
							</p>
							<Button type='submit' disabled={loading}>
								{loading ? 'Logging in..' : 'Login'}
							</Button>
						</div>
					</form>

					<Google />
				</CardContent>
			</Card>
			<div className='hidden sm:block'>
				<Lottie className='bg-background' animationData={animation} />
			</div>
		</div>
	);
}
