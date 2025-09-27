const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestChats() {
  try {
    // Find the agent
    const agent = await prisma.agent.findFirst({
      include: {
        user: true
      }
    });

    if (!agent) {
      console.log('No agent found. Please create agent personas first.');
      return;
    }

    console.log('Found agent:', agent.user.name, 'ID:', agent.id);

    // Find or get test users
    let testUsers = await prisma.user.findMany({
      where: {
        role: 'user'
      },
      take: 3
    });

    if (testUsers.length === 0) {
      // Create test users if none exist
      testUsers = await Promise.all([
        prisma.user.create({
          data: {
            name: 'John Farmer',
            email: 'john.farmer@agromarket.ng',
            phone: '+234-803-555-0100',
            verified: true,
            role: 'user'
          }
        }),
        prisma.user.create({
          data: {
            name: 'Mary Trader',
            email: 'mary.trader@agromarket.ng',
            phone: '+234-803-555-0101',
            verified: true,
            role: 'user'
          }
        }),
        prisma.user.create({
          data: {
            name: 'David Agric',
            email: 'david.agric@agromarket.ng',
            phone: '+234-803-555-0102',
            verified: true,
            role: 'user'
          }
        })
      ]);
      console.log('Created test users');
    } else {
      console.log('Found existing test users');
    }

    // Create test chats with varying dates over the last 30 days
    const chats = [];
    const statuses = ['active', 'resolved', 'pending'];

    for (let i = 0; i < 15; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const chatDate = new Date();
      chatDate.setDate(chatDate.getDate() - daysAgo);

      const randomUser = testUsers[Math.floor(Math.random() * testUsers.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      const chat = await prisma.chat.create({
        data: {
          userId: randomUser.id,
          agentId: agent.id,
          status: status,
          topic: `Agricultural inquiry ${i + 1}`,
          createdAt: chatDate,
          updatedAt: chatDate
        }
      });

      chats.push(chat);

      // Create initial user message
      const userMessageTime = new Date(chatDate);
      userMessageTime.setMinutes(userMessageTime.getMinutes() + 1);

      await prisma.message.create({
        data: {
          chatId: chat.id,
          senderId: randomUser.id,
          content: `Hello, I need help with my ${['tomatoes', 'cassava', 'yams', 'corn', 'rice'][Math.floor(Math.random() * 5)]} farming business.`,
          isAgentReply: false,
          createdAt: userMessageTime
        }
      });

      // Create agent response (for resolved and some active chats)
      if (status === 'resolved' || (status === 'active' && Math.random() > 0.5)) {
        const agentResponseTime = new Date(userMessageTime);
        agentResponseTime.setMinutes(agentResponseTime.getMinutes() + Math.floor(Math.random() * 30) + 5); // 5-35 minutes response time

        await prisma.message.create({
          data: {
            chatId: chat.id,
            senderId: agent.userId,
            content: `Thank you for contacting us! I'd be happy to help you with your farming business. Let me provide you with some guidance.`,
            isAgentReply: true,
            createdAt: agentResponseTime
          }
        });

        // For resolved chats, add more back-and-forth messages
        if (status === 'resolved') {
          const userFollowUp = new Date(agentResponseTime);
          userFollowUp.setMinutes(userFollowUp.getMinutes() + Math.floor(Math.random() * 20) + 5);

          await prisma.message.create({
            data: {
              chatId: chat.id,
              senderId: randomUser.id,
              content: `Thank you! That helps a lot. I have one more question about pricing.`,
              isAgentReply: false,
              createdAt: userFollowUp
            }
          });

          const agentFinalResponse = new Date(userFollowUp);
          agentFinalResponse.setMinutes(agentFinalResponse.getMinutes() + Math.floor(Math.random() * 15) + 3);

          await prisma.message.create({
            data: {
              chatId: chat.id,
              senderId: agent.userId,
              content: `Great question! For pricing, I recommend checking our marketplace analytics and competitor pricing. Is there anything else I can help you with?`,
              isAgentReply: true,
              createdAt: agentFinalResponse
            }
          });

          const userResolution = new Date(agentFinalResponse);
          userResolution.setMinutes(userResolution.getMinutes() + 5);

          await prisma.message.create({
            data: {
              chatId: chat.id,
              senderId: randomUser.id,
              content: `Perfect! That's exactly what I needed. Thank you so much for your help!`,
              isAgentReply: false,
              createdAt: userResolution
            }
          });
        }
      }

      console.log(`Created chat: "${chat.topic}" (${status}) - ${daysAgo} days ago`);
    }

    console.log('✅ Test chats created successfully!');
    console.log('📊 Summary:');

    const statusCounts = {};
    for (const chat of chats) {
      statusCounts[chat.status] = (statusCounts[chat.status] || 0) + 1;
    }

    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   - ${status}: ${count} chats`);
    });

    console.log(`👨‍💼 Agent: ${agent.user.name} (${agent.user.email})`);
    console.log(`👥 Test users: ${testUsers.length} users created/found`);

  } catch (error) {
    console.error('Error creating test chats:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestChats();