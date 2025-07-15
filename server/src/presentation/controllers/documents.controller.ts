import mime from 'mime'
import { container } from 'tsyringe'
import { DocumentService } from '~/app/services/document.service'
import { AuthorizationService } from '~/infra/services/authorization.service'
import type { DocumentsContract } from '~/presentation/contracts/documents'
import { mapErrorToStatusCode } from '~/presentation/utils/http-mapper'
import { matchResultReturn } from '~/presentation/utils/result-match'

const documentService = container.resolve(DocumentService)

export const documentsController: DocumentsContract = {
	createDocument: async ({ body, headers }) => {
		const userId = AuthorizationService.getUserIdFromAuthHeader(headers.authorization)
		if (!userId) return { status: 401, body: { message: 'Invalid or missing token' } }

		const result = await documentService.create({ userId, ...body })
		return matchResultReturn(result, {
			Ok: (doc) => ({ status: 200, body: doc }),
			Err: (err) => ({ status: mapErrorToStatusCode(err), body: { message: err.message } }),
		})
	},

	patchDocument: async ({ body, params, headers }) => {
		const userId = AuthorizationService.getUserIdFromAuthHeader(headers.authorization)
		if (!userId) return { status: 401, body: { message: 'Invalid or missing token' } }

		const result = await documentService.update({ userId, ...body, ...params })
		return matchResultReturn(result, {
			Ok: (doc) => ({ status: 200, body: doc }),
			Err: (err) => ({ status: mapErrorToStatusCode(err), body: { message: err.message } }),
		})
	},

	getDocumentById: async ({ params, headers }) => {
		const userId = AuthorizationService.getUserIdFromAuthHeader(headers.authorization)
		if (!userId) return { status: 401, body: { message: 'Invalid or missing token' } }

		const result = await documentService.getById({ userId, ...params })
		return matchResultReturn(result, {
			Ok: (doc) => ({ status: 200, body: doc }),
			Err: (err) => ({ status: mapErrorToStatusCode(err), body: { message: err.message } }),
		})
	},

	searchDocuments: async ({ query, headers }) => {
		const userId = AuthorizationService.getUserIdFromAuthHeader(headers.authorization)
		if (!userId) return { status: 401, body: { message: 'Invalid or missing token' } }

		const result = await documentService.search({ userId, paginationOptions: query, searchOptions: query })
		return matchResultReturn(result, {
			Ok: (docs) => ({ status: 200, body: docs }),
			Err: (err) => ({ status: mapErrorToStatusCode(err), body: { message: err.message } }),
		})
	},

	getDocumentAccessList: async ({ params, headers }) => {
		const userId = AuthorizationService.getUserIdFromAuthHeader(headers.authorization)
		if (!userId) return { status: 401, body: { message: 'Invalid or missing token' } }

		const result = await documentService.getAclEntries({ ...params, invokerUserId: userId })
		return matchResultReturn(result, {
			Ok: (access) => ({ status: 200, body: access }),
			Err: (err) => ({ status: mapErrorToStatusCode(err), body: { message: err.message } }),
		})
	},

	patchDocumentAccess: async ({ params, body, headers }) => {
		const userId = AuthorizationService.getUserIdFromAuthHeader(headers.authorization)
		if (!userId) return { status: 401, body: { message: 'Invalid or missing token' } }

		const result = await documentService.patchAcl({ invokerUserId: userId, ...params, ...body })
		return matchResultReturn(result, {
			Ok: (entry) => ({ status: 200, body: entry }),
			Err: (err) => ({ status: mapErrorToStatusCode(err), body: { message: err.message } }),
		})
	},

	deleteDocumentAccess: async ({ params, body, headers }) => {
		const userId = AuthorizationService.getUserIdFromAuthHeader(headers.authorization)
		if (!userId) return { status: 401, body: { message: 'Invalid or missing token' } }

		const result = await documentService.deleteAcl({ invokerUserId: userId, ...params, ...body })
		return matchResultReturn(result, {
			Ok: (entry) => ({ status: 200, body: entry }),
			Err: (err) => ({ status: mapErrorToStatusCode(err), body: { message: err.message } }),
		})
	},

	createDocumentLink: async ({ params, headers }) => {
		const userId = AuthorizationService.getUserIdFromAuthHeader(headers.authorization)
		if (!userId) return { status: 401, body: { message: 'Invalid or missing token' } }

		const result = await documentService.createLink({
			userId,
			documentId: params.documentId,
			baseUrl: `${headers.host}/documents/signed-url/download`,
			expiresAt: Date.now() + 2 * 60 * 60 * 1000,
			method: 'get',
		})
		return matchResultReturn(result, {
			Ok: (link) => ({ status: 200, body: { link } }),
			Err: (err) => ({ status: mapErrorToStatusCode(err), body: { message: err.message } }),
		})
	},

	downloadDocumentByLink: async ({ query }) => {
		const result = await documentService.getDocumentByLink(query)
		return matchResultReturn(result, {
			Ok: (doc) => {
				const fileExtension = mime.getExtension(doc.fileType) ?? 'bin'
				const headers = {
					'Content-Disposition': `attachment; filename="${doc.title}.${fileExtension}"`,
					'Content-Type': doc.fileType ?? 'text/plain',
				}
				return { status: 200, body: doc.content, headers }
			},
			Err: (err) => ({ status: mapErrorToStatusCode(err), body: { message: err.message } }),
		})
	},
}
