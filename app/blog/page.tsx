"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, User, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Blog() {
  // Sample blog posts - In production, these would come from a CMS or database
  const featuredPost = {
    title: "The Future of Smart Farming in Nigeria: Technology Meets Agriculture",
    excerpt: "Discover how Nigerian farmers are leveraging IoT sensors, drones, and data analytics to increase yields and reduce costs. Learn about the latest innovations transforming agriculture across the country.",
    author: "AgroMarket Team",
    date: "January 3, 2026",
    category: "Technology",
    image: "/images/blog/smart-farming.jpg",
    slug: "future-smart-farming-nigeria"
  };

  const blogPosts = [
    {
      title: "10 Essential Tips for Successful Crop Rotation",
      excerpt: "Maximize your harvest and maintain soil health with these proven crop rotation strategies used by successful Nigerian farmers.",
      author: "Dr. Chika Okafor",
      date: "December 28, 2025",
      category: "Farming Tips",
      slug: "crop-rotation-tips"
    },
    {
      title: "How to Price Your Agricultural Products Competitively",
      excerpt: "Learn the art and science of pricing your produce for maximum profit while staying competitive in the marketplace.",
      author: "Emmanuel Adeyemi",
      date: "December 20, 2025",
      category: "Business",
      slug: "pricing-agricultural-products"
    },
    {
      title: "Organic Farming: Is It Right for Your Business?",
      excerpt: "Explore the benefits, challenges, and profitability of transitioning to organic farming methods in Nigeria's agricultural landscape.",
      author: "Fatima Hassan",
      date: "December 15, 2025",
      category: "Sustainable Farming",
      slug: "organic-farming-guide"
    },
    {
      title: "Protecting Your Crops from Common Pests and Diseases",
      excerpt: "Identify, prevent, and treat the most common crop threats with our comprehensive pest and disease management guide.",
      author: "Dr. Chika Okafor",
      date: "December 10, 2025",
      category: "Crop Management",
      slug: "crop-protection-guide"
    },
    {
      title: "Accessing Agricultural Loans: A Step-by-Step Guide",
      excerpt: "Navigate the process of securing funding for your farm with our complete guide to agricultural loans and grants in Nigeria.",
      author: "Emmanuel Adeyemi",
      date: "December 5, 2025",
      category: "Finance",
      slug: "agricultural-loans-guide"
    },
    {
      title: "Water Conservation Techniques for Nigerian Farms",
      excerpt: "Implement water-saving strategies that reduce costs and ensure sustainable farming even during dry seasons.",
      author: "Fatima Hassan",
      date: "November 28, 2025",
      category: "Sustainable Farming",
      slug: "water-conservation-techniques"
    }
  ];

  const categories = [
    "All Posts",
    "Farming Tips",
    "Technology",
    "Business",
    "Sustainable Farming",
    "Crop Management",
    "Finance",
    "Market Trends"
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-900 to-green-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold mb-6">AgroMarket Blog</h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Expert insights, practical tips, and the latest trends in Nigerian agriculture
            </p>
          </div>
        </div>

        {/* Featured Post */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="text-6xl mb-4">📱</div>
                  <p className="text-gray-600 font-semibold">Featured Article</p>
                </div>
              </div>

              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold mb-4 w-fit">
                  {featuredPost.category}
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {featuredPost.title}
                </h2>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {featuredPost.excerpt}
                </p>

                <div className="flex items-center text-sm text-gray-500 mb-6">
                  <User className="w-4 h-4 mr-2" />
                  <span className="mr-4">{featuredPost.author}</span>
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{featuredPost.date}</span>
                </div>

                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="inline-flex items-center text-green-700 font-semibold hover:text-green-900 transition-colors w-fit"
                >
                  Read Full Article
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  index === 0
                    ? 'bg-green-900 text-white'
                    : 'bg-white text-gray-700 hover:bg-green-50 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <Link
                key={index}
                href={`/blog/${post.slug}`}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div className="bg-gradient-to-br from-green-100 to-green-50 h-48 flex items-center justify-center">
                  <div className="text-5xl">📝</div>
                </div>

                <div className="p-6">
                  <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                    {post.category}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-700 transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center text-xs text-gray-500 pt-4 border-t border-gray-100">
                    <User className="w-3 h-3 mr-1" />
                    <span className="mr-3">{post.author}</span>
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{post.date}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-12">
            <button className="bg-green-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors">
              Load More Articles
            </button>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-green-900 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-xl text-green-100 mb-8">
              Get the latest agricultural insights and tips delivered to your inbox
            </p>

            <form className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="submit"
                  className="bg-white text-green-900 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
                >
                  Subscribe
                </button>
              </div>
            </form>

            <p className="text-sm text-green-200 mt-4">
              No spam, unsubscribe anytime. Read our <Link href="/privacy" className="underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
