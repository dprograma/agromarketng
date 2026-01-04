const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedNotificationTestData() {
  try {
    // Find Sarah Adebayo's user record
    const user = await prisma.user.findUnique({
      where: { email: 'sarah.farmer@agromarket.ng' }
    });

    if (!user) {
      console.log('Sarah Adebayo user not found');
      return;
    }

    console.log('Found user:', user.name, 'ID:', user.id);

    // Check if notifications already exist
    const existingNotifications = await prisma.notification.count({
      where: { userId: user.id }
    });

    if (existingNotifications > 0) {
      console.log(`User already has ${existingNotifications} notifications`);
      return;
    }

    // Create sample notifications
    const notifications = [
      {
        userId: user.id,
        type: 'ad',
        message: '🎉 Your ad "Fresh Organic Tomatoes" has been approved!',
        time: '2 hours ago',
        read: false
      },
      {
        userId: user.id,
        type: 'promotion',
        message: '⏳ Your featured ad boost expires in 3 days!',
        time: '1 day ago',
        read: false
      },
      {
        userId: user.id,
        type: 'payment',
        message: '✅ Payment for ad promotion was successful.',
        time: '2 days ago',
        read: true
      },
      {
        userId: user.id,
        type: 'payment-failed',
        message: '⚠️ Your payment for "Premium Listing" failed.',
        time: '3 days ago',
        read: false
      },
      {
        userId: user.id,
        type: 'ad',
        message: '📝 Your ad "Organic Vegetables Bundle" is pending review.',
        time: '5 hours ago',
        read: true
      },
      {
        userId: user.id,
        type: 'promotion',
        message: '🚀 Your ad has received 50+ views today!',
        time: '6 hours ago',
        read: false
      },
      {
        userId: user.id,
        type: 'payment',
        message: '💳 New payment method added successfully.',
        time: '1 week ago',
        read: true
      },
      {
        userId: user.id,
        type: 'ad',
        message: '✨ Your ad "Premium Farm Equipment" is now live!',
        time: '3 days ago',
        read: false
      }
    ];

    // Create notifications in batches
    const createdNotifications = await prisma.notification.createMany({
      data: notifications
    });

    console.log(`✅ Created ${createdNotifications.count} notifications for ${user.name}`);
    console.log('📊 Notification Summary:');
    console.log(`- Total notifications: ${createdNotifications.count}`);
    console.log(`- Unread notifications: ${notifications.filter(n => !n.read).length}`);
    console.log(`- Read notifications: ${notifications.filter(n => n.read).length}`);
    console.log(`- Ad notifications: ${notifications.filter(n => n.type === 'ad').length}`);
    console.log(`- Payment notifications: ${notifications.filter(n => n.type === 'payment' || n.type === 'payment-failed').length}`);
    console.log(`- Promotion notifications: ${notifications.filter(n => n.type === 'promotion').length}`);

  } catch (error) {
    console.error('Error seeding notification test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedNotificationTestData();