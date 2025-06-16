import type { RouteConfig } from '@hono/zod-openapi'
import { jwtMiddleware } from '~/middlewares/jwt'

type SecurityRequirement = RouteConfig['security']

export const jwtSecuritySchema: SecurityRequirement = [
	{
		'jwt': [],
	},
]

export const addJwtSecurity = (route: RouteConfig) => {
	// retain if there are any other middlewares
	const otherMiddlewares = Array.isArray(route['middleware']) ? route['middleware'] : []
	route['middleware'] = [...otherMiddlewares, jwtMiddleware()]
	route['security'] = jwtSecuritySchema
}
