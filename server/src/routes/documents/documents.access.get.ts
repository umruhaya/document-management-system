import { z } from 'zod'
import { createRoute } from '@hono/zod-openapi'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import * as HttpStatusPhrases from 'stoker/http-status-phrases'
import { jsonContent } from 'stoker/openapi/helpers'
import type { AppRouteHandler } from '~/lib/types'
import { db, table } from '~/db'
import { jwtMiddleware } from '~/middlewares/jwt'
import { and, eq, exists } from 'drizzle-orm'

const route = createRoute({
	method: 'get',
	path: '/documents/{documentId}/access',
	operationId: 'getDocumentAccessList',
	tags: ['Documents'],
	summary: 'Get all users who have access to a document, with their usernames and roles',
	middleware: [jwtMiddleware()],
	security: [{ jwt: [] }],
	request: {
		params: z.object({ documentId: z.string() }),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(
			z.object({
				access: z.array(z.object({
					userId: z.string(),
					username: z.string(),
					role: z.string(),
				})),
			}),
			HttpStatusPhrases.OK,
		),
		[HttpStatusCodes.FORBIDDEN]: jsonContent(z.string(), HttpStatusPhrases.FORBIDDEN),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(z.string(), HttpStatusPhrases.NOT_FOUND),
	},
})

export const handler: AppRouteHandler<typeof route> = async (c) => {
	const { userId } = c.get('jwtPayload')
	const { documentId } = c.req.valid('param')

	// Check if requesting user has access to the document
	const hasAccess = await db
		.select()
		.from(table.documentAccess)
		.where(and(
			eq(table.documentAccess.documentId, documentId),
			eq(table.documentAccess.userId, userId),
		))
		.then(r => r.length > 0)

	if (!hasAccess) {
		return c.json('Forbidden', HttpStatusCodes.FORBIDDEN)
	}

	const access = await db
		.select({
			userId: table.documentAccess.userId,
			username: table.users.username,
			role: table.documentAccess.role,
		})
		.from(table.documentAccess)
		.innerJoin(table.users, eq(table.documentAccess.userId, table.users.id))
		.where(eq(table.documentAccess.documentId, documentId))
		.then(r => r)

	if (!access.length) {
		return c.json('No access records found for this document', HttpStatusCodes.NOT_FOUND)
	}

	return c.json({ access }, HttpStatusCodes.OK)
}

export const getDocumentAccessList = [route, handler] as const
