"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Filter, ChevronDown, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getProductImageUrl } from "@/lib/imageUtils";
import { getMainCategories, getAllCategoriesWithSubcategories } from "@/lib/categoryUtils";
import toast from "react-hot-toast";

interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  location: string;
  images: string[];
  views: number;
  clicks: number;
  rating: number;
  reviews: number;
  description: string;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    id: string;
    image?: string;
  };
}

interface Subcategory {
  name: string;
  href: string;
  section: string;
}

interface CategoryWithSubcategories {
  category: string;
  subcategories: Subcategory[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[] | CategoryWithSubcategories[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  // Initialize categories from navigation structure
  useEffect(() => {
    // Set initial categories from navigation structure
    setCategories(getMainCategories());
  }, []);

  // Fetch products data
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Build query parameters
        const params = new URLSearchParams();
        if (activeCategory !== "All") params.append("category", activeCategory);
        if (activeSubcategory) params.append("subCategory", activeSubcategory);
        if (searchQuery) params.append("q", searchQuery);
        params.append("sort", sortBy);
        params.append("page", currentPage.toString());
        params.append("minPrice", priceRange[0].toString());
        params.append("maxPrice", priceRange[1].toString());
        if (selectedLocations.length > 0) {
          selectedLocations.forEach(loc => params.append("locations", loc));
        }

        const response = await fetch(`/api/featured-products?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        setProducts(data.products || []);

        // Update subcategories if available
        if (data.subcategories) {
          setSubcategories(data.subcategories);
        }

        // Set pagination data
        if (data.pagination) {
          setCurrentPage(data.pagination.currentPage);
          setTotalPages(data.pagination.totalPages);
          setTotalItems(data.pagination.totalItems);
        } else {
          setTotalPages(1);
          setTotalItems(data.products?.length || 0);
        }

        // Set locations if available
        if (data.locations) {
          setLocations(data.locations);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
        toast.error('Failed to load products. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [activeCategory, activeSubcategory, searchQuery, sortBy, currentPage, priceRange, selectedLocations]);

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setActiveSubcategory(null); // Reset subcategory when changing category
    setCurrentPage(1); // Reset to first page on category change
  };

  // Handle subcategory change
  const handleSubcategoryChange = (subcategory: string | null) => {
    setActiveSubcategory(subcategory);
    setCurrentPage(1); // Reset to first page on subcategory change
  };

  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setCurrentPage(1); // Reset to first page on sort change
  };

  // Handle price range change
  const handlePriceRangeChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newValue = parseInt(e.target.value);
    setPriceRange(prev => {
      const newRange = [...prev] as [number, number];
      newRange[index] = newValue;
      return newRange;
    });
  };

  // Handle location selection
  const handleLocationToggle = (location: string) => {
    setSelectedLocations(prev => {
      if (prev.includes(location)) {
        return prev.filter(loc => loc !== location);
      } else {
        return [...prev, location];
      }
    });
    setCurrentPage(1); // Reset to first page on location change
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveCategory("All");
    setActiveSubcategory(null);
    setSearchQuery("");
    setSortBy("newest");
    setPriceRange([0, 1000000]);
    setSelectedLocations([]);
    setCurrentPage(1);
  };

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="bg-green-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Explore Our Products
          </h1>
          <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
            Discover high-quality agricultural products directly from local farmers across Nigeria.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-8 max-w-2xl mx-auto">
            <div className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="flex-1 p-3 border-0 rounded-l-md focus:ring-2 focus:ring-green-500"
              />
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-3 rounded-r-md hover:bg-green-700 transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters - Mobile Toggle */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-center gap-2 bg-white p-3 rounded-md border shadow-sm"
              >
                <Filter className="h-5 w-5" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
            </div>

            {/* Filters Sidebar */}
            <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-green-600 hover:text-green-700"
                  >
                    Clear All
                  </button>
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Categories</h3>
                  <div className="space-y-2">
                    <div
                      className={`cursor-pointer px-3 py-2 rounded-md ${activeCategory === "All" ? "bg-green-100 text-green-700" : "text-gray-800 hover:bg-gray-100"}`}
                      onClick={() => handleCategoryChange("All")}
                    >
                      All Categories
                    </div>
                    {categories.map((category) => (
                      <div
                        key={category}
                        className={`cursor-pointer px-3 py-2 rounded-md ${activeCategory === category ? "bg-green-100 text-green-700" : "text-gray-800 hover:bg-gray-100"}`}
                        onClick={() => handleCategoryChange(category)}
                      >
                        {category}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subcategories - Only show when a category is selected */}
                {activeCategory !== "All" && Array.isArray(subcategories) && subcategories.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-md font-medium text-gray-900 mb-3">Subcategories</h3>
                    <div className="space-y-2">
                      <div
                        className={`cursor-pointer px-3 py-2 rounded-md ${activeSubcategory === null ? "bg-green-100 text-green-700" : "text-gray-800 hover:bg-gray-100"}`}
                        onClick={() => handleSubcategoryChange(null)}
                      >
                        All {activeCategory}
                      </div>
                      {/* If subcategories is an array of Subcategory objects */}
                      {!('category' in subcategories[0]) && (subcategories as Subcategory[]).map((subcat) => (
                        <div
                          key={subcat.name}
                          className={`cursor-pointer px-3 py-2 rounded-md ${activeSubcategory === subcat.name ? "bg-green-100 text-green-700" : "text-gray-800 hover:bg-gray-100"}`}
                          onClick={() => handleSubcategoryChange(subcat.name)}
                        >
                          {subcat.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Price Range</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Min: {formatCurrency(priceRange[0])}</span>
                      <span className="text-sm text-gray-600">Max: {formatCurrency(priceRange[1])}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="min-price" className="sr-only">Minimum Price</label>
                        <input
                          type="number"
                          id="min-price"
                          min="0"
                          max={priceRange[1]}
                          value={priceRange[0]}
                          onChange={(e) => handlePriceRangeChange(e, 0)}
                          className="w-full p-2 border rounded-md"
                        />
                      </div>
                      <div>
                        <label htmlFor="max-price" className="sr-only">Maximum Price</label>
                        <input
                          type="number"
                          id="max-price"
                          min={priceRange[0]}
                          value={priceRange[1]}
                          onChange={(e) => handlePriceRangeChange(e, 1)}
                          className="w-full p-2 border rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Locations */}
                {locations.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-md font-medium text-gray-900 mb-3">Locations</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {locations.map((location) => (
                        <div key={location} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`location-${location}`}
                            checked={selectedLocations.includes(location)}
                            onChange={() => handleLocationToggle(location)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`location-${location}`} className="ml-2 text-sm text-gray-700">
                            {location}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Products Grid */}
            <div className="lg:w-3/4">
              {/* Sort Controls */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col sm:flex-row justify-between items-center">
                <div className="mb-4 sm:mb-0">
                  <p className="text-gray-600">
                    {isLoading ? (
                      "Loading products..."
                    ) : products.length > 0 ? (
                      `Showing ${products.length} products`
                    ) : (
                      "No products found"
                    )}
                  </p>
                </div>
                <div className="flex items-center">
                  <label htmlFor="sort" className="text-sm text-gray-700 mr-2">Sort by:</label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={handleSortChange}
                    className="p-2 border rounded-md focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="newest">Newest</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
              </div>

              {/* Active Filters */}
              {(activeCategory !== "All" || activeSubcategory || searchQuery || selectedLocations.length > 0 || priceRange[0] > 0 || priceRange[1] < 1000000) && (
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-gray-700">Active Filters:</span>

                    {activeCategory !== "All" && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                        Category: {activeCategory}
                        <button onClick={() => setActiveCategory("All")} className="ml-1">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}

                    {activeSubcategory && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                        Subcategory: {activeSubcategory}
                        <button onClick={() => setActiveSubcategory(null)} className="ml-1">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}

                    {searchQuery && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                        Search: {searchQuery}
                        <button onClick={() => setSearchQuery("")} className="ml-1">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}

                    {(priceRange[0] > 0 || priceRange[1] < 1000000) && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                        Price: {formatCurrency(Number(priceRange[0]))} - {formatCurrency(Number(priceRange[1]))}
                        <button onClick={() => setPriceRange([0, 1000000])} className="ml-1">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}

                    {selectedLocations.map(location => (
                      <span key={location} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                        Location: {location}
                        <button onClick={() => handleLocationToggle(location)} className="ml-1">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Products */}
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-10 h-10 animate-spin text-green-600" />
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 hover:translate-y-[-2px] group"
                    >
                      <div className="relative h-52 w-full overflow-hidden">
                        <Image
                          src={getProductImageUrl(product.images)}
                          alt={product.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-0 left-0 w-full p-2 flex justify-between">
                          <div className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                            {product.category}
                          </div>
                          {product.rating >= 4.5 && (
                            <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                              <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              Top Rated
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-green-700 transition-colors">{product.title}</h3>
                          <p className="font-bold text-green-700 ml-2 whitespace-nowrap">{formatCurrency(product.price)}</p>
                        </div>

                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>

                        <div className="flex items-center mt-3 text-sm text-gray-500">
                          <span className="truncate">{product.location}</span>
                          <span className="mx-2 flex-shrink-0">•</span>
                          <span className="flex-shrink-0">{product.views} views</span>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`h-4 w-4 ${i < Math.floor(product.rating)
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                    }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="ml-1 text-xs text-gray-500">
                              ({product.reviews})
                            </span>
                          </div>
                          <div className="flex items-center">
                            {product.user.image ? (
                              <img
                                src={product.user.image}
                                alt={product.user.name}
                                className="w-5 h-5 rounded-full mr-1 object-cover"
                              />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-green-100 text-green-800 flex items-center justify-center mr-1">
                                {product.user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="text-xs text-gray-500 truncate max-w-[100px]">
                              {product.user.name}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <p className="text-gray-600 mb-4">No products found matching your criteria.</p>
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                  >
                    Clear Filters
                  </button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8">
                  <div className="text-center text-sm text-gray-600 mb-4">
                    Showing {products.length} of {totalItems} products - Page {currentPage} of {totalPages}
                  </div>
                  <nav className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-md ${currentPage === 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                        }`}
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      // Show first page, last page, current page, and pages around current
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 rounded-md ${currentPage === page
                              ? "bg-green-600 text-white"
                              : "text-gray-700 hover:bg-gray-100"
                              }`}
                            aria-label={`Page ${page}`}
                            aria-current={currentPage === page ? "page" : undefined}
                          >
                            {page}
                          </button>
                        );
                      }

                      // Show ellipsis for skipped pages
                      if (
                        (page === 2 && currentPage > 3) ||
                        (page === totalPages - 1 && currentPage < totalPages - 2)
                      ) {
                        return <span key={page} className="px-2">...</span>;
                      }

                      return null;
                    })}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-md ${currentPage === totalPages
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                        }`}
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
