import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSampleChats() {
  try {
    console.log('🚀 Creating sample support chats...\n');

    // Get existing users (admin, agent, and regular users)
    const users = await prisma.user.findMany({
      where: {
        role: { in: ['user'] }
      },
      take: 3
    });

    const agent = await prisma.agent.findFirst({
      include: {
        user: true
      }
    });

    if (users.length === 0) {
      console.log('❌ No users found. Creating a test user...');

      // Create a test user if none exist
      const testUser = await prisma.user.create({
        data: {
          name: 'Test Customer',
          email: 'customer@example.com',
          verified: true,
          role: 'user'
        }
      });
      users.push(testUser);
    }

    // Create sample support tickets
    const sampleTickets = [
      {
        subject: 'Payment Issue with Ad Posting',
        priority: 3, // High
        category: 'Payment',
        status: 'pending',
        userId: users[0]?.id,
        agentId: null,
        messages: [
          {
            content: 'I am unable to post my ad because my payment keeps getting declined. I have tried multiple cards but none work.',
            senderId: users[0]?.id,
            isAgentReply: false
          }
        ]
      },
      {
        subject: 'Account Verification Problem',
        priority: 2, // Medium
        category: 'Account',
        status: 'active',
        userId: users[1]?.id || users[0]?.id,
        agentId: agent?.id,
        messages: [
          {
            content: 'I have not received my email verification link after multiple attempts. Please help me verify my account.',
            senderId: users[1]?.id || users[0]?.id,
            isAgentReply: false
          },
          {
            content: 'Hello! I can help you with that. Let me check your account status and resend the verification email.',
            senderId: agent?.userId,
            isAgentReply: true
          }
        ]
      },
      {
        subject: 'Ad Performance Questions',
        priority: 1, // Low
        category: 'General',
        status: 'closed',
        userId: users[2]?.id || users[0]?.id,
        agentId: agent?.id,
        messages: [
          {
            content: 'How can I improve the visibility of my ads? They are not getting enough views.',
            senderId: users[2]?.id || users[0]?.id,
            isAgentReply: false
          },
          {
            content: 'Here are some tips to improve your ad visibility: 1) Use high-quality images, 2) Write detailed descriptions, 3) Choose the right category and location.',
            senderId: agent?.userId,
            isAgentReply: true
          },
          {
            content: 'Thank you so much! This was very helpful.',
            senderId: users[2]?.id || users[0]?.id,
            isAgentReply: false
          }
        ]
      },
      {
        subject: 'Technical Bug Report',
        priority: 2, // Medium
        category: 'Technical',
        status: 'pending',
        userId: users[0]?.id,
        agentId: null,
        messages: [
          {
            content: 'The website keeps crashing when I try to upload images to my ad. This happens on both Chrome and Firefox.',
            senderId: users[0]?.id,
            isAgentReply: false
          }
        ]
      }
    ];

    for (const ticketData of sampleTickets) {
      const { messages, ...ticketInfo } = ticketData;

      // Create the support ticket
      const ticket = await prisma.supportTicket.create({
        data: ticketInfo
      });

      // Create messages for this ticket
      for (const messageData of messages) {
        if (messageData.senderId) {
          await prisma.supportMessage.create({
            data: {
              ...messageData,
              ticketId: ticket.id,
              senderId: messageData.senderId
            }
          });
        }
      }

      console.log(`✅ Created ticket: ${ticket.subject}`);
    }

    console.log('\n🎉 Sample chats created successfully!');
    console.log('\nYou can now view these chats in the Admin Dashboard > Chats tab');

  } catch (error) {
    console.error('❌ Error creating sample chats:', error);
    throw error;
  }
}

async function main() {
  try {
    await createSampleChats();
  } catch (error) {
    console.error('🚨 Failed to create sample chats:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  main();
}

export { createSampleChats };