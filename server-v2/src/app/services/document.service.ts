import type { Result } from '@carbonteq/fp'
import { ulid } from 'ulidx'
import type { DocumentEntity } from '~/domain/document/document.entity'
import type { DocumentRepository } from '~/domain/document/document.repository'
import type { EntityError } from '~/domain/errors'
import type { DocumentCreateType, DocumentPatchParamsType, DocumentPatchType } from '~/presentation/dtos/documents'

export class DocumentService {
	constructor(private readonly documentRepo: DocumentRepository) {}

	getById(documentId: string): Promise<Result<DocumentEntity, EntityError>> {
		return this.documentRepo.getById(documentId)
	}

	create(document: DocumentCreateType): Promise<Result<DocumentEntity, EntityError>> {
		return this.documentRepo.create({
			...document,
			id: ulid(),
			size: document.content.length,
			version: 1,
			tags: document.tags ?? [],
		})
	}

	update(document: DocumentPatchParamsType & DocumentPatchType): Promise<Result<true, EntityError>> {
		return this.documentRepo.update(document)
	}
}
