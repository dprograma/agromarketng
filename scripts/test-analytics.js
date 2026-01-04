const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAnalyticsData() {
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

    console.log('Testing analytics data for agent:', agent.user.name, 'ID:', agent.id);

    // Get time range (last 30 days)
    const now = new Date();
    let startDate = new Date();
    startDate.setDate(now.getDate() - 30);

    // Query tickets assigned to this agent within the time range
    const tickets = await prisma.supportTicket.findMany({
      where: {
        agentId: agent.id,
        createdAt: {
          gte: startDate,
          lte: now
        }
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    console.log(`Found ${tickets.length} tickets for this agent in the last 30 days:`);

    tickets.forEach(ticket => {
      console.log(`- ${ticket.subject} (${ticket.status}) - ${ticket.messages.length} messages`);
    });

    // Test the analytics calculations
    const totalChats = tickets.length;
    const resolvedChats = tickets.filter(ticket => ticket.status === 'closed').length;
    const activeChats = tickets.filter(ticket => ticket.status === 'active').length;
    const pendingChats = tickets.filter(ticket => ticket.status === 'pending').length;
    const resolutionRate = totalChats > 0 ? Math.round((resolvedChats / totalChats) * 100) : 0;

    console.log('\n📊 Analytics Summary:');
    console.log(`Total Support Interactions (Tickets): ${totalChats}`);
    console.log(`Active: ${activeChats}`);
    console.log(`Pending: ${pendingChats}`);
    console.log(`Resolved: ${resolvedChats}`);
    console.log(`Resolution Rate: ${resolutionRate}%`);

    // Calculate response times
    let totalResponseTime = 0;
    let responseCount = 0;

    tickets.forEach(ticket => {
      const messages = ticket.messages;
      for (let i = 1; i < messages.length; i++) {
        const prevMessage = messages[i - 1];
        const currentMessage = messages[i];

        // Calculate response time if this is an agent response to a user message
        if (!prevMessage.isAgentReply && currentMessage.isAgentReply) {
          const responseTime = (new Date(currentMessage.createdAt).getTime() - new Date(prevMessage.createdAt).getTime()) / (1000 * 60);
          totalResponseTime += responseTime;
          responseCount++;
          console.log(`Response time: ${Math.round(responseTime)} minutes`);
        }
      }
    });

    const avgResponseTime = responseCount > 0 ? Math.round(totalResponseTime / responseCount) : 0;
    console.log(`Average Response Time: ${avgResponseTime} minutes`);

    console.log('\n✅ Analytics system is working with real database data!');

  } catch (error) {
    console.error('Error testing analytics data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAnalyticsData();