import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { navigation } from '@/constants';

export const revalidate = 300; // Revalidate every 5 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const category = searchParams.get('category');
    const subCategory = searchParams.get('subCategory');
    const section = searchParams.get('section');
    const searchQuery = searchParams.get('q');
    const sortBy = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '10000000000');

    // Get locations filter
    const locations = searchParams.getAll('locations');

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Base query conditions
    const whereConditions: any = {
      status: 'active',
      price: {
        gte: minPrice,
        lte: maxPrice
      }
    };

    // Add category filter
    if (category && category !== 'All') {
      // Create a more flexible category matching approach
      // This will match both exact and partial matches, and handle variations in naming

      // First, normalize the category name by removing special characters and converting to lowercase
      const normalizedCategory = category.toLowerCase().replace(/[&-]/g, ' ');

      // Create an array of possible variations of the category name
      const categoryVariations = [
        category,                                  // Original category
        normalizedCategory,                        // Normalized category
        ...normalizedCategory.split(' ')           // Individual words in the category
      ];

      // Find the category in the navigation structure
      const navCategory = navigation.categories.find(
        cat => cat.name.toLowerCase() === category.toLowerCase()
      );

      if (navCategory) {
        console.log(`Found category in navigation: ${navCategory.name}`);

        // Get all subcategories for this category
        const subcategories = navCategory.items
          .filter(item => item.name !== 'Browse All')
          .map(item => item.name);

        console.log(`Found subcategories for ${navCategory.name}:`, subcategories);

        // Create a comprehensive query for this category
        whereConditions.OR = [
          // Direct category match
          { category: { equals: navCategory.name, mode: 'insensitive' } },

          // Match by subcategories - with more flexible matching
          ...subcategories.map(sub => ({
            subcategory: { contains: sub, mode: 'insensitive' }
          }))
        ];

        // No special handling needed for Farm Machinery anymore
        // We're using the simplified category structure from constants/index.ts

        // Log the exact query for debugging
        console.log(`Category query for ${navCategory.name}:`, JSON.stringify(whereConditions.OR, null, 2));
      } else {
        // Create OR conditions for all variations
        whereConditions.OR = categoryVariations.flatMap(cat => [
          { category: { equals: cat, mode: 'insensitive' } },
          { category: { contains: cat, mode: 'insensitive' } },
          { subcategory: { equals: cat, mode: 'insensitive' } },
          { subcategory: { contains: cat, mode: 'insensitive' } }
        ]);
      }

      // Log the search conditions for debugging
      console.log(`Searching for category variations: ${JSON.stringify(categoryVariations)}`);
    }

    // Add section filter if provided
    if (section && section !== 'All') {
      console.log(`Filtering by section: ${section}`);

      // Create section conditions
      const sectionConditions = {
        OR: [
          { section: { equals: section, mode: 'insensitive' } },
          { section: { contains: section, mode: 'insensitive' } }
        ]
      };

      // If we have existing OR conditions (from category filter), we need to combine them with AND
      if (whereConditions.OR) {
        whereConditions.AND = [
          { OR: whereConditions.OR },
          sectionConditions
        ];
        // Remove the original OR since we've moved it into AND
        delete whereConditions.OR;
      } else {
        // If no existing OR conditions, just set the section conditions
        whereConditions.OR = sectionConditions.OR;
      }
    }

    // Add subcategory filter if provided
    if (subCategory && subCategory !== 'All') {
      // Normalize the subcategory name
      const normalizedSubCategory = subCategory.toLowerCase().replace(/[&-]/g, ' ');

      // Create an array of possible variations of the subcategory name
      const subCategoryVariations = [
        subCategory,                                  // Original subcategory
        normalizedSubCategory,                        // Normalized subcategory
        ...normalizedSubCategory.split(' ')           // Individual words in the subcategory
      ];

      // Find the main category that contains this subcategory
      const mainCategory = navigation.categories.find(cat =>
        cat.items.some(item =>
          subCategoryVariations.some(variant =>
            item.name.toLowerCase().includes(variant.toLowerCase())
          )
        )
      );

      // Create subcategory conditions
      let subCategoryConditions;

      // Find the subcategory in the navigation structure
      let foundSubcategory = false;

      // Look through all categories to find the subcategory
      for (const navCategory of navigation.categories) {
        const item = navCategory.items.find(
          item => item.name.toLowerCase() === subCategory.toLowerCase() && item.name !== 'Browse All'
        );

        if (item) {
          foundSubcategory = true;
          console.log(`Found subcategory ${subCategory} in category ${navCategory.name}`);

          // Add the category condition to the main whereConditions
          whereConditions.category = { equals: navCategory.name, mode: 'insensitive' };
          break;
        }
      }

      if (foundSubcategory) {
        console.log(`Using special handling for subcategory: ${subCategory}`);

        subCategoryConditions = {
          OR: [
            // Direct match with more flexible options
            { subcategory: { equals: subCategory, mode: 'insensitive' } },
            { subcategory: { contains: subCategory, mode: 'insensitive' } }
          ]
        };

        // No special handling needed for Tractors subcategory anymore
        // We're using the simplified category structure from constants/index.ts

        // Log the exact query for debugging
        console.log(`Subcategory query for ${subCategory}:`, JSON.stringify(subCategoryConditions, null, 2));
      } else {
        subCategoryConditions = {
          OR: subCategoryVariations.flatMap(subCat => [
            { subcategory: { equals: subCat, mode: 'insensitive' } },
            { subcategory: { contains: subCat, mode: 'insensitive' } },
            { section: { equals: subCat, mode: 'insensitive' } },
            { section: { contains: subCat, mode: 'insensitive' } }
          ])
        };
      }

      // If we have existing OR conditions (from category filter), we need to combine them with AND
      if (whereConditions.OR) {
        whereConditions.AND = [
          { OR: whereConditions.OR },
          subCategoryConditions
        ];
        // Remove the original OR since we've moved it into AND
        delete whereConditions.OR;
      } else {
        // If no existing OR conditions, just set the subcategory conditions
        whereConditions.OR = subCategoryConditions.OR;
      }

      // Log the subcategory search conditions for debugging
      console.log(`Searching for subcategory variations: ${JSON.stringify(subCategoryVariations)}`);

      // If we found a matching main category, also include its name in the search
      if (mainCategory) {
        console.log(`Found matching main category: ${mainCategory.name}`);

        // Add the category to the query - we can't use complex conditions directly
        // so we'll add individual conditions for each subcategory variation
        for (const subCatVariation of subCategoryVariations) {
          subCategoryConditions.OR.push(
            { subcategory: { contains: subCatVariation, mode: 'insensitive' } }
          );
        }

        // Add the category condition to the main whereConditions
        whereConditions.category = { equals: mainCategory.name, mode: 'insensitive' };
      }
    }

    // Add search query filter
    if (searchQuery) {
      // Create search conditions
      const searchConditions = {
        OR: [
          { title: { contains: searchQuery, mode: 'insensitive' } },
          { description: { contains: searchQuery, mode: 'insensitive' } }
        ]
      };

      // If we have existing AND conditions (from combined category and subcategory filters)
      if (whereConditions.AND) {
        // Add the search conditions to the existing AND array
        whereConditions.AND.push(searchConditions);
      }
      // If we have existing OR conditions but no AND conditions
      else if (whereConditions.OR) {
        // Create AND conditions with the existing OR and new search conditions
        whereConditions.AND = [
          { OR: whereConditions.OR },
          searchConditions
        ];
        // Remove the original OR since we've moved it into AND
        delete whereConditions.OR;
      }
      // If we have neither AND nor OR conditions
      else {
        // Just set the search conditions directly
        whereConditions.OR = searchConditions.OR;
      }

      // Log the search query for debugging
      console.log(`Searching for query: "${searchQuery}"`);
    }

    // Add locations filter
    if (locations.length > 0) {
      whereConditions.location = {
        in: locations
      };
    }

    // Determine sort order
    let orderBy: any[] = [];

    switch (sortBy) {
      case 'price_low':
        orderBy = [{ price: 'asc' }];
        break;
      case 'price_high':
        orderBy = [{ price: 'desc' }];
        break;
      case 'popular':
        orderBy = [{ views: 'desc' }, { clicks: 'desc' }];
        break;
      case 'newest':
      default:
        orderBy = [{ createdAt: 'desc' }];
        break;
    }

    // Always prioritize boosted ads
    orderBy = [
      { boostMultiplier: 'desc' },
      { featuredOnHome: 'desc' },
      ...orderBy
    ];

    // Fetch products
    console.time('prisma.ad.findMany');
    console.log('Starting prisma.ad.findMany query with conditions:', JSON.stringify(whereConditions, null, 2));
    console.time('prisma.ad.findMany');
    const products = await prisma.ad.findMany({
      where: whereConditions,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        price: true,
        category: true,
        subcategory: true,
        section: true,
        location: true,
        images: true,
        views: true,
        clicks: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            name: true,
            id: true,
            image: true
          }
        }
      }
    });
    console.timeEnd('prisma.ad.findMany');
    console.log('Finished prisma.ad.findMany query. Found products count:', products.length);

    // Get total count for pagination
    console.time('prisma.ad.count');
    console.log('Starting prisma.ad.count query with conditions:', JSON.stringify(whereConditions, null, 2));
    console.time('prisma.ad.count');
    const totalCount = await prisma.ad.count({
      where: whereConditions
    });
    console.timeEnd('prisma.ad.count');
    console.log('Finished prisma.ad.count query. Total count:', totalCount);

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    // Get all available categories
    console.time('prisma.ad.groupBy (categories)');
    console.log('Starting prisma.ad.groupBy (categories) query.');
    console.time('prisma.ad.groupBy (categories)');
    const categories = await prisma.ad.groupBy({
      by: ['category'],
      where: {
        status: 'active'
      },
      _count: {
        category: true
      },
      orderBy: {
        _count: {
          category: 'desc'
        }
      }
    });
    console.timeEnd('prisma.ad.groupBy (categories)');
    console.log('Finished prisma.ad.groupBy (categories) query. Found categories count:', categories.length);

    // Get all available locations
    console.time('prisma.ad.groupBy (locations)');
    console.log('Starting prisma.ad.groupBy (locations) query.');
    console.time('prisma.ad.groupBy (locations)');
    const availableLocations = await prisma.ad.groupBy({
      by: ['location'],
      where: {
        status: 'active'
      },
      _count: {
        location: true
      },
      orderBy: {
        _count: {
          location: 'desc'
        }
      }
    });
    console.timeEnd('prisma.ad.groupBy (locations)');
    console.log('Finished prisma.ad.groupBy (locations) query. Found locations count:', availableLocations.length);

    // Calculate average rating (mock data for now, could be replaced with real ratings later)
    const productsWithRatings = products.map(product => {
      // Generate a random rating between 4.0 and 5.0
      const rating = (4 + Math.random()).toFixed(1);
      // Generate a random number of reviews between 10 and 200
      const reviews = Math.floor(Math.random() * 190) + 10;

      return {
        ...product,
        rating: parseFloat(rating),
        reviews
      };
    });

    // Get subcategories based on the navigation constants
    const getSubcategories = () => {
      // If a specific category is selected, return its subcategories
      if (category && category !== 'All') {
        console.log(`Getting subcategories for ${category}`);

        // Find the category in the navigation structure
        const categoryData = navigation.categories.find(
          cat => cat.name.toLowerCase() === category.toLowerCase()
        );

        if (categoryData) {
          // Get items directly from the category
          const subcategories = categoryData.items
            .filter(item => item.name !== 'Browse All') // Filter out "Browse All" items
            .map(item => ({
              name: item.name,
              href: item.href
            }));

          console.log(`Found ${subcategories.length} subcategories for ${category}:`,
            subcategories.map(sub => sub.name).join(', '));

          return subcategories;
        } else {
          console.log(`No category data found for ${category}`);
          return [];
        }
      }

      // Otherwise return all subcategories grouped by main category
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

    const response = NextResponse.json({
      products: productsWithRatings,
      categories: categories.map(c => c.category),
      locations: availableLocations.map(l => l.location),
      subcategories: getSubcategories(),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

    // Add caching headers
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    
    return response;
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch products',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
