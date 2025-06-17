import { createRouter } from '~/lib/create-app'
import { getUserById } from './users.id.get'
import { createUser } from './users.post'
import { updateUser } from './users.patch'
import { loginUser } from './users.token.post'

export const usersRouter = createRouter()
	.openapi(...getUserById)
	.openapi(...createUser)
	.openapi(...updateUser)
	.openapi(...loginUser)
