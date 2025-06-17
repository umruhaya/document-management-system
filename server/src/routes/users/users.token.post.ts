import { z } from 'zod'
import { createRoute } from '@hono/zod-openapi'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import * as HttpStatusPhrases from 'stoker/http-status-phrases'
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers'
import type { AppRouteHandler } from '~/lib/types'
import { db, table } from '~/db'
import argon2 from 'argon2'
import { sign } from 'hono/jwt'
import { eq } from 'drizzle-orm'
import { env } from '~/env'

const route = createRoute({
	method: 'post',
	path: '/users/token',
	operationId: 'loginUser',
	tags: ['Users'],
	summary: 'Login and get JWT token',
	request: {
		body: jsonContentRequired(
			z.object({
				username: z.string(),
				password: z.string(),
			}),
			'UserCredentials',
		),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(
			z.object({ token: z.string() }),
			HttpStatusPhrases.OK,
		),
		[HttpStatusCodes.UNAUTHORIZED]: jsonContent(
			z.string(),
			HttpStatusPhrases.UNAUTHORIZED,
		),
	},
})

export const handler: AppRouteHandler<typeof route> = async (c) => {
	const { username, password } = c.req.valid('json')
	const user = await db
		.select()
		.from(table.users)
		.where(eq(table.users.username, username))
		.then(r => r.at(0))

	// Provides Username Enumeration Protection (throw 401 instead of 404)
	if (!user) {
		return c.json('Invalid username or password\n', HttpStatusCodes.UNAUTHORIZED)
	}
	const valid = await argon2.verify(user.hashedPassword, password)
	if (!valid) {
		return c.json('Invalid username or password\n', HttpStatusCodes.UNAUTHORIZED)
	}

	// expiry time in seconds
	const EXPIRY_TIME = 4 * 60 * 60 // 4 hours

	const token = await sign({
		userId: user.id,
		username,
		iat: Date.now() / 1000,
		exp: Date.now() / 1000 + EXPIRY_TIME,
	}, env.JWT_SECRET)

	return c.json({ token }, HttpStatusCodes.OK)
}

export const loginUser = [route, handler] as const
