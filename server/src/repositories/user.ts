import { DatabaseError, db, table } from '~/db'
import argon2 from 'argon2'
import { ulid } from 'ulidx'
import { sign } from 'hono/jwt'
import { eq } from 'drizzle-orm'
import { env } from '~/env'
import { Result, ResultType } from '~/lib/result'
import { PostgresError} from 'pg-error-enum'

// Repository-specific error types
type UserRepoError =
	| { type: 'UserAlreadyExists'; message: string }
	| { type: 'UserNotFound'; message: string }
	| { type: 'InvalidCredentials'; message: string }
	| { type: 'Unknown'; message: string }

export class UserRepository {
	async getByUsername(username: string): Promise<ResultType<
		{ userId: string; username: string },
		{ type: 'UserNotFound'; message: string }
	>> {
		const user = await db
			.select({
				userId: table.users.id,
				username: table.users.username,
			})
			.from(table.users)
			.where(eq(table.users.username, username))
			.then(r => r.at(0))
		if (!user) {
			return Result.err({ type: 'UserNotFound', message: `No User Found with Username "${username}"` })
		}
		return Result.ok(user)
	}

	async create(username: string, password: string): Promise<ResultType<
		{ userId: string; token: string },
		{ type: 'UserAlreadyExists'; message: string } | { type: 'Unknown'; message: string }
	>> {
		const hashedPassword = await argon2.hash(password)
		const userId = ulid()
		try {
			await db.insert(table.users)
				.values({ id: userId, username, hashedPassword })
		} catch (error) {
			if (error instanceof DatabaseError && error.code === PostgresError.UNIQUE_VIOLATION) {
				return Result.err({
					type: 'UserAlreadyExists',
					message: `User with username "${username}" already exists`
				})
			}
			return Result.err({
				type: 'Unknown',
				message: (error as any).message || 'Unknown error'
			})
		}
		const EXPIRY_TIME = 4 * 60 * 60 // 4 hours
		const token = await sign({
			userId,
			username,
			iat: Date.now() / 1000,
			exp: Date.now() / 1000 + EXPIRY_TIME,
		}, env.JWT_SECRET)
		return Result.ok({ userId, token })
	}

	async login(username: string, password: string): Promise<ResultType<
		{ token: string },
		{ type: 'InvalidCredentials'; message: string } | { type: 'Unknown'; message: string }
	>> {
		const user = await db
			.select()
			.from(table.users)
			.where(eq(table.users.username, username))
			.then(r => r.at(0))
		if (!user) {
			return Result.err({
				type: 'InvalidCredentials',
				message: 'Invalid username or password'
			})
		}
		const valid = await argon2.verify(user.hashedPassword, password)
		if (!valid) {
			return Result.err({
				type: 'InvalidCredentials',
				message: 'Invalid username or password'
			})
		}
		const EXPIRY_TIME = 4 * 60 * 60 // 4 hours
		const token = await sign({
			userId: user.id,
			username,
			iat: Date.now() / 1000,
			exp: Date.now() / 1000 + EXPIRY_TIME,
		}, env.JWT_SECRET)
		return Result.ok({ token })
	}

	async update(
		userId: string,
		{ username, password, newUsername }: { username?: string, password?: string, newUsername?: string }
	): Promise<ResultType<
		{ updated: boolean },
		{ type: 'UserNotFound'; message: string } | { type: 'Unknown'; message: string }
	>> {
		if (!username && !password) {
			return Result.ok({ updated: false })
		}
		const hashedPassword = password ? await argon2.hash(password) : undefined
		const updateData: any = { updatedAt: new Date() }
		if (newUsername) updateData.username = newUsername
		if (hashedPassword) updateData.hashedPassword = hashedPassword
		let updatedUser
		try {
			updatedUser = await db.update(table.users)
				.set(updateData)
				.where(eq(table.users.id, userId))
				.returning()
				.then(r => r.at(0))
		} catch (error: any) {
			return Result.err({ type: 'Unknown', message: error.message || 'Unknown error' })
		}
		if (!updatedUser) {
			return Result.err({
				type: 'UserNotFound',
				message: `User not found`
			})
		}
		return Result.ok({ updated: true })
	}

	async getMe(userId: string): Promise<ResultType<
		{ id: string; username: string; createdAt: string; updatedAt: string },
		{ type: 'UserNotFound'; message: string }
	>> {
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
			return Result.err({
				type: 'UserNotFound',
				message: `No User Found with ID ${userId}`
			})
		}
		return Result.ok(user)
	}
}
