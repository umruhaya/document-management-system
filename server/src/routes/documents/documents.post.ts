import { z } from 'zod'
import { createRoute } from '@hono/zod-openapi'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import * as HttpStatusPhrases from 'stoker/http-status-phrases'
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers'
import type { AppRouteHandler } from '~/lib/types'
import { db, table } from '~/db'
import { ulid } from 'ulidx'
import { jwtMiddleware } from '~/middlewares/jwt'

const allowedFileTypes = [
	'text/plain',
	'text/markdown',
	'text/html',
	'application/javascript',
	'application/typescript',
	'text/x-python',
] as const

const description = `
## valid File types are:
- Plain Text: \`text/plain\`
- Markdown: \`text/markdown\`
- HTML: \`text/html\`
- JavaScript: \`application/javascript\`
- TypeScript: \`application/typescript\`
- Python: \`text/x-python\`
`

const route = createRoute({
	method: 'post',
	path: '/documents',
	operationId: 'createDocument',
	tags: ['Documents'],
	summary: 'Create a new document',
	description,
	middleware: [jwtMiddleware()],
	security: [{ jwt: [] }],
	request: {
		body: jsonContentRequired(
			z.object({
				title: z.string(),
				description: z.string(),
				fileType: z.enum(allowedFileTypes),
				content: z.string(),
				tags: z.array(z.string()).optional(),
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

	const size = body.content.length

	console.log('point 1: before insert')
	try {
		const insertPromise = db.insert(table.documents)
			.values({
				id: documentId,
				title: body.title,
				description: body.description,
				fileType: body.fileType,
				content: body.content,
				tags: body.tags ?? [],
				size,
				version: 1,
				createdBy: userId,
			})
			.execute()

		// Add a timeout to detect hanging
		await Promise.race([
			insertPromise,
			new Promise((_, reject) => setTimeout(() => reject(new Error('Insert timed out')), 5000)),
		])
		console.log('point 1: after insert')
	} catch (err) {
		console.error('Error at point 1:', err)
		throw err
	}

	// Grant owner access to creator
	console.log('point 2')
	await db.insert(table.documentAccess)
		.values({
			userId,
			documentId,
			role: 'owner',
		})
		.execute()
	// })

	return c.json({ documentId }, HttpStatusCodes.OK)
}

export const createDocument = [route, handler] as const
