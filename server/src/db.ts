import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { table } from '~/models'
import { env } from '~/env'

const HOST = env.DATABASE_HOST
const NAME = env.DATABASE_NAME
const PASSWORD = env.DATABASE_PASSWORD
const PORT = env.DATABASE_PORT
const USERNAME = env.DATABASE_USERNAME

const databaseConnectionString = `postgres://${USERNAME}:${PASSWORD}@${HOST}:${PORT}/${NAME}?sslmode=require`

const queryClient = postgres(databaseConnectionString)

export const DatabaseError = postgres.PostgresError
export const db = drizzle(queryClient, { schema: table })
