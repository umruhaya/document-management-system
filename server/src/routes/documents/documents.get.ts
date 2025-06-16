import { z } from 'zod'
import { createRoute } from '@hono/zod-openapi'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import * as HttpStatusPhrases from 'stoker/http-status-phrases'
import { jsonContent } from 'stoker/openapi/helpers'
import type { AppRouteHandler } from '~/lib/types'

const route = createRoute({
	method: 'get',
	path: '/documents',
	operationId: 'getDocument',
	tags: ['Documents'],
	summary: 'Retrieve Details of a Document if it exists',
	responses: {
		[HttpStatusCodes.OK]: jsonContent(
			z.object({}),
			HttpStatusPhrases.OK,
		),
	},
})

const handler: AppRouteHandler<typeof route> = async (c) => {
	return c.json({}, HttpStatusCodes.OK)
}

export const get = [route, handler] as const
