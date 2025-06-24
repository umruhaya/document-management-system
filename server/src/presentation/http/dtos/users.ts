import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

extendZodWithOpenApi(z)

// Get user by username
export const GetUserQuery = z.object({ username: z.string() })
export const GetUserResponse = z.object({
	userId: z.string(),
	username: z.string(),
})

// Create user
export const UserCredentials = z.object({
	username: z.string(),
	password: z.string(),
})
export const CreateUserResponse = z.object({
	userId: z.string(),
	token: z.string(),
})

// Login user
export const LoginUserRequest = z.object({
	username: z.string(),
	password: z.string(),
})
export const LoginUserResponse = z.object({
	token: z.string(),
})

// Update user
export const UserUpdate = z.object({
	username: z.string(),
	newUsername: z.string().optional(),
	password: z.string().optional(),
})
export const UpdateUserResponse = z.object({
	updated: z.boolean(),
})

// Get my details
export const GetMyDetailsResponse = z.object({
	id: z.string(),
	username: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
})
