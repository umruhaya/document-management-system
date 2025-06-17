import { varchar } from 'drizzle-orm/pg-core'
import { pgTable } from 'drizzle-orm/pg-core'
import { len } from './_constants'
import { documents } from './documents'
import { timestamp } from 'drizzle-orm/pg-core'

export const documentLinks = pgTable('document_links', {
	id: varchar('id', { length: len.ID })
		.primaryKey(),
	documentId: varchar('document_id', { length: len.ID })
		.notNull()
		.references(() => documents.id, { onDelete: 'cascade' }),
	fileExtension: varchar('file_extension', { length: len.MEDIUM })
		.notNull(),
	fileMimeType: varchar('mime_type', { length: len.MEDIUM })
		.notNull(),
	createdAt: timestamp('created_at')
		.defaultNow()
		.notNull(),
	expiresAt: timestamp('expires_at')
		.notNull(),
})
