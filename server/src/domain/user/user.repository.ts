import type { Result } from '@carbonteq/fp'
import type { UserEntity } from './user.entity'

/** Repository interface for UserEntity */
export abstract class UserRepository {
	abstract getById(userId: string): Promise<Result<UserEntity, Error>>
	abstract getByUsername(username: string): Promise<Result<UserEntity, Error>>
	abstract create(input: { id: string; username: string; hashedPassword: string }): Promise<Result<UserEntity, Error>>
	abstract update(
		user: { id: string } & Partial<{ username: string; hashedPassword: string }>,
	): Promise<Result<true, Error>>
}
