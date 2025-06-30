import * as HttpStatusCodes from 'stoker/http-status-codes'
import * as HttpStatusPhrases from 'stoker/http-status-phrases'
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers'
import { z } from 'zod'
import * as dtos from '~/presentation/dtos/documents'
import { createRoute } from './_helpers'

const description = `
## valid File types are:
- Plain Text: \`text/plain\`
- Markdown: \`text/markdown\`
- HTML: \`text/html\`
- JavaScript: \`application/javascript\`
- TypeScript: \`application/typescript\`
- Python: \`text/x-python\`
`

export const createDocument = createRoute({
	method: 'post',
	path: '/documents',
	operationId: 'createDocument',
	tags: ['Documents'],
	summary: 'Create a new document',
	description,
	security: [{ jwt: [] }],
	request: {
		body: jsonContentRequired(dtos.DocumentCreate, 'DocumentCreate'),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(dtos.CreateDocumentResponse, HttpStatusPhrases.OK),
	},
})

export const patchDocument = createRoute({
	method: 'patch',
	path: '/documents/{id}',
	operationId: 'patchDocument',
	tags: ['Documents'],
	summary: 'Update a document (owner/editor only)',
	description,
	security: [{ jwt: [] }],
	request: {
		params: dtos.DocumentPatchParams,
		body: jsonContentRequired(dtos.DocumentPatch, 'DocumentPatch'),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(dtos.PatchDocumentResponse, HttpStatusPhrases.OK),
		[HttpStatusCodes.FORBIDDEN]: jsonContent(z.string(), HttpStatusPhrases.FORBIDDEN),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(z.string(), HttpStatusPhrases.NOT_FOUND),
	},
})

export const getDocumentById = createRoute({
	method: 'get',
	path: '/documents/{id}',
	operationId: 'getDocument',
	tags: ['Documents'],
	summary: 'Retrieve Details of a Document if it exists',
	security: [{ jwt: [] }],
	request: {
		params: dtos.GetDocumentByIdParams,
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(dtos.GetDocumentByIdResponse, HttpStatusPhrases.OK),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(z.string(), HttpStatusPhrases.NOT_FOUND),
	},
})

export const searchDocuments = createRoute({
	method: 'get',
	path: '/documents',
	operationId: 'getDocuments',
	tags: ['Documents'],
	summary: 'Retrieve Documents List By Search Filters',
	security: [{ jwt: [] }],
	request: {
		query: dtos.SearchDocumentsQuery,
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(dtos.SearchDocumentsResponse, HttpStatusPhrases.OK),
	},
})

export const getDocumentAccessList = createRoute({
	method: 'get',
	path: '/documents/{documentId}/access',
	operationId: 'getDocumentAccessList',
	tags: ['Documents'],
	summary: 'Get all users who have access to a document, with their usernames and roles',
	security: [{ jwt: [] }],
	request: {
		params: dtos.GetDocumentAccessListParams,
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(dtos.GetDocumentAccessListResponse, HttpStatusPhrases.OK),
		[HttpStatusCodes.FORBIDDEN]: jsonContent(z.string(), HttpStatusPhrases.FORBIDDEN),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(z.string(), HttpStatusPhrases.NOT_FOUND),
	},
})

export const patchDocumentAccess = createRoute({
	method: 'patch',
	path: '/documents/{documentId}/access',
	operationId: 'patchDocumentAccess',
	tags: ['Documents'],
	summary: 'Modify access for a user on a document (add/update/remove). Only owner can perform.',
	security: [{ jwt: [] }],
	request: {
		params: dtos.PatchDocumentAccessParams,
		body: jsonContentRequired(dtos.PatchDocumentAccessRequest, 'DocumentAccessPatch'),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(dtos.PatchDocumentAccessResponse, HttpStatusPhrases.OK),
		[HttpStatusCodes.FORBIDDEN]: jsonContent(z.string(), HttpStatusPhrases.FORBIDDEN),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(z.string(), HttpStatusPhrases.NOT_FOUND),
	},
})

export const createDocumentLink = createRoute({
	method: 'post',
	path: '/documents/{documentId}/link',
	operationId: 'createDocumentLink',
	tags: ['Documents'],
	summary: 'Create a short-lived download link for a document (1 hour expiry)',
	security: [{ jwt: [] }],
	request: {
		params: dtos.CreateDocumentLinkParams,
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(dtos.CreateDocumentLinkResponse, HttpStatusPhrases.OK),
		[HttpStatusCodes.FORBIDDEN]: jsonContent(z.string(), HttpStatusPhrases.FORBIDDEN),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(z.string(), HttpStatusPhrases.NOT_FOUND),
	},
})

export const downloadDocumentByLink = createRoute({
	method: 'get',
	path: '/documents/download/{filename}',
	operationId: 'downloadDocumentByLink',
	tags: ['Documents'],
	summary: 'Download a document using a short-lived link',
	request: {
		params: dtos.DownloadDocumentByLinkParams,
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				'text/plain': { schema: dtos.DownloadDocumentByLinkResponse },
			},
			description: 'File',
		},
		[HttpStatusCodes.NOT_FOUND]: jsonContent(z.string(), HttpStatusPhrases.NOT_FOUND),
		[HttpStatusCodes.GONE]: jsonContent(z.string(), HttpStatusPhrases.GONE),
	},
})
