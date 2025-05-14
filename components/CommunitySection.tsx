"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChatBubbleLeftRightIcon, UserGroupIcon, CalendarIcon } from "@heroicons/react/24/outline";

// Sample testimonials
const testimonials = [
  {
    id: 1,
    content: "AgroMarket has transformed how I sell my produce. I now reach customers across Nigeria without middlemen cutting into my profits.",
    author: "Adamu Ibrahim",
    role: "Tomato Farmer, Kano",
    avatar: "/assets/img/testimonials/farmer1.jpg"
  },
  {
    id: 2,
    content: "The quality of produce I get through AgroMarket is exceptional. I love knowing exactly where my food comes from and supporting local farmers.",
    author: "Chioma Okafor",
    role: "Restaurant Owner, Lagos",
    avatar: "/assets/img/testimonials/customer1.jpg"
  },
  {
    id: 3,
    content: "As a small-scale farmer, AgroMarket has given me access to markets I never thought possible. My income has increased by 40% in just six months!",
    author: "Emmanuel Osei",
    role: "Cassava Farmer, Ogun",
    avatar: "/assets/img/testimonials/farmer2.jpg"
  }
];

// Sample upcoming events
const events = [
  {
    id: 1,
    title: "Farmer's Market Day",
    date: "June 15, 2024",
    location: "Lagos State Agricultural Development Center",
    image: "/assets/img/events/farmers-market.jpg"
  },
  {
    id: 2,
    title: "Sustainable Farming Workshop",
    date: "July 8, 2024",
    location: "Virtual Event",
    image: "/assets/img/events/workshop.jpg"
  },
  {
    id: 3,
    title: "Agricultural Technology Expo",
    date: "August 22-24, 2024",
    location: "Abuja International Conference Center",
    image: "/assets/img/events/agri-tech.jpg"
  }
];

export default function CommunitySection() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById('community');
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

  // Auto-rotate testimonials
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <section id="community" className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-green-900 mb-4">Our Growing Community</h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Join thousands of farmers, buyers, and agricultural enthusiasts who are part of our thriving ecosystem.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Testimonials Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -30 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center mb-8">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-600 mr-3" />
              <h3 className="text-2xl font-semibold text-green-800">Testimonials</h3>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 relative">
              {/* Quote mark */}
              <div className="absolute top-6 left-6 text-6xl text-green-100 font-serif">"</div>

              {/* Testimonial content */}
              <div className="relative z-10">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={testimonial.id}
                    className={`transition-opacity duration-500 ${activeTestimonial === index ? "block opacity-100" : "hidden opacity-0"
                      }`}
                  >
                    <p className="text-gray-700 text-lg mb-6 italic">
                      {testimonial.content}
                    </p>

                    <div className="flex items-center">
                      <div className="relative w-12 h-12 mr-4">
                        <Image
                          src={testimonial.avatar}
                          alt={testimonial.author}
                          fill
                          className="rounded-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{testimonial.author}</p>
                        <p className="text-sm text-gray-500">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation dots */}
              <div className="flex justify-center mt-8 space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${activeTestimonial === index ? "bg-green-600" : "bg-gray-300"
                      }`}
                    aria-label={`View testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/testimonials"
                className="text-green-600 font-medium hover:text-green-700 transition-colors"
              >
                Read more success stories →
              </Link>
            </div>
          </motion.div>

          {/* Events Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center mb-8">
              <CalendarIcon className="h-6 w-6 text-green-600 mr-3" />
              <h3 className="text-2xl font-semibold text-green-800">Upcoming Events</h3>
            </div>

            <div className="space-y-6">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden flex"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                >
                  <div className="relative w-1/3 h-auto">
                    <Image
                      src={event.image}
                      alt={event.title}
                      width={150}
                      height={150}
                      className="object-cover h-full w-full"
                    />
                  </div>
                  <div className="p-4 flex-1">
                    <h4 className="font-semibold text-gray-900">{event.title}</h4>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {event.date}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{event.location}</p>
                    <Link
                      href={`/events/${event.id}`}
                      className="text-green-600 text-sm font-medium hover:text-green-700 transition-colors mt-2 inline-block"
                    >
                      Learn more →
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/signup"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors duration-300"
              >
                <UserGroupIcon className="h-5 w-5 mr-2" />
                Join Our Community
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
