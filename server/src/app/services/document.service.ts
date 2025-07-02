import { Result } from '@carbonteq/fp'
import { inject, injectable } from 'tsyringe'
import { ulid } from 'ulidx'
import {
	DocumentPresignedUrlService,
	type PresignOptions,
	type VerificationInput,
} from '~/app/services/document-presigned-url.service'
import type { AccessControlListEntity, DocumentRole } from '~/domain/access-control-entry/access-control-entry.entity'
import type { AclRepository } from '~/domain/access-control-entry/acl.repository'
import { DocumentEntity } from '~/domain/document/document.entity'
import type { DocumentRepository } from '~/domain/document/document.repository'
import { DocumentNotFoundError, DocumentValidationError, NotFoundError } from '~/domain/errors'
import type { ULID } from '~/domain/utils/refined.types'
import type { DocumentCreateType, DocumentPatchParamsType, DocumentPatchType } from '~/presentation/dtos/documents'
import type { PaginationOptions } from '~/presentation/types'

@injectable()
export class DocumentService {
	constructor(
		@inject('DocumentRepository') private readonly documentRepo: DocumentRepository,
		@inject('AclRepository') private readonly aclRepo: AclRepository,
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

	async getById(userId: string, documentId: string): Promise<Result<DocumentEntity, Error>> {
		const result = await this.aclRepo.getAcl(userId, documentId)

		return result.isErr() && result instanceof NotFoundError
			? // if no acl found, return a Document Not Found Error
				Result.Err(new DocumentNotFoundError({ documentId }))
			: // else get the document and return its result
				result
					.flatMap((_entry) => this.documentRepo.getById(documentId))
					.toPromise()
	}

	/** Validate and create document entity, then persist via repository */
	async create(userId: string, document: DocumentCreateType): Promise<Result<DocumentEntity, Error>> {
		const now = new Date().toISOString()
		const serialized = {
			id: ulid(),
			createdAt: now,
			updatedAt: now,
			title: document.title,
			description: document.description,
			fileType: document.fileType,
			version: 1,
			size: document.content.length,
			content: document.content,
			tags: document.tags ?? [],
		}
		const entityRes = DocumentEntity.create(serialized)
		if (entityRes.isErr()) {
			return Result.Err(entityRes.unwrapErr())
		}
		const docEntity = entityRes.unwrap()
		return this.documentRepo.create(userId, docEntity)
	}

	async update(userId: string, document: DocumentPatchParamsType & DocumentPatchType): Promise<Result<true, Error>> {
		const result = await this.aclRepo.getAcl(userId, document.id)
		return result
			.flatMap(async (entry) => {
				return entry.role === 'owner' || entry.role === 'editor'
					? this.documentRepo.update({ ...document, id: document.id as ULID })
					: Result.Err(new DocumentNotFoundError({ documentId: document.id }))
			})
			.toPromise()
	}

	async getAclEntries(documentId: string): Promise<Result<AccessControlListEntity[], Error>> {
		return this.aclRepo.getByDocumentId(documentId)
	}

	async updateAcl(
		userId: string,
		documentId: string,
		action: { remove: true } | { remove: false; role: DocumentRole },
	): Promise<Result<true, Error>> {
		return action.remove
			? this.aclRepo.revokeAcl(userId, documentId)
			: this.aclRepo.setAcl(userId, documentId, action.role)
	}

	async createLink(userId: string, options: PresignOptions): Promise<Result<string, Error>> {
		// first check if the user has access
		const result = await this.aclRepo.getAcl(userId, options.documentId)
		return result.isErr() && result instanceof NotFoundError
			? // if no acl found, return a Document Not Found Error
				Result.Err(new DocumentNotFoundError({ documentId: options.documentId }))
			: // else get the document and return its result
				result.map((_entry) => DocumentPresignedUrlService.presignUrl(options))
	}

	async getDocumentByLink(input: VerificationInput): Promise<Result<DocumentEntity, Error>> {
		const verified = DocumentPresignedUrlService.verifySignature(input)
		return verified
			? this.documentRepo.getById(input.documentId)
			: Result.Err(new DocumentValidationError(input, 'Signature Did Not Match'))
	}
}
