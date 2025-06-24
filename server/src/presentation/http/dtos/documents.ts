import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
extendZodWithOpenApi(z)

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
export const CreateDocumentResponse = z.object({
	documentId: z.string(),
})

// Patch document
export const DocumentPatchParams = z.object({ id: z.string() })
export const DocumentPatch = z.object({
	title: z.string().optional(),
	description: z.string().optional(),
	fileType: z.enum(AllowedFileTypes).optional(),
	content: z.string().optional(),
	tags: z.array(z.string()).optional(),
})
export const PatchDocumentResponse = z.object({ updated: z.boolean() })

// Get document by ID
export const GetDocumentByIdParams = z.object({ id: z.string() })
export const GetDocumentByIdResponse = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string(),
	fileType: z.string(),
	version: z.number(),
	size: z.number(),
	content: z.string(),
	tags: z.array(z.string()),
	createdAt: z.string(),
	updatedAt: z.string(),
})

// Search documents
export const SearchDocumentsQuery = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(50).default(10),
	sort: z.string().optional(),
	title: z.string().optional(),
	author: z.string().optional(),
	tags: z.union([z.string(), z.string().array()])
		.optional()
		.transform(tags => tags ? (Array.isArray(tags) ? tags : [tags]) : undefined),
	fileType: z.string().optional(),
	version: z.coerce.number().optional(),
	exlcudeContent: z.literal('true').default('true').optional(),
})
export const SearchDocumentsResponse = z.object({
	totalItems: z.number(),     
	totalPages: z.number(), 
	currentPage: z.number(),    
	perPage: z.number(),
	items: z.array(z.object({
		id: z.string(),
		title: z.string(),
		description: z.string(),
		fileType: z.string(),
		version: z.number(),
		size: z.number(),
		content: z.string(),
		tags: z.array(z.string()),
		createdAt: z.string(),
		updatedAt: z.string(),
	})),
})

// Document access list
export const GetDocumentAccessListParams = z.object({ documentId: z.string() })
export const GetDocumentAccessListResponse = z.object({
	access: z.array(z.object({
		userId: z.string(),
		username: z.string(),
		role: z.string(),
	})),
})

// Patch document access
export const PatchDocumentAccessParams = z.object({ documentId: z.string() })
export const PatchDocumentAccessRequest = z.object({
	targetUserId: z.string(),
	role: z.enum(['viewer', 'editor', 'owner']).optional(),
	remove: z.boolean().optional(),
})
export const PatchDocumentAccessResponse = z.object({ success: z.boolean() })

// Create document link
export const CreateDocumentLinkParams = z.object({ documentId: z.string() })
export const CreateDocumentLinkResponse = z.object({
	linkId: z.string(),
	url: z.string(),
	expiresAt: z.string(),
})

// Download document by link
export const DownloadDocumentByLinkParams = z.object({ filename: z.string() })
export const DownloadDocumentByLinkResponse = z.string()
