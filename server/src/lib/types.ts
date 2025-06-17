import type { OpenAPIHono, RouteConfig, RouteHandler } from '@hono/zod-openapi'
import type { JwtVariables } from 'hono/jwt'

type Variables = JwtVariables<{ userId: string; username: string }> & {}

export interface AppBindings {
	Variables: Variables
}

export type AppOpenAPI = OpenAPIHono<AppBindings>

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>
