import { index, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'
import { len } from './_constants'

export const users = pgTable('users', {
	id: varchar('id', { length: len.ID })
		.primaryKey(),
	username: varchar('username', { length: len.MEDIUM })
		.notNull(),
	hashedPassword: varchar('hashed_password', { length: len.MEDIUM })
		.notNull(),
	createdAt: timestamp('created_at')
		.defaultNow()
		.notNull(),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.notNull(),
}, table => [
	index().on(table.username),
])
