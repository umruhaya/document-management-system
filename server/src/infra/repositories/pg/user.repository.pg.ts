import { matchOpt, Option, Result } from '@carbonteq/fp'
import { eq } from 'drizzle-orm'
import { match } from 'ts-pattern'
import { injectable } from 'tsyringe'
import { UserEntity } from '~/domain/user/user.entity'
import { UserRepository } from '~/domain/user/user.repository'
import { UserAlreadyExistsError, UserNotFoundError } from '~/domain/user/users.errors'
import type { AlreadyExistsError, NotFoundError, RepositoryResult } from '~/hexapp'
import { db, table } from '~/infra/database/client'
import { pgErrors } from '~/infra/utils'
import { TryCatchAsync } from '~/utils/trycatch'

@injectable()
export class UserRepositoryPg extends UserRepository {
	insert(user: UserEntity): Promise<RepositoryResult<UserEntity, AlreadyExistsError>> {
		return TryCatchAsync({
			fn: async () => {
				await db.insert(table.users).values(user.serialize())
				return Result.Ok(user)
			},
			onError: (error) => {
				return match(pgErrors.isUniqueConstraintViolationError(error))
					.with(true, () =>
						Result.Err(new UserAlreadyExistsError(`User Already Exists With Username ${user.username}`)),
					)
					.otherwise(() => Result.Err(new Error(JSON.stringify(error))))
			},
		})
	}

	update(user: UserEntity): Promise<RepositoryResult<UserEntity, NotFoundError>> {
		return TryCatchAsync({
			fn: async () => {
				const updatedUserOpt = await db
					.update(table.users)
					.set(user)
					.where(eq(table.users.id, user.id))
					.returning()
					.execute()
					.then((r) => Option.fromNullable(r.at(0)))

				return matchOpt(updatedUserOpt, {
					Some: UserEntity.create,
					None: () => Result.Err(new UserNotFoundError(`No User Exists with ID: ${user.id}`)),
				})
			},
			onError: (error) => {
				return match(pgErrors.isUniqueConstraintViolationError(error))
					.with(true, () =>
						Result.Err(new UserAlreadyExistsError(`User Already Exists With Username ${user.username}`)),
					)
					.otherwise(() => Result.Err(new Error(JSON.stringify(error))))
			},
		})
	}

	patch(
		user: Partial<Omit<UserEntity, 'id'>> & { id: UserEntity['id'] },
	): Promise<RepositoryResult<UserEntity, NotFoundError>> {
		return TryCatchAsync({
			fn: async () => {
				const updatedUserOpt = await db
					.update(table.users)
					.set(user)
					.where(eq(table.users.id, user.id))
					.returning()
					.execute()
					.then((r) => Option.fromNullable(r.at(0)))

				return matchOpt(updatedUserOpt, {
					Some: UserEntity.create,
					None: () => Result.Err(new UserNotFoundError(`No User Exists with ID: ${user.id}`)),
				})
			},
			onError: (error) => {
				return match(pgErrors.isUniqueConstraintViolationError(error))
					.with(true, () =>
						Result.Err(new UserAlreadyExistsError(`User Already Exists With Username ${user.username}`)),
					)
					.otherwise(() => Result.Err(new Error(JSON.stringify(error))))
			},
		})
	}

	fetchById(userId: UserEntity['id']): Promise<RepositoryResult<UserEntity, NotFoundError>> {
		return TryCatchAsync({
			fn: async () => {
				const userOpt = await db
					.select()
					.from(table.users)
					.where(eq(table.users.id, userId))
					.execute()
					.then((r) => Option.fromNullable(r.at(0)))
				return matchOpt(userOpt, {
					Some: UserEntity.fromSerialized,
					None: () => Result.Err(new UserNotFoundError(`No User Exists with ID: ${userId}`)),
				})
			},
			onError: (error) => Result.Err(new Error(JSON.stringify(error))),
		})
	}

	fetchByUsername(username: UserEntity['username']): Promise<RepositoryResult<UserEntity, NotFoundError>> {
		return TryCatchAsync({
			fn: async () => {
				const userOpt = await db
					.select()
					.from(table.users)
					.where(eq(table.users.username, username))
					.execute()
					.then((r) => Option.fromNullable(r.at(0)))
				return matchOpt(userOpt, {
					Some: UserEntity.fromSerialized,
					None: () => Result.Err(new UserNotFoundError(`No User Exists with Username: ${username}`)),
				})
			},
			onError: (error) => Result.Err(new Error(JSON.stringify(error))),
		})
	}
}
