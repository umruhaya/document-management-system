import {
	type AlreadyExistsError,
	type BaseEntity,
	BaseRepository,
	type NotFoundError,
	type RepositoryResult,
} from '@carbonteq/hexapp'
import type { UserEntity } from './user.entity'

export abstract class UserRepository extends BaseRepository<UserEntity> {
	abstract insert(entity: UserEntity): Promise<RepositoryResult<UserEntity, AlreadyExistsError>>
	abstract update(entity: UserEntity): Promise<RepositoryResult<UserEntity, NotFoundError>>
	abstract fetchById(userId: BaseEntity['id']): Promise<RepositoryResult<UserEntity, NotFoundError>>
	abstract fetchByUsername(userId: BaseEntity['id']): Promise<RepositoryResult<UserEntity, NotFoundError>>
}
