"use client";

import { useState, useEffect, useRef } from 'react';
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
import { categories, navigation } from '@/constants';
import { Search as SearchIcon, SlidersHorizontal, History, X } from 'lucide-react';
import { FilterState } from '@/types';
import { useSearchHistory } from '@/lib/searchHistory';
import RecentlyViewed from '@/components/RecentlyViewed';


export default function Search() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [filters, setFilters] = useState<FilterState>({
    minPrice: 0,
    maxPrice: 1000000,
    category: '',
    subCategory: '',
    location: '',
    sortBy: 'recent'
  });

  const { addSearch, getRecentSearches, removeSearch } = useSearchHistory();
  const [recentSearches, setRecentSearches] = useState<any[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const filtersButtonRef = useRef<HTMLButtonElement>(null);

  const getAllSuggestions = (term: string) => {
    if (!term) return [];

    const allSuggestions: any[] = [];
    navigation.categories.forEach(category => {
      if (category.name.toLowerCase().includes(term.toLowerCase())) {
        allSuggestions.push({
          type: 'category',
          name: category.name,
          href: `/search?category=${category.id}`,
        });
      }

      category.items.forEach(item => {
        if (item.name.toLowerCase().includes(term.toLowerCase())) {
          allSuggestions.push({
            type: 'item',
            name: item.name,
            href: item.href,
            category: category.name,
          });
        }
      });
    });

    return allSuggestions.slice(0, 8);
  };

  useEffect(() => {
    // Load recent searches on component mount
    setRecentSearches(getRecentSearches(5));
  }, []);

  const handleSuggestionSelect = (suggestion: any) => {
    if (suggestion.type === 'category') {
      setFilters(prev => ({ ...prev, category: suggestion.href.split('=')[1] }));
    }
    setSearchTerm(suggestion.name);
    setShowSuggestions(false);
    setShowHistory(false);
    setSelectedSuggestionIndex(-1);
  };

  const handleHistorySelect = (historyItem: any) => {
    setSearchTerm(historyItem.searchTerm);
    if (historyItem.filters) {
      setFilters(prev => ({ ...prev, ...historyItem.filters }));
    }
    setShowHistory(false);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev =>
          prev < 7 ? prev + 1 : 0 // Assuming max 8 suggestions
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev =>
          prev > 0 ? prev - 1 : 7
        );
        break;
      case 'Enter':
        if (selectedSuggestionIndex >= 0) {
          e.preventDefault();
          // Get the selected suggestion and handle it
          const suggestions = getAllSuggestions(searchTerm);
          const selectedSuggestion = suggestions[selectedSuggestionIndex];
          if (selectedSuggestion) {
            handleSuggestionSelect(selectedSuggestion);
          }
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        searchInputRef.current?.blur();
        break;
      case 'Tab':
        if (e.shiftKey) {
          // Let default behavior handle reverse tabbing
        } else {
          // Tab to filters button when suggestions are open
          setShowSuggestions(false);
          setSelectedSuggestionIndex(-1);
        }
        break;
    }
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

    // Save search to history if there's a search term
    if (searchTerm) {
      addSearch(searchTerm, {
        category: filters.category,
        location: filters.location,
        minPrice: filters.minPrice > 0 ? filters.minPrice : undefined,
        maxPrice: filters.maxPrice < 1000000 ? filters.maxPrice : undefined,
        sort: filters.sortBy
      });
      // Update recent searches
      setRecentSearches(getRecentSearches(5));
    }

    router.push(`/search?${params.toString()}`);
  };

  return (
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
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search for products, categories, or locations..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSuggestions(true);
                    setSelectedSuggestionIndex(-1);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={handleKeyDown}
                  onBlur={(e) => {
                    // Delay hiding suggestions and history to allow clicking
                    setTimeout(() => {
                      setShowSuggestions(false);
                      setShowHistory(false);
                    }, 150);
                  }}
                  className="h-12 pl-4 pr-12 rounded-lg border-gray-200 focus:border-green-500 focus:ring-green-500"
                  role="combobox"
                  aria-expanded={showSuggestions}
                  aria-haspopup="listbox"
                  aria-autocomplete="list"
                  aria-describedby="search-suggestions"
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
                onClick={() => setShowHistory(!showHistory)}
                className="h-12 px-4 border-gray-200 hover:bg-gray-50 rounded-lg shadow-sm"
                aria-expanded={showHistory}
                disabled={recentSearches.length === 0}
              >
                <History className="h-5 w-5" />
              </Button>

              <Button
                ref={filtersButtonRef}
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="h-12 px-4 border-gray-200 hover:bg-gray-50 rounded-lg shadow-sm"
                aria-expanded={showFilters}
                aria-controls="filter-panel"
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
                  selectedIndex={selectedSuggestionIndex}
                />
              </div>
            )}

            {/* Search History */}
            {showHistory && recentSearches.length > 0 && (
              <div className="relative">
                <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden z-50">
                  <div className="p-2">
                    <div className="px-4 py-2 text-xs text-gray-500 font-medium uppercase tracking-wide border-b border-gray-100 mb-2">
                      Recent Searches
                    </div>
                    {recentSearches.map((historyItem) => (
                      <div
                        key={historyItem.id}
                        className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 rounded-md group"
                      >
                        <button
                          onClick={() => handleHistorySelect(historyItem)}
                          className="flex-1 text-left flex items-center space-x-2"
                        >
                          <History className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{historyItem.searchTerm}</span>
                          {historyItem.resultCount !== undefined && (
                            <span className="text-xs text-gray-500">
                              ({historyItem.resultCount} results)
                            </span>
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSearch(historyItem.id);
                            setRecentSearches(getRecentSearches(5));
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Advanced Filters */}
            {showFilters && (
              <div id="filter-panel" className="mt-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Category Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <Select
                      value={filters.category}
                      onValueChange={(value) => setFilters({ ...filters, category: value })}
                    >
                      <SelectTrigger className="text-gray-400 h-10 w-full border-gray-200">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.name} value={category.name}>
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
                        className="text-gray-400 h-10 border-gray-200"
                      />
                      <span className="text-gray-500 self-center">to</span>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
                        className="text-gray-400 h-10 border-gray-200"
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
                      className="text-gray-400 h-10 border-gray-200"
                    />
                  </div>

                  {/* Sort By */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Sort By</label>
                    <Select
                      value={filters.sortBy}
                      onValueChange={(value) => setFilters({ ...filters, sortBy: value })}
                    >
                      <SelectTrigger className="text-gray-400 h-10 w-full border-gray-200">
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

          {/* Recently Viewed Section */}
          <RecentlyViewed />
        </div>
      </div>
    </div>
  );
}