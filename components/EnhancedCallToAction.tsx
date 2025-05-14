"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

export default function EnhancedCallToAction() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById('cta');
      if (element) {
        const position = element.getBoundingClientRect();
        if (position.top < window.innerHeight - 100) {
          setIsVisible(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on initial load

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!email.trim()) {
      setFormError("Email is required");
      return;
    }

    if (!acceptedTerms) {
      setFormError("You must accept the privacy policy");
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Thank you for subscribing!");
        setEmail("");
        setName("");
        setAcceptedTerms(false);
      } else {
        toast.error(data.error || "Failed to subscribe. Please try again.");
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="cta" className="relative py-20 overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-900 to-green-700">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-yellow-400"></div>
          <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-green-400"></div>
          <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-green-300"></div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Main CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Join the Agro Revolution
            </h2>
            <p className="text-xl text-gray-200 mb-8 max-w-lg">
              Sign up to access fresh produce, connect with farmers, and be part of a sustainable marketplace. Start your journey today!
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-yellow-500 text-white font-semibold shadow-lg hover:bg-yellow-400 transition-colors duration-300"
              >
                Sign Up Now
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>

              <Link
                href="/products"
                className="inline-flex items-center justify-center px-6 py-3 rounded-md border-2 border-white text-white font-semibold hover:bg-white hover:text-green-800 transition-colors duration-300"
              >
                Explore Marketplace
              </Link>
            </div>
          </motion.div>

          {/* Right Column - Newsletter Signup */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white rounded-xl shadow-xl p-8"
          >
            <h3 className="text-2xl font-bold text-green-900 mb-4">Stay Updated</h3>
            <p className="text-gray-600 mb-6">
              Subscribe to our newsletter for the latest updates on products, farming tips, and exclusive offers.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {formError}
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="flex items-start">
                <input
                  id="privacy"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1"
                />
                <label htmlFor="privacy" className="ml-2 block text-sm text-gray-600">
                  I agree to receive updates and accept the <Link href="/privacy-policy" className="text-green-600 hover:underline">Privacy Policy</Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 text-white font-medium py-2 px-4 rounded-md hover:bg-green-700 transition-colors duration-300 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Subscribing...
                  </>
                ) : (
                  "Subscribe"
                )}
              </button>
            </form>

            <p className="text-xs text-gray-500 mt-4">
              We respect your privacy and will never share your information with third parties.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
