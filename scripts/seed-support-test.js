const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedSupportTestData() {
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

    // Create support tickets
    const ticket1 = await prisma.supportTicket.create({
      data: {
        subject: 'Unable to upload images for my ad',
        priority: 3,
        category: 'technical',
        status: 'open',
        userId: user.id,
        attachments: []
      }
    });

    const ticket2 = await prisma.supportTicket.create({
      data: {
        subject: 'Question about subscription pricing',
        priority: 2,
        category: 'billing',
        status: 'closed',
        userId: user.id,
        attachments: []
      }
    });

    const ticket3 = await prisma.supportTicket.create({
      data: {
        subject: 'How to promote my farm produce ads?',
        priority: 1,
        category: 'general',
        status: 'open',
        userId: user.id,
        attachments: []
      }
    });

    console.log('Created support tickets:', ticket1.subject, ticket2.subject, ticket3.subject);

    // Create support messages for tickets
    const messages = [
      // Messages for ticket 1 (image upload issue)
      {
        ticketId: ticket1.id,
        senderId: user.id,
        content: 'Hi, I\'m trying to upload photos of my organic tomatoes but the upload keeps failing. I\'ve tried different browsers and the images are under 5MB. Can you help?',
        isAgentReply: false
      },
      {
        ticketId: ticket1.id,
        senderId: user.id, // Simulating agent reply with user ID for now
        content: 'Thank you for contacting support. Can you please tell me what error message you\'re seeing when the upload fails? Also, what image formats are you trying to upload?',
        isAgentReply: true
      },
      {
        ticketId: ticket1.id,
        senderId: user.id,
        content: 'The error says "Upload failed, please try again". I\'m trying to upload JPG files, each around 2-3MB in size. I have 5 photos total.',
        isAgentReply: false
      },

      // Messages for ticket 2 (billing question)
      {
        ticketId: ticket2.id,
        senderId: user.id,
        content: 'I\'d like to understand the difference between the Gold and Platinum subscription plans. What additional benefits does Platinum offer?',
        isAgentReply: false
      },
      {
        ticketId: ticket2.id,
        senderId: user.id, // Simulating agent reply
        content: 'Great question! The Platinum plan includes all Gold benefits plus exclusive placement opportunities, priority customer support, and a 20% discount on ad boosts compared to 10% with Gold. You also get dedicated account management for high-volume advertisers.',
        isAgentReply: true
      },
      {
        ticketId: ticket2.id,
        senderId: user.id,
        content: 'That sounds perfect for my business. How do I upgrade to Platinum?',
        isAgentReply: false
      },
      {
        ticketId: ticket2.id,
        senderId: user.id, // Simulating agent reply
        content: 'You can upgrade directly from your Payments & Billing section in the dashboard. Click on "Upgrade Plan" and select Platinum. The change will take effect immediately and you\'ll be charged the prorated amount.',
        isAgentReply: true
      },

      // Messages for ticket 3 (general question)
      {
        ticketId: ticket3.id,
        senderId: user.id,
        content: 'I\'m new to online advertising and want to make sure my farm produce ads get good visibility. What are the best practices for promoting ads on your platform?',
        isAgentReply: false
      }
    ];

    // Create all messages
    for (let messageData of messages) {
      await prisma.supportMessage.create({
        data: messageData
      });
    }

    console.log(`Created ${messages.length} support messages`);

    console.log('✅ Sample support data created successfully for', user.name);
    console.log('📊 Summary:');
    console.log('- Support Tickets: 3 (2 open, 1 closed)');
    console.log('- Categories: Technical, Billing, General');
    console.log('- Priorities: High, Medium, Low');
    console.log(`- Messages: ${messages.length} total`);

  } catch (error) {
    console.error('Error seeding support test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSupportTestData();