import { z } from 'zod'
import { createRoute } from '@hono/zod-openapi'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import * as HttpStatusPhrases from 'stoker/http-status-phrases'
import { jsonContent } from 'stoker/openapi/helpers'
import type { AppRouteHandler } from '~/lib/types'
import { db, table } from '~/db'
import { jwtMiddleware } from '~/middlewares/jwt'
import { and, arrayContains, eq, exists, ilike, inArray, like, sql } from 'drizzle-orm'

const route = createRoute({
	method: 'get',
	path: '/documents',
	operationId: 'getDocuments',
	tags: ['Documents'],
	summary: 'Retrieve Documents List By Search Filters',
	middleware: [jwtMiddleware()],
	security: [{ jwt: [] }],
	request: {
		query: z.object({
			title: z.string().optional(),
			author: z.string().optional(),
			tags: z.union([
				z.string(),
				z.string().array(),
			])
				.optional()
				.transform(tags => tags ? (Array.isArray(tags) ? tags : [tags]) : undefined),
			fileType: z.string().optional(),
			version: z.coerce.number().optional(),
			limit: z.coerce.number().int().positive().max(50).default(10),
			offset: z.coerce.number().int().nonnegative().default(0),
			exlcudeContent: z.literal('true').default('true').optional(),
		}),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(
			z.object({
				documents: z.array(z.object({
					id: z.string(),
					title: z.string(),
					description: z.string(),
					fileType: z.string(),
					version: z.number(),
					size: z.number(),
					content: z.string(),
					tags: z.array(z.string()),
					createdAt: z.string(),
					updatedAt: z.string(),
				})),
			}),
			HttpStatusPhrases.OK,
		),
	},
})

const handler: AppRouteHandler<typeof route> = async (c) => {
	const { userId } = c.get('jwtPayload')
	const query = c.req.valid('query')

	const documents = await db.selectDistinctOn([table.documents.id], {
		id: table.documents.id,
		title: table.documents.title,
		description: table.documents.description,
		fileType: table.documents.fileType,
		version: table.documents.version,
		size: table.documents.size,
		content: query.exlcudeContent ? sql`''` : table.documents.content,
		tags: table.documents.tags,
		createdAt: table.documents.createdAt,
		updatedAt: table.documents.updatedAt,
	})
		.from(table.documents)
		.innerJoin(table.documentAccess, eq(table.documents.id, table.documentAccess.documentId))
		.where(
			and(
				// First we need to check that the user querying should have access to the document in some capacity
				exists(
					db.select()
						.from(table.documentAccess)
						.where(
							and(
								eq(table.documentAccess.documentId, table.documents.id),
								eq(table.documentAccess.userId, userId),
							),
						),
				),
				// case insensitive match for title
				query.title ? ilike(table.documents.title, `%${query.title}%`) : undefined,
				// author (user is said to be author if they have owner or editor access)
				// Ensure querying user has access (via EXISTS)
				query.author ? ilike(table.users.username, `%${query.author}%`) : undefined,
				query.author ? inArray(table.documentAccess.role, ['owner', 'editor']) : undefined,
				// tags
				query.tags && query.tags.length !== 0 ? arrayContains(table.documents.tags, query.tags) : undefined,
				// file
				query.fileType ? eq(table.documents.fileType, query.fileType) : undefined,
			),
		)
		.limit(query.limit)
		.offset(query.offset)
		.execute()
		.then(r => r)

	return c.json({ documents }, HttpStatusCodes.OK)
}

export const searchDocuments = [route, handler] as const
