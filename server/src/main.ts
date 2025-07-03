import 'reflect-metadata'
import { Command } from 'commander'
import { container } from '~/infra/container'
import { env } from '~/infra/env'
import { formatStartUpMessage } from '~/infra/utils'
import { expressApp } from '~/presentation/app'

// initialize the container
container.isRegistered

const program = new Command()

program
	.command('serve')
	.description('Start the HTTP server')
	.option('--host <host>', 'Host to bind the server')
	.option('--port <port>', 'Port to bind the server', (value) => parseInt(value, 10))
	.action((options) => {
		const host = options.host || env.HOST
		const port = options.port || env.PORT
		expressApp.listen(port, host, () => {
			console.log(formatStartUpMessage({ port }))
		})
	})

program.parse(process.argv)
