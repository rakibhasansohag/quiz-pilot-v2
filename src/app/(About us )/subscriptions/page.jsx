import Navbar from '@/components/Navbar'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default function SubscriptionsTerms() {
  return (
    <div>
         <Navbar></Navbar>
        <div className="max-w-5xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-6">Payment and Subscription Terms</h1>
      <p className="mb-4">
        This section outlines the terms governing payments and subscriptions for premium features on QuizPilot, our EdTech platform dedicated to programming education through quizzes.
      </p>
      <h2 className="text-2xl font-semibold mt-6 mb-4">1. Subscription Plans</h2>
      <p className="mb-4">
        QuizPilot offers various subscription tiers, including a free plan with limited access and premium plans with additional features like advanced quizzes and certifications. Details of these plans are available on our pricing page.
      </p>
      <h2 className="text-2xl font-semibold mt-6 mb-4">2. Payment Methods</h2>
      <p className="mb-4">
        We accept payments via credit/debit cards, PayPal, and other secure methods. All transactions are processed through trusted third-party payment gateways, and you agree to provide accurate payment information.
      </p>
      <h2 className="text-2xl font-semibold mt-6 mb-4">3. Billing and Renewal</h2>
      <p className="mb-4">
        Subscriptions are billed on a monthly or annual basis, depending on your chosen plan. Your subscription will automatically renew unless canceled. You can manage or cancel your subscription via your account settings.
      </p>
      <h2 className="text-2xl font-semibold mt-6 mb-4">4. Refunds</h2>
      <p className="mb-4">
        Refunds are available within 14 days of purchase for premium subscriptions, provided no significant usage has occurred. Refund requests must be submitted in writing to support@quizpilot.com with your order details.
      </p>
      <h2 className="text-2xl font-semibold mt-6 mb-4">5. Price Changes</h2>
      <p className="mb-4">
        We reserve the right to modify subscription prices with prior notice. Continued use of the service after a price change constitutes acceptance of the new rates.
      </p>
      <p className="mt-6 text-sm">Last updated: September 07, 2025</p>
    </div>
    </div>
  )
}
