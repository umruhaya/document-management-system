import { container } from 'tsyringe'
import { UserService } from '~/app/services/user.service'
import { AuthorizationService } from '~/infra/services/authorization.service'
import type { UsersContract } from '~/presentation/contracts/users'
import { mapErrorToStatusCode } from '~/presentation/utils/http-mapper'
import { matchResultReturn } from '~/presentation/utils/result-match'

const userService = container.resolve(UserService)

export const usersController: UsersContract = {
	createUser: async ({ body }) => {
		const result = await userService.create(body)
		return matchResultReturn(result, {
			Ok: (user) => ({ status: 200, body: user }),
			Err: (err) => ({ status: mapErrorToStatusCode(err), body: { message: err.message } }),
		})
	},

	updateUser: async ({ body, headers }) => {
		const userId = AuthorizationService.getUserIdFromAuthHeader(headers.authorization)
		if (!userId) return { status: 401, body: { message: 'Invalid or missing token' } }

		const result = await userService.update({ id: userId, ...body })

		return matchResultReturn(result, {
			Ok: (user) => ({ status: 200, body: user }),
			Err: (err) => ({ status: mapErrorToStatusCode(err), body: { message: err.message } }),
		})
	},

	loginUser: async ({ body }) => {
		const result = await userService.login(body)
		return matchResultReturn(result, {
			Ok: (body) => ({ status: 200, body }),
			Err: (err) => ({ status: mapErrorToStatusCode(err), body: { message: err.message } }),
		})
	},

	getMyDetails: async ({ headers }) => {
		const userId = AuthorizationService.getUserIdFromAuthHeader(headers.authorization)
		if (!userId) return { status: 401, body: { message: 'Invalid or missing token' } }
		const result = await userService.getById({ id: userId })
		return matchResultReturn(result, {
			Ok: (user) => ({ status: 200, body: user }),
			Err: (err) => ({ status: mapErrorToStatusCode(err), body: { message: err.message } }),
		})
	},

	getUserByUsername: async ({ query }) => {
		const result = await userService.getByUsername(query)
		return matchResultReturn(result, {
			Ok: (user) => ({ status: 200, body: user }),
			Err: (err) => ({ status: mapErrorToStatusCode(err), body: { message: err.message } }),
		})
	},
}
