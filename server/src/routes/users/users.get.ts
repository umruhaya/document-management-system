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
	path: '/users',
	operationId: 'getUserDetailsByUsername',
	tags: ['Users'],
	summary: 'Retrieve Details of a user based on its username',
	request: {
		query: z.object({ username: z.string() }),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(
			z.object({
				userId: z.string(),
				username: z.string(),
			}),
			HttpStatusPhrases.OK,
		),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(z.string(), HttpStatusPhrases.NOT_FOUND),
	},
})

export const handler: AppRouteHandler<typeof route> = async (c) => {
	const { username } = c.req.valid('query')

	const user = await db
		.select({
			userId: table.users.id,
			username: table.users.username,
		})
		.from(table.users)
		.where(eq(table.users.username, username))
		.then(r => r.at(0))

	if (!user) {
		return c.json(`No User Found with Username "${username}"\n`, HttpStatusCodes.NOT_FOUND)
	}

	return c.json(user, HttpStatusCodes.OK)
}

export const getUserByUsername = [route, handler] as const
