import { z } from 'zod'
import * as dtos from '~/presentation/http/dtos/users'
import { db, table } from '~/db'
import argon2 from 'argon2'
import { ulid } from 'ulidx'
import { sign } from 'hono/jwt'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import { httpResponse } from '~/presentation/http/lib'
import { eq } from 'drizzle-orm'
import { env } from '~/env'

export const getByUsername = async (
	{ query }: { query: any },
) => {
	const parseResult = dtos.GetUserQuery.safeParse(query)
	if (!parseResult.success) {
		return httpResponse({ json: { error: parseResult.error.errors }, statusCode: HttpStatusCodes.UNPROCESSABLE_ENTITY })
	}
	const { username } = parseResult.data
	const user = await db
		.select({
			userId: table.users.id,
			username: table.users.username,
		})
		.from(table.users)
		.where(eq(table.users.username, username))
		.then(r => r.at(0))

	if (!user) {
		return httpResponse({
			json: `No User Found with Username "${username}"\n`,
			statusCode: HttpStatusCodes.NOT_FOUND,
		})
	}

	return httpResponse({ json: user, statusCode: HttpStatusCodes.OK })
}

export const create = async (
	{ body }: { body: any },
) => {
	const parseResult = dtos.UserCredentials.safeParse(body)
	if (!parseResult.success) {
		return httpResponse({ json: { error: parseResult.error.errors }, statusCode: HttpStatusCodes.UNPROCESSABLE_ENTITY })
	}
	const { username, password } = parseResult.data
	const hashedPassword = await argon2.hash(password)
	const userId = ulid()

	try {
		await db.insert(table.users)
			.values({ id: userId, username, hashedPassword })
	} catch (error: any) {
		if (error.code === '23505') {
			return httpResponse({
				json: `User with username "${username}" already exists\n`,
				statusCode: HttpStatusCodes.CONFLICT,
			})
		}
		throw error
	}

	const EXPIRY_TIME = 4 * 60 * 60 // 4 hours
	const token = await sign({
		userId,
		username,
		iat: Date.now() / 1000,
		exp: Date.now() / 1000 + EXPIRY_TIME,
	}, env.JWT_SECRET)

	return httpResponse({ json: { userId, token }, statusCode: HttpStatusCodes.OK })
}

export const login = async (
	{ body }: { body: any },
) => {
	const parseResult = dtos.LoginUserRequest.safeParse(body)
	if (!parseResult.success) {
		return httpResponse({ json: { error: parseResult.error.errors }, statusCode: HttpStatusCodes.UNPROCESSABLE_ENTITY })
	}
	const { username, password } = parseResult.data
	const user = await db
		.select()
		.from(table.users)
		.where(eq(table.users.username, username))
		.then(r => r.at(0))

	if (!user) {
		return httpResponse({ json: 'Invalid username or password\n', statusCode: HttpStatusCodes.UNAUTHORIZED })
	}
	const valid = await argon2.verify(user.hashedPassword, password)
	if (!valid) {
		return httpResponse({ json: 'Invalid username or password\n', statusCode: HttpStatusCodes.UNAUTHORIZED })
	}

	const EXPIRY_TIME = 4 * 60 * 60 // 4 hours
	const token = await sign({
		userId: user.id,
		username,
		iat: Date.now() / 1000,
		exp: Date.now() / 1000 + EXPIRY_TIME,
	}, env.JWT_SECRET)

	return httpResponse({ json: { token }, statusCode: HttpStatusCodes.OK })
}

export const update = async (
	{ userId, body }: { userId: string; body: any },
) => {
	const parseResult = dtos.UserUpdate.safeParse(body)
	if (!parseResult.success) {
		return httpResponse({ json: { error: parseResult.error.errors }, statusCode: HttpStatusCodes.UNPROCESSABLE_ENTITY })
	}
	const { username, password, newUsername } = parseResult.data

	if (!username && !password) {
		return httpResponse({ json: { updated: false }, statusCode: HttpStatusCodes.OK })
	}

	const hashedPassword = password ? await argon2.hash(password) : undefined

	const updateData: any = { updatedAt: new Date() }
	if (newUsername) updateData.username = newUsername
	if (hashedPassword) updateData.hashedPassword = hashedPassword

	const updatedUser = await db.update(table.users)
		.set(updateData)
		.where(eq(table.users.id, userId))
		.returning()
		.then(r => r.at(0))

	if (!updatedUser) {
		return httpResponse({ json: `User "${username}" not found\n`, statusCode: HttpStatusCodes.NOT_FOUND })
	}

	return httpResponse({ json: { updated: true }, statusCode: HttpStatusCodes.OK })
}

export const getMe = async (
	{ userId }: { userId: string },
) => {
	const user = await db
		.select({
			id: table.users.id,
			username: table.users.username,
			createdAt: table.users.createdAt,
			updatedAt: table.users.updatedAt,
		})
		.from(table.users)
		.where(eq(table.users.id, userId))
		.then(r => r.at(0))

	if (!user) {
		return httpResponse({ json: `No User Found with ID ${userId}`, statusCode: HttpStatusCodes.NOT_FOUND })
	}

	return httpResponse({ json: user, statusCode: HttpStatusCodes.OK })
}
