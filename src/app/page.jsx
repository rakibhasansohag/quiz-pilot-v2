import Text from '@/components/shared/Typography/Text';
import Image from 'next/image';

export default function Home() {
	return (
		<div className='flex flex-col items-center gap-5'>
			<Text tag='h1' className={'text-center pt-5'} text='The free, fun, and effective way to learn a language!' />
			<Text tag='heading' className='text-center' text='Section Heading.' />
			<Text tag='paragraph' className='text-center' text='Master whatever you’re learning with Quizlet’s interactive flashcards, practice tests, and study activities.' />
			<Text tag='small' className='text-center' text='Master whatever you’re learning with Quizlet’s interactive flashcards, practice tests, and study activities.' />
			<Text tag='link' className='text-center' text='this is link' />
			<Text tag='subheading' className='text-center' text='Subheading' />
		</div>
	);
}
