import 'reflect-metadata'
import { container } from '~/infra/container'
import { env } from '~/infra/env'
import { formatStartUpMessage } from '~/infra/utils'
import { expressApp } from '~/presentation/app'

// initialize the container
container.isRegistered

expressApp.listen(env.PORT, env.HOST, () => {
	console.log(formatStartUpMessage({ port: env.PORT }))
})
