import { z } from 'zod'
import { createRoute } from '@hono/zod-openapi'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import * as HttpStatusPhrases from 'stoker/http-status-phrases'
import { jsonContent } from 'stoker/openapi/helpers'
import type { AppRouteHandler } from '~/lib/types'
import { db, table } from '~/db'
import { eq } from 'drizzle-orm'
import mime from 'mime'

const route = createRoute({
	method: 'get',
	path: '/documents/download/{filename}',
	operationId: 'downloadDocumentByLink',
	tags: ['Documents'],
	summary: 'Download a document using a short-lived link',
	request: {
		params: z.object({
			filename: z.string(),
		}),
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				'text/plain': { schema: z.string() },
			},
			description: 'File',
		},
		[HttpStatusCodes.NOT_FOUND]: jsonContent(z.string(), HttpStatusPhrases.NOT_FOUND),
		[HttpStatusCodes.GONE]: jsonContent(z.string(), HttpStatusPhrases.GONE),
	},
})

export const handler: AppRouteHandler<typeof route> = async (c) => {
	const { filename } = c.req.valid('param')
	const linkId = filename.split('.')[0] ?? filename

	const link = await db
		.select({
			id: table.documentLinks.id,
			documentId: table.documentLinks.documentId,
			fileExtension: table.documentLinks.fileExtension,
			fileMimeType: table.documentLinks.fileMimeType,
			expiresAt: table.documentLinks.expiresAt,
		})
		.from(table.documentLinks)
		.where(
			eq(table.documentLinks.id, linkId),
		)
		.then(r => r.at(0))

	if (!link) {
		return c.json('Link not found', HttpStatusCodes.NOT_FOUND)
	}

	if (link.expiresAt < new Date()) {
		return c.json('Link expired', HttpStatusCodes.GONE)
	}

	const doc = await db
		.select({
			content: table.documents.content,
			title: table.documents.title,
			fileType: table.documents.fileType,
		})
		.from(table.documents)
		.where(eq(table.documents.id, link.documentId))
		.then(r => r.at(0))

	if (!doc) {
		return c.json('Document not found', HttpStatusCodes.NOT_FOUND)
	}

	// Guess file extension from the mime type
	const fileExtension = mime.getExtension(doc.fileType) ?? 'bin'

	c.header('Content-Disposition', `attachment; filename="${doc.title}.${fileExtension}"`)
	if (link.fileMimeType) {
		c.header('Content-Type', link.fileMimeType)
	} else {
		c.header('Content-Type', 'text/plain')
	}
	return c.body(doc.content, HttpStatusCodes.OK) as any
}

export const downloadDocumentByLink = [route, handler] as const
