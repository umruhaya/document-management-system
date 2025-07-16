import { z } from 'zod'

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

// Data Transfer Object (DTO) types inferred from the Zod schemas.

// Create User DTOs
export type CreateUserDTO = z.infer<typeof UserSchema.create>
export type CreateUserResponseDTO = z.infer<typeof UserSchema.createResponse>

// Login DTOs
export type LoginUserDTO = z.infer<typeof UserSchema.login>
export type LoginUserResponseDTO = z.infer<typeof UserSchema.loginResponse>

// Get My Details DTOs
export type GetMyDetailsDTO = z.infer<typeof UserSchema.me>
export type GetMyDetailsResponseDTO = z.infer<typeof UserSchema.meResponse>

// Patch User Details DTOs
export type PatchUserDTO = z.infer<typeof UserSchema.patch>
export type PatchUserResponseDTO = z.infer<typeof UserSchema.patchResponse>

// Get User by Username DTOs
export type GetUserByUsernameDTO = z.infer<typeof UserSchema.getByUsername>
export type GetUserByUsernameResponseDTO = z.infer<typeof UserSchema.getByUsernameResponse>
