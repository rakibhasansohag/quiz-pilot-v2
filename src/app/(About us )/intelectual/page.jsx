import Navbar from '@/components/Navbar'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default function IntellectualProperty() {
    return (
        <div>
           <Navbar></Navbar>
            <div className="max-w-5xl  py-12 px-6">
                <h1 className="text-3xl font-bold mb-6">Intellectual Property and Usage Rights</h1>
                <p className="mb-4">
                    This section details the intellectual property rights and usage permissions for content on QuizPilot, an EdTech platform focused on programming education through quizzes.
                </p>
                <h2 className="text-2xl font-semibold mt-6 mb-4">1. Ownership</h2>
                <p className="mb-4">
                    All content on QuizPilot, including quizzes, tutorials, and code examples, is owned by QuizPilot or its licensors. This includes text, graphics, logos, and software, all protected by copyright and trademark laws.
                </p>
                <h2 className="text-2xl font-semibold mt-6 mb-4">2. License to Use</h2>
                <p className="mb-4">
                    We grant you a limited, non-exclusive, non-transferable license to use the content for personal, non-commercial educational purposes. Reproduction, distribution, or modification of content without permission is prohibited.
                </p>
                <h2 className="text-2xl font-semibold mt-6 mb-4">3. User-Generated Content</h2>
                <p className="mb-4">
                    If you submit content (e.g., quiz answers or feedback), you grant QuizPilot a perpetual, irrevocable license to use, modify, and display it. You warrant that your content does not infringe on third-party rights.
                </p>
                <h2 className="text-2xl font-semibold mt-6 mb-4">4. Prohibited Actions</h2>
                <p className="mb-4">
                    You may not reverse engineer, decompile, or attempt to extract the source code of QuizPilot. Unauthorized use of our intellectual property may result in legal action and account termination.
                </p>
                <h2 className="text-2xl font-semibold mt-6 mb-4">5. Reporting Infringements</h2>
                <p className="mb-4">
                    If you believe content on QuizPilot infringes your intellectual property rights, please contact us at legal@quizpilot.com with details of the alleged infringement. We will investigate and take appropriate action.
                </p>
                <p className="mt-6 text-sm">Last updated: September 07, 2025</p>
            </div>
        </div>
    )
}
