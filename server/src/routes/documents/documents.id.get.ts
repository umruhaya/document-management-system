import { z } from 'zod'
import { createRoute } from '@hono/zod-openapi'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import * as HttpStatusPhrases from 'stoker/http-status-phrases'
import { jsonContent } from 'stoker/openapi/helpers'
import type { AppRouteHandler } from '~/lib/types'
import { db, table } from '~/db'
import { jwtMiddleware } from '~/middlewares/jwt'
import { and, eq } from 'drizzle-orm'

const route = createRoute({
	method: 'get',
	path: '/documents/{id}',
	operationId: 'getDocument',
	tags: ['Documents'],
	summary: 'Retrieve Details of a Document if it exists',
	middleware: [jwtMiddleware()],
	security: [{ jwt: [] }],
	request: {
		params: z.object({ id: z.string() }),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(
			z.object({
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
			}),
			HttpStatusPhrases.OK,
		),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(z.string(), HttpStatusPhrases.NOT_FOUND),
	},
})

const handler: AppRouteHandler<typeof route> = async (c) => {
	const { userId } = c.get('jwtPayload')
	const documentId = c.req.valid('param').id

	const document = await db.selectDistinctOn([table.documents.id], {
		id: table.documents.id,
		title: table.documents.title,
		description: table.documents.description,
		fileType: table.documents.fileType,
		version: table.documents.version,
		size: table.documents.size,
		content: table.documents.content,
		tags: table.documents.tags,
		createdAt: table.documents.createdAt,
		updatedAt: table.documents.updatedAt,
	})
		.from(table.documents)
		.innerJoin(table.documentAccess, eq(table.documents.id, table.documentAccess.documentId))
		.where(
			and(
				eq(table.documents.id, documentId),
				eq(table.documentAccess.userId, userId),
			),
		)
		.execute()
		.then(r => r.at(0))

	if (!document) {
		return c.json(`No Document Found with ID ${documentId}`, HttpStatusCodes.NOT_FOUND)
	}

	return c.json(document, HttpStatusCodes.OK)
}

export const getDocumentById = [route, handler] as const
