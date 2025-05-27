"use client";

import { useState, useEffect } from 'react';
import { navigation } from '@/constants';
import Link from 'next/link';
import { Command } from 'cmdk';
import { Suggestion, SearchSuggestionsProps } from '@/types';


export function SearchSuggestions({ searchTerm, onSelect }: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    if (!searchTerm) {
      setSuggestions([]);
      return;
    }

    // Generate suggestions based on categories and items
    const allSuggestions: Suggestion[] = [];

    navigation.categories.forEach(category => {
      // Add category if it matches
      if (category.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        allSuggestions.push({
          type: 'category',
          name: category.name,
          href: `/search?category=${category.id}`,
        });
      }

      // Add matching items from each section
      category.items.forEach(item => {
        if (item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          allSuggestions.push({
            type: 'item',
            name: item.name,
            href: item.href,
            category: category.name,
          });
        }
      });
    });

    setSuggestions(allSuggestions.slice(0, 8)); // Limit to 8 suggestions
  }, [searchTerm]);

  if (!suggestions.length) return null;

  return (
    <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden z-50">
      <div className="p-2">
        {suggestions.map((suggestion, index) => (
          <Link
            key={`${suggestion.type}-${index}`}
            href={suggestion.href}
            onClick={() => onSelect(suggestion)}
            className="flex flex-col px-4 py-2 hover:bg-gray-50 rounded-md"
          >
            <span className="font-medium text-gray-900">{suggestion.name}</span>
            {suggestion.type === 'item' && (
              <span className="text-sm text-gray-500">
                in {suggestion.category}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}