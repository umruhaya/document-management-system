import { z } from 'zod'

// Allowed file types for documents
export const AllowedFileTypes = [
	'text/plain',
	'text/markdown',
	'text/html',
	'application/javascript',
	'application/typescript',
	'text/x-python',
] as const

// Create document
export const DocumentCreate = z.object({
	title: z.string(),
	description: z.string(),
	fileType: z.enum(AllowedFileTypes),
	content: z.string(),
	tags: z.array(z.string()).optional(),
})
export type DocumentCreateType = z.infer<typeof DocumentCreate>
export const CreateDocumentResponse = z.object({
	documentId: z.string().uuid(),
})
export type CreateDocumentResponseType = z.infer<typeof CreateDocumentResponse>

// Patch document
export const DocumentPatchParams = z.object({ id: z.string().uuid() })
export type DocumentPatchParamsType = z.infer<typeof DocumentPatchParams>
export const DocumentPatch = z.object({
	title: z.string().optional(),
	description: z.string().optional(),
	fileType: z.enum(AllowedFileTypes).optional(),
	content: z.string().optional(),
	tags: z.array(z.string()).optional(),
})
export type DocumentPatchType = z.infer<typeof DocumentPatch>
export const PatchDocumentResponse = z.object({ updated: z.boolean() })
export type PatchDocumentResponseType = z.infer<typeof PatchDocumentResponse>

// Get document by ID
export const GetDocumentByIdParams = z.object({ id: z.string().uuid() })
export type GetDocumentByIdParamsType = z.infer<typeof GetDocumentByIdParams>
export const GetDocumentByIdResponse = z.object({
	id: z.string().uuid(),
	title: z.string(),
	description: z.string(),
	fileType: z.string(),
	version: z.number(),
	size: z.number(),
	content: z.string(),
	tags: z.array(z.string()),
	createdAt: z.date(),
	updatedAt: z.date(),
})
export type GetDocumentByIdResponseType = z.infer<typeof GetDocumentByIdResponse>

// Search documents
export const SearchDocumentsQuery = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(50).default(10),
	sort: z.string().optional(),
	title: z.string().optional(),
	author: z.string().optional(),
	tags: z
		.union([z.string(), z.string().array()])
		.optional()
		.transform((tags) => (tags ? (Array.isArray(tags) ? tags : [tags]) : undefined)),
	fileType: z.string().optional(),
	version: z.coerce.number().optional(),
	exlcudeContent: z
		.literal('true')
		.default('true')
		.optional()
		.transform((x) => x === 'true'),
})
export type SearchDocumentsQueryType = z.infer<typeof SearchDocumentsQuery>
export const SearchDocumentsResponse = z.object({
	pageNum: z.number(),
	pageSize: z.number(),
	totalPages: z.number(),
	data: z.array(
		z.object({
			id: z.string().uuid(),
			title: z.string(),
			description: z.string(),
			fileType: z.string(),
			version: z.number(),
			size: z.number(),
			content: z.string(),
			tags: z.array(z.string()),
			createdAt: z.date(),
			updatedAt: z.date(),
		}),
	),
})
export type SearchDocumentsResponseType = z.infer<typeof SearchDocumentsResponse>

// Document access list
export const GetDocumentAccessListParams = z.object({ documentId: z.string() })
export type GetDocumentAccessListParamsType = z.infer<typeof GetDocumentAccessListParams>
export const GetDocumentAccessListResponse = z.object({
	access: z.array(
		z.object({
			userId: z.string().uuid(),
			documentId: z.string().uuid(),
			role: z.string(),
		}),
	),
})
export type GetDocumentAccessListResponseType = z.infer<typeof GetDocumentAccessListResponse>

// Patch document Access
export const PatchDocumentAccessParams = z.object({ documentId: z.string().uuid() })
export type PatchDocumentAccessParamsType = z.infer<typeof PatchDocumentAccessParams>

export const PatchDocumentAccessRequest = z.object({
	userId: z.string().uuid(),
	role: z.enum(['viewer', 'editor', 'owner']),
})
export type PatchDocumentAccessRequestType = z.infer<typeof PatchDocumentAccessRequest>

export const PatchDocumentAccessResponse = z.object({ success: z.boolean() })
export type PatchDocumentAccessResponseType = z.infer<typeof PatchDocumentAccessResponse>

// Delete Document Access
export const DeleteDocumentAccessParams = z.object({ documentId: z.string().uuid() })
export type DeleteDocumentAccessParamsType = z.infer<typeof PatchDocumentAccessParams>

export const DeleteDocumentAccessRequest = z.object({
	userId: z.string().uuid(),
})
export type DeleteDocumentAccessRequestType = z.infer<typeof PatchDocumentAccessRequest>

export const DeleteDocumentAccessResponse = z.object({ success: z.boolean() })
export type DeleteDocumentAccessResponseType = z.infer<typeof PatchDocumentAccessResponse>

// Create document link
export const CreateDocumentLinkParams = z.object({ documentId: z.string().uuid() })
export type CreateDocumentLinkParamsType = z.infer<typeof CreateDocumentLinkParams>

export const CreateDocumentLinkResponse = z.object({
	link: z.string(),
})
export type CreateDocumentLinkResponseType = z.infer<typeof CreateDocumentLinkResponse>

// Download document by link
export const DownloadDocumentByLinkQuery = z.object({
	documentId: z.string().uuid(),
	method: z.string(),
	expiresAt: z.coerce.number(),
	signature: z.string(),
})
export type DownloadDocumentByLinkQueryType = z.infer<typeof DownloadDocumentByLinkQuery>
export const DownloadDocumentByLinkResponse = z.string()
export type DownloadDocumentByLinkResponseType = z.infer<typeof DownloadDocumentByLinkResponse>
