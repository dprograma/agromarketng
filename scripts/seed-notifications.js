// This script seeds notifications for all users
// Run with: node scripts/seed-notifications.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { formatDistanceToNow } = require('date-fns');

async function main() {
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    console.log(`Found ${users.length} users`);

    // Notification types
    const notificationTypes = ['ad', 'promotion', 'payment', 'payment-failed'];
    
    // Sample messages for each type
    const messages = {
      ad: [
        '🎉 Your ad "Organic Tomatoes" has been approved!',
        '🎉 Your ad "Premium Cattle Feed" has been approved!',
        '🎉 Your ad "Farm Equipment" has been approved!',
      ],
      promotion: [
        '⏳ Your featured ad boost expires in 3 days!',
        '⏳ Your category boost expires in 5 days!',
        '⏳ Your premium listing expires in 2 days!',
      ],
      payment: [
        '✅ Payment for ad promotion was successful.',
        '✅ Payment for subscription renewal was successful.',
        '✅ Payment for featured listing was successful.',
      ],
      'payment-failed': [
        '⚠️ Your payment for "Premium Listing" failed.',
        '⚠️ Your payment for "Subscription Renewal" failed.',
        '⚠️ Your payment for "Ad Boost" failed.',
      ],
    };

    // Time periods
    const timePeriods = ['2h ago', '1d ago', '3d ago', '1w ago'];

    // Create notifications for each user
    for (const user of users) {
      console.log(`Creating notifications for user: ${user.name} (${user.email})`);
      
      // Check if user already has notifications
      const existingCount = await prisma.notification.count({
        where: {
          userId: user.id,
        },
      });
      
      if (existingCount > 0) {
        console.log(`User ${user.email} already has ${existingCount} notifications. Skipping.`);
        continue;
      }
      
      // Create 3-7 random notifications for each user
      const notificationCount = Math.floor(Math.random() * 5) + 3;
      const notifications = [];
      
      for (let i = 0; i < notificationCount; i++) {
        const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
        const message = messages[type][Math.floor(Math.random() * messages[type].length)];
        const time = timePeriods[Math.floor(Math.random() * timePeriods.length)];
        const read = Math.random() > 0.5; // 50% chance of being read
        
        notifications.push({
          userId: user.id,
          type,
          message,
          time,
          read,
        });
      }
      
      // Create notifications in database
      const result = await prisma.notification.createMany({
        data: notifications,
      });
      
      console.log(`Created ${result.count} notifications for user ${user.email}`);
    }

    console.log('Notification seeding completed successfully');
  } catch (error) {
    console.error('Error seeding notifications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
