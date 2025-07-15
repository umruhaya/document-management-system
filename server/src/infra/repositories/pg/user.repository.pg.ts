import { matchOpt, Option, Result } from '@carbonteq/fp'
import { ExponentialBackoff, handleAll, retry, TimeoutStrategy, timeout } from 'cockatiel'
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
	private readonly retryPolicy = retry(handleAll, { maxAttempts: 3, backoff: new ExponentialBackoff() })
	private readonly timeoutPolicy = timeout(2000, TimeoutStrategy.Aggressive)

	// Utility to run with policies
	private runWithPolicy<T>(fn: () => Promise<T>): Promise<T> {
		return this.retryPolicy.execute(() => this.timeoutPolicy.execute(fn))
	}

	insert(user: UserEntity): Promise<RepositoryResult<UserEntity, AlreadyExistsError>> {
		return TryCatchAsync({
			fn: () => this.runWithPolicy(() => db.insert(table.users).values(user.serialize())).then(() => Result.Ok(user)),
			onError: (error) =>
				match(pgErrors.isUniqueConstraintViolationError(error))
					.with(true, () =>
						Result.Err(new UserAlreadyExistsError(`User Already Exists With Username ${user.username}`)),
					)
					.otherwise(() => Result.Err(new Error(JSON.stringify(error)))),
		})
	}

	update(user: UserEntity): Promise<RepositoryResult<UserEntity, NotFoundError>> {
		return TryCatchAsync({
			fn: () =>
				this.runWithPolicy(async () => {
					const r = await db.update(table.users).set(user).where(eq(table.users.id, user.id)).returning().execute()
					return Option.fromNullable(r.at(0))
				}).then((updatedUserOpt) =>
					matchOpt(updatedUserOpt, {
						Some: UserEntity.create,
						None: () => Result.Err(new UserNotFoundError(`No User Exists with ID: ${user.id}`)),
					}),
				),
			onError: (error) =>
				match(pgErrors.isUniqueConstraintViolationError(error))
					.with(true, () =>
						Result.Err(new UserAlreadyExistsError(`User Already Exists With Username ${user.username}`)),
					)
					.otherwise(() => Result.Err(new Error(JSON.stringify(error)))),
		})
	}

	// Similarly for patch, fetchById, fetchByUsername:
	patch(
		user: Partial<Omit<UserEntity, 'id'>> & { id: UserEntity['id'] },
	): Promise<RepositoryResult<UserEntity, NotFoundError>> {
		return TryCatchAsync({
			fn: () =>
				this.runWithPolicy(async () => {
					const r = await db.update(table.users).set(user).where(eq(table.users.id, user.id)).returning().execute()
					return Option.fromNullable(r.at(0))
				}).then((updatedUserOpt) =>
					matchOpt(updatedUserOpt, {
						Some: UserEntity.create,
						None: () => Result.Err(new UserNotFoundError(`No User Exists with ID: ${user.id}`)),
					}),
				),
			onError: (error) =>
				match(pgErrors.isUniqueConstraintViolationError(error))
					.with(true, () =>
						Result.Err(new UserAlreadyExistsError(`User Already Exists With Username ${user.username}`)),
					)
					.otherwise(() => Result.Err(new Error(JSON.stringify(error)))),
		})
	}

	fetchById(userId: UserEntity['id']): Promise<RepositoryResult<UserEntity, NotFoundError>> {
		return TryCatchAsync({
			fn: () =>
				this.runWithPolicy(async () => {
					const r = await db.select().from(table.users).where(eq(table.users.id, userId)).execute()
					return Option.fromNullable(r.at(0))
				}).then((userOpt) =>
					matchOpt(userOpt, {
						Some: UserEntity.fromSerialized,
						None: () => Result.Err(new UserNotFoundError(`No User Exists with ID: ${userId}`)),
					}),
				),
			onError: (error) => Result.Err(new Error(JSON.stringify(error))),
		})
	}

	fetchByUsername(username: UserEntity['username']): Promise<RepositoryResult<UserEntity, NotFoundError>> {
		return TryCatchAsync({
			fn: () =>
				this.runWithPolicy(async () => {
					const r = await db.select().from(table.users).where(eq(table.users.username, username)).execute()
					return Option.fromNullable(r.at(0))
				}).then((userOpt) =>
					matchOpt(userOpt, {
						Some: UserEntity.fromSerialized,
						None: () => Result.Err(new UserNotFoundError(`No User Exists with Username: ${username}`)),
					}),
				),
			onError: (error) => Result.Err(new Error(JSON.stringify(error))),
		})
	}
}
