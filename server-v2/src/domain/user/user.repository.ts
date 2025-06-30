import type { Result } from '@carbonteq/fp'
import type { EntityError } from '~/domain/errors'
import type { UserEntity } from '~/domain/user/user.entity'

export abstract class UserRepository {
	abstract getById(userId: string): Promise<Result<UserEntity, EntityError>>
	abstract getByUsername(username: string): Promise<Result<UserEntity, EntityError>>
	abstract create(
		user: Pick<UserEntity, 'id' | 'username' | 'hashedPassword'>,
	): Promise<Result<UserEntity, EntityError>>
	abstract update(
		user: Partial<Pick<UserEntity, 'username' | 'hashedPassword'>> & { id: string },
	): Promise<Result<true, EntityError>>
}
