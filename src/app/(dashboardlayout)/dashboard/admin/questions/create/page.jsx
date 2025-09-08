'use client';

import React from 'react';
import QuestionForm from '@/components/QuestionForm';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function CreateQuestionPage() {
	const router = useRouter();

	return (
		<div className='p-6 max-w-4xl mx-auto'>
			<QuestionForm
				onSaved={(data) => {
					toast.success('Question saved');
					router.push('/dashboard/questions');
				}}
			/>
		</div>
	);
}
