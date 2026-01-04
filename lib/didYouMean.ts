// Simple Levenshtein distance implementation
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  const len1 = str1.length;
  const len2 = str2.length;

  // Initialize matrix
  for (let i = 0; i <= len2; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len1; j++) {
    matrix[0][j] = j;
  }

  // Calculate distances
  for (let i = 1; i <= len2; i++) {
    for (let j = 1; j <= len1; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[len2][len1];
}

// Calculate similarity score (0-1, where 1 is identical)
function getSimilarityScore(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;

  const maxLength = Math.max(str1.length, str2.length);
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());

  return 1 - (distance / maxLength);
}

// Common agricultural terms and their variations
const agriculturalTerms = [
  // Crops
  'maize', 'corn', 'wheat', 'rice', 'barley', 'oats', 'millet', 'sorghum',
  'beans', 'peas', 'lentils', 'chickpeas', 'soybeans', 'groundnuts', 'peanuts',
  'cassava', 'yam', 'potato', 'sweet potato', 'plantain', 'banana',
  'tomato', 'pepper', 'onion', 'garlic', 'cabbage', 'lettuce', 'cucumber',
  'carrot', 'beetroot', 'spinach', 'kale', 'okra', 'eggplant', 'pumpkin',

  // Fruits
  'apple', 'orange', 'mango', 'pineapple', 'papaya', 'watermelon', 'melon',
  'grape', 'strawberry', 'raspberry', 'blueberry', 'blackberry',
  'avocado', 'coconut', 'date', 'fig', 'guava', 'passion fruit',

  // Livestock
  'cattle', 'cow', 'bull', 'ox', 'buffalo', 'goat', 'sheep', 'pig', 'swine',
  'chicken', 'poultry', 'duck', 'goose', 'turkey', 'rabbit', 'fish',

  // Equipment
  'tractor', 'plow', 'plough', 'cultivator', 'harrow', 'seeder', 'planter',
  'harvester', 'thresher', 'combine', 'mower', 'rake', 'baler',
  'sprayer', 'spreader', 'tiller', 'hoe', 'spade', 'fork', 'shovel',

  // Supplies
  'fertilizer', 'pesticide', 'herbicide', 'fungicide', 'insecticide',
  'seeds', 'seedlings', 'irrigation', 'water', 'compost', 'manure',
  'mulch', 'soil', 'feed', 'fodder', 'hay', 'silage'
];

// Spelling variations and common typos
const commonMisspellings: Record<string, string[]> = {
  'fertilizer': ['fertiliser', 'fertilyzer', 'fertillizer', 'fertalizer'],
  'pesticide': ['pestiside', 'pestacide', 'pesticcide'],
  'herbicide': ['herbiside', 'herbacide', 'herbiccide'],
  'tractor': ['tracktor', 'tracter', 'tractoor'],
  'equipment': ['equippment', 'equipement', 'equpment'],
  'irrigation': ['irriation', 'irigaton', 'irrigatin'],
  'harvest': ['harvist', 'harvset', 'harvets'],
  'livestock': ['livstock', 'lifestock', 'liveshtock'],
  'poultry': ['poltry', 'poultrey', 'poultri'],
  'vegetable': ['vegitable', 'vegtable', 'vegetabel'],
  'agriculture': ['agiculture', 'agricultre', 'agricutlure']
};

class DidYouMean {
  private terms: string[];
  private misspellings: Record<string, string[]>;

  constructor() {
    this.terms = agriculturalTerms;
    this.misspellings = commonMisspellings;
  }

  // Get suggestions for a misspelled term
  getSuggestions(searchTerm: string, maxSuggestions = 3): string[] {
    if (!searchTerm || searchTerm.length < 2) return [];

    const normalizedSearch = searchTerm.toLowerCase().trim();
    const suggestions: Array<{ term: string; score: number }> = [];

    // Check exact matches first
    if (this.terms.includes(normalizedSearch)) {
      return [];
    }

    // Check for common misspellings
    for (const [correct, variants] of Object.entries(this.misspellings)) {
      if (variants.includes(normalizedSearch)) {
        return [correct];
      }
    }

    // Calculate similarity scores for all terms
    this.terms.forEach(term => {
      const score = getSimilarityScore(normalizedSearch, term);

      // Only consider terms with reasonable similarity
      if (score >= 0.6 && score < 1.0) {
        suggestions.push({ term, score });
      }
    });

    // Sort by similarity score and return top suggestions
    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSuggestions)
      .map(s => s.term);
  }

  // Check if a term might be misspelled
  isPossibleMisspelling(searchTerm: string): boolean {
    if (!searchTerm || searchTerm.length < 2) return false;

    const normalizedSearch = searchTerm.toLowerCase().trim();

    // If it's an exact match, it's not misspelled
    if (this.terms.includes(normalizedSearch)) return false;

    // Check if we have suggestions
    return this.getSuggestions(searchTerm).length > 0;
  }

  // Get the best suggestion for a term
  getBestSuggestion(searchTerm: string): string | null {
    const suggestions = this.getSuggestions(searchTerm, 1);
    return suggestions.length > 0 ? suggestions[0] : null;
  }

  // Add custom terms (for extensibility)
  addTerms(newTerms: string[]): void {
    this.terms.push(...newTerms.map(term => term.toLowerCase()));
  }

  // Add custom misspelling mappings
  addMisspellings(mapping: Record<string, string[]>): void {
    Object.entries(mapping).forEach(([correct, variants]) => {
      if (this.misspellings[correct]) {
        this.misspellings[correct].push(...variants);
      } else {
        this.misspellings[correct] = variants;
      }
    });
  }
}

export const didYouMean = new DidYouMean();

// Hook for React components
export const useDidYouMean = () => {
  const getSuggestions = (searchTerm: string, maxSuggestions?: number) => {
    return didYouMean.getSuggestions(searchTerm, maxSuggestions);
  };

  const isPossibleMisspelling = (searchTerm: string) => {
    return didYouMean.isPossibleMisspelling(searchTerm);
  };

  const getBestSuggestion = (searchTerm: string) => {
    return didYouMean.getBestSuggestion(searchTerm);
  };

  return {
    getSuggestions,
    isPossibleMisspelling,
    getBestSuggestion
  };
};