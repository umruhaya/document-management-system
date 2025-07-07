import {
	type AlreadyExistsError,
	BaseRepository,
	type InvalidOperation,
	type NotFoundError,
	type RepositoryResult,
} from '@carbonteq/hexapp'
import type { AccessControlEntity } from './access-control-entry.entity'

export abstract class AccessControlRepository extends BaseRepository<AccessControlEntity> {
	abstract insert(entity: AccessControlEntity): Promise<RepositoryResult<AccessControlEntity, AlreadyExistsError>>
	abstract update(entity: AccessControlEntity): Promise<RepositoryResult<AccessControlEntity, NotFoundError>>

	// revokes
	abstract delete(
		userId: AccessControlEntity['userId'],
		documentId: AccessControlEntity['documentId'],
	): Promise<RepositoryResult<true, NotFoundError | InvalidOperation>>

	abstract fetchAllByDocumentId(documentId: string): Promise<RepositoryResult<AccessControlEntity[], NotFoundError>>

	abstract fetch(
		userId: AccessControlEntity['userId'],
		documentId: AccessControlEntity['documentId'],
	): Promise<RepositoryResult<AccessControlEntity, NotFoundError>>
}
