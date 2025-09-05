'use client';

import React from 'react';
import Image from 'next/image';
import Text from './shared/Typography/Text';

export default function Marquee() {
  const cloudinaryLogos = [
    {
      src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
      alt: 'JavaScript',
    },
    {
      src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg',
      alt: 'C++',
    },
    {
      src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
      alt: 'Python',
    },
    {
      src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
      alt: 'Java',
    },
    {
      src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg',
      alt: 'Go',
    },
    {
      src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ruby/ruby-original.svg',
      alt: 'Ruby',
    },
    {
      src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg',
      alt: 'PHP',
    },
    {
      src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg',
      alt: 'C#',
    },
    {
      src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
      alt: 'TypeScript',
    },
    {
      src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg',
      alt: 'Swift',
    },
  ];

  return (
    <section className="w-full flex flex-col items-center justify-center py-10">
      {/* Heading */}
      <Text
        tag="heading"
        text="Our Technology Partners"
        className="mb-4 text-center"
      />
      {/* Paragraph */}
      <Text
        tag="paragraph"
        text="We collaborate with amazing technologies to make QuizPilot better. Here are some of them:"
        className="mb-8 text-center max-w-xl"
      />

      {/* Marquee Container */}
      <div className="relative w-full max-w-6xl overflow-hidden">
        {/* Gradient Masks */}
        <div className="absolute left-0 top-0 w-16 sm:w-20 h-full z-10 bg-gradient-to-r from-gray-100 dark:from-neutral-900 to-transparent"></div>
        <div className="absolute right-0 top-0 w-16 sm:w-20 h-full z-10 bg-gradient-to-l from-gray-100 dark:from-neutral-900 to-transparent"></div>

        {/* Infinite Scrolling Logos */}
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
          {[...cloudinaryLogos, ...cloudinaryLogos].map((logo, index) => (
            <div
              key={index}
              className="shrink-0 flex items-center justify-center h-16 sm:h-20 w-[120px] sm:w-[150px] mx-5 opacity-80 hover:opacity-100 transition duration-300"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                width={70}
                height={70}
                className="object-contain"
                priority
              />
            </div>
          ))}
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </section>
  );
}
