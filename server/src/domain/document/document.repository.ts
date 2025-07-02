import type { Result } from '@carbonteq/fp'
import type { DocumentEntity, SerializedDocument } from '~/domain/document/document.entity'
import type { PaginatedCollection, PaginationOptions } from '~/presentation/types'

/** Repository interface for DocumentEntity */
/** Repository interface for DocumentEntity */
export abstract class DocumentRepository {
	abstract search(
		userId: string,
		option: PaginationOptions<{
			title?: string
			fileType?: string
			sort?: string
			tags?: string[]
			version?: number
			author?: string
			exlcudeContent?: 'true'
		}>,
	): Promise<Result<PaginatedCollection<DocumentEntity>, Error>>
	abstract getById(documentId: string): Promise<Result<DocumentEntity, Error>>
	/** Persist a new document for a given user */
	/** Persist a new document for a given user */
	/** Persist a new document for a given user */
	abstract create(
		userId: string,
		document: Omit<SerializedDocument, 'createdAt' | 'updatedAt'>,
	): Promise<Result<DocumentEntity, Error>>
	abstract update(
		document: { id: string } & Partial<Omit<DocumentEntity, 'createdAt' | 'updatedAt'>>,
	): Promise<Result<true, Error>>
}
