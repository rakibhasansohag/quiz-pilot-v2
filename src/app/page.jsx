import Text from '@/components/shared/Typography/Text';
import { getSession } from 'next-auth/react';
import Image from 'next/image';

export default async function Home() {
	const user = await getSession();
	console.log(user);
	return (
		<div>
			<Text tag='heading' text='hellooooo' className='' />
		</div>
	);
}
