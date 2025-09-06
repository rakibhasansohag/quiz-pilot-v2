'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function LoginPage() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const router = useRouter();

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
		<div
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				height: '100vh',
				backgroundColor: '#f0f2f5',
			}}
		>
			<div
				style={{
					padding: '2rem',
					borderRadius: '8px',
					boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
					backgroundColor: '#fff',
					width: '100%',
					maxWidth: '400px',
				}}
			>
				<h2 style={{ textAlign: 'center', color: '#333' }}>Login</h2>
				<form
					onSubmit={handleSubmit}
					style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
				>
					<div>
						<label
							htmlFor='email'
							style={{
								display: 'block',
								marginBottom: '0.5rem',
								color: '#555',
							}}
						>
							Email:
						</label>
						<input
							type='email'
							id='email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							style={{
								width: '100%',
								padding: '0.75rem',
								borderRadius: '4px',
								border: '1px solid #ccc',
							}}
						/>
					</div>
					<div>
						<label
							htmlFor='password'
							style={{
								display: 'block',
								marginBottom: '0.5rem',
								color: '#555',
							}}
						>
							Password:
						</label>
						<input
							type='password'
							id='password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							style={{
								width: '100%',
								padding: '0.75rem',
								borderRadius: '4px',
								border: '1px solid #ccc',
							}}
						/>
					</div>
					{error && (
						<p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
					)}
					<button
						type='submit'
						disabled={loading}
						style={{
							padding: '0.75rem',
							borderRadius: '4px',
							border: 'none',
							backgroundColor: '#0070f3',
							color: '#fff',
							cursor: loading ? 'not-allowed' : 'pointer',
							opacity: loading ? 0.7 : 1,
						}}
					>
						{loading ? 'Logging in...' : 'Login'}
					</button>
				</form>
			</div>
		</div>
	);
}
