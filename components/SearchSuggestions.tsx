"use client";

import { useState, useEffect } from 'react';
import { navigation } from '@/constants';
import Link from 'next/link';
import { Command } from 'cmdk';
import { Suggestion, SearchSuggestionsProps } from '@/types';
import { useDidYouMean } from '@/lib/didYouMean';


export function SearchSuggestions({ searchTerm, onSelect, selectedIndex = -1 }: SearchSuggestionsProps & { selectedIndex?: number }) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const { getSuggestions: getSpellingSuggestions, isPossibleMisspelling } = useDidYouMean();
  const [showSpellingSuggestions, setShowSpellingSuggestions] = useState(false);
  const [spellingSuggestions, setSpellingSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (!searchTerm) {
      setSuggestions([]);
      setSpellingSuggestions([]);
      setShowSpellingSuggestions(false);
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

    // Check for spelling suggestions if no exact matches found
    if (allSuggestions.length === 0 && isPossibleMisspelling(searchTerm)) {
      const spellingAlternatives = getSpellingSuggestions(searchTerm, 3);
      setSpellingSuggestions(spellingAlternatives);
      setShowSpellingSuggestions(spellingAlternatives.length > 0);
    } else {
      setSpellingSuggestions([]);
      setShowSpellingSuggestions(false);
    }
  }, [searchTerm]);

  if (!suggestions.length && !showSpellingSuggestions) return null;

  return (
    <div
      id="search-suggestions"
      className="absolute left-0 right-0 top-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden z-50"
      role="listbox"
    >
      <div className="p-2">
        {/* Show spelling suggestions first if available */}
        {showSpellingSuggestions && (
          <>
            <div className="px-4 py-2 text-xs text-gray-500 font-medium uppercase tracking-wide border-b border-gray-100 mb-2">
              Did you mean?
            </div>
            {spellingSuggestions.map((spellingSuggestion, index) => (
              <button
                key={`spelling-${index}`}
                onClick={() => onSelect({
                  type: 'spelling',
                  name: spellingSuggestion,
                  href: `/search?q=${encodeURIComponent(spellingSuggestion)}`
                })}
                className={`w-full text-left flex items-center px-4 py-2 rounded-md transition-colors ${
                  index === selectedIndex && suggestions.length === 0
                    ? 'bg-blue-50 border-blue-200 border'
                    : 'hover:bg-gray-50'
                }`}
                role="option"
                aria-selected={index === selectedIndex && suggestions.length === 0}
                tabIndex={-1}
              >
                <span className="text-blue-600 mr-2">→</span>
                <span className="font-medium text-gray-900">{spellingSuggestion}</span>
              </button>
            ))}
            {suggestions.length > 0 && (
              <div className="border-t border-gray-100 mt-2 pt-2">
                <div className="px-4 py-1 text-xs text-gray-500 font-medium uppercase tracking-wide">
                  Or browse
                </div>
              </div>
            )}
          </>
        )}

        {/* Regular suggestions */}
        {suggestions.map((suggestion, index) => (
          <Link
            key={`${suggestion.type}-${index}`}
            href={suggestion.href}
            onClick={() => onSelect(suggestion)}
            className={`flex flex-col px-4 py-2 rounded-md transition-colors ${
              index === selectedIndex
                ? 'bg-green-50 border-green-200 border'
                : 'hover:bg-gray-50'
            }`}
            role="option"
            aria-selected={index === selectedIndex}
            tabIndex={-1}
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