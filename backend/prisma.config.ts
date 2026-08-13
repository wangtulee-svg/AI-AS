import { defineConfig } from 'prisma/config'

export default defineConfig({
  earlyAccess: true,
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  db: {
    url: process.env.DATABASE_URL, // ອ່ານຄ່າຈາກ .env
  },
})