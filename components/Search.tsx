"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SearchSuggestions } from '@/components/SearchSuggestions';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { categories } from '@/constants';
import { Search as SearchIcon, SlidersHorizontal } from 'lucide-react';
import { FilterState } from '@/types';


export default function Search() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    minPrice: 0,
    maxPrice: 1000000,
    category: '',
    subCategory: '',
    location: '',
    sortBy: 'recent'
  });

  const handleSuggestionSelect = (suggestion: any) => {
    if (suggestion.type === 'category') {
      setFilters(prev => ({ ...prev, category: suggestion.href.split('=')[1] }));
    }
    setSearchTerm(suggestion.name);
    setShowSuggestions(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (searchTerm) params.set('q', searchTerm);
    if (filters.category) params.set('category', filters.category);
    if (filters.subCategory) params.set('subcategory', filters.subCategory);
    if (filters.minPrice > 0) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice < 1000000) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.location) params.set('location', filters.location);
    if (filters.sortBy) params.set('sort', filters.sortBy);

    router.push(`/search?${params.toString()}`);
  };

  return (
    // <div className="w-full max-w-4xl mx-auto">
    //   <form onSubmit={handleSearch} className="space-y-4">
    //     <div className="flex gap-2 relative">
    //       <div className="flex-1 relative">

    //       </div>
    //       <Input
    //         type="search"
    //         placeholder="Search for agricultural products..."
    //         value={searchTerm}
    //         onChange={(e) => {
    //           setSearchTerm(e.target.value);
    //           setShowSuggestions(true);
    //         }}
    //         onFocus={() => setShowSuggestions(true)}
    //         className="flex-1"
    //       />
    //       {showSuggestions && (
    //         <SearchSuggestions
    //           searchTerm={searchTerm}
    //           onSelect={handleSuggestionSelect}
    //         />
    //       )}
    //       <Button type="submit" className="bg-green-600 hover:bg-green-700">
    //         <SearchIcon className="h-4 w-4 mr-2" />
    //         Search
    //       </Button>
    //       <Button
    //         type="button"
    //         variant="outline"
    //         onClick={() => setShowFilters(!showFilters)}
    //       >
    //         <Filter className="h-4 w-4" />
    //       </Button>
    //     </div>

    //     {showFilters && (
    //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg">
    //         <div className="space-y-2">
    //           <label className="text-sm font-medium">Category</label>
    //           <Select
    //             value={filters.category}
    //             onValueChange={(value) => setFilters({ ...filters, category: value })}
    //           >
    //             <SelectTrigger>
    //               <SelectValue placeholder="Select category" />
    //             </SelectTrigger>
    //             <SelectContent>
    //               {categories.map((category) => (
    //                 <SelectItem key={category.slug} value={category.slug}>
    //                   {category.name}
    //                 </SelectItem>
    //               ))}
    //             </SelectContent>
    //           </Select>
    //         </div>

    //         <div className="space-y-2">
    //           <label className="text-sm font-medium">Price Range</label>
    //           <div className="flex gap-2">
    //             <Input
    //               type="number"
    //               placeholder="Min"
    //               value={filters.minPrice}
    //               onChange={(e) => setFilters({ ...filters, minPrice: Number(e.target.value) })}
    //             />
    //             <Input
    //               type="number"
    //               placeholder="Max"
    //               value={filters.maxPrice}
    //               onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
    //             />
    //           </div>
    //         </div>

    //         <div className="space-y-2">
    //           <label className="text-sm font-medium">Location</label>
    //           <Input
    //             type="text"
    //             placeholder="Enter location"
    //             value={filters.location}
    //             onChange={(e) => setFilters({ ...filters, location: e.target.value })}
    //           />
    //         </div>

    //         <div className="space-y-2">
    //           <label className="text-sm font-medium">Sort By</label>
    //           <Select
    //             value={filters.sortBy}
    //             onValueChange={(value) => setFilters({ ...filters, sortBy: value })}
    //           >
    //             <SelectTrigger>
    //               <SelectValue placeholder="Sort by..." />
    //             </SelectTrigger>
    //             <SelectContent>
    //               <SelectItem value="recent">Most Recent</SelectItem>
    //               <SelectItem value="price_asc">Price: Low to High</SelectItem>
    //               <SelectItem value="price_desc">Price: High to Low</SelectItem>
    //               <SelectItem value="views">Most Viewed</SelectItem>
    //             </SelectContent>
    //           </Select>
    //         </div>
    //       </div>
    //     )}
    //   </form>
    // </div>

    <div className="min-h-screen flex flex-col">
      {/* Main Content Area */}
      <div className="flex-grow bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Find Agricultural Products
            </h1>
            <p className="text-gray-600">
              Search through thousands of farm products, equipment, and supplies
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-4 max-w-4xl mx-auto">
            {/* Search Bar */}
            <div className="flex gap-2 relative">
              <div className="flex-1 relative shadow-sm">
                <Input
                  type="search"
                  placeholder="Search for products, categories, or locations..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="h-12 pl-4 pr-12 rounded-lg border-gray-200 focus:border-green-500 focus:ring-green-500"
                />
                <SearchIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>

              <Button
                type="submit"
                className="h-12 px-6 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm"
              >
                Search
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="h-12 px-4 border-gray-200 hover:bg-gray-50 rounded-lg shadow-sm"
              >
                <SlidersHorizontal className="h-5 w-5 mr-2" />
                Filters
              </Button>
            </div>

            {/* Search Suggestions */}
            {showSuggestions && (
              <div className="relative">
                <SearchSuggestions
                  searchTerm={searchTerm}
                  onSelect={handleSuggestionSelect}
                />
              </div>
            )}

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Category Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <Select
                      value={filters.category}
                      onValueChange={(value) => setFilters({ ...filters, category: value })}
                    >
                      <SelectTrigger className="h-10 w-full border-gray-200">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.slug} value={category.slug}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Price Range</label>
                    <div className="flex gap-3">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={(e) => setFilters({ ...filters, minPrice: Number(e.target.value) })}
                        className="h-10 border-gray-200"
                      />
                      <span className="text-gray-500 self-center">to</span>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
                        className="h-10 border-gray-200"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    <Input
                      type="text"
                      placeholder="Enter location"
                      value={filters.location}
                      onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                      className="h-10 border-gray-200"
                    />
                  </div>

                  {/* Sort By */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Sort By</label>
                    <Select
                      value={filters.sortBy}
                      onValueChange={(value) => setFilters({ ...filters, sortBy: value })}
                    >
                      <SelectTrigger className="h-10 w-full border-gray-200">
                        <SelectValue placeholder="Sort by..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">Most Recent</SelectItem>
                        <SelectItem value="price_asc">Price: Low to High</SelectItem>
                        <SelectItem value="price_desc">Price: High to Low</SelectItem>
                        <SelectItem value="views">Most Viewed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFilters({
                      minPrice: 0,
                      maxPrice: 1000000,
                      category: '',
                      subCategory: '',
                      location: '',
                      sortBy: 'recent'
                    })}
                    className="mr-2"
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}