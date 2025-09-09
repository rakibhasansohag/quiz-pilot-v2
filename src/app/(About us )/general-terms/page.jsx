import Navbar from '@/components/Navbar'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default function GenerelTerms() {
    return (
        <div>
            <Navbar></Navbar>
            <div className="max-w-5xl  px-6 py-12">
                <h1 className="text-3xl font-bold mb-6">General Terms and Conditions</h1>
                <p className="mb-4">
                    Welcome to QuizPilot, an EdTech platform designed to empower learners with programming skills through interactive quizzes. These General Terms and Conditions ("Terms") govern your use of our website and services. By accessing or using QuizPilot, you agree to be bound by these Terms. If you do not agree, please refrain from using our platform.
                </p>
                <h2 className="text-2xl font-semibold mt-6 mb-4">1. Acceptance of Terms</h2>
                <p className="mb-4">
                    By registering an account or engaging with any content on QuizPilot, you acknowledge that you have read, understood, and agree to be bound by these Terms, along with our Privacy Policy. We reserve the right to update these Terms at any time, and continued use of the platform constitutes acceptance of the revised Terms.
                </p>
                <h2 className="text-2xl font-semibold mt-6 mb-4">2. Eligibility</h2>
                <p className="mb-4">
                    To use QuizPilot, you must be at least 13 years old. By using the platform, you represent that you meet this age requirement and have the legal capacity to enter into these Terms. Parental consent is required for users under 18.
                </p>
                <h2 className="text-2xl font-semibold mt-6 mb-4">3. Account Security</h2>
                <p className="mb-4">
                    You are responsible for maintaining the confidentiality of your account credentials, including your password. Any activities conducted under your account are your responsibility. Notify us immediately if you suspect unauthorized use of your account.
                </p>
                <h2 className="text-2xl font-semibold mt-6 mb-4">4. Service Usage</h2>
                <p className="mb-4">
                    QuizPilot provides educational content and quizzes for learning programming languages. You may not use the platform for any illegal or unauthorized purpose, including but not limited to hacking, distributing malware, or infringing on intellectual property rights.
                </p>
                <h2 className="text-2xl font-semibold mt-6 mb-4">5. Termination</h2>
                <p className="mb-4">
                    We reserve the right to suspend or terminate your account at our discretion if you violate these Terms. Upon termination, your access to QuizPilot services will cease, and any associated data may be deleted.
                </p>
                <p className="mt-6 text-sm">Last updated: September 07, 2025</p>
            </div>
        </div>
    )
}
