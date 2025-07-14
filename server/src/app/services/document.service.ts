import { Result } from '@carbonteq/fp'
import { inject, injectable } from 'tsyringe'
import { type DocumentDTO, DocumentSchema } from '~/app/dto/documents'
import { AccessControlEntity } from '~/domain/access-control/access-control.entity'
import type { AccessControlRepository } from '~/domain/access-control/access-control.repository'
import { DocumentEntity } from '~/domain/document/document.entity'
import { DocumentValidationError } from '~/domain/document/document.errors'
import type { DocumentRepository } from '~/domain/document/document.repository'
import { ProtectedDocumentsService } from '~/domain/services/protected-documents'
import { PaginationOptions, UUID } from '~/hexapp'
import { DocumentPresignedUrlService } from '~/infra/services/document-presigned-url.service'

@injectable()
export class DocumentService {
	constructor(
		@inject('DocumentRepository') private readonly documentRepo: DocumentRepository,
		@inject('AclRepository') private readonly aclRepo: AccessControlRepository,
	) {}

	async search({ userId, searchOptions, paginationOptions: { page, limit } }: DocumentDTO['search']) {
		return PaginationOptions.create({ pageNum: page, pageSize: limit })
			.flatMap((paginationOptions) =>
				this.documentRepo.search(
					userId,
					searchOptions,
					{ excludeContent: searchOptions.exlcudeContent },
					paginationOptions,
				),
			)
			.map((docs) => ({
				...docs,
				data: docs.data.map((doc) => doc.serialize()).map((d) => ({ ...d, documentId: d.id })),
			}))
			.map(DocumentSchema.searchResponse.parse)
			.toPromise()
	}

	async getById({ userId, documentId }: DocumentDTO['getById']) {
		const result = await this.aclRepo.fetch(UUID.fromTrusted(userId), UUID.fromTrusted(documentId))
		return result
			.flatMap((_entry) => this.documentRepo.fetchById(UUID.fromTrusted(documentId)))
			.map((d) => d.serialize())
			.map((d) => ({ ...d, documentId: d.id }))
			.map(DocumentSchema.getByIdResponse.parse)
			.toPromise()
	}

	async create(document: DocumentDTO['create']) {
		return DocumentEntity.create({ ...document, version: 1, size: document.content.length })
			.flatMap((doc) => this.documentRepo.insertWithAccessControl(document.userId, doc))
			.map((d) => d.serialize())
			.map((d) => ({ ...d, documentId: d.id }))
			.map(DocumentSchema.createResponse.parse)
			.toPromise()
	}

	async update(document: DocumentDTO['patch']) {
		const result = await this.aclRepo.fetch(UUID.fromTrusted(document.userId), UUID.fromTrusted(document.documentId))
		return result
			.validate([ProtectedDocumentsService.validateEditAccessForDocument])
			.mapErr((e) => (Array.isArray(e) ? e[0] : e))
			.flatMap(() => this.documentRepo.patch({ ...document, id: UUID.fromTrusted(document.documentId) }))
			.map((d) => d.serialize())
			.map((d) => ({ ...d, documentId: d.id }))
			.map(DocumentSchema.patchResponse.parse)
			.toPromise()
	}

	async getAclEntries(accessList: DocumentDTO['accessList']) {
		const result = await this.aclRepo.fetchAllByDocumentId(accessList.documentId)
		return result.map(DocumentSchema.accessListResponse.parse)
	}

	async patchAcl(accessEntry: DocumentDTO['patchAccess']) {
		const { invokerUserId } = accessEntry
		return Result.all(
			AccessControlEntity.create({
				userId: UUID.fromTrusted(accessEntry.userId),
				documentId: UUID.fromTrusted(accessEntry.documentId),
				role: accessEntry.role,
			}),
			await this.aclRepo.fetchAllByDocumentId(UUID.fromTrusted(accessEntry.documentId)),
		)
			.mapErr((e) => (Array.isArray(e) ? e[0] : e))
			.flatMap(([patchEntry, entries]) =>
				ProtectedDocumentsService.applyPatchToAccessControlList(invokerUserId, patchEntry, entries),
			)
			.flatMap(this.aclRepo.update)
			.map(() => DocumentSchema.patchAccessResponse.parse(accessEntry))
			.toPromise()
	}

	async deleteAcl({ invokerUserId, userId, documentId }: DocumentDTO['deleteAccess']) {
		const result = await this.aclRepo.fetchAllByDocumentId(UUID.fromTrusted(documentId))
		return result
			.flatMap((entries) =>
				ProtectedDocumentsService.deleteEntryFromAccessControlList(invokerUserId, userId, documentId, entries),
			)
			.flatMap(({ userId, documentId }) => this.aclRepo.delete(userId, documentId))
			.map(() => ({ success: true }) satisfies DocumentDTO['deleteAccessResponse'])
			.toPromise()
	}

	async createLink(input: {
		userId: string
		documentId: string
		baseUrl: string
		expiresAt: number
		method: string
	}): Promise<Result<string, Error>> {
		const result = await this.aclRepo.fetch(UUID.fromTrusted(input.userId), UUID.fromTrusted(input.documentId))
		return result.map((_entry) => DocumentPresignedUrlService.presignUrl(input))
	}

	async getDocumentByLink(args: DocumentDTO['downloadByLink']): Promise<Result<DocumentEntity, Error>> {
		const verified = DocumentPresignedUrlService.verifySignature(args)
		return verified
			? this.documentRepo.fetchById(UUID.fromTrusted(args.documentId))
			: Result.Err(new DocumentValidationError('Signature Did Not Match'))
	}
}
