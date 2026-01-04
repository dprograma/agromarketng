interface SearchHistoryItem {
  id: string;
  searchTerm: string;
  filters?: Record<string, any>;
  timestamp: number;
  resultCount?: number;
}

class SearchHistory {
  private static instance: SearchHistory;
  private storageKey = 'agro-search-history';
  private maxItems = 20;

  private constructor() {}

  static getInstance(): SearchHistory {
    if (!this.instance) {
      this.instance = new SearchHistory();
    }
    return this.instance;
  }

  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  private getHistory(): SearchHistoryItem[] {
    if (!this.isClient()) return [];

    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading search history:', error);
      return [];
    }
  }

  private saveHistory(history: SearchHistoryItem[]): void {
    if (!this.isClient()) return;

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }

  addSearch(searchTerm: string, filters?: Record<string, any>, resultCount?: number): void {
    if (!searchTerm.trim()) return;

    const history = this.getHistory();
    const newItem: SearchHistoryItem = {
      id: Date.now().toString(),
      searchTerm: searchTerm.trim(),
      filters: filters || {},
      timestamp: Date.now(),
      resultCount
    };

    // Remove any existing identical search
    const filteredHistory = history.filter(
      item => item.searchTerm.toLowerCase() !== searchTerm.toLowerCase()
    );

    // Add new item to the beginning
    const updatedHistory = [newItem, ...filteredHistory].slice(0, this.maxItems);

    this.saveHistory(updatedHistory);
  }

  getRecentSearches(limit = 10): SearchHistoryItem[] {
    return this.getHistory()
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  getPopularSearches(limit = 5): Array<{term: string, count: number}> {
    const history = this.getHistory();
    const termCounts = new Map<string, number>();

    history.forEach(item => {
      const term = item.searchTerm.toLowerCase();
      termCounts.set(term, (termCounts.get(term) || 0) + 1);
    });

    return Array.from(termCounts.entries())
      .map(([term, count]) => ({ term, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  clearHistory(): void {
    if (!this.isClient()) return;
    localStorage.removeItem(this.storageKey);
  }

  removeSearch(id: string): void {
    const history = this.getHistory();
    const updatedHistory = history.filter(item => item.id !== id);
    this.saveHistory(updatedHistory);
  }

  // Get search suggestions based on history
  getSuggestions(query: string, limit = 5): string[] {
    if (!query.trim()) return [];

    const history = this.getHistory();
    const queryLower = query.toLowerCase();

    return history
      .filter(item =>
        item.searchTerm.toLowerCase().includes(queryLower) &&
        item.searchTerm.toLowerCase() !== queryLower
      )
      .map(item => item.searchTerm)
      .slice(0, limit);
  }
}

export const searchHistory = SearchHistory.getInstance();

// Helper functions for React components
export const useSearchHistory = () => {
  const addSearch = (searchTerm: string, filters?: Record<string, any>, resultCount?: number) => {
    searchHistory.addSearch(searchTerm, filters, resultCount);
  };

  const getRecentSearches = (limit?: number) => {
    return searchHistory.getRecentSearches(limit);
  };

  const getPopularSearches = (limit?: number) => {
    return searchHistory.getPopularSearches(limit);
  };

  const getSuggestions = (query: string, limit?: number) => {
    return searchHistory.getSuggestions(query, limit);
  };

  const clearHistory = () => {
    searchHistory.clearHistory();
  };

  const removeSearch = (id: string) => {
    searchHistory.removeSearch(id);
  };

  return {
    addSearch,
    getRecentSearches,
    getPopularSearches,
    getSuggestions,
    clearHistory,
    removeSearch
  };
};