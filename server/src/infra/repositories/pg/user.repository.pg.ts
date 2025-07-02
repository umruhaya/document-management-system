import { Result } from '@carbonteq/fp'
import { eq } from 'drizzle-orm'
import { PostgresError } from 'pg-error-enum'
import { injectable } from 'tsyringe'
import { UnknownError, UserAlreadyExistsError, UserNotFoundError } from '~/domain/errors'
import { UserEntity } from '~/domain/user/user.entity'
import { UserRepository } from '~/domain/user/user.repository'
import { DatabaseError, db, table } from '~/infra/database/client'
import { TryCatchAsync } from '~/utils/trycatch'

@injectable()
export class UserRepositoryPg extends UserRepository {
	getById(userId: string): Promise<Result<UserEntity, Error>> {
		return TryCatchAsync({
			fn: async () => {
				const user = await db
					.select()
					.from(table.users)
					.where(eq(table.users.id, userId))
					.execute()
					.then((r) => r.at(0))
				return user
					? UserEntity.create({
							...user,
							createdAt: new Date(user.createdAt).toISOString(),
							updatedAt: new Date(user.updatedAt).toISOString(),
						})
					: Result.Err(new UserNotFoundError({ userId }))
			},
			onError: (error) => Result.Err(new UnknownError(`Error: ${error}`, 'Failed user.get')),
		})
	}

	getByUsername(username: string): Promise<Result<UserEntity, Error>> {
		return TryCatchAsync({
			fn: async () => {
				const user = await db
					.select()
					.from(table.users)
					.where(eq(table.users.username, username))
					.execute()
					.then((r) => r.at(0))
				return user
					? UserEntity.create({
							...user,
							createdAt: new Date(user.createdAt).toISOString(),
							updatedAt: new Date(user.updatedAt).toISOString(),
						})
					: Result.Err(new UserNotFoundError({ username }))
			},
			onError: (error) => Result.Err(new UnknownError(`Error: ${error}`, 'Failed user.get')),
		})
	}

	create(input: Pick<UserEntity, 'id' | 'username' | 'hashedPassword'>): Promise<Result<UserEntity, Error>> {
		return TryCatchAsync({
			fn: async () => {
				// build entity and persist
				const now = new Date().toISOString()
				const serialized = {
					id: input.id,
					createdAt: now,
					updatedAt: now,
					username: input.username,
					hashedPassword: input.hashedPassword,
				}
				const entityRes = UserEntity.create(serialized)
				if (entityRes.isErr()) {
					return Result.Err(entityRes.unwrapErr())
				}
				const entity = entityRes.unwrap()
				await db.insert(table.users).values({ ...entity.serialize() })
				return Result.Ok(entity)
			},
			onError: (error) =>
				Result.Err(
					error instanceof DatabaseError && error.code === PostgresError.UNIQUE_VIOLATION
						? new UserAlreadyExistsError({ userId: input.id })
						: new UnknownError(`User Insert Failed With values ${JSON.stringify(input)}`, 'Failed user.create'),
				),
		})
	}

	update(
		user: Partial<Pick<UserEntity, 'username' | 'hashedPassword'>> & { id: string },
	): Promise<Result<true, Error>> {
		return TryCatchAsync({
			fn: async () => {
				const updatedUser = await db
					.update(table.users)
					.set(user)
					.where(eq(table.users.id, user.id))
					.returning()
					.execute()
					.then((r) => r.at(0))
				if (updatedUser === undefined) {
					return Result.Err(new UserNotFoundError({ userId: user.id }))
				}
				return Result.Ok(true)
			},
			onError: (error) =>
				Result.Err(
					new UnknownError(
						`User Update Failed With values ${JSON.stringify(user)}, Details: ${error}`,
						'Failed user.update',
					),
				),
		})
	}
}
