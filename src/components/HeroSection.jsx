'use client';

import Link from 'next/link';
import Text from './shared/Typography/Text';
import hero from '@/components/hero';
import Lottie from 'lottie-react';

export default function HeroSection() {
  return (
    <section className="w-full py-12 md:py-20">
      <div className="max-w-6xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 items-center gap-10">
        {/* Left Lottie Animation */}
        <div className="relative w-full flex justify-center md:justify-start">
          <Lottie animationData={hero} />
        </div>

        {/* Right Content */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <Text
            tag="h1"
            text="The free, fun, and effective way to <br/> learn a language!"
            className="!leading-tight !font-extrabold"
          />

          <Text
            tag="paragraph"
            text="Join millions of learners worldwide and start speaking confidently today. Learn smarter, not harder — with QuizPilot!"
            className="mt-5 text-lg text-muted-foreground max-w-lg"
          />

          <div className="mt-7 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link
              href="/quiz"
              className="px-8 py-3 text-lg rounded-lg font-semibold text-white bg-primary hover:bg-purple-950/90 transition-colors duration-300 shadow-lg text-center"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 text-lg rounded-lg font-semibold text-primary bg-white border border-primary hover:bg-purple-50 transition-colors duration-300 shadow text-center"
            >
              I Already Have an Account
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
