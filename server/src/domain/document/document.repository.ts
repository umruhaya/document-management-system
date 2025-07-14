import type { DocumentEntity } from '~/domain/document/document.entity'
import {
	type AlreadyExistsError,
	BaseRepository,
	type InvalidOperation,
	type NotFoundError,
	type Paginated,
	type PaginationOptions,
	type RepositoryResult,
} from '~/hexapp'

export abstract class DocumentRepository extends BaseRepository<DocumentEntity> {
	abstract insert(document: DocumentEntity): Promise<RepositoryResult<DocumentEntity, AlreadyExistsError>>
	abstract update(document: DocumentEntity): Promise<RepositoryResult<DocumentEntity, NotFoundError>>
	abstract patch(
		document: Partial<DocumentEntity> & { id: DocumentEntity['id'] },
	): Promise<RepositoryResult<DocumentEntity, NotFoundError>>
	abstract fetchById(documentId: DocumentEntity['id']): Promise<RepositoryResult<DocumentEntity, NotFoundError>>

	abstract insertWithAccessControl(
		userId: string,
		document: DocumentEntity,
	): Promise<RepositoryResult<DocumentEntity, AlreadyExistsError>>

	abstract search(
		userId: string,
		filters: Partial<Pick<DocumentEntity, 'title' | 'fileType' | 'tags' | 'version'>>,
		paginationOptions: PaginationOptions,
	): Promise<RepositoryResult<Paginated<DocumentEntity>, InvalidOperation>>
}
