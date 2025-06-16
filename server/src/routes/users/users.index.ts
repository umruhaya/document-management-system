import { createRouter } from '~/lib/create-app'
import { get } from './users.get'

export const usersRouter = createRouter()
	.openapi(...get)
