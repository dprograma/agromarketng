const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

async function testAgentStatsAPI() {
  try {
    console.log('🔍 Testing Agent Stats API\n');

    // Find the agent
    const agent = await prisma.agent.findFirst({
      include: {
        user: true
      }
    });

    if (!agent) {
      console.log('❌ No agent found. Please create agent personas first.');
      return;
    }

    console.log('✅ Agent found:', agent.user.name, 'ID:', agent.id);

    // Create a test JWT token (simulating authentication)
    const tokenPayload = {
      id: agent.userId,
      role: agent.user.role,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };

    const token = jwt.sign(tokenPayload, process.env.NEXTAUTH_SECRET);
    console.log('📋 Generated test token for API call');

    // Test the database queries directly (simulate what the API does)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    console.log('\n📊 Testing database queries:');

    // Active tickets
    const activeTickets = await prisma.supportTicket.count({
      where: {
        agentId: agent.id,
        status: 'active'
      }
    });
    console.log(`   - Active tickets: ${activeTickets}`);

    // Pending tickets
    const pendingTickets = await prisma.supportTicket.count({
      where: {
        status: 'pending',
        agentId: null
      }
    });
    console.log(`   - Pending tickets: ${pendingTickets}`);

    // Resolved tickets
    const resolvedTickets = await prisma.supportTicket.count({
      where: {
        agentId: agent.id,
        status: 'closed',
        updatedAt: {
          gte: thirtyDaysAgo
        }
      }
    });
    console.log(`   - Resolved tickets (30 days): ${resolvedTickets}`);

    // Total assigned tickets
    const totalTickets = await prisma.supportTicket.count({
      where: {
        agentId: agent.id
      }
    });
    console.log(`   - Total assigned tickets: ${totalTickets}`);

    // Recent activity
    const recentActivity = await prisma.supportTicket.findMany({
      where: {
        agentId: agent.id
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 5,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    console.log(`   - Recent activity items: ${recentActivity.length}`);

    // Calculate resolution rate
    const resolutionRate = totalTickets > 0
      ? Math.round((resolvedTickets / totalTickets) * 100)
      : 0;
    console.log(`   - Resolution rate: ${resolutionRate}%`);

    console.log('\n✅ All database queries working correctly!');

    // Test making an actual HTTP request to the API
    console.log('\n🌐 Testing HTTP API call...');
    try {
      const response = await fetch('http://localhost:3002/api/agent/stats', {
        method: 'GET',
        headers: {
          'Cookie': `next-auth.session-token=${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ API call successful!');
        console.log('📊 API Response:', JSON.stringify(data, null, 2));
      } else {
        const errorText = await response.text();
        console.log('❌ API call failed:');
        console.log(`   Status: ${response.status}`);
        console.log(`   Response: ${errorText}`);
      }
    } catch (fetchError) {
      console.log('❌ HTTP request failed:', fetchError.message);
    }

  } catch (error) {
    console.error('❌ Error testing agent stats API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAgentStatsAPI();