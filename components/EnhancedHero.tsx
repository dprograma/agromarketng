"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
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
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/80 to-green-800/60"></div>
      </div>

      {/* Main Content */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-6xl py-32 sm:py-48 lg:py-56">
          <motion.div
            className="max-w-2xl"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              className="hidden sm:mb-8 sm:flex sm:justify-start"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-white ring-1 ring-white/50 hover:ring-white/70">
                Join our farmers' community. <Link href="/signup" className="font-semibold text-yellow-400 ml-1">Sign up now<span className="ml-1" aria-hidden="true"><ChevronRightIcon className="h-4 w-4 inline" /></span></Link>
              </div>
            </motion.div>

            {/* Hero Heading */}
            <motion.h1
              className="text-balance text-4xl font-bold tracking-tight text-white sm:text-6xl mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.8 }}
            >
              Connecting Farmers <br className="hidden sm:block" />
              <span className="text-yellow-400">to Markets</span>
            </motion.h1>

            <motion.p
              className="mt-6 text-lg leading-8 text-gray-300 max-w-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible ? 1 : 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Discover fresh produce, trade directly with local farmers, and promote sustainable agriculture. Join the largest online agro-market today.
            </motion.p>

            {/* Hero Buttons */}
            <motion.div
              className="mt-10 flex items-center gap-x-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Link
                href="/products"
                className="rounded-md bg-yellow-500 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-yellow-400 transition-colors duration-300 flex items-center"
              >
                Explore Products
                <ChevronRightIcon className="ml-2 h-4 w-4" />
              </Link>

              <Link
                href="/about"
                className="text-sm font-semibold leading-6 text-white flex items-center group"
              >
                Learn more
                <span className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
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
