import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    // Check if the environment variable is set
    const password: string = process.env.ADMIN_PASS ?? 'admin1234'
    const email: string = process.env.ADMIN_EMAIL ?? 'admin@agromarket.com';
    const hashedPassword = await bcrypt.hash(password, 10)

    const admin = await prisma.user.upsert({
        where: { email: email },
        update: {},
        create: {
            email: email,
            name: 'Admin',
            password: hashedPassword,
            role: 'admin',
            verified: true
        },
    })

    console.log({ admin })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })