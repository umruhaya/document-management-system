import { z } from 'zod'
import { createRoute } from '@hono/zod-openapi'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import * as HttpStatusPhrases from 'stoker/http-status-phrases'
import { jsonContent } from 'stoker/openapi/helpers'
import type { AppRouteHandler } from '~/lib/types'
import { db, table } from '~/db'
import { jwtMiddleware } from '~/middlewares/jwt'
import { eq } from 'drizzle-orm'

const route = createRoute({
	method: 'get',
	path: '/users/{id}',
	operationId: 'getUser',
	tags: ['Users'],
	summary: 'Retrieve Details of a User if it exists',
	middleware: [jwtMiddleware()],
	security: [{ jwt: [] }],
	request: {
		params: z.object({ id: z.string() }),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(
			z.object({
				id: z.string(),
				username: z.string(),
				createdAt: z.string(),
				updatedAt: z.string(),
			}),
			HttpStatusPhrases.OK,
		),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(z.string(), HttpStatusPhrases.NOT_FOUND),
	},
})

export const handler: AppRouteHandler<typeof route> = async (c) => {
	const userId = c.req.valid('param').id

	const user = await db
		.select({
			id: table.users.id,
			username: table.users.username,
			createdAt: table.users.createdAt,
			updatedAt: table.users.updatedAt,
		})
		.from(table.users)
		.where(eq(table.users.id, userId))
		.then(r => r.at(0))

	if (!user) {
		return c.json(`No User Found with ID ${userId}`, HttpStatusCodes.NOT_FOUND)
	}

	return c.json(user, HttpStatusCodes.OK)
}

export const getUserById = [route, handler] as const
