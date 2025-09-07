import Navbar from '@/components/Navbar';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react'

export default function TermsAndConditions() {
    return (
        <div>
           <Navbar></Navbar>
            <div className="max-w-5xl mx-auto px-6 py-12">

                <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
                <p className="mb-4">
                    Welcome to Estrella! By accessing and using our platform, you agree to comply with the
                    following Terms and Conditions. Please read them carefully before using our services.
                </p>

                <h2 className="text-2xl font-semibold mt-6 mb-3">1. Acceptance of Terms</h2>
                <p className="mb-4">
                    By using our website, mobile app, or services, you acknowledge that you have read,
                    understood, and agree to be bound by these Terms. If you do not agree, you may not access
                    or use our services.
                </p>

                <h2 className="text-2xl font-semibold mt-6 mb-3">2. Eligibility</h2>
                <p className="mb-4">
                    To use Estrella’s services, you must be at least 18 years old or have the consent of a
                    parent or guardian. You agree to provide accurate and complete registration details and keep
                    them up-to-date.
                </p>

                <h2 className="text-2xl font-semibold mt-6 mb-3">3. Use of Services</h2>
                <p className="mb-4">
                    You agree not to misuse our platform. This includes, but is not limited to: violating
                    applicable laws, infringing intellectual property rights, attempting unauthorized access to
                    systems, or distributing harmful content.
                </p>

                <h2 className="text-2xl font-semibold mt-6 mb-3">4. Termination</h2>
                <p className="mb-4">
                    We reserve the right to suspend or terminate your account if you violate these Terms,
                    engage in fraudulent activity, or misuse our services. All provisions regarding ownership,
                    disclaimers, and limitations of liability will survive termination.
                </p>
            </div>
        </div>
    );
}

