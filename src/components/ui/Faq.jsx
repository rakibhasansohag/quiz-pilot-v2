'use client';
import React from 'react'
import Link from 'next/link';
import faq from '@/components/faq_purple_full';
import Lottie from 'lottie-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@radix-ui/react-accordion';

// import Text from '../shared/Typography/Text';


export default function FaqSection() {
    return (
        <section className="w-full  ">
            <div className="max-w-6xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 items-center gap-10">
                {/* Left Lottie Animation */}
                <div className="relative w-full flex justify-center md:justify-start">
                    <Lottie className='text-purple-600 h-80' animationData={faq} />
                </div>

                {/* Right Content */}
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <div className="mt-6 w-full max-w-md ">
                        <Accordion type="single" collapsible className="w-full ">

                            {/* Item 1 */}
                            <AccordionItem value="item-1" className="border
                            border-b-purple-700 rounded-md mb-2 hover:shadow-lg p-3">
                                <AccordionTrigger className="px-4 font-semibold ">
                                    What is QuizPilot?
                                </AccordionTrigger>
                                <AccordionContent className="px-4 text-sm">
                                    QuizPilot is an interactive quiz platform where learners can test their knowledge,
                                    track progress, and improve through engaging challenges.
                                </AccordionContent>
                            </AccordionItem>

                            {/* Item 2 */}
                            <AccordionItem value="item-2" className="border
                            border-b-purple-700 rounded-md mb-2 hover:shadow-lg p-3">
                                <AccordionTrigger className="px-4 font-semibold">
                                    How do I create an account?
                                </AccordionTrigger>
                                <AccordionContent className="px-4 text-sm">
                                    Click the "Sign Up" button at the top right corner and follow the registration steps.
                                    You can also sign in with Google for quick access.
                                </AccordionContent>
                            </AccordionItem>

                            {/* Item 3 */}
                            <AccordionItem value="item-3" className="border
                            border-b-purple-700 rounded-md mb-2 hover:shadow-lg p-3">
                                <AccordionTrigger className="px-4 font-semibold">
                                    Can I use QuizPilot for free?
                                </AccordionTrigger>
                                <AccordionContent className="px-4 text-xs">
                                    Yes, QuizPilot offers a free plan with access to quizzes.
                                    Premium features like advanced analytics and custom quizzes
                                    are available on paid plans.
                                </AccordionContent>
                            </AccordionItem>

                            {/* Item 4 */}
                            <AccordionItem value="item-4" className="border
                            border-b-purple-700 rounded-md mb-2 hover:shadow-lg p-3">
                                <AccordionTrigger className="px-4 font-semibold">
                                    Can I create my own quizzes?
                                </AccordionTrigger>
                                <AccordionContent className="px-4 text-sm">
                                    Absolutely! Registered users can create and share quizzes with the community.
                                    You can also set difficulty levels, categories, and timers.
                                </AccordionContent>
                            </AccordionItem>

                            {/* Item 5 */}
                            <AccordionItem value="item-5" className="border
                            border-b-purple-700 rounded-md hover:shadow-lg p-3">
                                <AccordionTrigger className="px-4 font-semibold">
                                    Is QuizPilot mobile-friendly?
                                </AccordionTrigger>
                                <AccordionContent className="px-4 text-sm">
                                    Yes, QuizPilot is fully responsive and optimized for desktops, tablets,
                                    and mobile devices so you can learn anytime, anywhere.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                    </div>
                </div>
            </div>
        </section>
    )
}
