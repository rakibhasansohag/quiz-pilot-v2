import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default function RefundPolicy() {
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
                <h1 className="text-3xl font-bold mb-6">Returns & Refund Policy</h1>
                <p className="mb-4">
                    At Estrella, customer satisfaction is our priority. If you are not fully satisfied with
                    your purchase, our Returns & Refund Policy will guide you through the process.
                </p>

                <h2 className="text-2xl font-semibold mt-6 mb-3">1. Eligibility for Returns</h2>
                <p className="mb-4">
                    Products may be returned within 14 days of delivery if they are unused, undamaged, and in
                    their original packaging. Proof of purchase is required.
                </p>

                <h2 className="text-2xl font-semibold mt-6 mb-3">2. Non-Returnable Items</h2>
                <p className="mb-4">
                    Some items such as perishable goods, personalized products, and digital downloads are not
                    eligible for return or refund.
                </p>

                <h2 className="text-2xl font-semibold mt-6 mb-3">3. Refunds</h2>
                <p className="mb-4">
                    Refunds will be processed within 7–10 business days after inspection. Refunds will be
                    credited to your original payment method.
                </p>

                <h2 className="text-2xl font-semibold mt-6 mb-3">4. Exchanges</h2>
                <p className="mb-4">
                    If you receive a defective or wrong product, we will replace it free of charge. Please
                    contact our support team immediately.
                </p>
            </div>


        </div>
    )
}
