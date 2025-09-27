const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testProfileData() {
  try {
    // Find Sarah Adebayo's user record
    const user = await prisma.user.findUnique({
      where: { email: 'sarah.farmer@agromarket.ng' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      console.log('Sarah Adebayo user not found');
      return;
    }

    console.log('✅ Current Sarah Adebayo Profile:');
    console.log(JSON.stringify(user, null, 2));

    // Update phone if not set
    if (!user.phone) {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { phone: '+234 801 234 5678' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        }
      });

      console.log('\n✅ Updated Sarah Profile with phone:');
      console.log(JSON.stringify(updatedUser, null, 2));
    }

    // Check notification preferences
    let notificationPrefs = await prisma.notificationPreferences.findUnique({
      where: { userId: user.id }
    });

    if (!notificationPrefs) {
      notificationPrefs = await prisma.notificationPreferences.create({
        data: {
          userId: user.id,
          emailForAdActivity: true,
          emailForPromotions: true,
          smsForPromotions: false,
          emailForMessages: true,
          emailForPayments: true,
        }
      });
      console.log('\n✅ Created default notification preferences for Sarah');
    }

    console.log('\n✅ Sarah\'s Notification Preferences:');
    console.log(JSON.stringify(notificationPrefs, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testProfileData();