import type { Result } from '@carbonteq/fp'
import type { UserEntity } from '~/domain/user/user.entity'

export abstract class UserRepository {
	abstract getById(userId: string): Promise<Result<UserEntity, Error>>
	abstract getByUsername(username: string): Promise<Result<UserEntity, Error>>
	abstract create(user: Pick<UserEntity, 'id' | 'username' | 'hashedPassword'>): Promise<Result<UserEntity, Error>>
	abstract update(
		user: Partial<Pick<UserEntity, 'username' | 'hashedPassword'>> & { id: string },
	): Promise<Result<true, Error>>
}
