import { pgEnum, pgTable, primaryKey, varchar } from 'drizzle-orm/pg-core'
import { users } from './users'
import { documents } from './documents'
import { len } from './_constants'

export const rolesPgEnum = pgEnum('document_roles', ['viewer', 'editor', 'owner'])

export const documentAccess = pgTable('document_access', {
	userId: varchar('user_id', { length: len.ID })
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	documentId: varchar('document_id', { length: len.ID })
		.notNull()
		.references(() => documents.id),
	role: rolesPgEnum('role')
		.notNull(),
}, table => [
	primaryKey({ columns: [table.userId, table.documentId] }),
])
