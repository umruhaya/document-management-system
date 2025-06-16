import { index, integer, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { users } from './users'
import { len } from './_constants'
import { sql } from 'drizzle-orm'

export const documents = pgTable('documents', {
	id: varchar('id', { length: len.ID })
		.primaryKey(),
	title: varchar('title', { length: len.MEDIUM })
		.notNull(),
	description: varchar('description', { length: len.LONG })
		.notNull(),
	fileType: varchar('file_type', { length: len.MEDIUM })
		.notNull(),
	version: integer('version')
		.default(1)
		.notNull(),
	size: integer('size_bytes')
		.notNull(),
	content: text('content')
		.notNull(),
	tags: varchar('tags', { length: len.MEDIUM })
		.array()
		.default(sql`ARRAY[]::varchar[]`)
		.notNull(),
	authorId: varchar('author_id', { length: len.ID })
		.notNull()
		.references(() => users.id),
	createdAt: timestamp('created_at')
		.defaultNow()
		.notNull(),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.notNull(),
})
