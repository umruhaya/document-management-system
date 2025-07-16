import { Result } from '@carbonteq/fp'
import argon2 from 'argon2'
import { match } from 'ts-pattern'
import { inject, injectable } from 'tsyringe'
import type { CreateUserDTO, GetMyDetailsDTO, GetUserByUsernameDTO, LoginUserDTO, PatchUserDTO } from '~/app/dto/users'
import { UserSchema } from '~/app/dto/users'
import { UserEntity } from '~/domain/user/user.entity'
import type { UserRepository } from '~/domain/user/user.repository'
import { UserUnauthorizedOperation } from '~/domain/user/users.errors'
import { UUID } from '~/hexapp'
import { AuthorizationService } from '~/infra/services/authorization.service'

@injectable()
export class UserService {
	constructor(@inject('UserRepository') private readonly userRepo: UserRepository) {}

	async getById({ id }: GetMyDetailsDTO) {
		const result = await this.userRepo.fetchById(UUID.fromTrusted(id))
		return result.map(UserSchema.meResponse.parse)
	}

	async getByUsername({ username }: GetUserByUsernameDTO) {
		const result = await this.userRepo.fetchByUsername(username)
		return result.map(UserSchema.getByUsernameResponse.parse)
	}

	async create(user: CreateUserDTO) {
		const hashedPassword = await argon2.hash(user.password)
		// validate and create user entity, then persist
		return UserEntity.create({ username: user.username, hashedPassword })
			.flatMap((user) => this.userRepo.insert(user))
			.map((user) => ({
				id: user.id,
				jwtToken: AuthorizationService.signPayload({ userId: user.id, username: user.username }),
			}))
			.map(UserSchema.createResponse.parse)
			.toPromise()
	}

	async update(user: PatchUserDTO) {
		const hashedPassword = user.password ? await argon2.hash(user.password) : undefined
		const result = await this.userRepo.patch({ id: UUID.fromTrusted(user.id), username: user.username, hashedPassword })
		return result.map(UserSchema.patchResponse.parse)
	}

	async login(user: LoginUserDTO) {
		const userFromDbResult = await this.userRepo.fetchByUsername(user.username)
		return userFromDbResult
			.flatMap(async (userFromDb) => {
				const isPasswordCorrect = await argon2.verify(userFromDb.hashedPassword, user.password)
				return match(isPasswordCorrect)
					.with(true, () =>
						Result.Ok({
							id: userFromDb.id,
							jwtToken: AuthorizationService.signPayload({ userId: userFromDb.id, username: user.username }),
						}),
					)
					.otherwise(() => Result.Err(new UserUnauthorizedOperation('username or password is incorrect')))
			})
			.map(UserSchema.loginResponse.parse)
			.toPromise()
	}
}
