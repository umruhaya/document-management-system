import { Result } from '@carbonteq/fp'
import argon2 from 'argon2'
import { inject, injectable } from 'tsyringe'
import { ulid } from 'ulidx'
import { AuthorizationService } from '~/app/services/authorization.service'
import { AuthenticationError } from '~/domain/errors'
import type { UserEntity } from '~/domain/user/user.entity'
import type { UserRepository } from '~/domain/user/user.repository'

@injectable()
export class UserService {
	constructor(@inject('UserRepository') private readonly userRepo: UserRepository) {}

	async getById(userId: string): Promise<Result<UserEntity, Error>> {
		return this.userRepo.getById(userId)
	}

	async getByUsername(username: string): Promise<Result<UserEntity, Error>> {
		return this.userRepo.getByUsername(username)
	}

	async create(user: { username: string; password: string }): Promise<Result<UserEntity & { token: string }, Error>> {
		const { username, password } = user
		const userId = ulid()
		const hashedPassword = await argon2.hash(password)
		const createUserRes = await this.userRepo.create({ id: userId, username, hashedPassword })
		return createUserRes.map((user) => ({ ...user, token: AuthorizationService.signPayload({ userId, username }) }))
	}

	async update(user: { id: string; username?: string; password?: string }): Promise<Result<true, Error>> {
		const hashedPassword = user.password ? await argon2.hash(user.password) : undefined
		return this.userRepo.update({ id: user.id, username: user.username, hashedPassword })
	}

	async login(user: { username: string; password: string }): Promise<Result<{ token: string }, Error>> {
		const userFromDbResult = await this.userRepo.getByUsername(user.username)
		return userFromDbResult
			.flatMap(async (userFromDb) => {
				const matched = await argon2.verify(userFromDb.hashedPassword, user.password)
				return matched
					? Result.Ok({ token: AuthorizationService.signPayload({ userId: userFromDb.id, username: user.username }) })
					: Result.Err(new AuthenticationError('user-credentials', 'username or password is incorrect'))
			})
			.toPromise()
	}
}
