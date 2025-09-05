import Text from '@/components/shared/Typography/Text';
import Image from 'next/image';

export default function Home() {
  return (
    <div>
      <Text tag="heading" text="hellooooo" className="" />
      <button className="ml-40 mt-30 py-2 px-8 bg-gray-50 dark:bg-gray-700 rounded-sm">
        Click
      </button>
    </div>
  );
}
