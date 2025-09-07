import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default function PrivacyPolicy() {
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
                <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
                <p className="mb-4">
                    At Estrella, we respect your privacy and are committed to protecting your personal
                    information. This Privacy Policy explains how we collect, use, and safeguard your data.
                </p>

                <h2 className="text-2xl font-semibold mt-6 mb-3">1. Information We Collect</h2>
                <p className="mb-4">
                    We may collect personal details such as your name, email, shipping address, payment
                    information, and browsing behavior to provide and improve our services.
                </p>

                <h2 className="text-2xl font-semibold mt-6 mb-3">2. Use of Information</h2>
                <p className="mb-4">
                    We use your data to process orders, enhance user experience, send promotional offers, and
                    maintain security. We do not sell your personal information to third parties.
                </p>

                <h2 className="text-2xl font-semibold mt-6 mb-3">3. Data Protection</h2>
                <p className="mb-4">
                    We employ strong security measures including encryption and secure servers. However, no
                    method of transmission over the Internet is 100% secure, and we cannot guarantee absolute
                    protection.
                </p>

                <h2 className="text-2xl font-semibold mt-6 mb-3">4. Your Rights</h2>
                <p className="mb-4">
                    You may request access, correction, or deletion of your personal data at any time. Please
                    contact our support team for assistance.
                </p>
            </div>



        </div>
    )
}
