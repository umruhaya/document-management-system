import { initContract } from '@ts-rest/core'
import { z } from 'zod'
import { UserSchema } from '~/app/dto/users'
import type { InferContract } from '~/presentation/utils/ts-rest-contract'

const c = initContract()

export const usersContract = c.router(
	{
		createUser: {
			method: 'POST',
			path: '/users',
			summary: 'Creates a New User in the system',
			headers: z.record(z.string()),
			body: UserSchema.create,
			responses: {
				200: UserSchema.createResponse,
				409: z.object({ message: z.string() }),
			},
		},
		updateUser: {
			method: 'PATCH',
			path: '/users',
			metadata: { jwt: true },
			summary: "Updates a User's Username and/or Password",
			headers: z.record(z.string()),
			body: UserSchema.patch.omit({ id: true }),
			responses: {
				200: UserSchema.patchResponse,
				404: z.object({ message: z.string() }),
				500: z.object({ message: z.string() }),
			},
		},
		loginUser: {
			method: 'POST',
			path: '/users/token',
			summary: 'Login and get JWT token',
			headers: z.record(z.string()),
			body: UserSchema.login,
			responses: {
				200: UserSchema.loginResponse,
				401: z.object({ message: z.string() }),
			},
		},
		getMyDetails: {
			method: 'GET',
			path: '/users/me',
			metadata: { jwt: true },
			summary: 'Retrieve Details of a user itself',
			headers: z.record(z.string()),
			responses: {
				200: UserSchema.meResponse,
				404: z.object({ message: z.string() }),
			},
		},
		getUserByUsername: {
			method: 'GET',
			path: '/users',
			summary: 'Retrieve Details of a user based on its username',
			headers: z.record(z.string()),
			query: UserSchema.getByUsername,
			responses: {
				200: UserSchema.getByUsernameResponse,
				404: z.object({ message: z.string() }),
			},
		},
	},
	{
		commonResponses: {
			500: z.object({ message: z.string() }),
		},
	},
)

export type UsersContract = InferContract<typeof usersContract>
