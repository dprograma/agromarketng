"use client";

import { useEffect, useState } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSearchParams } from 'next/navigation';
import Search from '@/components/Search';
import Link from 'next/link';
import { Ad } from '@/types';
import ProductCard from '@/components/ProductCard';
import { Loader2 } from 'lucide-react';
import { categories } from '@/constants';

export default function SearchResults() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?${searchParams.toString()}`);
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow">
        <Search />

         {/* Initial State - No Search Yet */}
         {!searchParams.toString() && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Recommended for You
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Show some featured products here */}
                {results.slice(0, 4).map((ad) => (
                  <ProductCard key={ad.id} product={ad} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          ) : results.length > 0 ? (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {results.length} Results Found
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((ad) => (
                  <ProductCard key={ad.id} product={ad} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600">
                No results found. Try adjusting your search criteria.
              </p>
            </div>
          )}
        </div> */}

        {searchParams.toString() && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-green-600 mb-4" />
                <p className="text-gray-600">Searching for products...</p>
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {results.length} Results Found
                  </h2>
                  <p className="text-sm text-gray-600">
                    Showing results for "{searchParams.get('q')}"
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {results.map((ad) => (
                    <ProductCard key={ad.id} product={ad} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <div className="mb-4">
                  <img 
                    src="/no-results.svg" 
                    alt="No results" 
                    className="w-40 h-40 mx-auto opacity-75"
                  />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Results Found
                </h3>
                <p className="text-gray-600 mb-6">
                  We couldn't find any products matching your search.
                  Try adjusting your filters or search terms.
                </p>
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">
                    Popular Categories
                  </h4>
                  <div className="flex flex-wrap justify-center gap-2">
                    {categories.slice(0, 5).map((category) => (
                      <Link
                        key={category.slug}
                        href={`/search?category=${category.slug}`}
                        className="px-4 py-2 bg-gray-50 text-gray-700 rounded-full text-sm hover:bg-gray-100"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}