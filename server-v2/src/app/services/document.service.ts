import { Result } from '@carbonteq/fp'
import { ulid } from 'ulidx'
import type { AclRepository } from '~/domain/access-control-entry/acl.repository'
import type { DocumentEntity } from '~/domain/document/document.entity'
import type { DocumentRepository } from '~/domain/document/document.repository'
import { type EntityError, EntityNotFoundError } from '~/domain/errors'
import type { DocumentCreateType, DocumentPatchParamsType, DocumentPatchType } from '~/presentation/dtos/documents'
import type { PaginationOptions } from '~/presentation/types'

export class DocumentService {
	constructor(
		private readonly documentRepo: DocumentRepository,
		private readonly aclRepo: AclRepository,
	) {}

	search(
		userId: string,
		options: PaginationOptions<{
			title?: string
			fileType?: string
			sort?: string
			tags?: string[]
			version?: number
			exlcudeContent?: 'true'
		}>,
	) {
		return this.documentRepo.search(userId, options)
	}

	async getById(userId: string, documentId: string): Promise<Result<DocumentEntity, EntityError>> {
		const result = await this.aclRepo.getAcl(userId, documentId)

		return result.isErr() && result instanceof EntityNotFoundError
			? // if no acl found, return a Document Not Found Error
				Result.Err(new EntityNotFoundError('Document', `docId: ${documentId}`))
			: // else get the document and return its result
				result
					.flatMap((_entry) => this.documentRepo.getById(documentId))
					.toPromise()
	}

	create(userId: string, document: DocumentCreateType): Promise<Result<DocumentEntity, EntityError>> {
		return this.documentRepo.create(userId, {
			...document,
			id: ulid(),
			size: document.content.length,
			version: 1,
			tags: document.tags ?? [],
		})
	}

	async update(
		userId: string,
		document: DocumentPatchParamsType & DocumentPatchType,
	): Promise<Result<true, EntityError>> {
		const result = await this.aclRepo.getAcl(userId, document.id)
		return result
			.flatMap(async (entry) => {
				return entry.role === 'owner' || entry.role === 'editor'
					? await this.documentRepo.update(document)
					: Result.Err(new EntityNotFoundError('Document', `docId: ${document.id}`))
			})
			.toPromise()
	}
}
