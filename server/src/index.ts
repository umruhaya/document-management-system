// import { serve } from '@hono/node-server'
import app from '~/app'
import { env } from '~/env'
import os from 'os'

function getInternalIpAddress() {
	const networkInterfaces = os.networkInterfaces()

	for (const interfaceName in networkInterfaces) {
		const interfaces = networkInterfaces[interfaceName]

		if (!interfaces) return '127.0.0.1'

		for (const iface of interfaces) {
			// Check for IPv4 and internal=true
			if (iface.family === 'IPv4' && !iface.internal) {
				return iface.address
			}
		}
	}

	return '127.0.0.1'
}

const internalIp = getInternalIpAddress()

export default {
	fetch: app.fetch,
	port: env.PORT,
	hostname: env.HOST,
}

console.log(
	`Server is listening at: \n\n\t- http://localhost:${env.PORT}\n\t- http://${internalIp}:${env.PORT}`,
)
