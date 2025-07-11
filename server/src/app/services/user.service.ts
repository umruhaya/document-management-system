import { Result } from '@carbonteq/fp'
import argon2 from 'argon2'
import { inject, injectable } from 'tsyringe'
import { UserEntity } from '~/domain/user/user.entity'
import type { UserRepository } from '~/domain/user/user.repository'
import { UserUnauthorizedOperation } from '~/domain/user/users.errors'
import { UUID } from '~/hexapp'
import { AuthorizationService } from '~/infra/services/authorization.service'

@injectable()
export class UserService {
	constructor(@inject('UserRepository') private readonly userRepo: UserRepository) {}

	async getById(userId: string): Promise<Result<UserEntity, Error>> {
		return this.userRepo.fetchById(UUID.fromTrusted(userId))
	}

	async getByUsername(username: string): Promise<Result<UserEntity, Error>> {
		return this.userRepo.fetchByUsername(username)
	}

	async create(user: { username: string; password: string }): Promise<Result<{ id: string; token: string }, Error>> {
		const hashedPassword = await argon2.hash(user.password)
		// validate and create user entity, then persist
		return UserEntity.create({ username: user.username, hashedPassword })
			.flatMap((user) => this.userRepo.insert(user))
			.map((user) => ({
				id: user.id,
				token: AuthorizationService.signPayload({ userId: user.id, username: user.username }),
			}))
			.toPromise()
	}

	async update(user: { id: string; username?: string; password?: string }): Promise<Result<true, Error>> {
		const hashedPassword = user.password ? await argon2.hash(user.password) : undefined
		const result = await this.userRepo.patch({ id: UUID.fromTrusted(user.id), username: user.username, hashedPassword })
		return result.map(() => true as const)
	}

	async login(user: { username: string; password: string }): Promise<Result<{ token: string }, Error>> {
		const userFromDbResult = await this.userRepo.fetchByUsername(user.username)
		return userFromDbResult
			.flatMap(async (userFromDb) => {
				const matched = await argon2.verify(userFromDb.hashedPassword, user.password)
				return matched
					? Result.Ok({ token: AuthorizationService.signPayload({ userId: userFromDb.id, username: user.username }) })
					: Result.Err(new UserUnauthorizedOperation('username or password is incorrect'))
			})
			.toPromise()
	}
}
