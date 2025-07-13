import os from 'node:os'
import { DrizzleQueryError } from 'drizzle-orm/errors'
import { PostgresError as PgErrors } from 'pg-error-enum'
import { PostgresError } from 'postgres'

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

export const pgErrors = {
	isPostgressError: (error: unknown): error is PostgresError => {
		return error instanceof DrizzleQueryError && error.cause instanceof PostgresError
	},
	isUniqueConstraintViolationError: (error: unknown): boolean => {
		return (
			error instanceof DrizzleQueryError &&
			error.cause instanceof PostgresError &&
			error.cause.code === PgErrors.UNIQUE_VIOLATION
		)
	},
}
