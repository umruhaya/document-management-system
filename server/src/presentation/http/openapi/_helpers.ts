import type { RouteConfig } from '@asteasolutions/zod-to-openapi'

export const createRoute: <R extends RouteConfig>(routeConfig: R) => R = (r) => r
