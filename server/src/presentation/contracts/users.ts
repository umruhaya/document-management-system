import { initContract } from '@ts-rest/core'
import { z } from 'zod'
import * as dtos from '~/presentation/dtos/users'

const c = initContract()

export const usersContract = c.router({
	createUser: {
		method: 'POST',
		path: '/users',
		summary: 'Creates a New User in the system',
		body: dtos.UserCredentials,
		responses: {
			200: dtos.CreateUserResponse,
			409: z.string(),
		},
	},
	updateUser: {
		method: 'PATCH',
		path: '/users',
		summary: "Updates a User's Username and/or Password",
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
		body: dtos.LoginUserRequest,
		responses: {
			200: dtos.LoginUserResponse,
			401: z.string(),
		},
	},
	getMyDetails: {
		method: 'GET',
		path: '/users/me',
		summary: 'Retrieve Details of a user itself',
		responses: {
			200: dtos.GetMyDetailsResponse,
			404: z.string(),
		},
		// security: [{ jwt: [] }]
	},
	getUserByUsername: {
		method: 'GET',
		path: '/users',
		summary: 'Retrieve Details of a user based on its username',
		query: dtos.GetUserQuery,
		responses: {
			200: dtos.GetUserResponse,
			404: z.string(),
		},
	},
})
