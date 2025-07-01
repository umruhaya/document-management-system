import { initContract } from '@ts-rest/core'
import { z } from 'zod'
import * as dtos from '~/presentation/dtos/users'
import type { InferContract } from '~/presentation/utils/ts-rest-contract'

const c = initContract()

export const usersContract = c.router(
	{
		createUser: {
			method: 'POST',
			path: '/users',
			summary: 'Creates a New User in the system',
			headers: z.record(z.string()),
			body: dtos.UserCredentials,
			responses: {
				200: dtos.CreateUserResponse,
				409: z.string(),
			},
		},
		updateUser: {
			method: 'PATCH',
			path: '/users',
			metadata: { jwt: true },
			summary: "Updates a User's Username and/or Password",
			headers: z.record(z.string()),
			body: dtos.UserUpdate,
			responses: {
				200: dtos.UpdateUserResponse,
				404: z.string(),
				500: z.string(),
			},
		},
		loginUser: {
			method: 'POST',
			path: '/users/token',
			summary: 'Login and get JWT token',
			headers: z.record(z.string()),
			body: dtos.LoginUserRequest,
			responses: {
				200: dtos.LoginUserResponse,
				401: z.string(),
			},
		},
		getMyDetails: {
			method: 'GET',
			path: '/users/me',
			metadata: { jwt: true },
			summary: 'Retrieve Details of a user itself',
			headers: z.record(z.string()),
			responses: {
				200: dtos.GetMyDetailsResponse,
				404: z.string(),
			},
		},
		getUserByUsername: {
			method: 'GET',
			path: '/users',
			summary: 'Retrieve Details of a user based on its username',
			headers: z.record(z.string()),
			query: dtos.GetUserQuery,
			responses: {
				200: dtos.GetUserResponse,
				404: z.string(),
			},
		},
	},
	{
		commonResponses: {
			500: z.string(),
		},
	},
)

export type UsersContract = InferContract<typeof usersContract>
