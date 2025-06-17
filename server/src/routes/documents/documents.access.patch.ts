import { z } from 'zod'
import { createRoute } from '@hono/zod-openapi'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import * as HttpStatusPhrases from 'stoker/http-status-phrases'
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers'
import type { AppRouteHandler } from '~/lib/types'
import { db, table } from '~/db'
import { jwtMiddleware } from '~/middlewares/jwt'
import { and, eq } from 'drizzle-orm'

const route = createRoute({
	method: 'patch',
	path: '/documents/{documentId}/access',
	operationId: 'patchDocumentAccess',
	tags: ['Documents'],
	summary: 'Modify access for a user on a document (add/update/remove). Only owner can perform.',
	middleware: [jwtMiddleware()],
	security: [{ jwt: [] }],
	request: {
		params: z.object({ documentId: z.string() }),
		body: jsonContentRequired(
			z.object({
				targetUserId: z.string(),
				role: z.enum(['viewer', 'editor', 'owner']).optional(),
				remove: z.boolean().optional(), // if true, remove access
			}),
			'DocumentAccessPatch',
		),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(z.object({ success: z.boolean() }), HttpStatusPhrases.OK),
		[HttpStatusCodes.FORBIDDEN]: jsonContent(z.string(), HttpStatusPhrases.FORBIDDEN),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(z.string(), HttpStatusPhrases.NOT_FOUND),
	},
})

export const handler: AppRouteHandler<typeof route> = async (c) => {
	const { userId } = c.get('jwtPayload')
	const { documentId } = c.req.valid('param')
	const { targetUserId, role, remove } = c.req.valid('json')

	// Only owner can modify access
	const isOwner = await db
		.select()
		.from(table.documentAccess)
		.where(and(
			eq(table.documentAccess.documentId, documentId),
			eq(table.documentAccess.userId, userId),
			eq(table.documentAccess.role, 'owner'),
		))
		.then(r => r.length > 0)

	if (!isOwner) {
		return c.json('Only owner can modify access', HttpStatusCodes.FORBIDDEN)
	}

	// Remove access
	if (remove) {
		const deleted = await db.delete(table.documentAccess)
			.where(and(
				eq(table.documentAccess.documentId, documentId),
				eq(table.documentAccess.userId, targetUserId),
			))
		return c.json({ success: true }, HttpStatusCodes.OK)
	}

	// Add or update access
	if (!role) {
		return c.json('Role is required when not removing access', HttpStatusCodes.FORBIDDEN)
	}

	// Upsert: try update, if not exists then insert
	const existing = await db
		.select()
		.from(table.documentAccess)
		.where(and(
			eq(table.documentAccess.documentId, documentId),
			eq(table.documentAccess.userId, targetUserId),
		))
		.then(r => r.length > 0)

	if (existing) {
		await db.update(table.documentAccess)
			.set({ role })
			.where(and(
				eq(table.documentAccess.documentId, documentId),
				eq(table.documentAccess.userId, targetUserId),
			))
	} else {
		await db.insert(table.documentAccess)
			.values({
				documentId,
				userId: targetUserId,
				role,
			})
	}

	return c.json({ success: true }, HttpStatusCodes.OK)
}

export const patchDocumentAccess = [route, handler] as const
