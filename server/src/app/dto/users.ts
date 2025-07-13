import { z } from 'zod'
import type { InferZodTypesRecursively } from './_utils'

const user = z.object({
	id: z.string().uuid(),
	username: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export const UserSchema = {
	// Create User
	create: user.pick({ username: true }).extend({ password: z.string() }),
	createResponse: user.pick({ id: true }).extend({
		jwtToken: z.string(),
	}),

	// Login Request For User
	login: user.pick({ username: true }).extend({
		password: z.string(),
	}),
	loginResponse: user.pick({ id: true }).extend({
		jwtToken: z.string(),
	}),

	// Get My Details
	me: user.pick({ id: true }),
	meResponse: user,

	// Patch User Details (Update Username or Password)
	patch: z.object({
		id: z.string(),
		username: z.string().optional(),
		password: z.string().optional(),
	}),
	patchResponse: user,

	// User by Username
	getByUsername: user.pick({ username: true }),
	getByUsernameResponse: user,
}

/**
 * Recursively infers types for all entries in a DTO object using z.infer.
 * For nested objects, applies inference recursively.
 */

// Example usage:
export type UserDTO = InferZodTypesRecursively<typeof UserSchema>
