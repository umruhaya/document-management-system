import { initContract } from '@ts-rest/core'
import { z } from 'zod'
import * as dtos from '~/presentation/dtos/documents'
import type { InferContract } from '~/presentation/utils/ts-rest-contract'

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
			query: dtos.DownloadDocumentByLinkQuery,
			responses: {
				200: c.otherResponse({ contentType: 'text/markdown', body: z.string() }),
				404: z.string(),
				410: z.string(),
			},
		},
		createDocument: {
			method: 'POST',
			path: '/documents',
			metadata: { jwt: true },
			summary: 'Create a new document',
			headers: z.record(z.string()),
			description: validFileTypeDescription,
			body: dtos.DocumentCreate,
			responses: {
				200: dtos.CreateDocumentResponse,
				401: z.string(),
			},
		},
		patchDocument: {
			method: 'PATCH',
			path: '/documents/:id',
			metadata: { jwt: true },
			summary: 'Update a document (owner/editor only)',
			headers: z.record(z.string()),
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
			metadata: { jwt: true },
			summary: 'Retrieve Details of a Document if it exists',
			headers: z.record(z.string()),
			pathParams: dtos.GetDocumentByIdParams,
			responses: {
				200: dtos.GetDocumentByIdResponse,
				404: z.string(),
			},
		},
		searchDocuments: {
			method: 'GET',
			path: '/documents',
			metadata: { jwt: true },
			summary: 'Retrieve Documents List By Search Filters',
			headers: z.record(z.string()),
			query: dtos.SearchDocumentsQuery,
			responses: {
				200: dtos.SearchDocumentsResponse,
			},
		},
		getDocumentAccessList: {
			method: 'GET',
			path: '/documents/:documentId/access',
			metadata: { jwt: true },
			summary: 'Get all users who have access to a document, with their usernames and roles',
			headers: z.record(z.string()),
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
			metadata: { jwt: true },
			summary: 'Modify access for a user on a document (add/update/remove). Only owner can perform.',
			headers: z.record(z.string()),
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
			metadata: { jwt: true },
			summary: 'Create a short-lived download link for a document (1 hour expiry)',
			headers: z.record(z.string()),
			pathParams: dtos.CreateDocumentLinkParams,
			body: c.noBody(),
			responses: {
				200: dtos.CreateDocumentLinkResponse,
				403: z.string(),
				404: z.string(),
			},
		},
	},
	{
		commonResponses: {
			500: z.string(),
		},
	},
)

export type DocumentsContract = InferContract<typeof documentsContract>
