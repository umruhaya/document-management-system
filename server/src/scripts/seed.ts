import 'reflect-metadata'
import { faker } from '@faker-js/faker'
import argon2 from 'argon2'
import { ulid } from 'ulidx'
import { db, table } from '~/infra/database/client'
import type { DocumentsAccessInsert } from '~/infra/database/models/document-access'
import type { DocumentsInsert } from '~/infra/database/models/documents'
import type { UsersInsert } from '~/infra/database/models/users'

async function main() {
	console.log('Starting DB seeding...')

	// Clear existing data
	await db.delete(table.documentAccess).execute()
	await db.delete(table.documents).execute()
	await db.delete(table.users).execute()

	// Generate a single password hash for all users
	const PASSWORD = 'Password123!'
	const hashedPassword = await argon2.hash(PASSWORD)

	const NUM_USERS = 50
	const MIN_DOCS_PER_USER = 5
	const MAX_DOCS_PER_USER = 15
	const MAX_ADDITIONAL_ACCESSES = 5
	const MIN_DOCUMENT_CONTENT_PARAS = 5
	const MAX_DOCUMENT_CONTENT_PARAS = 1000

	// Seed users
	const users: UsersInsert[] = Array.from({ length: NUM_USERS }, () => {
		const id = ulid()
		const username = faker.internet.userName()
		return { id, username, hashedPassword }
	})
	await db.insert(table.users).values(users).execute()
	console.log(`Inserted ${users.length} users`)

	// Seed documents and access entries
	const docs: Array<DocumentsInsert> = []
	const accessEntries: Array<DocumentsAccessInsert> = []

	// Generate all the users
	for (const user of users) {
		// Decide how many docs would be created for this particular user
		const numDocs = faker.number.int({ min: MIN_DOCS_PER_USER, max: MAX_DOCS_PER_USER })

		// create all the docs for the specific user
		for (let i = 0; i < numDocs; i++) {
			const id = ulid()
			const title = faker.lorem.sentence()
			const description = faker.lorem.paragraph(1)
			const content = faker.lorem.paragraphs({ min: MIN_DOCUMENT_CONTENT_PARAS, max: MAX_DOCUMENT_CONTENT_PARAS })
			const fileType = faker.helpers.arrayElement(['text/plain', 'text/markdown'])
			const version = faker.number.int({ min: 1, max: 20 })
			const size = Buffer.byteLength(content, 'utf8')
			const tags = faker.helpers.uniqueArray(faker.lorem.word, faker.number.int({ min: 1, max: 5 }))

			docs.push({
				id,
				title,
				description,
				fileType,
				version,
				size,
				content,
				tags,
			})

			// Owner access (as the user creating the doc should be added as owner the in Access Control List)
			accessEntries.push({ userId: user.id, documentId: id, role: 'owner' })

			// Additional random access entries
			const otherUserIds = faker.helpers.uniqueArray(
				users.map((u) => u.id),
				faker.number.int({ min: 0, max: MAX_ADDITIONAL_ACCESSES }),
			)
			for (const otherId of otherUserIds) {
				if (otherId === user.id) continue
				accessEntries.push({
					userId: otherId,
					documentId: id,
					role: faker.helpers.arrayElement(['viewer', 'editor', 'owner']),
				})
			}
		}
	}
	await db.insert(table.documents).values(docs).execute()
	console.log(`Inserted ${docs.length} documents`)

	await db.insert(table.documentAccess).values(accessEntries).execute()
	console.log(`Inserted ${accessEntries.length} access control entries`)

	console.log('DB seeding completed successfully')
	process.exit(0)
}

main().catch((err) => {
	console.error('Seeding failed:', err)
	process.exit(1)
})
