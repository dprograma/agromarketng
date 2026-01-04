#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 Testing database connection...');

    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`📊 Users in database: ${userCount}`);

    // Test another table
    const adCount = await prisma.ad.count();
    console.log(`📊 Ads in database: ${adCount}`);

    console.log('✅ Database is working correctly!');

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();