import { initContract } from '@ts-rest/core'
import { z } from 'zod'
import { DocumentSchema } from '~/app/dto/documents'
import type { InferContract } from '~/presentation/http/utils/ts-rest-contract'

const c = initContract()

const validFileTypeDescription = `
## valid File types are:
- Plain Text: \`text/plain\`
- Markdown: \`text/markdown\`
- HTML: \`text/html\`
- JavaScript: \`application/javascript\`
- TypeScript: \`application/typescript\`
- Python: \`text/x-python\`
`

export const documentsContract = c.router(
	{
		downloadDocumentByLink: {
			method: 'GET',
			path: '/documents/signed-url/download',
			summary: 'Download a document using a short-lived link',
			headers: z.record(z.string()),
			query: DocumentSchema.downloadByLink,
			responses: {
				200: c.otherResponse({ contentType: 'text/markdown', body: DocumentSchema.downloadByLinkResponse }),
				404: z.object({ message: z.string() }),
				410: z.object({ message: z.string() }),
			},
		},
		createDocument: {
			method: 'POST',
			path: '/documents',
			metadata: { jwt: true },
			summary: 'Create a new document',
			headers: z.record(z.string()),
			description: validFileTypeDescription,
			body: DocumentSchema.create.omit({ userId: true }),
			responses: {
				200: DocumentSchema.createResponse,
				401: z.object({ message: z.string() }),
			},
		},
		patchDocument: {
			method: 'PATCH',
			path: '/documents/:documentId',
			metadata: { jwt: true },
			summary: 'Update a document (owner/editor only)',
			headers: z.record(z.string()),
			description: validFileTypeDescription,
			pathParams: DocumentSchema.patch.pick({ documentId: true }),
			body: DocumentSchema.patch.omit({ userId: true, documentId: true }),
			responses: {
				200: DocumentSchema.patchResponse,
				403: z.object({ message: z.string() }),
				404: z.object({ message: z.string() }),
			},
		},
		getDocumentById: {
			method: 'GET',
			path: '/documents/:documentId',
			metadata: { jwt: true },
			summary: 'Retrieve Details of a Document if it exists',
			headers: z.record(z.string()),
			pathParams: DocumentSchema.getById.pick({ documentId: true }),
			responses: {
				200: DocumentSchema.getByIdResponse,
				404: z.object({ message: z.string() }),
			},
		},
		searchDocuments: {
			method: 'GET',
			path: '/documents',
			metadata: { jwt: true },
			summary: 'Retrieve Documents List By Search Filters',
			headers: z.record(z.string()),
			query: z.object({
				...DocumentSchema.search.shape.searchOptions.shape,
				...DocumentSchema.search.shape.paginationOptions.shape,
			}),
			responses: {
				200: DocumentSchema.searchResponse,
			},
		},
		getDocumentAccessList: {
			method: 'GET',
			path: '/documents/:documentId/access',
			metadata: { jwt: true },
			summary: 'Get all users who have access to a document, with their usernames and roles',
			headers: z.record(z.string()),
			pathParams: DocumentSchema.patchAccess.pick({ documentId: true }),
			responses: {
				200: DocumentSchema.accessListResponse,
				403: z.object({ message: z.string() }),
				404: z.object({ message: z.string() }),
			},
		},
		patchDocumentAccess: {
			method: 'PATCH',
			path: '/documents/:documentId/access',
			metadata: { jwt: true },
			summary: 'Modify access for a user on a document (add/update). Only owner can perform.',
			headers: z.record(z.string()),
			pathParams: DocumentSchema.patchAccess.pick({ documentId: true }),
			body: DocumentSchema.patchAccess.omit({ invokerUserId: true, documentId: true }),
			responses: {
				200: DocumentSchema.patchAccessResponse,
				403: z.object({ message: z.string() }),
				404: z.object({ message: z.string() }),
			},
		},
		deleteDocumentAccess: {
			method: 'DELETE',
			path: '/documents/:documentId/access',
			metadata: { jwt: true },
			summary: 'Modify access for a user on a document (remove). Only owner can perform.',
			headers: z.record(z.string()),
			pathParams: DocumentSchema.deleteAccess.pick({ documentId: true }),
			body: DocumentSchema.deleteAccess.omit({ invokerUserId: true, documentId: true }),
			responses: {
				200: DocumentSchema.deleteAccessResponse,
				403: z.object({ message: z.string() }),
				404: z.object({ message: z.string() }),
			},
		},
		createDocumentLink: {
			method: 'POST',
			path: '/documents/:documentId/link',
			metadata: { jwt: true },
			summary: 'Create a short-lived download link for a document (1 hour expiry)',
			headers: z.record(z.string()),
			pathParams: DocumentSchema.createLink,
			body: c.noBody(),
			responses: {
				200: DocumentSchema.createLinkResponse,
				403: z.object({ message: z.string() }),
				404: z.object({ message: z.string() }),
			},
		},
	},
	{
		commonResponses: {
			500: z.object({ message: z.string() }),
		},
	},
)

export type DocumentsContract = InferContract<typeof documentsContract>
