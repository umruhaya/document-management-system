import { expressApp } from '~/presentation/http/express/app'
import { env } from '~/env'
import { formatStartUpMessage } from './utils'

expressApp.listen(env.PORT, env.HOST, () => {
	console.log(formatStartUpMessage({ port: env.PORT }))
})
