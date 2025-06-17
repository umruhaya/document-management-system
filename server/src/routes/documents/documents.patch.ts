import { z } from 'zod'
import { createRoute } from '@hono/zod-openapi'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import * as HttpStatusPhrases from 'stoker/http-status-phrases'
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers'
import type { AppRouteHandler } from '~/lib/types'
import { db, table } from '~/db'
import { jwtMiddleware } from '~/middlewares/jwt'
import { and, eq, inArray, sql } from 'drizzle-orm'

const route = createRoute({
	method: 'patch',
	path: '/documents/{id}',
	operationId: 'patchDocument',
	tags: ['Documents'],
	summary: 'Update a document (owner/editor only)',
	middleware: [jwtMiddleware()],
	security: [{ jwt: [] }],
	request: {
		params: z.object({ id: z.string() }),
		body: jsonContentRequired(
			z.object({
				title: z.string().optional(),
				description: z.string().optional(),
				fileType: z.string().optional(),
				content: z.string().optional(),
				tags: z.array(z.string()).optional(),
			}),
			'DocumentPatch',
		),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(z.object({ updated: z.boolean() }), HttpStatusPhrases.OK),
		[HttpStatusCodes.FORBIDDEN]: jsonContent(z.string(), HttpStatusPhrases.FORBIDDEN),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(z.string(), HttpStatusPhrases.NOT_FOUND),
	},
})

export const handler: AppRouteHandler<typeof route> = async (c) => {
	const { userId } = c.get('jwtPayload')
	const { id: documentId } = c.req.valid('param')
	const patch = c.req.valid('json')

	// Check if user has owner or editor access
	const access = await db
		.select({ role: table.documentAccess.role })
		.from(table.documentAccess)
		.where(and(
			eq(table.documentAccess.documentId, documentId),
			eq(table.documentAccess.userId, userId),
			inArray(table.documentAccess.role, ['owner', 'editor']),
		))
		.then(r => r.at(0))

	if (!access) {
		return c.json('Forbidden: Not enough access', HttpStatusCodes.FORBIDDEN)
	}

	// increment version if content is being updated
	const version = patch.content !== undefined ? sql`${table.documents.version} + 1` : undefined
	// Update Size if content is being updated
	const size = patch.content !== undefined ? patch.content.length : undefined

	const result = await db.update(table.documents)
		.set({ ...patch, version, size })
		.where(eq(table.documents.id, documentId))
		.returning()
		.then(r => r.at(0))

	if (!result) {
		return c.json('Document not found', HttpStatusCodes.NOT_FOUND)
	}

	return c.json({ updated: true }, HttpStatusCodes.OK)
}

export const patchDocument = [route, handler] as const
