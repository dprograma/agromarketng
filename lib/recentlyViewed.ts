interface RecentlyViewedItem {
  id: string;
  title: string;
  price: number;
  location: string;
  category: string;
  images: string[];
  viewedAt: number;
  userId?: string;
}

class RecentlyViewed {
  private static instance: RecentlyViewed;
  private storageKey = 'agro-recently-viewed';
  private maxItems = 10;

  private constructor() {}

  static getInstance(): RecentlyViewed {
    if (!this.instance) {
      this.instance = new RecentlyViewed();
    }
    return this.instance;
  }

  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  private getRecentlyViewed(): RecentlyViewedItem[] {
    if (!this.isClient()) return [];

    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading recently viewed:', error);
      return [];
    }
  }

  private saveRecentlyViewed(items: RecentlyViewedItem[]): void {
    if (!this.isClient()) return;

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving recently viewed:', error);
    }
  }

  addItem(item: Omit<RecentlyViewedItem, 'viewedAt'>): void {
    const recentlyViewed = this.getRecentlyViewed();

    // Remove any existing item with the same ID
    const filteredItems = recentlyViewed.filter(existing => existing.id !== item.id);

    // Add the new item at the beginning
    const newItem: RecentlyViewedItem = {
      ...item,
      viewedAt: Date.now()
    };

    const updatedItems = [newItem, ...filteredItems].slice(0, this.maxItems);
    this.saveRecentlyViewed(updatedItems);
  }

  getItems(limit?: number): RecentlyViewedItem[] {
    const items = this.getRecentlyViewed()
      .sort((a, b) => b.viewedAt - a.viewedAt);

    return limit ? items.slice(0, limit) : items;
  }

  removeItem(id: string): void {
    const recentlyViewed = this.getRecentlyViewed();
    const filteredItems = recentlyViewed.filter(item => item.id !== id);
    this.saveRecentlyViewed(filteredItems);
  }

  clearAll(): void {
    if (!this.isClient()) return;
    localStorage.removeItem(this.storageKey);
  }

  hasItems(): boolean {
    return this.getItems().length > 0;
  }

  // Get items from specific category
  getItemsByCategory(category: string, limit = 3): RecentlyViewedItem[] {
    return this.getItems()
      .filter(item => item.category.toLowerCase() === category.toLowerCase())
      .slice(0, limit);
  }

  // Get items within price range
  getItemsByPriceRange(minPrice: number, maxPrice: number, limit = 5): RecentlyViewedItem[] {
    return this.getItems()
      .filter(item => item.price >= minPrice && item.price <= maxPrice)
      .slice(0, limit);
  }

  // Get statistical data
  getStats(): {
    totalViews: number;
    categoryCounts: Record<string, number>;
    averagePrice: number;
    mostViewedCategory: string;
  } {
    const items = this.getItems();
    const categoryCounts: Record<string, number> = {};
    let totalPrice = 0;

    items.forEach(item => {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
      totalPrice += item.price;
    });

    const mostViewedCategory = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    return {
      totalViews: items.length,
      categoryCounts,
      averagePrice: items.length > 0 ? totalPrice / items.length : 0,
      mostViewedCategory
    };
  }
}

export const recentlyViewed = RecentlyViewed.getInstance();

// Hook for React components
export const useRecentlyViewed = () => {
  const addItem = (item: Omit<RecentlyViewedItem, 'viewedAt'>) => {
    recentlyViewed.addItem(item);
  };

  const getItems = (limit?: number) => {
    return recentlyViewed.getItems(limit);
  };

  const removeItem = (id: string) => {
    recentlyViewed.removeItem(id);
  };

  const clearAll = () => {
    recentlyViewed.clearAll();
  };

  const hasItems = () => {
    return recentlyViewed.hasItems();
  };

  const getItemsByCategory = (category: string, limit?: number) => {
    return recentlyViewed.getItemsByCategory(category, limit);
  };

  const getItemsByPriceRange = (minPrice: number, maxPrice: number, limit?: number) => {
    return recentlyViewed.getItemsByPriceRange(minPrice, maxPrice, limit);
  };

  const getStats = () => {
    return recentlyViewed.getStats();
  };

  return {
    addItem,
    getItems,
    removeItem,
    clearAll,
    hasItems,
    getItemsByCategory,
    getItemsByPriceRange,
    getStats
  };
};