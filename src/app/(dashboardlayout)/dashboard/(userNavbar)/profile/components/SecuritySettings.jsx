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
			const data = await res.json();
			setSessions(data.sessions || []);
		} catch (err) {
			console.error(err);
		}
	}

	async function handleRevoke(id, isCurrent) {
		if (isCurrent) {
			toast.error(
				"You can't revoke your current session here. Use logout instead.",
			);
			return;
		}
		try {
			const res = await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
			if (!res.ok) {
				const j = await res.json();
				toast.error(j.error || 'Failed to revoke session');
				return;
			}
			toast.success('Session revoked');
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
							No active sessions.
						</div>
					) : (
						<table className='w-full table-auto border'>
							<thead>
								<tr className='bg-gray-200'>
									<th className='p-2'>Device</th>
									<th className='p-2'>OS</th>
									<th className='p-2'>Browser</th>
									<th className='p-2'>IP</th>
									<th className='p-2'>Last Seen</th>
									<th className='p-2'>Action</th>
								</tr>
							</thead>
							<tbody>
								{sessions.map((s) => (
									<tr key={s._id} className='border-t'>
										<td className='p-2'>{s.device}</td>
										<td className='p-2'>{s.os}</td>
										<td className='p-2'>{s.browser}</td>
										<td className='p-2'>{s.ip}</td>
										<td className='p-2'>
											{new Date(s.lastSeenAt).toLocaleString()}
										</td>
										<td className='p-2'>
											<Button
												variant='destructive'
												size='sm'
												disabled={s.isCurrent}
												onClick={() => handleRevoke(s._id, s.isCurrent)}
											>
												{s.isCurrent ? 'Current' : 'Revoke'}
											</Button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
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
