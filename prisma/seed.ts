import "dotenv/config";
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding database...")

  // Create Super Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gymtech.com' },
    update: {},
    create: {
      email: 'admin@gymtech.com',
      password: 'password123', // Em prod usar hash (bcrypt)
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
    },
  })

  console.log("Created Admin: ", admin.email)

  // Create Exercises with GIFs from Google Search
  const exercises = [
    {
      name: 'Supino Reto com Barra',
      description: 'Exercício para peitoral.',
      gifUrl: 'https://media.tenor.com/images/3f18e11cfc635df8527a2eb1f3edfb7b/tenor.gif',
    },
    {
      name: 'Supino Inclinado com Halteres',
      description: 'Foco na parte superior do peitoral.',
      gifUrl: 'https://media.tenor.com/images/7a0d42111d4e7d4d4205c6d32df149b5/tenor.gif',
    },
    {
      name: 'Agachamento Livre',
      description: 'Exercício completo para pernas.',
      gifUrl: 'https://makeagif.com/media/2-24-2016/5K1X9z.gif',
    }
  ]

  for (const ex of exercises) {
    await prisma.exercise.create({
      data: ex
    })
  }

  console.log("Seeded exercises!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
