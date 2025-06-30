import type { Result } from '@carbonteq/fp'
import type { DocumentEntity } from '~/domain/document/document.entity'
import type { EntityError } from '~/domain/errors'
import type { PaginatedCollection, PaginationOptions } from '~/presentation/types'

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
	): Promise<Result<PaginatedCollection<DocumentEntity>, EntityError>>
	abstract getById(documentId: string): Promise<Result<DocumentEntity, EntityError>>
	abstract create(
		userId: string,
		document: Omit<DocumentEntity, 'createdAt' | 'updatedAt'>,
	): Promise<Result<DocumentEntity, EntityError>>
	abstract update(
		document: { id: string } & Partial<Omit<DocumentEntity, 'createdAt' | 'updatedAt'>>,
	): Promise<Result<true, EntityError>>
}
