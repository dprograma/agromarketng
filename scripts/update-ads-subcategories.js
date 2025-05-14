// This script updates existing ads with subcategory information based on their category
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');
const fs = require('fs');

// Define the categories and navigation structure manually since we can't import from constants
const navigation = {
  categories: [
    {
      id: 'farm-animals',
      name: 'Farm Animals',
      sections: [
        {
          id: 'animals',
          name: 'Animals',
          items: [
            { name: 'Cattle', href: '#' },
            { name: 'Goats', href: '#' },
            { name: 'Sheep', href: '#' },
            { name: 'Pigs', href: '#' },
            { name: 'Horses', href: '#' },
            { name: 'Rabbits', href: '#' },
            { name: 'Browse All', href: '#' },
          ],
        },
      ],
    },
    {
      id: 'poultry',
      name: 'Poultry',
      sections: [
        {
          id: 'birds',
          name: 'Birds',
          items: [
            { name: 'Chickens', href: '#' },
            { name: 'Ducks', href: '#' },
            { name: 'Turkeys', href: '#' },
            { name: 'Geese', href: '#' },
            { name: 'Quails', href: '#' },
            { name: 'Pigeons', href: '#' },
            { name: 'Browse All', href: '#' },
          ],
        },
      ],
    },
    {
      id: 'plants',
      name: 'Plants',
      sections: [
        {
          id: 'crops',
          name: 'Crops',
          items: [
            { name: 'Vegetables', href: '#' },
            { name: 'Fruits', href: '#' },
            { name: 'Herbs', href: '#' },
            { name: 'Legumes', href: '#' },
            { name: 'Tubers', href: '#' },
            { name: 'Spices', href: '#' },
            { name: 'Browse All', href: '#' },
          ],
        },
        {
          id: 'cereals',
          name: 'Cereals & Grains',
          items: [
            { name: 'Maize', href: '#' },
            { name: 'Rice', href: '#' },
            { name: 'Wheat', href: '#' },
            { name: 'Millet', href: '#' },
            { name: 'Sorghum', href: '#' },
            { name: 'Oats', href: '#' },
            { name: 'Browse All', href: '#' },
          ],
        },
      ],
    },
    {
      id: 'machinery',
      name: 'Farm Machinery',
      sections: [
        {
          id: 'machinery',
          name: 'Machinery',
          items: [
            { name: 'Tractors', href: '#' },
            { name: 'Ploughs', href: '#' },
            { name: 'Harrows', href: '#' },
            { name: 'Seeders', href: '#' },
            { name: 'Harvesters', href: '#' },
            { name: 'Cultivators', href: '#' },
            { name: 'Browse All', href: '#' },
          ],
        },
        {
          id: 'tools',
          name: 'Tools',
          items: [
            { name: 'Hoes', href: '#' },
            { name: 'Spades', href: '#' },
            { name: 'Rakes', href: '#' },
            { name: 'Watering Cans', href: '#' },
            { name: 'Sickles', href: '#' },
            { name: 'Browse All', href: '#' },
          ],
        },
      ],
    },
    {
      id: 'accessories',
      name: 'Farm Accessories',
      sections: [
        {
          id: 'accessories',
          name: 'Farm Accessories',
          items: [
            { name: 'Fencing', href: '#' },
            { name: 'Feeders & Drinkers', href: '#' },
            { name: 'Storage Bins', href: '#' },
            { name: 'Greenhouses', href: '#' },
            { name: 'Irrigation Systems', href: '#' },
            { name: 'Fertilizer Dispensers', href: '#' },
            { name: 'Browse All', href: '#' },
          ],
        },
      ],
    },
  ]
};

async function updateAdsWithSubcategories() {
  try {
    console.log('Starting to update ads with subcategory information...');

    // Get all ads
    const ads = await prisma.ad.findMany();
    console.log(`Found ${ads.length} ads to process`);

    let updatedCount = 0;
    let skippedCount = 0;

    // Process each ad
    for (const ad of ads) {
      // Find the category in navigation
      const categoryData = navigation.categories.find(
        cat => cat.name === ad.category
      );

      if (categoryData) {
        // Get the first section and subcategory as default
        const firstSection = categoryData.sections[0];
        const firstSubcategory = firstSection.items.find(item => item.name !== 'Browse All');

        if (firstSection && firstSubcategory) {
          // Update the ad with subcategory and section
          await prisma.ad.update({
            where: { id: ad.id },
            data: {
              subcategory: firstSubcategory.name,
              section: firstSection.name
            }
          });

          updatedCount++;
          console.log(`Updated ad ${ad.id} - "${ad.title}" with subcategory: ${firstSubcategory.name}, section: ${firstSection.name}`);
        } else {
          skippedCount++;
          console.log(`Skipped ad ${ad.id} - "${ad.title}" - No suitable subcategory found`);
        }
      } else {
        skippedCount++;
        console.log(`Skipped ad ${ad.id} - "${ad.title}" - Category "${ad.category}" not found in navigation`);
      }
    }

    console.log(`\nUpdate complete!`);
    console.log(`Updated: ${updatedCount} ads`);
    console.log(`Skipped: ${skippedCount} ads`);

  } catch (error) {
    console.error('Error updating ads:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update function
updateAdsWithSubcategories();
