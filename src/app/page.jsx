import Text from '@/components/shared/Typography/Text';

export default async function Home() {
  return (
    <div>
      <div className="flex flex-col items-center gap-5">
        <Text
          tag="h1"
          className={'text-center pt-5'}
          text="The free, fun, and effective way to learn a language!"
        />
        <Text tag="heading" className="text-center" text="Section Heading." />
        <Text
          tag="paragraph"
          className="text-center"
          text="Master whatever you’re learning with Quizlet’s interactive flashcards, practice tests, and study activities."
        />
        <Text
          tag="small"
          className="text-center"
          text="Japan is an island country in East Asia. Located in the Pacific Ocean off the northeast coast of the Asian mainland, it is bordered to the west by the Sea of Japan and extends from the Sea of Okhotsk in the north to the East China Sea in the south. The Japanese archipelago consists of four major islands alongside 14,121 smaller islands, covering 377,975 square kilometers (145,937 sq mi). "
        />
        <Text tag="link" className="text-center" text="this is link" />
        <Text tag="subheading" className="text-center" text="Subheading" />
      </div>
    </div>
  );

}
