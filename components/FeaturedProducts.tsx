"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRightIcon, StarIcon } from "@heroicons/react/24/solid";
import { Loader2, Wheat, Tractor, Beef, Sprout, Wrench } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Ad } from "@/types";

// Define UI categories with icons
const uiCategories = [
  { name: "Farm Accessories", slug: "accessories", icon: Wheat },
  { name: "Farm Machinery", slug: "machinery", icon: Tractor },
  { name: "Tools", slug: "tools", icon: Wrench },
  { name: "Farm Animals", slug: "farm-animals", icon: Beef },
  { name: "Plants", slug: "plants", icon: Sprout },
  { name: "Poultry", slug: "poultry", icon: Sprout },
  { name: "Cereals & Grains", slug: "cereals", icon: Wheat },
];

// Define the type for products returned from the API
interface FeaturedProduct extends Partial<Ad> {
  rating?: number;
  reviews?: number;
}

export default function FeaturedProducts() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { data: products = [], isLoading } = useQuery<FeaturedProduct[]>({
    queryKey: ['featuredProducts', activeCategory],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (activeCategory !== "All") {
        queryParams.append('category', activeCategory);
      }
      const response = await fetch(`/api/featured-products?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      return data.products;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById('featured-products');
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

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section id="featured-products" className="bg-gray-50 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-green-900 mb-4">Featured Products</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore our selection of high-quality agricultural products sourced directly from local farmers across Nigeria.
          </p>
        </motion.div>

        {/* Category Pills */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <button
            onClick={() => setActiveCategory("All")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${activeCategory === "All"
              ? "bg-green-600 text-white"
              : "bg-white text-gray-800 hover:bg-green-50"
              }`}
          >
            All
          </button>

          {uiCategories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.name}
                onClick={() => setActiveCategory(category.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 flex items-center gap-2 ${activeCategory === category.name
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-800 hover:bg-green-50"
                  }`}
              >
                <Icon className="h-4 w-4" />
                {category.name}
              </button>
            );
          })}
        </motion.div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
                initial={{ opacity: 0, y: 30 }}
                animate={mounted ? { opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.png'}
                    alt={product.title || ''}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                    loading={index < 4 ? "eager" : "lazy"}
                    quality={75}
                  />
                  <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                    {product.category}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{product.title}</h3>
                    <span className="font-bold text-green-700">{formatCurrency(Number(product.price))}</span>
                  </div>

                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      <StarIcon className="h-4 w-4 text-yellow-500" />
                      <span className="ml-1 text-sm text-gray-700">{product.rating || 4.5}</span>
                    </div>
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="text-xs text-gray-500">{product.reviews || 0} reviews</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {product.location}
                    </span>

                    <Link
                      href={`/products/${product.id}`}
                      className="text-green-600 text-sm font-medium hover:text-green-700 transition-colors flex items-center"
                    >
                      View
                      <ChevronRightIcon className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* View All Button */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={mounted ? { opacity: isVisible ? 1 : 0 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Link
            href="/products"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 transition-colors duration-300"
          >
            View All Products
            <ChevronRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}