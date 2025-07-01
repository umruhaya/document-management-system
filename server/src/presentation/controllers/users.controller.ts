import { AuthorizationService } from '~/app/services/authorization.service'
import { UserService } from '~/app/services/user.service'
import { UserRepositoryPg } from '~/infra/repositories/pg/user.repository.pg'
import type { UsersContract } from '~/presentation/contracts/users'
import { mapEntityErrorToStatusCode } from '~/presentation/utils/http-mapper'
import { matchResultReturn } from '~/presentation/utils/result-match'

const userService = new UserService(new UserRepositoryPg())
export const usersController: UsersContract = {
	createUser: async ({ body }) => {
		const result = await userService.create(body)
		return matchResultReturn(result, {
			Ok: (user) => ({ status: 200, body: { userId: user.id, token: user.token } }),
			Err: (err) => ({ status: mapEntityErrorToStatusCode(err), body: err.message }),
		})
	},

	updateUser: async ({ body, headers }) => {
		const userId = AuthorizationService.getUserIdFromAuthHeader(headers.authorization)
		if (!userId) return { status: 401, body: 'Invalid or missing token' }
		const result = await userService.update({ id: userId, ...body })
		return matchResultReturn(result, {
			Ok: () => ({ status: 200, body: { updated: true } }),
			Err: (err) => ({ status: mapEntityErrorToStatusCode(err), body: err.message }),
		})
	},

	loginUser: async ({ body }) => {
		const result = await userService.login(body)
		return matchResultReturn(result, {
			Ok: ({ token }) => ({ status: 200, body: { token } }),
			Err: (err) => ({ status: mapEntityErrorToStatusCode(err), body: err.message }),
		})
	},

	getMyDetails: async ({ headers }) => {
		const userId = AuthorizationService.getUserIdFromAuthHeader(headers.authorization)
		if (!userId) return { status: 401, body: 'Invalid or missing token' }
		const result = await userService.getById(userId)
		return matchResultReturn(result, {
			Ok: ({ id, username, createdAt, updatedAt }) => ({
				status: 200,
				body: { id, username, createdAt: createdAt.toISOString(), updatedAt: updatedAt.toISOString() },
			}),
			Err: (err) => ({ status: mapEntityErrorToStatusCode(err), body: err.message }),
		})
	},

	getUserByUsername: async ({ query }) => {
		const result = await userService.getByUsername(query.username)
		return matchResultReturn(result, {
			Ok: ({ id, username }) => ({ status: 200, body: { userId: id, username } }),
			Err: (err) => ({ status: mapEntityErrorToStatusCode(err), body: err.message }),
		})
	},
}
