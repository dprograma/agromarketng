"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingCartIcon, UsersIcon, TruckIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const steps = [
  {
    id: 1,
    title: "Browse Products",
    description: "Explore a wide variety of fresh produce directly from local farmers.",
    icon: ShoppingCartIcon,
    color: "bg-green-50 text-green-600",
  },
  {
    id: 2,
    title: "Connect with Farmers",
    description: "Chat with farmers, learn about their produce, and support local agriculture.",
    icon: UsersIcon,
    color: "bg-yellow-50 text-yellow-600",
  },
  {
    id: 3,
    title: "Place Your Order",
    description: "Select your items, add them to your cart, and proceed to checkout.",
    icon: TruckIcon,
    color: "bg-green-50 text-green-600",
  },
  {
    id: 4,
    title: "Get it Delivered",
    description: "Enjoy fresh produce delivered straight to your door with our reliable service.",
    icon: CheckCircleIcon,
    color: "bg-yellow-50 text-yellow-600",
  },
];

export default function EnhancedHowItWorks() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [backgroundCircles, setBackgroundCircles] = useState<Array<{
    width: string;
    height: string;
    top: string;
    left: string;
    opacity: number;
  }>>([]);

  // Generate background circles only once on client-side
  useEffect(() => {
    const circles = [...Array(20)].map(() => ({
      width: `${Math.random() * 300 + 50}px`,
      height: `${Math.random() * 300 + 50}px`,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      opacity: Math.random() * 0.5,
    }));
    setBackgroundCircles(circles);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById('how-it-works');
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

  // Auto-advance steps
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev % 4) + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <section id="how-it-works" className="bg-gray-100 py-20 px-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full">
          {backgroundCircles.map((circle, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-green-900"
              style={{
                width: circle.width,
                height: circle.height,
                top: circle.top,
                left: circle.left,
                opacity: circle.opacity,
              }}
            />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-green-900 mb-4">How It Works</h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Discover a seamless way to connect with local farmers and get fresh produce delivered to your doorstep.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              className={`flex flex-col items-center text-center p-8 rounded-xl shadow-sm transition-all duration-300 ${activeStep === step.id
                  ? "bg-white scale-105 shadow-md"
                  : "bg-white/80"
                }`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              onClick={() => setActiveStep(step.id)}
            >
              <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mb-4`}>
                <step.icon className="h-8 w-8" />
              </div>

              <div className="relative">
                <div className="absolute -top-10 -left-4 w-10 h-10 flex items-center justify-center bg-green-600 text-white rounded-full text-lg font-bold">
                  {step.id}
                </div>
                <h3 className="text-xl font-semibold text-green-900 mb-3">{step.title}</h3>
              </div>

              <p className="text-gray-600">
                {step.description}
              </p>

              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 left-[calc(25%_+_4rem)] transform -translate-y-1/2 w-[calc(25%_-_8rem)] h-0.5 bg-gray-200">
                  <div
                    className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-500"
                    style={{
                      width: activeStep > index + 1 ? "100%" : "0%",
                    }}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Mobile Progress Indicator */}
        <div className="flex justify-center mt-8 lg:hidden">
          {steps.map((step) => (
            <button
              key={step.id}
              className={`w-3 h-3 mx-1 rounded-full transition-colors duration-300 ${activeStep === step.id ? "bg-green-600" : "bg-gray-300"
                }`}
              onClick={() => setActiveStep(step.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
