import { OpenAPIHono } from '@hono/zod-openapi'
import { notFound, onError, serveEmojiFavicon } from 'stoker/middlewares'
import { defaultHook } from 'stoker/openapi'
import type { AppBindings, AppOpenAPI } from './types'
import { swaggerUI } from '@hono/swagger-ui'
import { requestId } from 'hono/request-id'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

export function createRouter() {
	return new OpenAPIHono<AppBindings>({
		strict: false,
		defaultHook,
	})
}

export function createApp() {
	const app = createRouter()

	app.use(serveEmojiFavicon('📝'))
	app.use(requestId())
	app.use(logger())

	app.use(
		'*',
		cors({
			origin: '*',
			allowHeaders: ['*'],
			allowMethods: ['GET', 'POST', 'OPTIONS', 'DELETE', 'PATCH', 'PUT'],
			credentials: true,
		}),
	)

	// The OpenAPI specification will be available at /docs.json
	app.doc('/docs.json', {
		openapi: '3.0.0',
		info: {
			version: '1.0.0',
			title: 'DMS API',
		},
		// servers: [{ url: '/api' }],
	})

	app.openAPIRegistry.registerComponent('securitySchemes', 'jwt', {
		type: 'http',
		scheme: 'bearer',
		description: 'JSON Web Token',
		bearerFormat: 'JWT',
	})

	app.get('/', (c) => {
		return c.html(
			`<div><h1>DMS Server is Up</h1><a href='/docs'>View Docs</a></div>`,
		)
	})

	app.get('/healthz', c => c.text('OK\n'))
	app.get('/livez', c => c.text('OK\n'))
	app.get('/readyz', c => c.text('OK\n'))

	app.get('/docs', swaggerUI({ url: '/docs.json', persistAuthorization: true }))

	app.notFound(notFound)
	app.onError(onError)

	return app
}

export function createTestApp<R extends AppOpenAPI>(router: R) {
	return createApp().route('/', router)
}
