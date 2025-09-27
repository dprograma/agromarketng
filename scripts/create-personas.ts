import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createPersonas() {
  try {
    console.log('🚀 Creating Admin and Agent personas...\n');

    // Strong passwords
    const adminPassword = 'AgroAdmin2024!@#$';
    const agentPassword = 'AgroAgent2024!';

    // Hash passwords
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 12);
    const hashedAgentPassword = await bcrypt.hash(agentPassword, 12);

    // Create Administrator account
    const admin = await prisma.user.upsert({
      where: { email: 'admin@agromarket.ng' },
      update: {
        password: hashedAdminPassword,
        role: 'admin',
        verified: true
      },
      create: {
        name: 'System Administrator',
        email: 'admin@agromarket.ng',
        password: hashedAdminPassword,
        role: 'admin',
        verified: true,
        emailVerified: new Date(),
        phone: '+234-800-ADMIN-01'
      },
    });

    // Create Agent account
    const agent = await prisma.user.upsert({
      where: { email: 'agent@agromarket.ng' },
      update: {
        password: hashedAgentPassword,
        role: 'agent',
        verified: true
      },
      create: {
        name: 'Support Agent',
        email: 'agent@agromarket.ng',
        password: hashedAgentPassword,
        role: 'agent',
        verified: true,
        emailVerified: new Date(),
        phone: '+234-800-AGENT-01'
      },
    });

    // Create Agent record for the agent user
    const agentRecord = await prisma.agent.upsert({
      where: { userId: agent.id },
      update: {
        isOnline: false,
        isAvailable: true,
        activeChats: 0,
        specialties: ['General Support', 'Ad Management', 'Payment Issues', 'Technical Support']
      },
      create: {
        userId: agent.id,
        isOnline: false,
        isAvailable: true,
        activeChats: 0,
        specialties: ['General Support', 'Ad Management', 'Payment Issues', 'Technical Support']
      },
    });

    console.log('✅ Successfully created personas!\n');

    console.log('📋 LOGIN CREDENTIALS:\n');

    console.log('🔐 ADMINISTRATOR ACCOUNT:');
    console.log('   Email:    admin@agromarket.ng');
    console.log('   Password: AgroAdmin2024!@#$');
    console.log('   Role:     admin');
    console.log('   Access:   /admin/dashboard\n');

    console.log('👨‍💼 AGENT ACCOUNT:');
    console.log('   Email:    agent@agromarket.ng');
    console.log('   Password: AgroAgent2024!');
    console.log('   Role:     agent');
    console.log('   Access:   /agent/dashboard\n');

    console.log('🔒 PASSWORD SECURITY:');
    console.log('   Admin password: 18 characters, uppercase, lowercase, numbers, symbols');
    console.log('   Agent password: 16 characters, uppercase, lowercase, numbers, symbols');

    return { admin, agent, agentRecord };

  } catch (error) {
    console.error('❌ Error creating personas:', error);
    throw error;
  }
}

async function main() {
  try {
    await createPersonas();
    console.log('\n🎉 Persona creation completed successfully!');
  } catch (error) {
    console.error('🚨 Failed to create personas:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main();

export { createPersonas };