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

// Get all main categories from the navigation structure
export const getMainCategories = () => {
  return navigation.categories.map(cat => cat.name);
};

// Get subcategories for a specific category
export const getSubcategoriesForCategory = (categoryName: string) => {
  const category = navigation.categories.find(
    cat => cat.name.toLowerCase() === categoryName.toLowerCase()
  );

  if (!category) return [];

  return category.items
    .filter(item => item.name !== 'Browse All') // Filter out "Browse All" items
    .map(item => ({
      name: item.name,
      href: item.href
    }));
};

// Map UI category names to database category names
export const mapUiCategoryToDatabase = (uiCategory: string) => {
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
export const mapDatabaseCategoryToUi = (dbCategory: string) => {
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
  return navigation.categories.map(cat => ({
    category: cat.name,
    subcategories: cat.items
      .filter(item => item.name !== 'Browse All')
      .map(item => ({
        name: item.name,
        href: item.href
      }))
  }));
};

// Find a subcategory in any category
export const findSubcategoryInCategories = (subcategoryName: string) => {
  for (const category of navigation.categories) {
    const subcategory = category.items.find(
      item => item.name.toLowerCase() === subcategoryName.toLowerCase()
    );

    if (subcategory) {
      return {
        category: category.name,
        subcategory: subcategory.name
      };
    }
  }

  return null;
};
