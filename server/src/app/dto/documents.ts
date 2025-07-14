import { z } from 'zod'
import type { InferZodTypesRecursively } from './_utils'

const document = z.object({
	documentId: z.string().uuid(),
	title: z.string(),
	description: z.string(),
	fileType: z.string().default('text/plain'),
	version: z.number(),
	size: z.number(),
	content: z.string(),
	tags: z.array(z.string()),
	createdAt: z.date(),
	updatedAt: z.date(),
})

const accessEntry = z.object({
	userId: z.string().uuid(),
	documentId: z.string().uuid(),
	role: z.enum(['viewer', 'editor', 'owner']),
})

const userId = { userId: z.string().uuid() }

// Document DTO schema object
export const DocumentSchema = {
	create: document
		.pick({
			documentId: true,
			title: true,
			description: true,
			fileType: true,
			content: true,
			tags: true,
		})
		.extend(userId),
	createResponse: document.omit({ content: true }),

	patch: document
		.pick({ title: true, description: true, fileType: true, content: true, tags: true })
		.partial()
		.extend({ userId: z.string().uuid(), documentId: z.string().uuid() }),
	patchResponse: document,

	getById: document.pick({ documentId: true }).extend(userId),
	getByIdResponse: document,

	search: z.object({
		userId: z.string().uuid(),
		paginationOptions: z.object({
			page: z.coerce.number().int().positive().default(1),
			limit: z.coerce.number().int().positive().max(50).default(10),
		}),
		searchOptions: z.object({
			title: z.string().optional(),
			author: z.string().optional(),
			tags: z
				.union([z.string(), z.string().array()])
				.optional()
				.transform((tags) => (tags ? (Array.isArray(tags) ? tags : [tags]) : undefined)),
			fileType: z.string().optional(),
			version: z.coerce.number().optional(),
		}),
	}),
	searchResponse: z.object({
		pageNum: z.number(),
		pageSize: z.number(),
		totalPages: z.number(),
		data: z.array(document.omit({ content: true })),
	}),

	// Make a clear distinction between invokerUserId (id of user that makes the request) vs the `userId` field in Access Entry Resource
	accessList: accessEntry.pick({ documentId: true }).extend({ invokerUserId: z.string().uuid() }),
	accessListResponse: z.array(accessEntry),

	patchAccess: accessEntry.extend({ invokerUserId: z.string().uuid() }),
	patchAccessResponse: accessEntry,

	deleteAccess: accessEntry.pick({ userId: true, documentId: true }).extend({ invokerUserId: z.string().uuid() }),
	deleteAccessResponse: z.object({ success: z.boolean() }),

	createLink: z.object({ documentId: z.string().uuid() }),
	createLinkResponse: z.object({ link: z.string() }),

	downloadByLink: z.object({
		documentId: z.string().uuid(),
		method: z.string(),
		expiresAt: z.coerce.number(),
		signature: z.string(),
	}),
	downloadByLinkResponse: z.string(),
}

/** Recursively infer types for all entries in DocumentSchema */
export type DocumentDTO = InferZodTypesRecursively<typeof DocumentSchema>
