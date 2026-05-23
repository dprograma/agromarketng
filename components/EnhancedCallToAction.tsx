"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { Gift, Users, Shield, MapPin } from "lucide-react";

const features = [
  {
    icon: Gift,
    title: "Free Forever",
    description: "Post unlimited ads at zero cost. No hidden fees, no premium tiers for basic listing.",
  },
  {
    icon: Users,
    title: "Direct Connection",
    description: "Connect directly with farmers and buyers. No middlemen, better prices for everyone.",
  },
  {
    icon: Shield,
    title: "Verified Sellers",
    description: "Trade with confidence. Our verification system ensures trustworthy transactions.",
  },
  {
    icon: MapPin,
    title: "Nationwide Reach",
    description: "Reach buyers and sellers across all 36 states of Nigeria and beyond.",
  },
];

export default function EnhancedCallToAction() {
  const [isVisible, setIsVisible] = useState(false);

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
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <section id="cta" className="relative py-20 overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-900 to-green-700">
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
            <p className="text-xl text-gray-200 mb-4 max-w-lg">
              Start listing your products today — completely free. Connect with thousands of farmers and buyers across Nigeria.
            </p>
            <p className="text-base text-yellow-300 font-medium mb-8">
              No credit card required. No limits on listings. Just sign up and start selling.
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

          {/* Right Column - Why Choose AgroMarket */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3 className="text-2xl font-bold text-white mb-6">Why Choose AgroMarket?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:bg-white/15 transition-colors duration-300"
                >
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center mb-3">
                    <feature.icon className="h-5 w-5 text-yellow-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-1">{feature.title}</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
