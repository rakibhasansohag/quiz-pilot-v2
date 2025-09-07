import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default function CookiePolicy() {
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
                <h1 className="text-3xl font-bold mb-6">Cookie Policy</h1>
                <p className="mb-4">
                    Estrella uses cookies to improve user experience, analyze site traffic, and personalize
                    content. This policy explains how and why we use cookies.
                </p>

                <h2 className="text-2xl font-semibold mt-6 mb-3">1. What Are Cookies?</h2>
                <p className="mb-4">
                    Cookies are small files stored on your device that help websites recognize your preferences
                    and activity.
                </p>

                <h2 className="text-2xl font-semibold mt-6 mb-3">2. Types of Cookies We Use</h2>
                <p className="mb-4">
                    - **Essential Cookies**: Necessary for core functionality. <br />
                    - **Analytics Cookies**: Help us understand user interactions. <br />
                    - **Advertising Cookies**: Provide personalized ads. <br />
                    - **Preference Cookies**: Store your choices and settings.
                </p>

                <h2 className="text-2xl font-semibold mt-6 mb-3">3. Managing Cookies</h2>
                <p className="mb-4">
                    You can adjust your browser settings to block or delete cookies. However, disabling cookies
                    may limit functionality of our website.
                </p>

                <h2 className="text-2xl font-semibold mt-6 mb-3">4. Updates</h2>
                <p className="mb-4">
                    We may update this Cookie Policy from time to time. Continued use of our services implies
                    acceptance of any changes.
                </p>
            </div>

        </div>
    )
}
