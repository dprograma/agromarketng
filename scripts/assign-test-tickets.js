const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function assignTestTickets() {
  try {
    // Find the agent
    const agent = await prisma.agent.findFirst({
      include: {
        user: true
      }
    });

    if (!agent) {
      console.log('No agent found');
      return;
    }

    console.log('Found agent:', agent.user.name, 'ID:', agent.id);

    // Find all open/pending tickets and assign some to the agent
    const tickets = await prisma.supportTicket.findMany({
      where: {
        status: {
          in: ['open', 'pending']
        }
      },
      include: {
        user: true
      }
    });

    console.log(`Found ${tickets.length} open/pending tickets`);

    // Assign tickets to agent with different statuses for testing
    if (tickets.length >= 1) {
      // Make first ticket pending (unassigned)
      await prisma.supportTicket.update({
        where: { id: tickets[0].id },
        data: {
          status: 'pending',
          agentId: null
        }
      });
      console.log(`Set ticket "${tickets[0].subject}" to pending`);
    }

    if (tickets.length >= 2) {
      // Make second ticket active and assigned to agent
      await prisma.supportTicket.update({
        where: { id: tickets[1].id },
        data: {
          status: 'active',
          agentId: agent.id
        }
      });
      console.log(`Assigned ticket "${tickets[1].subject}" to agent as active`);
    }

    if (tickets.length >= 3) {
      // Make third ticket assigned to agent but keep as open
      await prisma.supportTicket.update({
        where: { id: tickets[2].id },
        data: {
          status: 'active',
          agentId: agent.id
        }
      });
      console.log(`Assigned ticket "${tickets[2].subject}" to agent as active`);
    }

    console.log('✅ Test tickets assigned successfully!');

    // Show current ticket distribution
    const ticketCounts = await prisma.supportTicket.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    console.log('\n📊 Current ticket distribution:');
    ticketCounts.forEach(group => {
      console.log(`- ${group.status}: ${group._count.status} tickets`);
    });

  } catch (error) {
    console.error('Error assigning test tickets:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignTestTickets();