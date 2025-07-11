import mime from 'mime'
import { container } from 'tsyringe'
import { DocumentService } from '~/app/services/document.service'
import { PaginationOptions } from '~/hexapp'
import { AuthorizationService } from '~/infra/services/authorization.service'
import type { DocumentsContract } from '~/presentation/contracts/documents'
import { mapErrorToStatusCode } from '~/presentation/utils/http-mapper'
import { matchResultReturn } from '~/presentation/utils/result-match'

const documentService = container.resolve(DocumentService)

export const documentsController: DocumentsContract = {
	createDocument: async ({ body, headers }) => {
		const userId = AuthorizationService.getUserIdFromAuthHeader(headers.authorization)
		if (!userId) return { status: 401, body: 'Invalid or missing token' }

		const result = await documentService.create(userId, body)
		return matchResultReturn(result, {
			Ok: (doc) => ({ status: 200, body: { documentId: doc.id } }),
			Err: (err) => ({ status: mapErrorToStatusCode(err), body: err.message }),
		})
	},

	patchDocument: async ({ body, params, headers }) => {
		const userId = AuthorizationService.getUserIdFromAuthHeader(headers.authorization)
		if (!userId) return { status: 401, body: 'Invalid or missing token' }

		const document = { ...body, id: params.id }
		const result = await documentService.update(userId, document)
		return matchResultReturn(result, {
			Ok: () => ({ status: 200, body: { updated: true } }),
			Err: (err) => ({ status: mapErrorToStatusCode(err), body: err.message }),
		})
	},

	getDocumentById: async ({ params, headers }) => {
		const userId = AuthorizationService.getUserIdFromAuthHeader(headers.authorization)
		if (!userId) return { status: 401, body: 'Invalid or missing token' }

		const result = await documentService.getById(userId, params.id)
		return matchResultReturn(result, {
			Ok: (doc) => ({ status: 200, body: doc.serialize() }),
			Err: (err) => ({ status: mapErrorToStatusCode(err), body: err.message }),
		})
	},

	searchDocuments: async ({ query: q, headers }) => {
		const userId = AuthorizationService.getUserIdFromAuthHeader(headers.authorization)
		if (!userId) return { status: 401, body: 'Invalid or missing token' }

		const result = await PaginationOptions.create({ pageNum: q.page, pageSize: q.limit })
			.flatMap((paginationOptions) =>
				documentService.search(
					userId,
					{ title: q.title, version: q.version, fileType: q.fileType, tags: q.tags },
					{ exlcudeContent: q.exlcudeContent },
					paginationOptions,
				),
			)
			.toPromise()
		return matchResultReturn(result, {
			Ok: (docs) => ({ status: 200, body: docs }),
			Err: (err) => ({ status: mapErrorToStatusCode(err), body: err.message }),
		})
	},

	getDocumentAccessList: async ({ params }) => {
		const result = await documentService.getAclEntries(params.documentId)
		return matchResultReturn(result, {
			Ok: (access) => ({ status: 200, body: { access } }),
			Err: (err) => ({ status: mapErrorToStatusCode(err), body: err.message }),
		})
	},

	patchDocumentAccess: async ({ params, body, headers }) => {
		const userId = AuthorizationService.getUserIdFromAuthHeader(headers.authorization)
		if (!userId) return { status: 401, body: 'Invalid or missing token' }

		const result = await documentService.patchAcl(body.userId, params.documentId, body.role)
		return matchResultReturn(result, {
			Ok: () => ({ status: 200, body: { success: true } }),
			Err: (err) => ({ status: mapErrorToStatusCode(err), body: err.message }),
		})
	},

	deleteDocumentAccess: async ({ params, body, headers }) => {
		const userId = AuthorizationService.getUserIdFromAuthHeader(headers.authorization)
		if (!userId) return { status: 401, body: 'Invalid or missing token' }

		const result = await documentService.deleteAcl(body.userId, params.documentId)
		return matchResultReturn(result, {
			Ok: () => ({ status: 200, body: { success: true } }),
			Err: (err) => ({ status: mapErrorToStatusCode(err), body: err.message }),
		})
	},

	createDocumentLink: async ({ params, headers }) => {
		const userId = AuthorizationService.getUserIdFromAuthHeader(headers.authorization)
		if (!userId) return { status: 401, body: 'Invalid or missing token' }

		const result = await documentService.createLink(userId, {
			baseUrl: `${headers.host}/documents/signed-url/download`,
			documentId: params.documentId,
			expiresAt: Date.now() + 2 * 60 * 60 * 1000,
			method: 'get',
		})
		return matchResultReturn(result, {
			Ok: (link) => ({ status: 200, body: { link } }),
			Err: (err) => ({ status: mapErrorToStatusCode(err), body: err.message }),
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
			Err: (err) => ({ status: mapErrorToStatusCode(err), body: err.message }),
		})
	},
}
