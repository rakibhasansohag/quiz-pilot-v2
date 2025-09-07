import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default function PrivacyTerms() {
    return (
        <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                <Image
                    src="https://res.cloudinary.com/dlrzwaoga/image/upload/v1757071182/vnixltocrqshrhu3l22t.png"
                    alt="QuizPilot Logo"
                    width={48}
                    height={48}
                    className="object-contain"
                    priority
                />
            </Link>
            <div className="max-w-5xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold mb-6">Privacy and Data Usage Terms</h1>
                <p className="mb-4">
                    At QuizPilot, we are committed to protecting your privacy. This Privacy and Data Usage section outlines how we collect, use, and safeguard your personal information while using our EdTech platform.
                </p>
                <h2 className="text-2xl font-semibold mt-6 mb-4">1. Information Collection</h2>
                <p className="mb-4">
                    We collect data such as your name, email address, and progress on quizzes when you register or interact with our services. This data helps us personalize your learning experience and improve our platform.
                </p>
                <h2 className="text-2xl font-semibold mt-6 mb-4">2. Data Usage</h2>
                <p className="mb-4">
                    Your information may be used to provide customer support, send updates about QuizPilot, and analyze usage patterns to enhance our offerings. We do not sell your data to third parties without your consent.
                </p>
                <h2 className="text-2xl font-semibold mt-6 mb-4">3. Data Security</h2>
                <p className="mb-4">
                    We implement industry-standard security measures, including encryption and secure servers, to protect your data. However, no online platform is entirely immune to security breaches, and we cannot guarantee absolute security.
                </p>
                <h2 className="text-2xl font-semibold mt-6 mb-4">4. Third-Party Services</h2>
                <p className="mb-4">
                    QuizPilot uses third-party services like NextAuth for authentication. These services have their own privacy policies, and we encourage you to review them. We ensure that any data shared with third parties complies with these Terms.
                </p>
                <h2 className="text-2xl font-semibold mt-6 mb-4">5. Your Rights</h2>
                <p className="mb-4">
                    You have the right to access, correct, or delete your personal data. Contact us at support@quizpilot.com to exercise these rights. We will respond within 30 days of your request.
                </p>
                <p className="mt-6 text-sm">Last updated: September 07, 2025</p>
            </div>

        </div>


    )
}
