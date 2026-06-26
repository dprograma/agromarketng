import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, User, ArrowRight } from "lucide-react";
import Link from "next/link";
import { blogPosts } from "@/lib/blog-posts";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AgroMarket NG Blog | Nigerian Agriculture Tips, Market Trends & Farming Guides",
  description:
    "Expert guides on Nigerian farming, crop management, agricultural financing, and market pricing. Practical advice for farmers and agribusiness owners across Nigeria.",
  alternates: { canonical: "https://www.agromarketng.com/blog" },
  openGraph: {
    title: "AgroMarket NG Blog",
    description:
      "Expert guides on Nigerian farming, crop management, agricultural financing, and market pricing.",
    url: "https://www.agromarketng.com/blog",
    type: "website",
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  Technology: "bg-blue-100 text-blue-800",
  "Farming Tips": "bg-green-100 text-green-800",
  Business: "bg-purple-100 text-purple-800",
  "Sustainable Farming": "bg-teal-100 text-teal-800",
  "Crop Management": "bg-yellow-100 text-yellow-800",
  Finance: "bg-orange-100 text-orange-800",
};

const categories = [
  "All Posts",
  "Farming Tips",
  "Technology",
  "Business",
  "Sustainable Farming",
  "Crop Management",
  "Finance",
  "Market Trends",
];

export default function Blog() {
  const [featuredPost, ...restPosts] = blogPosts;

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
          <Link
            href={`/blog/${featuredPost.slug}`}
            className="block bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="text-6xl mb-4">📱</div>
                  <p className="text-gray-600 font-semibold">Featured Article</p>
                </div>
              </div>

              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 w-fit ${
                    CATEGORY_COLORS[featuredPost.category] ?? "bg-gray-100 text-gray-800"
                  }`}
                >
                  {featuredPost.category}
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-4">{featuredPost.title}</h2>

                <p className="text-gray-600 mb-6 leading-relaxed">{featuredPost.excerpt}</p>

                <div className="flex items-center text-sm text-gray-500 mb-6">
                  <User className="w-4 h-4 mr-2" />
                  <span className="mr-4">{featuredPost.author}</span>
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{featuredPost.date}</span>
                </div>

                <span className="inline-flex items-center text-green-700 font-semibold hover:text-green-900 transition-colors w-fit">
                  Read Full Article
                  <ArrowRight className="w-4 h-4 ml-2" />
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Categories */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((category, index) => (
              <span
                key={index}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  index === 0
                    ? "bg-green-900 text-white"
                    : "bg-white text-gray-700 border border-gray-200"
                }`}
              >
                {category}
              </span>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {restPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div className="bg-gradient-to-br from-green-100 to-green-50 h-48 flex items-center justify-center">
                  <div className="text-5xl">📝</div>
                </div>

                <div className="p-6">
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
                      CATEGORY_COLORS[post.category] ?? "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {post.category}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-700 transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-gray-600 mb-4 text-sm line-clamp-3">{post.excerpt}</p>

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
              No spam, unsubscribe anytime. Read our{" "}
              <Link href="/privacy" className="underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
