'use client';

import { motion } from 'framer-motion';
import faq from '@/components/faq-lottie.json';
import Lottie from 'lottie-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@radix-ui/react-accordion';
import Text from '@/components/shared/Typography/Text';

export default function FAQSection() {
  /* FAQ Data */
  const faqItems = [
    {
      question: 'What is QuizPilot?',
      answer:
        'QuizPilot is an interactive quiz platform where learners can test their knowledge, track progress, and improve through engaging challenges.',
    },
    {
      question: 'How do I create an account?',
      answer:
        "Click the 'Sign Up' button at the top right corner and follow the registration steps. You can also sign in with Google for quick access.",
    },
    {
      question: 'Can I use QuizPilot for free?',
      answer:
        'Yes, QuizPilot offers a free plan with access to quizzes. Premium features like advanced analytics and custom quizzes are available on paid plans.',
    },
    {
      question: 'Can I create my own quizzes?',
      answer:
        'Absolutely! Registered users can create and share quizzes with the community. You can also set difficulty levels, categories, and timers.',
    },
    {
      question: 'Is QuizPilot mobile-friendly?',
      answer:
        'Yes, QuizPilot is fully responsive and optimized for desktops, tablets, and mobile devices so you can learn anytime, anywhere.',
    },
  ];

  return (
    <section className="relative w-full py-16 md:py-24 overflow-hidden">
      {/* Animated Background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] blur-3xl"
      />

      {/* Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 items-center gap-14">
        {/* Left Lottie Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="flex justify-center md:justify-start"
        >
          <Lottie className="h-80 md:h-[450px]" animationData={faq} />
        </motion.div>

        {/* Right Content */}
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="flex flex-col items-center md:items-start text-center md:text-left"
        >
          {/* Heading */}
          <Text tag="heading" text="Frequently Asked Questions" className="" />

          {/* Subheading */}
          <Text
            tag="paragraph"
            text="Everything you need to know about <b>QuizPilot</b> is here. If you have more questions, feel free to reach out to us!"
            className="md:text-lg max-w-lg mt-4 mb-8"
          />

          {/* Accordion */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="w-full max-w-md rounded-2xl shadow-sm p-6"
          >
            <Accordion
              type="single"
              collapsible
              className="w-full transition-all duration-700"
            >
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border border-purple-300/30 rounded-xl mb-4 hover:shadow-md transition-all duration-500 ease-in-out hover:scale-[1.02] backdrop-blur-xl"
                >
                  <AccordionTrigger className="px-4 py-3 font-semibold text-lg transition-colors duration-300">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 text-sm leading-relaxed transition-all duration-500">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
