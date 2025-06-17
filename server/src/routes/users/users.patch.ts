import { z } from 'zod'
import { createRoute } from '@hono/zod-openapi'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import * as HttpStatusPhrases from 'stoker/http-status-phrases'
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers'
import type { AppRouteHandler } from '~/lib/types'
import { DatabaseError, db, table } from '~/db'
import argon2 from 'argon2'
import { jwtMiddleware } from '~/middlewares/jwt'
import { eq } from 'drizzle-orm'

const route = createRoute({
	method: 'patch',
	path: '/users',
	operationId: 'updateUser',
	tags: ['Users'],
	summary: "Updates a User's Username and/or Password",
	middleware: [jwtMiddleware()],
	security: [{ jwt: [] }],
	request: {
		body: jsonContentRequired(
			z.object({
				username: z.string(),
				newUsername: z.string().optional(),
				password: z.string().optional(),
			}),
			'UserUpdate',
		),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(z.object({ updated: z.boolean() }), HttpStatusPhrases.OK),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(z.string(), HttpStatusPhrases.NOT_FOUND),
		[HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(z.string(), HttpStatusPhrases.INTERNAL_SERVER_ERROR),
	},
})

export const handler: AppRouteHandler<typeof route> = async (c) => {
	const { userId } = c.get('jwtPayload')
	const { username, password } = c.req.valid('json')

	if (!username && !password) {
		return c.json({ updated: false }, HttpStatusCodes.OK)
	}

	const hashedPassword = password ? await argon2.hash(password) : undefined

	try {
		const updatedUser = await db.update(table.users)
			.set({ username, hashedPassword, updatedAt: new Date() })
			.where(eq(table.users.id, userId))
			.returning()
			.then(r => r.at(0))

		// In practice, this condition should not hit.
		if (!updatedUser) {
			return c.json(`User "${username}" not found\n`, HttpStatusCodes.NOT_FOUND)
		}
	} catch (error) {
		if (error instanceof DatabaseError) {
			return c.json('Database error\n', HttpStatusCodes.INTERNAL_SERVER_ERROR)
		}
	}
	return c.json({ updated: true }, HttpStatusCodes.OK)
}

export const updateUser = [route, handler] as const
