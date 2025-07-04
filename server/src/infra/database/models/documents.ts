import { integer, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { len } from './_constants'

export const documents = pgTable('documents', {
	id: varchar('id', { length: len.ID }).primaryKey(),
	title: varchar('title', { length: len.MEDIUM }).notNull(),
	description: varchar('description', { length: len.LONG }).notNull(),
	fileType: varchar('file_type', { length: len.MEDIUM }).notNull(),
	version: integer('version').default(1).notNull(),
	size: integer('size_bytes').notNull(),
	content: text('content').notNull(),
	tags: varchar('tags', { length: len.MEDIUM }).array().notNull(),
	createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
})

export type DocumentsSelect = typeof documents.$inferSelect
export type DocumentsInsert = typeof documents.$inferInsert
