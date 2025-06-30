import 'reflect-metadata'
import { env } from '~/infra/env'
import { expressApp } from '~/presentation/app'
import { formatStartUpMessage } from '~/infra/utils'

expressApp.listen(env.PORT, env.HOST, () => {
	console.log(formatStartUpMessage({ port: env.PORT }))
})
