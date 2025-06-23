import { z } from 'zod'
import * as dtos from '~/presentation/http/dtos/documents'
import { db, table } from '~/db'
import { ulid } from 'ulidx'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import { httpResponse } from '~/presentation/http/lib'
import { and, arrayContains, eq, exists, ilike, inArray, sql } from 'drizzle-orm'
import mime from 'mime'
import { addHours } from 'date-fns'

export const create = async (input: { userId: string, body: any }) => {
	const documentId = ulid()

	const bodyResult = dtos.DocumentCreate.safeParse(input.body)
	if (!bodyResult.success) {
		return httpResponse({ json: bodyResult.error.errors, statusCode: HttpStatusCodes.UNPROCESSABLE_ENTITY })
	}
	const { userId } = input
	const body = bodyResult.data

	const size = body.content.length

	await db.transaction(async (tx) => {
		await tx.insert(table.documents)
			.values({
				id: documentId,
				title: body.title,
				description: body.description,
				fileType: body.fileType,
				content: body.content,
				tags: body.tags ?? [],
				size,
				version: 1,
				createdBy: userId,
			})

		// Grant owner access to creator
		await tx.insert(table.documentAccess)
			.values({
				userId,
				documentId,
				role: 'owner',
			})
	})

	return httpResponse({ json: { documentId }, statusCode: HttpStatusCodes.OK })
}

export const patch = async (
	{ userId, params, body }: {
		userId: string
		params: any
		body: any
	},
) => {
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

	const access = await db
		.select({ role: table.documentAccess.role })
		.from(table.documentAccess)
		.where(and(
			eq(table.documentAccess.documentId, documentId),
			eq(table.documentAccess.userId, userId),
			inArray(table.documentAccess.role, ['owner', 'editor']),
		))
		.then(r => r.at(0))

	if (!access) {
		return httpResponse({ json: 'Forbidden: Not enough access', statusCode: HttpStatusCodes.FORBIDDEN })
	}

	const version = patch.content !== undefined ? sql`${table.documents.version} + 1` : undefined
	const size = patch.content !== undefined ? patch.content.length : undefined

	const result = await db.update(table.documents)
		.set({ ...patch, version, size })
		.where(eq(table.documents.id, documentId))
		.returning()
		.then(r => r.at(0))

	if (!result) {
		return httpResponse({ json: 'Document not found', statusCode: HttpStatusCodes.NOT_FOUND })
	}

	return httpResponse({ json: { updated: true }, statusCode: HttpStatusCodes.OK })
}

export const getById = async (
	{ userId, params }: { userId: string; params: any },
) => {
	const paramsResult = dtos.GetDocumentByIdParams.safeParse(params)
	if (!paramsResult.success) {
		return httpResponse({ json: paramsResult.error.errors, statusCode: HttpStatusCodes.UNPROCESSABLE_ENTITY })
	}
	const documentId = paramsResult.data.id

	const document = await db.selectDistinctOn([table.documents.id], {
		id: table.documents.id,
		title: table.documents.title,
		description: table.documents.description,
		fileType: table.documents.fileType,
		version: table.documents.version,
		size: table.documents.size,
		content: table.documents.content,
		tags: table.documents.tags,
		createdAt: table.documents.createdAt,
		updatedAt: table.documents.updatedAt,
	})
		.from(table.documents)
		.innerJoin(table.documentAccess, eq(table.documents.id, table.documentAccess.documentId))
		.where(
			and(
				eq(table.documents.id, documentId),
				eq(table.documentAccess.userId, userId),
			),
		)
		.execute()
		.then(r => r.at(0))

	if (!document) {
		return httpResponse({ json: `No Document Found with ID ${documentId}`, statusCode: HttpStatusCodes.NOT_FOUND })
	}

	return httpResponse({ json: document, statusCode: HttpStatusCodes.OK })
}

export const search = async (
	{ userId, query }: { userId: string; query: any },
) => {
	const queryResult = dtos.SearchDocumentsQuery.safeParse(query)
	if (!queryResult.success) {
		return httpResponse({ json: queryResult.error.errors, statusCode: HttpStatusCodes.UNPROCESSABLE_ENTITY })
	}
	const q = queryResult.data

	const documents = await db.selectDistinctOn([table.documents.id], {
		id: table.documents.id,
		title: table.documents.title,
		description: table.documents.description,
		fileType: table.documents.fileType,
		version: table.documents.version,
		size: table.documents.size,
		content: q.exlcudeContent ? sql`''` : table.documents.content,
		tags: table.documents.tags,
		createdAt: table.documents.createdAt,
		updatedAt: table.documents.updatedAt,
	})
		.from(table.documents)
		.innerJoin(table.documentAccess, eq(table.documents.id, table.documentAccess.documentId))
		.where(
			and(
				exists(
					db.select()
						.from(table.documentAccess)
						.where(
							and(
								eq(table.documentAccess.documentId, table.documents.id),
								eq(table.documentAccess.userId, userId),
							),
						),
				),
				q.title ? ilike(table.documents.title, `%${q.title}%`) : undefined,
				q.author ? ilike(table.users.username, `%${q.author}%`) : undefined,
				q.author ? inArray(table.documentAccess.role, ['owner', 'editor']) : undefined,
				q.tags && q.tags.length !== 0 ? arrayContains(table.documents.tags, q.tags) : undefined,
				q.fileType ? eq(table.documents.fileType, q.fileType) : undefined,
			),
		)
		.limit(q.limit)
		.offset(q.offset)
		.execute()
		.then(r => r)

	return httpResponse({ json: { documents }, statusCode: HttpStatusCodes.OK })
}

export const getAccessList = async (
	{ userId, params }: { userId: string; params: any },
) => {
	const paramsResult = dtos.GetDocumentAccessListParams.safeParse(params)
	if (!paramsResult.success) {
		return httpResponse({ json: paramsResult.error.errors, statusCode: HttpStatusCodes.UNPROCESSABLE_ENTITY })
	}
	const { documentId } = paramsResult.data

	const hasAccess = await db
		.select()
		.from(table.documentAccess)
		.where(and(
			eq(table.documentAccess.documentId, documentId),
			eq(table.documentAccess.userId, userId),
		))
		.then(r => r.length > 0)

	if (!hasAccess) {
		return httpResponse({ json: 'Forbidden', statusCode: HttpStatusCodes.FORBIDDEN })
	}

	const access = await db
		.select({
			userId: table.documentAccess.userId,
			username: table.users.username,
			role: table.documentAccess.role,
		})
		.from(table.documentAccess)
		.innerJoin(table.users, eq(table.documentAccess.userId, table.users.id))
		.where(eq(table.documentAccess.documentId, documentId))
		.then(r => r)

	if (!access.length) {
		return httpResponse({
			json: 'No access records found for this document',
			statusCode: HttpStatusCodes.NOT_FOUND,
		})
	}

	return httpResponse({ json: { access }, statusCode: HttpStatusCodes.OK })
}

export const patchAccess = async (
	{ userId, params, body }: {
		userId: string
		params: any
		body: any
	},
) => {
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

	const isOwner = await db
		.select()
		.from(table.documentAccess)
		.where(and(
			eq(table.documentAccess.documentId, documentId),
			eq(table.documentAccess.userId, userId),
			eq(table.documentAccess.role, 'owner'),
		))
		.then(r => r.length > 0)

	if (!isOwner) {
		return httpResponse({ json: 'Only owner can modify access', statusCode: HttpStatusCodes.FORBIDDEN })
	}

	if (remove) {
		await db.delete(table.documentAccess)
			.where(and(
				eq(table.documentAccess.documentId, documentId),
				eq(table.documentAccess.userId, targetUserId),
			))
		return httpResponse({ json: { success: true }, statusCode: HttpStatusCodes.OK })
	}

	if (!role) {
		return httpResponse({
			json: 'Role is required when not removing access',
			statusCode: HttpStatusCodes.FORBIDDEN,
		})
	}

	const existing = await db
		.select()
		.from(table.documentAccess)
		.where(and(
			eq(table.documentAccess.documentId, documentId),
			eq(table.documentAccess.userId, targetUserId),
		))
		.then(r => r.length > 0)

	if (existing) {
		await db.update(table.documentAccess)
			.set({ role })
			.where(and(
				eq(table.documentAccess.documentId, documentId),
				eq(table.documentAccess.userId, targetUserId),
			))
	} else {
		await db.insert(table.documentAccess)
			.values({
				documentId,
				userId: targetUserId,
				role,
			})
	}

	return httpResponse({ json: { success: true }, statusCode: HttpStatusCodes.OK })
}

export const createLink = async (
	{ userId, params, origin }: {
		userId: string
		params: any
		origin: string
	},
) => {
	const paramsResult = dtos.CreateDocumentLinkParams.safeParse(params)
	if (!paramsResult.success) {
		return httpResponse({ json: paramsResult.error.errors, statusCode: HttpStatusCodes.UNPROCESSABLE_ENTITY })
	}
	const { documentId } = paramsResult.data

	const access = await db
		.select()
		.from(table.documentAccess)
		.where(
			and(
				eq(table.documentAccess.documentId, documentId),
				eq(table.documentAccess.userId, userId),
			),
		)
		.then(r => r.length > 0)

	if (!access) {
		return httpResponse({ json: 'Forbidden', statusCode: HttpStatusCodes.FORBIDDEN })
	}

	const doc = await db
		.select({ id: table.documents.id, fileType: table.documents.fileType })
		.from(table.documents)
		.where(eq(table.documents.id, documentId))
		.then(r => r.at(0))

	if (!doc) {
		return httpResponse({ json: 'Document not found', statusCode: HttpStatusCodes.NOT_FOUND })
	}

	const linkId = ulid()
	const expiresAt = addHours(new Date(), 1)
	const fileExtension = mime.getExtension(doc.fileType) ?? 'bin'

	await db.insert(table.documentLinks).values({
		id: linkId,
		documentId,
		fileExtension,
		fileMimeType: doc.fileType,
		createdAt: new Date(),
		expiresAt,
	})

	const path = `/documents/download/${linkId}.${fileExtension}`
	const url = `${origin}${path}`

	return httpResponse({ json: { linkId, url, expiresAt: expiresAt.toISOString() }, statusCode: HttpStatusCodes.OK })
}

export const downloadByLink = async (
	{ params }: { params: any },
) => {
	const paramsResult = dtos.DownloadDocumentByLinkParams.safeParse(params)
	if (!paramsResult.success) {
		return httpResponse({ json: paramsResult.error.errors, statusCode: HttpStatusCodes.UNPROCESSABLE_ENTITY })
	}
	const { filename } = paramsResult.data
	const linkId = filename.split('.')[0] ?? filename

	const link = await db
		.select({
			id: table.documentLinks.id,
			documentId: table.documentLinks.documentId,
			fileExtension: table.documentLinks.fileExtension,
			fileMimeType: table.documentLinks.fileMimeType,
			expiresAt: table.documentLinks.expiresAt,
		})
		.from(table.documentLinks)
		.where(
			eq(table.documentLinks.id, linkId),
		)
		.then(r => r.at(0))

	if (!link) {
		return httpResponse({ json: 'Link not found', statusCode: HttpStatusCodes.NOT_FOUND })
	}

	if (link.expiresAt < new Date()) {
		return httpResponse({ json: 'Link expired', statusCode: HttpStatusCodes.GONE })
	}

	const doc = await db
		.select({
			content: table.documents.content,
			title: table.documents.title,
			fileType: table.documents.fileType,
		})
		.from(table.documents)
		.where(eq(table.documents.id, link.documentId))
		.then(r => r.at(0))

	if (!doc) {
		return httpResponse({ json: 'Document not found', statusCode: HttpStatusCodes.NOT_FOUND })
	}

	const fileExtension = mime.getExtension(doc.fileType) ?? 'bin'
	const headers = {
		'Content-Disposition': `attachment; filename="${doc.title}.${fileExtension}"`,
		'Content-Type': link.fileMimeType ?? 'text/plain',
	}

	return httpResponse({ body: doc.content, statusCode: HttpStatusCodes.OK, headers })
}
