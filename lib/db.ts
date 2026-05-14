import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

// Singleton pattern for Prisma Client
declare global {
  var prisma: PrismaClient | undefined
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
})

const adapter = new PrismaPg(pool)

export const prisma =
  global.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "info"] : [],
  })

if (process.env.NODE_ENV !== "production") global.prisma = prisma

export default prisma
