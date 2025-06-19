import { z } from 'zod'
import { createRoute } from './_helpers'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import * as HttpStatusPhrases from 'stoker/http-status-phrases'
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers'
import * as dtos from '../dtos/users'

export const createUser = createRoute({
	method: 'post',
	path: '/users',
	operationId: 'createUser',
	tags: ['Users'],
	summary: 'Creates a New User in the system',
	request: {
		body: jsonContentRequired(dtos.UserCredentials, 'UserCredentials'),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(dtos.CreateUserResponse, HttpStatusPhrases.OK),
		[HttpStatusCodes.CONFLICT]: jsonContent(z.string(), HttpStatusPhrases.CONFLICT),
	},
})

export const updateUser = createRoute({
	method: 'patch',
	path: '/users',
	operationId: 'updateUser',
	tags: ['Users'],
	summary: "Updates a User's Username and/or Password",
	security: [{ jwt: [] }],
	request: {
		body: jsonContentRequired(dtos.UserUpdate, 'UserUpdate'),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(dtos.UpdateUserResponse, HttpStatusPhrases.OK),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(z.string(), HttpStatusPhrases.NOT_FOUND),
		[HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(z.string(), HttpStatusPhrases.INTERNAL_SERVER_ERROR),
	},
})

export const loginUser = createRoute({
	method: 'post',
	path: '/users/token',
	operationId: 'loginUser',
	tags: ['Users'],
	summary: 'Login and get JWT token',
	request: {
		body: jsonContentRequired(dtos.LoginUserRequest, 'UserCredentials'),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(dtos.LoginUserResponse, HttpStatusPhrases.OK),
		[HttpStatusCodes.UNAUTHORIZED]: jsonContent(z.string(), HttpStatusPhrases.UNAUTHORIZED),
	},
})

export const getMyDetails = createRoute({
	method: 'get',
	path: '/users/me',
	operationId: 'getMyDetails',
	tags: ['Users'],
	summary: 'Retrieve Details of a user itself',
	security: [{ jwt: [] }],
	responses: {
		[HttpStatusCodes.OK]: jsonContent(dtos.GetMyDetailsResponse, HttpStatusPhrases.OK),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(z.string(), HttpStatusPhrases.NOT_FOUND),
	},
})

export const getUserByUsername = createRoute({
	method: 'get',
	path: '/users',
	operationId: 'getUserDetailsByUsername',
	tags: ['Users'],
	summary: 'Retrieve Details of a user based on its username',
	request: {
		query: dtos.GetUserQuery,
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(dtos.GetUserResponse, HttpStatusPhrases.OK),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(z.string(), HttpStatusPhrases.NOT_FOUND),
	},
})
