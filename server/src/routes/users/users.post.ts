import { z } from 'zod'
import { createRoute } from '@hono/zod-openapi'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import * as HttpStatusPhrases from 'stoker/http-status-phrases'
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers'
import type { AppRouteHandler } from '~/lib/types'
import { DatabaseError, db, table } from '~/db'
import { PostgresError } from 'pg-error-enum'
import { ulid } from 'ulidx'
import argon2 from 'argon2'

const route = createRoute({
	method: 'post',
	path: '/users',
	operationId: 'createUser',
	tags: ['Users'],
	summary: 'Creates a New User in the system',
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
			z.object({ userId: z.string() }),
			HttpStatusPhrases.OK,
		),
		[HttpStatusCodes.CONFLICT]: jsonContent(
			z.string(),
			HttpStatusPhrases.CONFLICT,
		),
	},
})

export const handler: AppRouteHandler<typeof route> = async (c) => {
	const { username, password } = c.req.valid('json')
	const hashedPassword = await argon2.hash(password)
	const userId = ulid()

	try {
		await db.insert(table.users)
			.values({ id: userId, username, hashedPassword })
	} catch (error) {
		if (error instanceof DatabaseError) {
			if (error.code === PostgresError.UNIQUE_VIOLATION) {
				return c.json(`User with username "${username}" already exists\n`, HttpStatusCodes.CONFLICT)
			}
		}
	}
	return c.json({ userId }, HttpStatusCodes.OK)
}

export const createUser = [route, handler] as const
