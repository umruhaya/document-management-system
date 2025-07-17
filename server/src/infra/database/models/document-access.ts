import { pgEnum, pgTable, primaryKey, varchar } from 'drizzle-orm/pg-core'
import { len } from './_constants'
import { documents } from './documents'
import { users } from './users'

export const rolesPgEnum = pgEnum('document_roles', ['viewer', 'editor', 'owner'])

export const documentAccess = pgTable(
	'document_access',
	{
		userId: varchar('user_id', { length: len.ID })
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		documentId: varchar('document_id', { length: len.ID })
			.notNull()
			.references(() => documents.id, { onDelete: 'cascade' }),
		role: rolesPgEnum('role').notNull(),
	},
	(table) => [primaryKey({ columns: [table.userId, table.documentId] })],
)

export type DocumentsAccessSelect = typeof documentAccess.$inferSelect
export type DocumentsAccessInsert = typeof documentAccess.$inferInsert
