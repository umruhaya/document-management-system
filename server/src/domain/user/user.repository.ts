import { type AlreadyExistsError, BaseRepository, type NotFoundError, type RepositoryResult } from '~/hexapp'
import type { UserEntity } from './user.entity'

export abstract class UserRepository extends BaseRepository<UserEntity> {
	abstract insert(entity: UserEntity): Promise<RepositoryResult<UserEntity, AlreadyExistsError>>
	abstract update(entity: UserEntity): Promise<RepositoryResult<UserEntity, NotFoundError>>
	abstract fetchById(userId: UserEntity['id']): Promise<RepositoryResult<UserEntity, NotFoundError>>
	abstract fetchByUsername(username: UserEntity['username']): Promise<RepositoryResult<UserEntity, NotFoundError>>
}
