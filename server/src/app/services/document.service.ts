import { Result } from '@carbonteq/fp'
import { inject, injectable } from 'tsyringe'
import { AccessControlEntity, type DocumentRole } from '~/domain/access-control/access-control.entity'
import type { AccessControlRepository } from '~/domain/access-control/access-control.repository'
import { DocumentEntity } from '~/domain/document/document.entity'
import { DocumentValidationError } from '~/domain/document/document.errors'
import type { DocumentRepository } from '~/domain/document/document.repository'
import { ProtectedDocumentsService } from '~/domain/services/protected-documents'
import { type PaginationOptions, UUID } from '~/hexapp'
import {
	DocumentPresignedUrlService,
	type PresignOptions,
	type VerificationInput,
} from '~/infra/services/document-presigned-url.service'
import type { DocumentCreateType, DocumentPatchParamsType, DocumentPatchType } from '~/presentation/dtos/documents'

@injectable()
export class DocumentService {
	constructor(
		@inject('DocumentRepository') private readonly documentRepo: DocumentRepository,
		@inject('AclRepository') private readonly aclRepo: AccessControlRepository,
	) {}

	search(
		userId: string,
		filters: Partial<{ title: string; fileType: string; tags: string[]; version: number }>,
		searchOptions: { exlcudeContent: boolean },
		paginationOptions: PaginationOptions,
	) {
		return this.documentRepo.search(userId, filters, searchOptions, paginationOptions)
	}

	async getById(userId: string, documentId: string): Promise<Result<DocumentEntity, Error>> {
		const result = await this.aclRepo.fetch(UUID.fromTrusted(userId), UUID.fromTrusted(documentId))

		return result.flatMap((_entry) => this.documentRepo.fetchById(UUID.fromTrusted(documentId))).toPromise()
	}

	/** Validate and create document entity, then persist via repository */
	async create(userId: string, document: DocumentCreateType): Promise<Result<DocumentEntity, Error>> {
		return DocumentEntity.create({ ...document, version: 1, tags: document.tags ?? [], size: document.content.length })
			.flatMap((doc) => this.documentRepo.insertWithAccessControl(userId, doc))
			.toPromise()
	}

	async update(userId: string, document: DocumentPatchParamsType & DocumentPatchType): Promise<Result<true, Error>> {
		const result = await this.aclRepo.fetch(UUID.fromTrusted(userId), UUID.fromTrusted(document.id))
		return result
			.validate([ProtectedDocumentsService.validateEditAccessForDocument])
			.mapErr((e) => (Array.isArray(e) ? e[0] : e))
			.flatMap(() => this.documentRepo.patch({ ...document, id: UUID.fromTrusted(document.id) }))
			.map(() => true as const)
			.toPromise()
	}

	async getAclEntries(documentId: string): Promise<Result<AccessControlEntity[], Error>> {
		return this.aclRepo.fetchAllByDocumentId(documentId)
	}

	async patchAcl(userId: string, documentId: string, role: DocumentRole): Promise<Result<true, Error>> {
		return Result.all(
			// patchEntry
			AccessControlEntity.create({
				userId: UUID.fromTrusted(userId),
				documentId: UUID.fromTrusted(documentId),
				role,
			}),
			// entries
			await this.aclRepo.fetchAllByDocumentId(UUID.fromTrusted(documentId)),
		)
			.flatMap(([patchEntry, entries]) => ProtectedDocumentsService.applyPatchToAccessControlList(patchEntry, entries))
			.validate([ProtectedDocumentsService.validateEntriesForDocument])
			.mapErr((e) => (Array.isArray(e) ? e[0] : e))
			.map(() => true as const)
	}

	async deleteAcl(userId: string, documentId: string): Promise<Result<true, Error>> {
		const result = await this.aclRepo.fetchAllByDocumentId(UUID.fromTrusted(documentId))
		return result
			.flatMap((entries) => ProtectedDocumentsService.deleteEntryFromAccessControlList(userId, documentId, entries))
			.validate([ProtectedDocumentsService.validateEntriesForDocument])
			.mapErr((e) => (Array.isArray(e) ? e[0] : e))
			.map(() => true as const)
	}

	async createLink(userId: string, options: PresignOptions): Promise<Result<string, Error>> {
		// first check if the user has access
		const result = await this.aclRepo.fetch(UUID.fromTrusted(userId), UUID.fromTrusted(options.documentId))

		return result.map((_entry) => DocumentPresignedUrlService.presignUrl(options))
	}

	async getDocumentByLink(input: VerificationInput): Promise<Result<DocumentEntity, Error>> {
		const verified = DocumentPresignedUrlService.verifySignature(input)
		return verified
			? this.documentRepo.fetchById(UUID.fromTrusted(input.documentId))
			: Result.Err(new DocumentValidationError('Signature Did Not Match'))
	}
}
