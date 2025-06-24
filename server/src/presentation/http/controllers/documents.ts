import * as HttpStatusCodes from 'stoker/http-status-codes'
import * as HttpStatusPhrases from 'stoker/http-status-phrases'
import { z } from 'zod'
import * as dtos from '~/presentation/http/dtos/documents'
import { httpResponse } from '~/presentation/http/lib'
import { DocumentRepository } from '~/repositories/document'

const documentRepository = new DocumentRepository()

export const create = async (input: { userId: string; body: any }) => {
	const bodyResult = dtos.DocumentCreate.safeParse(input.body)
	if (!bodyResult.success) {
		return httpResponse({ json: bodyResult.error.errors, statusCode: HttpStatusCodes.UNPROCESSABLE_ENTITY })
	}
	const { userId } = input
	const body = bodyResult.data
	const result = await documentRepository.create(userId, body)
	if (result.ok) {
		return httpResponse({ json: result.value, statusCode: HttpStatusCodes.OK })
	}
	return httpResponse({ json: result.error.message, statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR })
}

export const patch = async ({ userId, params, body }: { userId: string; params: any; body: any }) => {
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
	const result = await documentRepository.patch(userId, documentId, patch)
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

export const getById = async ({ userId, params }: { userId: string; params: any }) => {
	const paramsResult = dtos.GetDocumentByIdParams.safeParse(params)
	if (!paramsResult.success) {
		return httpResponse({ json: paramsResult.error.errors, statusCode: HttpStatusCodes.UNPROCESSABLE_ENTITY })
	}
	const documentId = paramsResult.data.id
	const result = await documentRepository.getById(userId, documentId)
	if (result.ok) {
		return httpResponse({ json: result.value, statusCode: HttpStatusCodes.OK })
	}
	return httpResponse({ json: `No Document Found with ID ${documentId}`, statusCode: HttpStatusCodes.NOT_FOUND })
}

export const search = async ({ userId, query }: { userId: string; query: any }) => {
	const queryResult = dtos.SearchDocumentsQuery.safeParse(query)
	if (!queryResult.success) {
		return httpResponse({ json: queryResult.error.errors, statusCode: HttpStatusCodes.UNPROCESSABLE_ENTITY })
	}
	const q = queryResult.data
	const result = await documentRepository.search(userId, q)
	if (result.ok) {
		return httpResponse({ json: result.value, statusCode: HttpStatusCodes.OK })
	}
	return httpResponse({ json: result.error.message, statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR })
}

export const getAccessList = async ({ userId, params }: { userId: string; params: any }) => {
	const paramsResult = dtos.GetDocumentAccessListParams.safeParse(params)
	if (!paramsResult.success) {
		return httpResponse({ json: paramsResult.error.errors, statusCode: HttpStatusCodes.UNPROCESSABLE_ENTITY })
	}
	const { documentId } = paramsResult.data
	const result = await documentRepository.getAccessList(userId, documentId)
	if (result.ok) {
		return httpResponse({ json: result.value, statusCode: HttpStatusCodes.OK })
	}
	if (result.error.type === 'Forbidden') {
		return httpResponse({ json: HttpStatusPhrases.FORBIDDEN, statusCode: HttpStatusCodes.FORBIDDEN })
	}
	return httpResponse({ json: `No Document Found with ID ${documentId}`, statusCode: HttpStatusCodes.NOT_FOUND })
}

export const patchAccess = async ({ userId, params, body }: { userId: string; params: any; body: any }) => {
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
		const result = await documentRepository.revokeAccess(userId, documentId, targetUserId)
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

	const result = await documentRepository.patchAccess(userId, documentId, targetUserId, role)
	if (result.ok) {
		return httpResponse({ json: result.value, statusCode: HttpStatusCodes.OK })
	}
	return httpResponse({ json: result.error.message, statusCode: HttpStatusCodes.FORBIDDEN })
}

export const createLink = async ({ userId, params, origin }: { userId: string; params: any; origin: string }) => {
	const paramsResult = dtos.CreateDocumentLinkParams.safeParse(params)
	if (!paramsResult.success) {
		return httpResponse({ json: paramsResult.error.errors, statusCode: HttpStatusCodes.UNPROCESSABLE_ENTITY })
	}
	const { documentId } = paramsResult.data
	const result = await documentRepository.createLink(userId, documentId, origin)
	if (result.ok) {
		return httpResponse({ json: result.value, statusCode: HttpStatusCodes.OK })
	}
	switch (result.error.type) {
		case 'Forbidden':
			return httpResponse({ json: HttpStatusPhrases.FORBIDDEN, statusCode: HttpStatusCodes.FORBIDDEN })
		case 'NotFound':
			return httpResponse({ json: HttpStatusPhrases.NOT_FOUND, statusCode: HttpStatusCodes.NOT_FOUND })
		case 'Unknown':
		default:
			return httpResponse({
				json: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
				statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
			})
	}
}

export const downloadByLink = async ({ params }: { params: any }) => {
	const paramsResult = dtos.DownloadDocumentByLinkParams.safeParse(params)
	if (!paramsResult.success) {
		return httpResponse({ json: paramsResult.error.errors, statusCode: HttpStatusCodes.UNPROCESSABLE_ENTITY })
	}
	const { filename } = paramsResult.data
	const result = await documentRepository.downloadByLink(filename)
	if (result.ok) {
		const { content, title, fileType, fileMimeType, fileExtension } = result.value
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
