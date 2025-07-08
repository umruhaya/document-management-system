import type { DocumentEntity } from '~/domain/document/document.entity'
import {
	type AlreadyExistsError,
	type BaseEntity,
	BaseRepository,
	type InvalidOperation,
	type NotFoundError,
	type Paginated,
	type PaginationOptions,
	type RepositoryResult,
} from '~/hexapp'

export abstract class DocumentRepository extends BaseRepository<DocumentEntity> {
	abstract insert(entity: DocumentEntity): Promise<RepositoryResult<DocumentEntity, AlreadyExistsError>>
	abstract update(entity: DocumentEntity): Promise<RepositoryResult<DocumentEntity, NotFoundError>>
	abstract fetchById(documentId: BaseEntity['id']): Promise<RepositoryResult<DocumentEntity, NotFoundError>>

	abstract insertWithAccessControl(
		userId: string,
		entity: DocumentEntity,
	): Promise<RepositoryResult<DocumentEntity, AlreadyExistsError>>

	abstract search(
		userId: string,
		filters: Pick<DocumentEntity, 'title' | 'fileType' | 'tags' | 'version'>,
		searchOptions: { exlcudeContent: boolean },
		paginationOptions: PaginationOptions,
	): Promise<RepositoryResult<Paginated<DocumentEntity>, InvalidOperation>>
}
