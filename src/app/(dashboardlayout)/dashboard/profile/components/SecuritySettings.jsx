'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';

export default function SecuritySettings() {
	const [sessions, setSessions] = useState([]);
	const { register, handleSubmit, reset } = useForm({
		defaultValues: { current: '', newPassword: '', confirm: '' },
	});

	useEffect(() => {
		fetchSessions();
	}, []);

	async function fetchSessions() {
		try {
			const res = await fetch('/api/sessions');
			const json = await res.json();
			if (res.ok) {
				setSessions(json.sessions || []);
			} else {
				setSessions([]);
			}
		} catch (err) {
			console.error(err);
		}
	}

	async function handleRevoke(id) {
		try {
			const res = await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
			if (!res.ok) {
				const j = await res.json();
				toast.error(j.error || 'Failed');
				return;
			}
			toast.success('Revoked');
			fetchSessions();
		} catch (err) {
			toast.error('Server error');
		}
	}

	async function changePassword(vals) {
		if (vals.newPassword !== vals.confirm) {
			toast.error('Passwords do not match');
			return;
		}

		try {
			const res = await fetch('/api/auth/change-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					current: vals.current,
					newPassword: vals.newPassword,
				}),
			});
			const j = await res.json();
			if (!res.ok) {
				toast.error(j.error || 'Failed');
				return;
			}
			toast.success('Password changed');
			reset();
		} catch (err) {
			toast.error('Server error');
		}
	}

	return (
		<div className='space-y-6'>
			<Card>
				<CardHeader>
					<h3 className='text-lg font-medium'>Active sessions</h3>
				</CardHeader>
				<CardContent>
					{sessions.length === 0 ? (
						<div className='text-sm text-muted-foreground'>
							No active sessions info available.
						</div>
					) : (
						<ul className='space-y-2'>
							{sessions.map((s) => (
								<li
									key={s._id}
									className='flex justify-between items-center border rounded p-3'
								>
									<div>
										<div className='font-medium'>
											{s.userAgent || 'Unknown device'}
										</div>
										<div className='text-sm text-muted-foreground'>
											{s.ip} • {new Date(s.lastSeenAt).toLocaleString()}
										</div>
									</div>
									<div>
										<Button
											variant='destructive'
											onClick={() => handleRevoke(s._id)}
										>
											Revoke
										</Button>
									</div>
								</li>
							))}
						</ul>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<h3 className='text-lg font-medium'>Change password</h3>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={handleSubmit(changePassword)}
						className='grid grid-cols-1 gap-4 max-w-md'
					>
						<div>
							<Label>Current password</Label>
							<Input type='password' {...register('current')} />
						</div>
						<div>
							<Label>New password</Label>
							<Input type='password' {...register('newPassword')} />
						</div>
						<div>
							<Label>Confirm new password</Label>
							<Input type='password' {...register('confirm')} />
						</div>
						<div className='flex gap-3'>
							<Button type='submit'>Change password</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
