import { initContract } from '@ts-rest/core'
import { z } from 'zod'
import * as dtos from '~/presentation/dtos/documents'

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

export const documentsContract = c.router({
	createDocument: {
		method: 'POST',
		path: '/documents',
		summary: 'Create a new document',
		description: validFileTypeDescription,
		body: dtos.DocumentCreate,
		responses: {
			200: dtos.CreateDocumentResponse,
		},
	},
	patchDocument: {
		method: 'PATCH',
		path: '/documents/:id',
		summary: 'Update a document (owner/editor only)',
		description: validFileTypeDescription,
		pathParams: dtos.DocumentPatchParams,
		body: dtos.DocumentPatch,
		responses: {
			200: dtos.PatchDocumentResponse,
			403: z.string(),
			404: z.string(),
		},
	},
	getDocumentById: {
		method: 'GET',
		path: '/documents/:id',
		summary: 'Retrieve Details of a Document if it exists',
		pathParams: dtos.GetDocumentByIdParams,
		responses: {
			200: dtos.GetDocumentByIdResponse,
			404: z.string(),
		},
	},
	searchDocuments: {
		method: 'GET',
		path: '/documents',
		summary: 'Retrieve Documents List By Search Filters',
		query: dtos.SearchDocumentsQuery,
		responses: {
			200: dtos.SearchDocumentsResponse,
		},
	},
	getDocumentAccessList: {
		method: 'GET',
		path: '/documents/:documentId/access',
		summary: 'Get all users who have access to a document, with their usernames and roles',
		pathParams: dtos.GetDocumentAccessListParams,
		responses: {
			200: dtos.GetDocumentAccessListResponse,
			403: z.string(),
			404: z.string(),
		},
	},
	patchDocumentAccess: {
		method: 'PATCH',
		path: '/documents/:documentId/access',
		summary: 'Modify access for a user on a document (add/update/remove). Only owner can perform.',
		pathParams: dtos.PatchDocumentAccessParams,
		body: dtos.PatchDocumentAccessRequest,
		responses: {
			200: dtos.PatchDocumentAccessResponse,
			403: z.string(),
			404: z.string(),
		},
	},
	createDocumentLink: {
		method: 'POST',
		path: '/documents/:documentId/link',
		summary: 'Create a short-lived download link for a document (1 hour expiry)',
		pathParams: dtos.CreateDocumentLinkParams,
		body: z.undefined(),
		responses: {
			200: dtos.CreateDocumentLinkResponse,
			403: z.string(),
			404: z.string(),
		},
	},
	downloadDocumentByLink: {
		method: 'GET',
		path: '/documents/download',
		summary: 'Download a document using a short-lived link',
		query: dtos.DownloadDocumentByLinkQuery,
		responses: {
			200: dtos.DownloadDocumentByLinkResponse,
			404: z.string(),
			410: z.string(),
		},
	},
})
