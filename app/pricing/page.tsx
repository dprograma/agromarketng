"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, X } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "₦0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        { text: "Up to 10 active ads", included: true },
        { text: "Basic search and filters", included: true },
        { text: "Direct messaging", included: true },
        { text: "Email notifications", included: true },
        { text: "Standard listing visibility", included: true },
        { text: "Community forum access", included: true },
        { text: "Ad boosting", included: false },
        { text: "Priority support", included: false },
        { text: "Featured seller badge", included: false },
        { text: "Analytics dashboard", included: false }
      ],
      buttonText: "Get Started Free",
      buttonStyle: "border-2 border-green-900 text-green-900 hover:bg-green-50",
      popular: false
    },
    {
      name: "Premium",
      price: "₦5,000",
      period: "per month",
      description: "For growing agricultural businesses",
      features: [
        { text: "Unlimited ad postings", included: true },
        { text: "Advanced search and filters", included: true },
        { text: "Direct messaging", included: true },
        { text: "Email & SMS notifications", included: true },
        { text: "Enhanced listing visibility", included: true },
        { text: "Community forum access", included: true },
        { text: "10 ad boost credits/month", included: true },
        { text: "Priority customer support", included: true },
        { text: "Featured seller badge", included: true },
        { text: "Analytics dashboard", included: true }
      ],
      buttonText: "Start Premium Trial",
      buttonStyle: "bg-green-900 text-white hover:bg-green-800",
      popular: true
    },
    {
      name: "Business",
      price: "₦15,000",
      period: "per month",
      description: "For established agricultural enterprises",
      features: [
        { text: "Unlimited ad postings", included: true },
        { text: "Advanced search and filters", included: true },
        { text: "Direct messaging", included: true },
        { text: "Email & SMS notifications", included: true },
        { text: "Premium listing visibility", included: true },
        { text: "Community forum access", included: true },
        { text: "Unlimited ad boosting", included: true },
        { text: "Dedicated account manager", included: true },
        { text: "Verified business badge", included: true },
        { text: "Advanced analytics & insights", included: true },
        { text: "API access", included: true },
        { text: "Custom branding", included: true }
      ],
      buttonText: "Contact Sales",
      buttonStyle: "border-2 border-green-900 text-green-900 hover:bg-green-50",
      popular: false
    }
  ];

  const adBoostPricing = [
    {
      type: "Homepage Feature",
      duration: "7 days",
      price: "₦1,000",
      features: ["Featured on homepage", "Priority in search results", "Highlighted badge"]
    },
    {
      type: "Top of Category",
      duration: "7 days",
      price: "₦1,000",
      features: ["Top position in category", "Category highlight", "Increased visibility"]
    },
    {
      type: "Highlighted Listing",
      duration: "7 days",
      price: "₦1,000",
      features: ["Visual highlight in listings", "Search result priority", "Attention-grabbing border"]
    }
  ];

  const faqs = [
    {
      question: "Can I change my plan later?",
      answer: "Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll be charged a prorated amount for the remainder of the billing period."
    },
    {
      question: "What happens when my free ad limit is reached?",
      answer: "Once you reach 10 active ads on the free plan, you'll need to either deactivate an existing ad or upgrade to Premium/Business to post more ads."
    },
    {
      question: "How does ad boosting work?",
      answer: "Ad boosting increases your listing's visibility by placing it at the top of search results and featured sections. Each boost lasts for the specified duration, typically 7 or 14 days."
    },
    {
      question: "Is there a contract or can I cancel anytime?",
      answer: "No contracts required! All our plans are month-to-month and you can cancel at any time. Your access will continue until the end of your current billing period."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major Nigerian payment methods including bank transfers, debit cards, and mobile money through our secure payment partners Paystack and Flutterwave."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 14-day money-back guarantee for Premium and Business plans. If you're not satisfied within the first 14 days, contact us for a full refund."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-900 to-green-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold mb-6">Simple, Transparent Pricing</h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Choose the plan that fits your agricultural business needs. No hidden fees, cancel anytime.
            </p>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-2xl shadow-sm overflow-hidden ${
                  plan.popular ? 'ring-4 ring-green-500 shadow-xl' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                    MOST POPULAR
                  </div>
                )}

                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>

                  <div className="mb-6">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-2">/{plan.period}</span>
                  </div>

                  <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors mb-8 ${plan.buttonStyle}`}>
                    {plan.buttonText}
                  </button>

                  <ul className="space-y-4">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mr-3 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ad Boost Pricing */}
        <div className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Ad Boost Options</h2>
              <p className="text-xl text-gray-600">
                Give your listings extra visibility with our ad boosting options
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {adBoostPricing.map((boost, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200 hover:border-green-500 transition-colors">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{boost.type}</h3>
                  <div className="text-3xl font-bold text-green-900 mb-4">{boost.price}</div>
                  <p className="text-gray-600 mb-4">Duration: {boost.duration}</p>
                  <ul className="space-y-2">
                    {boost.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start text-sm">
                        <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <p className="text-center text-gray-600 mt-8">
              Premium and Business plan subscribers receive boost credits monthly!
            </p>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-gray-50 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-green-900 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-xl text-green-100 mb-8">
              Our team is here to help you choose the right plan
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/support"
                className="bg-white text-green-900 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
              >
                Contact Support
              </a>
              <a
                href="/signup"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors"
              >
                Start Free Trial
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
