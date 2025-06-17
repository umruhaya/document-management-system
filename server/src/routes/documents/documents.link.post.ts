import { z } from 'zod'
import { createRoute } from '@hono/zod-openapi'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import * as HttpStatusPhrases from 'stoker/http-status-phrases'
import { jsonContent } from 'stoker/openapi/helpers'
import type { AppRouteHandler } from '~/lib/types'
import { db, table } from '~/db'
import { jwtMiddleware } from '~/middlewares/jwt'
import { and, eq } from 'drizzle-orm'
import { ulid } from 'ulidx'
import { addHours } from 'date-fns'
import mime from 'mime'

const route = createRoute({
	method: 'post',
	path: '/documents/{documentId}/link',
	operationId: 'createDocumentLink',
	tags: ['Documents'],
	summary: 'Create a short-lived download link for a document (1 hour expiry)',
	middleware: [jwtMiddleware()],
	security: [{ jwt: [] }],
	request: {
		params: z.object({ documentId: z.string() }),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(
			z.object({ linkId: z.string(), url: z.string(), expiresAt: z.string() }),
			HttpStatusPhrases.OK,
		),
		[HttpStatusCodes.FORBIDDEN]: jsonContent(z.string(), HttpStatusPhrases.FORBIDDEN),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(z.string(), HttpStatusPhrases.NOT_FOUND),
	},
})

export const handler: AppRouteHandler<typeof route> = async (c) => {
	const { userId } = c.get('jwtPayload')
	const { documentId } = c.req.valid('param')
	const origin = c.req.header('Origin') ?? ''

	// Check if user has access to the document
	const access = await db
		.select()
		.from(table.documentAccess)
		.where(
			and(
				eq(table.documentAccess.documentId, documentId),
				eq(table.documentAccess.userId, userId),
			),
		)
		.then(r => r.length > 0)

	if (!access) {
		return c.json('Forbidden', HttpStatusCodes.FORBIDDEN)
	}

	// Check if document exists
	const doc = await db
		.select({ id: table.documents.id, fileType: table.documents.fileType })
		.from(table.documents)
		.where(eq(table.documents.id, documentId))
		.then(r => r.at(0))

	if (!doc) {
		return c.json('Document not found', HttpStatusCodes.NOT_FOUND)
	}

	const linkId = ulid()
	// Expiry is set to 1 hour
	const expiresAt = addHours(new Date(), 1)

	// Guess file extension from the mime type
	const fileExtension = mime.getExtension(doc.fileType) ?? 'bin'

	await db.insert(table.documentLinks).values({
		id: linkId,
		documentId,
		fileExtension,
		fileMimeType: doc.fileType,
		createdAt: new Date(),
		expiresAt,
	})

	const path = `/documents/download/${linkId}.${fileExtension}`
	const url = `${origin}${path}`

	return c.json({ linkId, url, expiresAt: expiresAt.toISOString() }, HttpStatusCodes.OK)
}

export const createDocumentLink = [route, handler] as const
