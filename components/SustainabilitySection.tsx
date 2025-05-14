"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { LeafIcon, DropletIcon, SunIcon, RecycleIcon } from "./Icons";

export default function SustainabilitySection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById('sustainability');
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

  return (
    <section id="sustainability" className="py-20 px-4 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -50 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-green-900 mb-6">Committed to Sustainability</h2>
            <p className="text-lg text-gray-700 mb-8">
              At AgroMarket, we believe in sustainable farming practices that protect our environment while supporting local communities. Our platform promotes eco-friendly agriculture and responsible consumption.
            </p>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <LeafIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-green-800">Organic Farming</h3>
                  <p className="text-gray-600">
                    We support farmers who use organic methods, avoiding harmful pesticides and fertilizers.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <DropletIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-green-800">Water Conservation</h3>
                  <p className="text-gray-600">
                    Our farmers implement water-saving techniques to minimize waste and protect this precious resource.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <SunIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-green-800">Renewable Energy</h3>
                  <p className="text-gray-600">
                    We encourage the use of solar and other renewable energy sources in farming operations.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <RecycleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-green-800">Waste Reduction</h3>
                  <p className="text-gray-600">
                    We work to minimize food waste through efficient distribution and eco-friendly packaging.
                  </p>
                </div>
              </div>
            </div>

            <motion.div
              className="mt-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Link
                href="/services"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors duration-300"
              >
                Learn More About Our Initiatives
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Column - Image */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative h-[500px] w-full rounded-xl overflow-hidden shadow-xl">
              <Image
                src="/assets/img/sustainability.jpg"
                alt="Sustainable farming practices"
                fill
                className="object-cover"
              />

              {/* Overlay with stats */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-900/90 to-transparent p-6">
                <div className="grid grid-cols-2 gap-4 text-white">
                  <div>
                    <p className="text-3xl font-bold">30%</p>
                    <p className="text-sm">Less Water Usage</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold">40%</p>
                    <p className="text-sm">Less Food Waste</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold">50%</p>
                    <p className="text-sm">Carbon Footprint Reduction</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold">1000+</p>
                    <p className="text-sm">Sustainable Farmers</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Certification Badges */}
            <div className="absolute -bottom-6 -right-6 bg-white rounded-lg shadow-lg p-4 flex space-x-4">
              <div className="w-12 h-12 relative">
                <Image
                  src="/assets/img/organic-badge.png"
                  alt="Organic Certification"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="w-12 h-12 relative">
                <Image
                  src="/assets/img/eco-badge.png"
                  alt="Eco-Friendly Certification"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="w-12 h-12 relative">
                <Image
                  src="/assets/img/fair-trade-badge.png"
                  alt="Fair Trade Certification"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
