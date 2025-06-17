import { z } from 'zod'
import { createRoute } from '@hono/zod-openapi'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import * as HttpStatusPhrases from 'stoker/http-status-phrases'
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers'
import type { AppRouteHandler } from '~/lib/types'
import { db, table } from '~/db'
import { ulid } from 'ulidx'
import { jwtMiddleware } from '~/middlewares/jwt'

const route = createRoute({
	method: 'post',
	path: '/documents',
	operationId: 'createDocument',
	tags: ['Documents'],
	summary: 'Create a new document',
	middleware: [jwtMiddleware()],
	security: [{ jwt: [] }],
	request: {
		body: jsonContentRequired(
			z.object({
				title: z.string(),
				description: z.string(),
				fileType: z.string(),
				content: z.string(),
				tags: z.array(z.string()).optional(),
				size: z.number().int().positive(),
				version: z.number().int().positive().optional(),
			}),
			'DocumentCreate',
		),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(
			z.object({ documentId: z.string() }),
			HttpStatusPhrases.OK,
		),
	},
})

export const handler: AppRouteHandler<typeof route> = async (c) => {
	const { userId } = c.get('jwtPayload')
	const body = c.req.valid('json')
	const documentId = ulid()

	await db.transaction(async (tx) => {
		await tx.insert(table.documents)
			.values({
				id: documentId,
				title: body.title,
				description: body.description,
				fileType: body.fileType,
				content: body.content,
				tags: body.tags ?? [],
				size: body.size,
				version: body.version ?? 1,
				createdBy: userId,
			})

		// Grant owner access to creator
		await tx.insert(table.documentAccess)
			.values({
				userId,
				documentId,
				role: 'owner',
			})
	})

	return c.json({ documentId }, HttpStatusCodes.OK)
}

export const createDocument = [route, handler] as const
