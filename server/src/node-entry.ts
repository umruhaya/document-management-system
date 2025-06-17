import { serve } from '@hono/node-server'
import app from '~/app'
import { env } from '~/env'
import { formatStartUpMessage } from './utils'

serve({
	fetch: app.fetch,
	port: env.PORT,
	hostname: env.HOST,
}, (info) => {
	console.log(formatStartUpMessage({ port: env.PORT }))
})
