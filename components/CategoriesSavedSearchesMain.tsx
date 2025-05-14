"use client";

import { useState, useEffect } from "react";
import { Bookmark, Bell, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { categories } from "@/constants";

interface SavedSearch {
  id: number;
  query: string;
  createdAt: string;
}

export default function CategoriesSavedSearches() {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  useEffect(() => {
    fetchSavedSearches();
  }, []);

  const fetchSavedSearches = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/saved-searches", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setSavedSearches(data.savedSearches || []);
      } else {
        toast.error("Failed to load saved searches");
      }
    } catch (error) {
      console.error("Error fetching saved searches:", error);
      toast.error("Failed to load saved searches");
    } finally {
      setLoading(false);
    }
  };

  const saveSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Enter a search term to save.");
      return;
    }

    // Check if search already exists
    if (savedSearches.some(search => search.query === searchQuery)) {
      toast.error("Search already saved.");
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch("/api/user/saved-searches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: searchQuery }),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setSavedSearches([...savedSearches, data.savedSearch]);
        toast.success("Search saved successfully.");
        setSearchQuery("");
      } else {
        toast.error("Failed to save search");
      }
    } catch (error) {
      console.error("Error saving search:", error);
      toast.error("Failed to save search");
    } finally {
      setIsSaving(false);
    }
  };

  const removeSavedSearch = async (id: number) => {
    try {
      setIsDeleting(id);
      const response = await fetch(`/api/user/saved-searches?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setSavedSearches(savedSearches.filter((search) => search.id !== id));
        toast.success("Search removed.");
      } else {
        toast.error("Failed to remove search");
      }
    } catch (error) {
      console.error("Error removing search:", error);
      toast.error("Failed to remove search");
    } finally {
      setIsDeleting(null);
    }
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
            disabled={isSaving}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition flex items-center gap-2"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bookmark size={18} />} Save
          </button>
        </div>

        {/* List of Saved Searches */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : savedSearches.length > 0 ? (
          <div className="mt-4 space-y-2">
            {savedSearches.map((search) => (
              <div key={search.id} className="flex justify-between items-center p-2 border rounded-md bg-gray-50">
                <div>
                  <span className="text-gray-700">{search.query}</span>
                  <p className="text-xs text-gray-500">Saved on {new Date(search.createdAt).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => removeSavedSearch(search.id)}
                  className="text-red-500"
                  disabled={isDeleting === search.id}
                >
                  {isDeleting === search.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X size={18} />}
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
