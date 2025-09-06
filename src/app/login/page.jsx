'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import animation from "@/components/animation";
import Lottie from 'lottie-react';
import Google from "@/components/google/Google"
import { useState } from 'react';



export default function LoginPage() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const router = useRouter();

	// alert(password)

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, password }),
				credentials: 'include',
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Login failed');
			}

			// Login successful, redirect to dashboard or home page
			toast.success('Login successful');

			router.push('/dashboard');
		} catch (err) {
			setError(err.message || 'An unexpected error occurred.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='min-h-screen  flex items-center justify-center p-4 lg:gap-15'>
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
								variant='ghost'
								onClick={() => router.push('/signup')}
							>
								Create a new account?
							</p>
							{error && (
								<p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
							)}

							<Button type='submit' disabled={loading} >
								{loading ? "Loging in .." : "Login"}
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
