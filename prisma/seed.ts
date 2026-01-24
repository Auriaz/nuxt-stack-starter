import 'dotenv/config'
import { PrismaClient } from './generated/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.user.create({
    data: {
      username: 'alice',
      email: 'alice@prisma.io'
    }
  })
}

main()
  .then(() => prisma.$disconnect())
  .catch(async () => {
    await prisma.$disconnect()
    process.exit(1)
  })
