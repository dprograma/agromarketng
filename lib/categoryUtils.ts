import { navigation } from '@/constants';

// Type definitions
export interface CategoryIcon {
  name: string;
  icon: React.ComponentType<any>;
}

export interface Subcategory {
  name: string;
  href: string;
}

interface NavigationItem {
  name: string;
  href: string;
}

// Updated interface based on observed structure
interface NavigationCategory {
  id: string;
  name: string;
  items: NavigationItem[];
}


// Get all main categories from the navigation structure
export const getMainCategories = () => {
  return navigation.categories.map((cat: NavigationCategory) => cat.name);
};

// Get subcategories for a specific category
export const getSubcategoriesForCategory = (categoryName: string): Subcategory[] => {
  const category = navigation.categories.find(
    (cat: NavigationCategory) => cat.name.toLowerCase() === categoryName.toLowerCase()
  );

  if (!category || !category.items) return [];

  return category.items
    .filter((item: NavigationItem) => item.name !== 'Browse All') // Filter out "Browse All" items
    .map((item: NavigationItem) => ({
      name: item.name,
      href: item.href
    }));
};

// Map UI category names to database category names
export const mapUiCategoryToDatabase = (uiCategory: string): string => {
  // Since we're using a simplified and consistent category structure,
  // the UI category names are the same as the database category names
  const categoryMappings: Record<string, string> = {
    "Farm Accessories": "Farm Accessories",
    "Farm Machinery": "Farm Machinery", // Now simplified to just "Farm Machinery"
    "Tools": "Tools",
    "Farm Animals": "Farm Animals",
    "Plants": "Plants",
    "Poultry": "Poultry",
    "Cereals & Grains": "Cereals & Grains"
  };

  return categoryMappings[uiCategory] || uiCategory;
};

// Map database category names to UI category names
export const mapDatabaseCategoryToUi = (dbCategory: string): string => {
  // Since we're using a simplified and consistent category structure,
  // the database category names are the same as the UI category names
  const reverseCategoryMappings: Record<string, string> = {
    "Farm Accessories": "Farm Accessories",
    "Farm Machinery": "Farm Machinery", // Now simplified to just "Farm Machinery"
    "Tools": "Tools",
    "Farm Animals": "Farm Animals",
    "Plants": "Plants",
    "Poultry": "Poultry",
    "Cereals & Grains": "Cereals & Grains"
  };

  return reverseCategoryMappings[dbCategory] || dbCategory;
};

// Get all categories with their subcategories
export const getAllCategoriesWithSubcategories = () => {
  return navigation.categories.map((cat: NavigationCategory) => ({
    category: cat.name,
    subcategories: cat.items // Access items directly
      .filter((item: NavigationItem) => item.name !== 'Browse All')
      .map((item: NavigationItem) => ({
        name: item.name,
        href: item.href
      }))
  }));
};

// Find a subcategory in any category
export const findSubcategoryInCategories = (subcategoryName: string) => {
  for (const category of navigation.categories as NavigationCategory[]) {
    // Access items directly
    if (category.items) {
      const subcategory = category.items.find(
        (item: NavigationItem) => item.name.toLowerCase() === subcategoryName.toLowerCase()
      );

      if (subcategory) {
        return {
          category: category.name,
          subcategory: subcategory.name
        };
      }
    }
  }

  return null;
};
