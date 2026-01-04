"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShoppingCart, TrendingUp, Shield, MessageCircle, Search, Bell, Star, Users } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <Search className="w-12 h-12 text-green-600" />,
      title: "Advanced Search & Filters",
      description: "Find exactly what you need with our powerful search engine. Filter by category, location, price range, and more to discover the perfect agricultural products."
    },
    {
      icon: <ShoppingCart className="w-12 h-12 text-green-600" />,
      title: "Classified Ads System",
      description: "Post and browse agricultural products easily. Our intuitive ad posting system lets you list farm equipment, livestock, produce, and more with detailed descriptions and multiple images."
    },
    {
      icon: <TrendingUp className="w-12 h-12 text-green-600" />,
      title: "Ad Boosting & Promotion",
      description: "Increase your visibility with our ad boosting feature. Get your listings to the top of search results and featured sections to reach more potential buyers."
    },
    {
      icon: <MessageCircle className="w-12 h-12 text-green-600" />,
      title: "Direct Messaging",
      description: "Communicate directly with buyers and sellers through our secure messaging system. Negotiate prices, arrange deliveries, and build business relationships."
    },
    {
      icon: <Shield className="w-12 h-12 text-green-600" />,
      title: "Secure Transactions",
      description: "Your safety is our priority. We implement robust security measures including account verification, fraud detection, and secure payment processing."
    },
    {
      icon: <Bell className="w-12 h-12 text-green-600" />,
      title: "Smart Notifications",
      description: "Stay updated with real-time notifications for messages, ad activity, and price changes. Customize your notification preferences to stay informed."
    },
    {
      icon: <Star className="w-12 h-12 text-green-600" />,
      title: "Rating & Reviews",
      description: "Build trust in the community with our rating system. Review your transactions and check seller ratings before making purchase decisions."
    },
    {
      icon: <Users className="w-12 h-12 text-green-600" />,
      title: "Community Support",
      description: "Join a thriving community of farmers, suppliers, and agricultural enthusiasts. Access expert advice, share knowledge, and grow together."
    }
  ];

  const subscriptionFeatures = [
    {
      title: "Free Tier",
      features: [
        "Post up to 10 active ads",
        "Basic search and filters",
        "Direct messaging",
        "Email notifications",
        "Standard listing visibility"
      ],
      highlighted: false
    },
    {
      title: "Premium Subscription",
      features: [
        "Unlimited ad postings",
        "Priority customer support",
        "Enhanced listing visibility",
        "Advanced analytics",
        "Featured seller badge",
        "Ad boosting credits",
        "Early access to new features"
      ],
      highlighted: true
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-900 to-green-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold mb-6">Powerful Features for Agricultural Trade</h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Everything you need to buy, sell, and thrive in the agricultural marketplace.
              Built by farmers, for farmers.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription Plans Section */}
        <div className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
              <p className="text-xl text-gray-600">
                Start free and upgrade when you're ready to grow
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {subscriptionFeatures.map((plan, index) => (
                <div
                  key={index}
                  className={`rounded-xl p-8 ${
                    plan.highlighted
                      ? 'bg-green-900 text-white ring-4 ring-green-500 shadow-xl'
                      : 'bg-gray-50'
                  }`}
                >
                  <h3 className={`text-2xl font-bold mb-6 ${
                    plan.highlighted ? 'text-white' : 'text-gray-900'
                  }`}>
                    {plan.title}
                  </h3>
                  <ul className="space-y-3">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start">
                        <svg
                          className={`w-6 h-6 mr-2 flex-shrink-0 ${
                            plan.highlighted ? 'text-green-300' : 'text-green-600'
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className={plan.highlighted ? 'text-green-50' : 'text-gray-700'}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Technical Features Section */}
        <div className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Built for Performance & Security</h2>
              <p className="text-xl text-gray-600">
                Enterprise-grade technology powering your agricultural marketplace
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Lightning Fast</h3>
                <p className="text-gray-600">
                  Optimized performance with intelligent caching, lazy loading, and CDN delivery for instant page loads.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Mobile Responsive</h3>
                <p className="text-gray-600">
                  Fully responsive design that works seamlessly on desktop, tablet, and mobile devices.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Protection</h3>
                <p className="text-gray-600">
                  Bank-level encryption, NDPR compliance, and regular security audits keep your data safe.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-green-900 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-green-100 mb-8">
              Join thousands of farmers and suppliers already using AgroMarket
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/signup"
                className="bg-white text-green-900 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
              >
                Sign Up Free
              </a>
              <a
                href="/products"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors"
              >
                Browse Products
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
