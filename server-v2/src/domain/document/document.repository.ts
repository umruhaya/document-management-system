import type { Result } from '@carbonteq/fp'
import type { DocumentEntity } from '~/domain/document/document.entity'
import type { EntityError } from '~/domain/errors'

export abstract class DocumentRepository {
	abstract getById(documentId: string): Promise<Result<DocumentEntity, EntityError>>
	abstract create(
		document: Omit<DocumentEntity, 'createdAt' | 'updatedAt'>,
	): Promise<Result<DocumentEntity, EntityError>>
	abstract update(
		document: { id: string } & Partial<Omit<DocumentEntity, 'createdAt' | 'updatedAt'>>,
	): Promise<Result<true, EntityError>>
}
