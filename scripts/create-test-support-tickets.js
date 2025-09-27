const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestSupportTickets() {
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

    // Find or create a user for the test tickets
    let testUser = await prisma.user.findFirst({
      where: {
        email: 'sarah.farmer@agromarket.ng'
      }
    });

    if (!testUser) {
      // Create a test user
      testUser = await prisma.user.create({
        data: {
          name: 'Sarah Adebayo',
          email: 'sarah.farmer@agromarket.ng',
          phone: '+234-803-555-0123',
          verified: true,
          role: 'user'
        }
      });
      console.log('Created test user:', testUser.name);
    } else {
      console.log('Found test user:', testUser.name);
    }

    // Create test support tickets
    const tickets = [
      {
        subject: 'Unable to upload images for my yam products',
        priority: 3, // High
        category: 'technical',
        status: 'active',
        userId: testUser.id,
        agentId: agent.id,
        attachments: []
      },
      {
        subject: 'Payment not processing for my cassava sale',
        priority: 3, // High
        category: 'billing',
        status: 'active',
        userId: testUser.id,
        agentId: agent.id,
        attachments: []
      },
      {
        subject: 'How to promote my organic tomatoes?',
        priority: 2, // Medium
        category: 'product',
        status: 'pending',
        userId: testUser.id,
        agentId: null, // Pending assignment
        attachments: []
      },
      {
        subject: 'Account verification for farmers',
        priority: 2, // Medium
        category: 'general',
        status: 'pending',
        userId: testUser.id,
        agentId: null, // Pending assignment
        attachments: []
      },
      {
        subject: 'Delivery issues with my corn order',
        priority: 1, // Low
        category: 'customer-service',
        status: 'closed',
        userId: testUser.id,
        agentId: agent.id,
        attachments: []
      },
      {
        subject: 'Subscription plan questions',
        priority: 2, // Medium
        category: 'billing',
        status: 'closed',
        userId: testUser.id,
        agentId: agent.id,
        attachments: []
      }
    ];

    // Create all tickets
    const createdTickets = [];
    for (let ticketData of tickets) {
      const ticket = await prisma.supportTicket.create({
        data: ticketData
      });
      createdTickets.push(ticket);
      console.log(`Created ticket: "${ticket.subject}" (${ticket.status})`);
    }

    // Create some test messages for the active tickets
    const activeTickets = createdTickets.filter(t => t.status === 'active');

    for (let ticket of activeTickets) {
      // Initial user message
      await prisma.supportMessage.create({
        data: {
          ticketId: ticket.id,
          senderId: testUser.id,
          content: `Hi, I need help with: ${ticket.subject}. This is affecting my farming business and I need urgent assistance.`,
          isAgentReply: false
        }
      });

      // Agent response
      await prisma.supportMessage.create({
        data: {
          ticketId: ticket.id,
          senderId: agent.userId,
          content: `Thank you for contacting support. I understand this is urgent for your farming business. Let me help you resolve this issue.`,
          isAgentReply: true
        }
      });

      console.log(`Added messages to ticket: "${ticket.subject}"`);
    }

    console.log('✅ Test support tickets created successfully!');
    console.log('📊 Summary:');

    const statusCounts = {};
    createdTickets.forEach(ticket => {
      statusCounts[ticket.status] = (statusCounts[ticket.status] || 0) + 1;
    });

    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   - ${status}: ${count} tickets`);
    });

    console.log(`📱 Test user: ${testUser.name} (${testUser.email})`);
    console.log(`👨‍💼 Agent: ${agent.user.name} (${agent.user.email})`);

  } catch (error) {
    console.error('Error creating test support tickets:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestSupportTickets();