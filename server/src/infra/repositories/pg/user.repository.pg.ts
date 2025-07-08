import { Result } from '@carbonteq/fp'
import { eq } from 'drizzle-orm'
import { PostgresError } from 'pg-error-enum'
import { injectable } from 'tsyringe'
import { UserEntity } from '~/domain/user/user.entity'
import { UserRepository } from '~/domain/user/user.repository'
import { UserAlreadyExistsError, UserNotFoundError } from '~/domain/user/users.errors'
import type { AlreadyExistsError, NotFoundError, RepositoryResult } from '~/hexapp'
import { DatabaseError, db, table } from '~/infra/database/client'
import { TryCatchAsync } from '~/utils/trycatch'

@injectable()
export class UserRepositoryPg extends UserRepository {
	insert(user: UserEntity): Promise<RepositoryResult<UserEntity, AlreadyExistsError>> {
		const abc = TryCatchAsync({
			fn: async () => {
				await db.insert(table.users).values(user.serialize())
				return Result.Ok(user)
			},
			onError: (error) => {
				if (error instanceof DatabaseError && error.code === PostgresError.UNIQUE_VIOLATION) {
					return Result.Err(new UserAlreadyExistsError('User Already Exists'))
				}
				return Result.Err(new Error(JSON.stringify(error)))
			},
		})
		return abc
	}

	update(user: UserEntity): Promise<RepositoryResult<UserEntity, NotFoundError>> {
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
					return Result.Err(new UserNotFoundError(`No User Exists with ID: ${user.id}`))
				}
				return Result.Ok(user)
			},
			onError: (error) =>
				Result.Err(new Error(`User Update Failed With values ${JSON.stringify(user)}, Details: ${error}`)),
		})
	}

	fetchById(userId: UserEntity['id']): Promise<RepositoryResult<UserEntity, NotFoundError>> {
		return TryCatchAsync({
			fn: async () => {
				const user = await db
					.select()
					.from(table.users)
					.where(eq(table.users.id, userId))
					.execute()
					.then((r) => r.at(0))
				return user
					? UserEntity.fromSerialized(user)
					: Result.Err(new UserNotFoundError(`No User Exists with ID: ${userId}`))
			},
			onError: (error) => Result.Err(new Error(JSON.stringify(error))),
		})
	}

	fetchByUsername(username: UserEntity['username']): Promise<RepositoryResult<UserEntity, NotFoundError>> {
		return TryCatchAsync({
			fn: async () => {
				const user = await db
					.select()
					.from(table.users)
					.where(eq(table.users.username, username))
					.execute()
					.then((r) => r.at(0))
				return user
					? UserEntity.fromSerialized(user)
					: Result.Err(new UserNotFoundError(`No User Exists with Username: ${username}`))
			},
			onError: (error) => Result.Err(new Error(JSON.stringify(error))),
		})
	}
}
