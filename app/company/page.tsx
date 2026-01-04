"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Target, Eye, Heart, Users, Award, TrendingUp, Shield } from "lucide-react";

export default function Company() {
  const values = [
    {
      icon: <Heart className="w-10 h-10 text-green-600" />,
      title: "Farmer-First Approach",
      description: "Every decision we make prioritizes the needs and success of farmers and agricultural businesses."
    },
    {
      icon: <Shield className="w-10 h-10 text-green-600" />,
      title: "Trust & Transparency",
      description: "We build trust through transparent practices, secure transactions, and honest communication."
    },
    {
      icon: <Users className="w-10 h-10 text-green-600" />,
      title: "Community Empowerment",
      description: "We empower agricultural communities by providing tools, knowledge, and connections to thrive."
    },
    {
      icon: <Award className="w-10 h-10 text-green-600" />,
      title: "Excellence & Innovation",
      description: "We continuously innovate and strive for excellence in everything we do."
    }
  ];

  const stats = [
    { number: "10,000+", label: "Active Users" },
    { number: "50,000+", label: "Products Listed" },
    { number: "₦100M+", label: "Transaction Value" },
    { number: "36", label: "States Covered" }
  ];

  const team = [
    {
      name: "Leadership Team",
      description: "Experienced professionals with backgrounds in agriculture, technology, and business development."
    },
    {
      name: "Product Team",
      description: "Designers and engineers dedicated to creating the best user experience for agricultural trade."
    },
    {
      name: "Support Team",
      description: "Customer success specialists available to help you succeed on our platform."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-900 to-green-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold mb-6">Empowering Nigeria's Agricultural Future</h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              AgroMarket is Nigeria's leading agricultural marketplace, connecting farmers, suppliers, and buyers
              to create a thriving ecosystem for agricultural trade.
            </p>
          </div>
        </div>

        {/* Story Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-white rounded-xl shadow-sm p-8 space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>

            <p className="text-gray-700 leading-relaxed">
              AgroMarket was born from a simple observation: Nigerian farmers and agricultural businesses
              needed a better way to connect, trade, and grow. Traditional marketplaces were limited by
              geography, information gaps, and inefficient processes.
            </p>

            <p className="text-gray-700 leading-relaxed">
              We set out to build a platform that would break down these barriers, leveraging technology
              to create opportunities for agricultural businesses of all sizes. From small-scale farmers
              in rural communities to large agricultural enterprises, AgroMarket provides the tools and
              connections needed to succeed in today's marketplace.
            </p>

            <p className="text-gray-700 leading-relaxed">
              Today, AgroMarket serves thousands of users across Nigeria, facilitating millions of naira
              in agricultural trade every month. But we're just getting started. Our vision is to become
              the premier agricultural marketplace in West Africa, empowering millions of farmers and
              transforming how agricultural trade happens across the continent.
            </p>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="bg-green-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <div className="flex items-center mb-4">
                  <Target className="w-12 h-12 text-green-300 mr-4" />
                  <h2 className="text-3xl font-bold">Our Mission</h2>
                </div>
                <p className="text-green-100 text-lg leading-relaxed">
                  To empower agricultural communities across Nigeria by providing a secure, efficient,
                  and accessible marketplace that connects farmers, suppliers, and buyers, fostering
                  sustainable growth and prosperity in the agricultural sector.
                </p>
              </div>

              <div>
                <div className="flex items-center mb-4">
                  <Eye className="w-12 h-12 text-green-300 mr-4" />
                  <h2 className="text-3xl font-bold">Our Vision</h2>
                </div>
                <p className="text-green-100 text-lg leading-relaxed">
                  To become West Africa's leading agricultural marketplace, transforming how agricultural
                  trade happens and creating lasting economic opportunities for millions of farmers and
                  agricultural businesses across the continent.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 text-center">
                <div className="flex justify-center mb-4">{value.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Impact</h2>
              <p className="text-xl text-gray-600">
                Growing together with Nigeria's agricultural community
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-green-900 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 text-lg">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Team</h2>
              <p className="text-xl text-gray-600">
                Passionate people building the future of agricultural trade
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {team.map((dept, index) => (
                <div key={index} className="bg-white rounded-xl p-8 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{dept.name}</h3>
                  <p className="text-gray-600">{dept.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Join Us */}
        <div className="bg-green-900 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <TrendingUp className="w-16 h-16 text-green-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Join Our Growing Community</h2>
            <p className="text-xl text-green-100 mb-8">
              Be part of the agricultural revolution. Whether you're a farmer, supplier, or buyer,
              AgroMarket has a place for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/signup"
                className="bg-white text-green-900 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
              >
                Get Started Today
              </a>
              <a
                href="/contact"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Get in Touch</h2>
              <p className="text-gray-600">We'd love to hear from you</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                <p className="text-gray-600">info@agromarketng.com</p>
                <p className="text-gray-600">support@agromarketng.com</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
                <p className="text-gray-600">+234 (0) 123 456 7890</p>
                <p className="text-gray-600">Mon-Fri, 8AM-6PM WAT</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Address</h3>
                <p className="text-gray-600">Victoria Island</p>
                <p className="text-gray-600">Lagos State, Nigeria</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
