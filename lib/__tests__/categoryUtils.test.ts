// Mock the navigation object structure used by categoryUtils
const mockNavigation = {
  categories: [
    {
      name: 'Electronics',
      featured: [
        { name: 'Laptops', href: '#' },
        { name: 'Smartphones', href: '#' },
      ],
      items: [ // Flattened structure
        { name: 'Laptops', href: '#' },
        { name: 'Smartphones', href: '#' },
        { name: 'Tablets', href: '#' },
      ],
    },
    {
      name: 'Fashion',
      featured: [
        { name: 'Men', href: '#' },
        { name: 'Women', href: '#' },
      ],
      items: [ // Flattened structure
        { name: 'Men', href: '#' },
        { name: 'Women', href: '#' },
        { name: 'Kids', href: '#' },
      ],
    },
    {
      name: 'Home',
      featured: [],
      items: [ // Flattened structure
        { name: 'Furniture', href: '#' },
        { name: 'Decor', href: '#' },
      ],
    },
    {
      name: 'Services',
      featured: [],
      items: [], // Flattened structure
    },
  ],
};

import {
  getSubcategoriesForCategory,
  mapUiCategoryToDatabase,
  mapDatabaseCategoryToUi,
  getAllCategoriesWithSubcategories,
  findSubcategoryInCategories,
} from '../categoryUtils';

// Mock the navigation import
jest.mock('@/constants', () => ({
  navigation: mockNavigation,
}));

describe('categoryUtils', () => {
  describe('getSubcategoriesForCategory', () => {
    it('should return subcategories for a given category name', () => {
      const subcategories = getSubcategoriesForCategory('Electronics');
      expect(subcategories).toEqual([
        { name: 'Laptops', href: '#' },
        { name: 'Smartphones', href: '#' },
        { name: 'Tablets', href: '#' },
      ]);
    });

    it('should return an empty array for a category with no sections/items', () => {
      const subcategories = getSubcategoriesForCategory('Services');
      expect(subcategories).toEqual([]);
    });

    it('should return an empty array for a non-existent category', () => {
      const subcategories = getSubcategoriesForCategory('NonExistent');
      expect(subcategories).toEqual([]);
    });
  });

  describe('mapUiCategoryToDatabase', () => {
    it('should map UI category name to database category name', () => {
      expect(mapUiCategoryToDatabase('Electronics')).toBe('Electronics');
      expect(mapUiCategoryToDatabase('Fashion')).toBe('Fashion');
      expect(mapUiCategoryToDatabase('Home')).toBe('Home');
      expect(mapUiCategoryToDatabase('Services')).toBe('Services');
    });

    it('should return the same name if mapping is not found (fallback)', () => {
      // Assuming no specific mapping is needed if names are the same
      // This test confirms it doesn't break for unknown UI names
      expect(mapUiCategoryToDatabase('UnknownCategory')).toBe('UnknownCategory');
    });
  });

  describe('mapDatabaseCategoryToUi', () => {
    it('should map database category name to UI category name', () => {
      expect(mapDatabaseCategoryToUi('Electronics')).toBe('Electronics');
      expect(mapDatabaseCategoryToUi('Fashion')).toBe('Fashion');
      expect(mapDatabaseCategoryToUi('Home')).toBe('Home');
      expect(mapDatabaseCategoryToUi('Services')).toBe('Services');
    });

    it('should return the same name if mapping is not found (fallback)', () => {
      // Assuming no specific mapping is needed if names are the same
      // This test confirms it doesn't break for unknown DB names
      expect(mapDatabaseCategoryToUi('UnknownCategory')).toBe('UnknownCategory');
    });
  });

  describe('getAllCategoriesWithSubcategories', () => {
    it('should return all categories with their subcategories', () => {
      const categoriesWithSubs = getAllCategoriesWithSubcategories();
      expect(categoriesWithSubs).toEqual([
        {
          category: 'Electronics', // Updated property name
          subcategories: [
            { name: 'Laptops', href: '#' },
            { name: 'Smartphones', href: '#' },
            { name: 'Tablets', href: '#' },
          ],
        },
        {
          category: 'Fashion', // Updated property name
          subcategories: [
            { name: 'Men', href: '#' },
            { name: 'Women', href: '#' },
            { name: 'Kids', href: '#' },
          ],
        },
        {
          category: 'Home', // Updated property name
          subcategories: [
            { name: 'Furniture', href: '#' },
            { name: 'Decor', href: '#' },
          ],
        },
        {
          category: 'Services', // Updated property name
          subcategories: [],
        },
      ]);
    });
  });

  describe('findSubcategoryInCategories', () => {
    it('should find a subcategory and return its category and subcategory names', () => {
      const result = findSubcategoryInCategories('Smartphones');
      expect(result).toEqual({
        category: 'Electronics', // Updated property name
        subcategory: 'Smartphones', // Updated property name
      });
    });

    it('should return undefined if subcategory is not found', () => {
      const result = findSubcategoryInCategories('NonExistentSubcategory');
      expect(result).toBeNull(); // Updated assertion to expect null
    });
  });
});
