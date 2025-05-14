// This script adds test data for Farm Machinery and Tractors
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addFarmMachineryTestData() {
  try {
    console.log('Starting to add Farm Machinery test data...');

    // Get the first user to associate with the ads
    const user = await prisma.user.findFirst();
    if (!user) {
      console.error('No users found in the database. Please create a user first.');
      return;
    }

    // Farm Machinery test data
    const farmMachineryAds = [
      {
        title: 'New Holland Tractor - Model T7',
        category: 'Farm Machinery',
        subcategory: 'Tractors',
        section: 'Machinery',
        location: 'Lagos, Nigeria',
        price: 15000000,
        description: 'Brand new New Holland T7 tractor with 180 horsepower. Perfect for large-scale farming operations.',
        contact: '08012345678',
        images: ['/placeholder.png'],
        status: 'Active',
        userId: user.id
      },
      {
        title: 'John Deere Tractor - Model 5E',
        category: 'Farm Machinery',
        subcategory: 'Tractors',
        section: 'Machinery',
        location: 'Abuja, Nigeria',
        price: 12000000,
        description: 'Used John Deere 5E series tractor in excellent condition. 75 horsepower, perfect for medium-sized farms.',
        contact: '08023456789',
        images: ['/placeholder.png'],
        status: 'Active',
        userId: user.id
      },
      {
        title: 'Massey Ferguson Tractor - Model 240',
        category: 'Farm Machinery',
        subcategory: 'Tractors',
        section: 'Machinery',
        location: 'Kano, Nigeria',
        price: 8000000,
        description: 'Reliable Massey Ferguson 240 tractor. 50 horsepower, ideal for small to medium farms.',
        contact: '08034567890',
        images: ['/placeholder.png'],
        status: 'Active',
        userId: user.id
      },
      {
        title: 'Kubota Tractor - Model L5018',
        category: 'Farm Machinery',
        subcategory: 'Tractors',
        section: 'Machinery',
        location: 'Ibadan, Nigeria',
        price: 10000000,
        description: 'Kubota L5018 compact tractor. 50 horsepower, versatile and fuel-efficient.',
        contact: '08045678901',
        images: ['/placeholder.png'],
        status: 'Active',
        userId: user.id
      },
      {
        title: 'Disc Harrow - 20 Discs',
        category: 'Farm Machinery',
        subcategory: 'Harrows',
        section: 'Machinery',
        location: 'Enugu, Nigeria',
        price: 2500000,
        description: 'Heavy-duty disc harrow with 20 discs. Perfect for soil preparation and weed control.',
        contact: '08056789012',
        images: ['/placeholder.png'],
        status: 'Active',
        userId: user.id
      },
      {
        title: 'Seed Planter - 4 Row',
        category: 'Farm Machinery',
        subcategory: 'Seeders',
        section: 'Machinery',
        location: 'Port Harcourt, Nigeria',
        price: 1800000,
        description: '4-row seed planter for maize, soybeans, and other crops. Increases planting efficiency.',
        contact: '08067890123',
        images: ['/placeholder.png'],
        status: 'Active',
        userId: user.id
      }
    ];

    // Create the ads
    for (const adData of farmMachineryAds) {
      const existingAd = await prisma.ad.findFirst({
        where: {
          title: adData.title,
          category: adData.category
        }
      });

      if (existingAd) {
        console.log(`Ad "${adData.title}" already exists, skipping...`);
        continue;
      }

      const ad = await prisma.ad.create({
        data: adData
      });

      console.log(`Created ad: ${ad.title} (${ad.category} - ${ad.subcategory})`);
    }

    console.log('Farm Machinery test data added successfully!');
  } catch (error) {
    console.error('Error adding Farm Machinery test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
addFarmMachineryTestData();
