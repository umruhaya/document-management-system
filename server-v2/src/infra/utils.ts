import os from 'node:os'

export const getInternalIpAddress = () => {
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

export const formatStartUpMessage = ({ port }: { port: number }) => {
	const internalIp = getInternalIpAddress()
	return `Server is listening at: \n\n\t- http://localhost:${port}\n\t- http://${internalIp}:${port}`
}
