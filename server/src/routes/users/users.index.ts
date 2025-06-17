import { createRouter } from '~/lib/create-app'
import { getMyDetails } from './users.me.get'
import { createUser } from './users.post'
import { updateUser } from './users.patch'
import { loginUser } from './users.token.post'
import { getUserByUsername } from './users.get'

export const usersRouter = createRouter()
	.openapi(...getMyDetails)
	.openapi(...getUserByUsername)
	.openapi(...createUser)
	.openapi(...updateUser)
	.openapi(...loginUser)
