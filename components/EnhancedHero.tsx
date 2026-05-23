"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { Star, Check, Sparkles } from "lucide-react";
import heroImg from "../public/assets/img/agromarket-hero1.png";

export default function EnhancedHero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative bg-green-900 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src={heroImg}
          alt="Agro-market hero background"
          fill
          priority
          className="object-cover object-left-center opacity-70"
          style={{ objectPosition: 'left center' }}
        />
        <div className="absolute inset-0 bg-green-900/70"></div>
      </div>

      {/* Main Content */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-5xl py-32 sm:py-48 lg:py-56 text-center">
          <motion.div
            className="mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Free Ad Posting Badge */}
            <motion.div
              className="mb-6 flex flex-wrap justify-center gap-3"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/20 backdrop-blur-sm px-4 py-1.5 text-sm font-semibold text-yellow-300 ring-1 ring-yellow-400/40">
                <Sparkles className="h-4 w-4" />
                100% Free Ad Posting
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 text-sm text-white ring-1 ring-white/20">
                <Star className="h-3.5 w-3.5 text-yellow-400" />
                Trusted by Nigerian Farmers
              </div>
            </motion.div>

            {/* Hero Heading */}
            <motion.h1
              className="text-balance text-5xl font-bold tracking-tight text-white sm:text-7xl mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.8 }}
            >
              Connecting Farmers <br className="hidden sm:block" />
              <span className="text-yellow-400">to Markets</span>
            </motion.h1>

            <motion.p
              className="mt-6 text-lg leading-8 text-gray-200 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible ? 1 : 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Post your farm products for free, trade directly with local farmers and buyers, and grow your agricultural business. No fees, no limits.
            </motion.p>

            {/* Hero Buttons */}
            <motion.div
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Link
                href="/products"
                className="rounded-md bg-yellow-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg hover:bg-yellow-400 transition-colors duration-300 flex items-center"
              >
                Explore Products
                <ChevronRightIcon className="ml-2 h-4 w-4" />
              </Link>

              <Link
                href="/dashboard/new-ad"
                className="rounded-md bg-white/10 backdrop-blur-sm px-6 py-3.5 text-base font-semibold text-white shadow-lg ring-1 ring-white/20 hover:bg-white/20 transition-colors duration-300 flex items-center"
              >
                Post Your Ad — Free
                <ChevronRightIcon className="ml-2 h-4 w-4" />
              </Link>

              <Link
                href="/about"
                className="text-base font-semibold leading-6 text-white flex items-center group"
              >
                Learn more
                <span className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible ? 1 : 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              {['No hidden fees', 'Unlimited listings', 'Direct farmer contact'].map((item) => (
                <div key={item} className="flex items-center text-sm text-gray-300">
                  <Check className="h-4 w-4 text-yellow-400 mr-1.5 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto">
          <path
            fill="#f9fafb"
            fillOpacity="1"
            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
          ></path>
        </svg>
      </div>
    </div>
  );
}
