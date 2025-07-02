import { Result } from '@carbonteq/fp'
import { eq } from 'drizzle-orm'
import { PostgresError } from 'pg-error-enum'
import { injectable } from 'tsyringe'
import { EntityAlreadyExistsError, type EntityError, EntityNotFoundError, EntityUnknownError } from '~/domain/errors'
import { UserEntity } from '~/domain/user/user.entity'
import { UserRepository } from '~/domain/user/user.repository'
import { DatabaseError, db, table } from '~/infra/database/client'
import { TryCatchAsync } from '~/utils/trycatch'

@injectable()
export class UserRepositoryPg extends UserRepository {
	getById(userId: string): Promise<Result<UserEntity, EntityError>> {
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
							createdAt: new Date(user.createdAt),
							updatedAt: new Date(user.updatedAt),
						})
					: Result.Err(new EntityNotFoundError('user', `No User Found With ID: ${userId}`))
			},
			onError: (error) => Result.Err(new EntityUnknownError('UserRepository', `Error: ${error}`, 'Failed user.get')),
		})
	}

	getByUsername(username: string): Promise<Result<UserEntity, EntityError>> {
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
							createdAt: new Date(user.createdAt),
							updatedAt: new Date(user.updatedAt),
						})
					: Result.Err(new EntityNotFoundError('user', `No User Found With Username: ${username}`))
			},
			onError: (error) => Result.Err(new EntityUnknownError('UserRepository', `Error: ${error}`, 'Failed user.get')),
		})
	}

	create(user: UserEntity): Promise<Result<UserEntity, EntityError>> {
		return TryCatchAsync({
			fn: async () => {
				await db
					.insert(table.users)
					.values({ ...user, createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString() })
				return Result.Ok(user)
			},
			onError: (error) =>
				Result.Err(
					error instanceof DatabaseError && error.code === PostgresError.UNIQUE_VIOLATION
						? new EntityAlreadyExistsError('UserRepository', `User Already Exists With ID: ${user.id}`)
						: new EntityUnknownError(
								'UserRepository',
								`User Insert Failed With values ${JSON.stringify(user)}`,
								'Failed user.create',
							),
				),
		})
	}

	update(
		user: Partial<Pick<UserEntity, 'username' | 'hashedPassword'>> & { id: string },
	): Promise<Result<true, EntityError>> {
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
					return Result.Err(new EntityNotFoundError('UserRepository', `No User found With ID: ${user.id}`))
				}
				return Result.Ok(true)
			},
			onError: (error) =>
				Result.Err(
					new EntityUnknownError(
						'UserRepository',
						`User Update Failed With values ${JSON.stringify(user)}, Details: ${error}`,
						'Failed user.update',
					),
				),
		})
	}
}
