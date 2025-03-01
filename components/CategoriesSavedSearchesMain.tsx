"use client";

import { useState } from "react";
import { Bookmark, Bell, X } from "lucide-react";
import toast from "react-hot-toast";
import { categories } from "@/constants"


export default function CategoriesSavedSearches() {
  const [savedSearches, setSavedSearches] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const saveSearch = () => {
    if (!searchQuery.trim()) {
      toast.error("Enter a search term to save.");
      return;
    }
    if (!savedSearches.includes(searchQuery)) {
      setSavedSearches([...savedSearches, searchQuery]);
      toast.success("Search saved successfully.");
    } else {
      toast.error("Search already saved.");
    }
    setSearchQuery("");
  };

  const removeSavedSearch = (query: string) => {
    setSavedSearches(savedSearches.filter((search) => search !== query));
    toast.success("Search removed.");
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 text-center">🔍 Categories & Saved Searches</h2>
      <p className="text-gray-600 text-center mt-2">Personalize your search experience.</p>

      {/* Categories Section */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-700">📂 Browse Categories</h3>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((category) => (
            <button
              key={category.slug}
              className="flex items-center justify-center border rounded-lg p-3 text-gray-700 bg-gray-50 hover:bg-green-100 transition"
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Saved Searches */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-700">🔖 Saved Searches</h3>
        <div className="mt-4 flex items-center space-x-3">
          <input
            type="text"
            placeholder="Search and save..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 p-3 border rounded-md focus:ring-green-500 focus:border-green-500"
          />
          <button
            onClick={saveSearch}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition flex items-center gap-2"
          >
            <Bookmark size={18} /> Save
          </button>
        </div>
        {/* List of Saved Searches */}
        {savedSearches.length > 0 ? (
          <div className="mt-4 space-y-2">
            {savedSearches.map((query, index) => (
              <div key={index} className="flex justify-between items-center p-2 border rounded-md bg-gray-50">
                <span className="text-gray-700">{query}</span>
                <button onClick={() => removeSavedSearch(query)} className="text-red-500">
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mt-2">No saved searches yet.</p>
        )}
      </div>

      {/* Search Alerts */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-700">🔔 Search Alerts</h3>
        <p className="text-gray-600 mt-2">Get notified when new ads match your saved searches.</p>
        <button
          onClick={() => toast.success("Search alerts enabled!")}
          className="mt-3 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition flex items-center gap-2"
        >
          <Bell size={18} /> Enable Alerts
        </button>
      </div>
    </div>
  );
}
