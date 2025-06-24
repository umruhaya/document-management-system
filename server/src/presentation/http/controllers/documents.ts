import * as HttpStatusCodes from 'stoker/http-status-codes'
import * as HttpStatusPhrases from 'stoker/http-status-phrases'
import { inject, injectable } from 'tsyringe'
import type { Logger } from '~/logger/Logger'
import * as dtos from '~/presentation/http/dtos/documents'
import { httpResponse } from '~/presentation/http/lib'
import { DocumentRepository } from '~/repositories/document'

@injectable()
export class DocumentsController {
	constructor(
		@inject(DocumentRepository) private readonly documentRepository: DocumentRepository,
		@inject('Logger') private readonly logger: Logger,
	) {}

	async create(input: { userId: string; body: unknown }) {
		this.logger.info('DocumentsController.create called', { userId: input.userId })
		const bodyResult = dtos.DocumentCreate.safeParse(input.body)
		if (!bodyResult.success) {
			return httpResponse({ json: bodyResult.error.errors, statusCode: HttpStatusCodes.UNPROCESSABLE_ENTITY })
		}
		const { userId } = input
		const body = bodyResult.data
		const result = await this.documentRepository.create(userId, body)
		if (result.ok) {
			return httpResponse({ json: result.value, statusCode: HttpStatusCodes.OK })
		}
		return httpResponse({ json: result.error.message, statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR })
	}

	async patch({ userId, params, body }: { userId: string; params: unknown; body: unknown }) {
		this.logger.info('DocumentsController.patch called', { userId })
		const paramsResult = dtos.DocumentPatchParams.safeParse(params)
		if (!paramsResult.success) {
			return httpResponse({ json: paramsResult.error.errors, statusCode: HttpStatusCodes.UNPROCESSABLE_ENTITY })
		}
		const bodyResult = dtos.DocumentPatch.safeParse(body)
		if (!bodyResult.success) {
			return httpResponse({ json: bodyResult.error.errors, statusCode: HttpStatusCodes.UNPROCESSABLE_ENTITY })
		}
		const documentId = paramsResult.data.id
		const patch = bodyResult.data
		const result = await this.documentRepository.patch(userId, documentId, patch)
		if (result.ok) {
			return httpResponse({ json: result.value, statusCode: HttpStatusCodes.OK })
		}
		if (result.error.type === 'Forbidden') {
			return httpResponse({ json: result.error.message, statusCode: HttpStatusCodes.FORBIDDEN })
		}
		if (result.error.type === 'NotFound') {
			return httpResponse({ json: result.error.message, statusCode: HttpStatusCodes.NOT_FOUND })
		}
		return httpResponse({ json: result.error.message, statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR })
	}

	async getById({ userId, params }: { userId: string; params: unknown }) {
		this.logger.info('DocumentsController.getById called', { userId })
		const paramsResult = dtos.GetDocumentByIdParams.safeParse(params)
		if (!paramsResult.success) {
			return httpResponse({ json: paramsResult.error.errors, statusCode: HttpStatusCodes.UNPROCESSABLE_ENTITY })
		}
		const documentId = paramsResult.data.id
		const result = await this.documentRepository.getById(userId, documentId)
		if (result.ok) {
			return httpResponse({ json: result.value, statusCode: HttpStatusCodes.OK })
		}
		return httpResponse({ json: `No Document Found with ID ${documentId}`, statusCode: HttpStatusCodes.NOT_FOUND })
	}

	async search({ userId, query }: { userId: string; query: unknown }) {
		this.logger.info('DocumentsController.search called', { userId })
		const queryResult = dtos.SearchDocumentsQuery.safeParse(query)
		if (!queryResult.success) {
			return httpResponse({ json: queryResult.error.errors, statusCode: HttpStatusCodes.UNPROCESSABLE_ENTITY })
		}
		const q = queryResult.data
		const result = await this.documentRepository.search(userId, q)
		if (result.ok) {
			return httpResponse({ json: result.value, statusCode: HttpStatusCodes.OK })
		}
		return httpResponse({ json: result.error.message, statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR })
	}

	async getAccessList({ userId, params }: { userId: string; params: unknown }) {
		this.logger.info('DocumentsController.getAccessList called', { userId })
		const paramsResult = dtos.GetDocumentAccessListParams.safeParse(params)
		if (!paramsResult.success) {
			return httpResponse({ json: paramsResult.error.errors, statusCode: HttpStatusCodes.UNPROCESSABLE_ENTITY })
		}
		const { documentId } = paramsResult.data
		const result = await this.documentRepository.getAccessList(userId, documentId)
		if (result.ok) {
			return httpResponse({ json: result.value, statusCode: HttpStatusCodes.OK })
		}
		if (result.error.type === 'Forbidden') {
			return httpResponse({ json: HttpStatusPhrases.FORBIDDEN, statusCode: HttpStatusCodes.FORBIDDEN })
		}
		return httpResponse({ json: `No Document Found with ID ${documentId}`, statusCode: HttpStatusCodes.NOT_FOUND })
	}

	async patchAccess({ userId, params, body }: { userId: string; params: unknown; body: unknown }) {
		this.logger.info('DocumentsController.patchAccess called', { userId })
		const paramsResult = dtos.PatchDocumentAccessParams.safeParse(params)
		if (!paramsResult.success) {
			return httpResponse({ json: paramsResult.error.errors, statusCode: HttpStatusCodes.UNPROCESSABLE_ENTITY })
		}
		const bodyResult = dtos.PatchDocumentAccessRequest.safeParse(body)
		if (!bodyResult.success) {
			return httpResponse({ json: bodyResult.error.errors, statusCode: HttpStatusCodes.UNPROCESSABLE_ENTITY })
		}
		const { documentId } = paramsResult.data
		const { targetUserId, role, remove } = bodyResult.data

		if (remove) {
			const result = await this.documentRepository.revokeAccess(userId, documentId, targetUserId)
			if (result.ok) {
				return httpResponse({ json: result.value, statusCode: HttpStatusCodes.OK })
			}
			return httpResponse({ json: 'Success', statusCode: HttpStatusCodes.OK })
		}

		if (!role) {
			return httpResponse({
				json: { message: 'role is required when remove is false' },
				statusCode: HttpStatusCodes.BAD_REQUEST,
			})
		}

		const result = await this.documentRepository.patchAccess(userId, documentId, targetUserId, role)
		if (result.ok) {
			return httpResponse({ json: result.value, statusCode: HttpStatusCodes.OK })
		}
		return httpResponse({ json: result.error.message, statusCode: HttpStatusCodes.FORBIDDEN })
	}

	async createLink({ userId, params, origin }: { userId: string; params: unknown; origin: string }) {
		this.logger.info('DocumentsController.createLink called', { userId })
		const paramsResult = dtos.CreateDocumentLinkParams.safeParse(params)
		if (!paramsResult.success) {
			return httpResponse({ json: paramsResult.error.errors, statusCode: HttpStatusCodes.UNPROCESSABLE_ENTITY })
		}
		const { documentId } = paramsResult.data
		const result = await this.documentRepository.createLink(userId, documentId, origin)
		if (result.ok) {
			return httpResponse({ json: result.value, statusCode: HttpStatusCodes.OK })
		}
		switch (result.error.type) {
			case 'Forbidden':
				return httpResponse({ json: HttpStatusPhrases.FORBIDDEN, statusCode: HttpStatusCodes.FORBIDDEN })
			case 'NotFound':
				return httpResponse({ json: HttpStatusPhrases.NOT_FOUND, statusCode: HttpStatusCodes.NOT_FOUND })
			default:
				return httpResponse({
					json: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
					statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
				})
		}
	}

	async downloadByLink({ params }: { params: unknown }) {
		this.logger.info('DocumentsController.downloadByLink called')
		const paramsResult = dtos.DownloadDocumentByLinkParams.safeParse(params)
		if (!paramsResult.success) {
			return httpResponse({ json: paramsResult.error.errors, statusCode: HttpStatusCodes.UNPROCESSABLE_ENTITY })
		}
		const { filename } = paramsResult.data
		const result = await this.documentRepository.downloadByLink(filename)
		if (result.ok) {
			const { content, title, fileMimeType, fileExtension } = result.value
			const headers = {
				'Content-Disposition': `attachment; filename="${title}.${fileExtension}"`,
				'Content-Type': fileMimeType ?? 'text/plain',
			}
			return httpResponse({ body: content, statusCode: HttpStatusCodes.OK, headers })
		}
		switch (result.error.type) {
			case 'Gone':
				return httpResponse({ json: `Already Expired`, statusCode: HttpStatusCodes.GONE })
			case 'NotFound':
				return httpResponse({ json: `No Link Found`, statusCode: HttpStatusCodes.NOT_FOUND })
			default:
				return httpResponse({
					json: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
					statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
				})
		}
	}
}
