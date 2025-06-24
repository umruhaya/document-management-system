import { addHours } from 'date-fns'
import { and, arrayContains, countDistinct, eq, exists, ilike, inArray, sql } from 'drizzle-orm'
import mime from 'mime'
import { ulid } from 'ulidx'
import { db, table } from '~/db'
import { Result, type ResultType } from '~/lib/result'

export class DocumentRepository {
	async create(
		userId: string,
		data: {
			title: string
			description: string
			fileType: string
			content: string
			tags?: string[]
		},
	): Promise<ResultType<{ documentId: string }, { type: 'Unknown'; message: string }>> {
		const documentId = ulid()
		const size = data.content.length
		try {
			await db.transaction(async (tx) => {
				await tx.insert(table.documents).values({
					id: documentId,
					title: data.title,
					description: data.description,
					fileType: data.fileType,
					content: data.content,
					tags: data.tags ?? [],
					size,
					version: 1,
					createdBy: userId,
				})
				await tx.insert(table.documentAccess).values({
					userId,
					documentId,
					role: 'owner',
				})
			})
			return Result.ok({ documentId })
		} catch (error: any) {
			return Result.err({ type: 'Unknown', message: error.message || 'Unknown error' })
		}
	}

	async patch(
		userId: string,
		documentId: string,
		patch: any,
	): Promise<ResultType<{ updated: boolean }, { type: 'Forbidden' | 'NotFound' | 'Unknown'; message: string }>> {
		const access = await db
			.select({ role: table.documentAccess.role })
			.from(table.documentAccess)
			.where(
				and(
					eq(table.documentAccess.documentId, documentId),
					eq(table.documentAccess.userId, userId),
					inArray(table.documentAccess.role, ['owner', 'editor']),
				),
			)
			.then((r) => r.at(0))
		if (!access) {
			return Result.err({ type: 'Forbidden', message: 'Not enough access' })
		}
		const version = patch.content !== undefined ? sql`${table.documents.version} + 1` : undefined
		const size = patch.content !== undefined ? patch.content.length : undefined
		let result
		try {
			result = await db
				.update(table.documents)
				.set({ ...patch, version, size })
				.where(eq(table.documents.id, documentId))
				.returning()
				.then((r) => r.at(0))
		} catch (error: any) {
			return Result.err({ type: 'Unknown', message: error.message || 'Unknown error' })
		}
		if (!result) {
			return Result.err({ type: 'NotFound', message: 'Document not found' })
		}
		return Result.ok({ updated: true })
	}

	async getById(userId: string, documentId: string): Promise<ResultType<any, { type: 'NotFound' }>> {
		const document = await db
			.selectDistinctOn([table.documents.id], {
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
			.where(and(eq(table.documents.id, documentId), eq(table.documentAccess.userId, userId)))
			.execute()
			.then((r) => r.at(0))
		if (!document) {
			return Result.err({ type: 'NotFound', message: `No Document Found with ID ${documentId}` })
		}
		return Result.ok(document)
	}

	async search(userId: string, q: any): Promise<ResultType<any, { type: 'Unknown'; message: string }>> {
		const filters = and(
			exists(
				db
					.select()
					.from(table.documentAccess)
					.where(and(eq(table.documentAccess.documentId, table.documents.id), eq(table.documentAccess.userId, userId))),
			),
			q.title ? ilike(table.documents.title, `%${q.title}%`) : undefined,
			q.author ? ilike(table.users.username, `%${q.author}%`) : undefined,
			q.author ? inArray(table.documentAccess.role, ['owner', 'editor']) : undefined,
			q.tags && q.tags.length !== 0 ? arrayContains(table.documents.tags, q.tags) : undefined,
			q.fileType ? eq(table.documents.fileType, q.fileType) : undefined,
		)
		try {
			const [totalItems, documents] = await Promise.all([
				db
					.select({
						count: countDistinct(table.documents.id),
					})
					.from(table.documents)
					.innerJoin(table.documentAccess, eq(table.documents.id, table.documentAccess.documentId))
					.where(filters)
					.execute()
					.then((r) => r.at(0)?.count ?? 0),

				db
					.selectDistinctOn([table.documents.id], {
						id: table.documents.id,
						title: table.documents.title,
						description: table.documents.description,
						fileType: table.documents.fileType,
						version: table.documents.version,
						size: table.documents.size,
						content: q.exlcudeContent ? sql<string>`''` : table.documents.content,
						tags: table.documents.tags,
						createdAt: table.documents.createdAt,
						updatedAt: table.documents.updatedAt,
					})
					.from(table.documents)
					.innerJoin(table.documentAccess, eq(table.documents.id, table.documentAccess.documentId))
					.where(filters)
					.limit(q.limit)
					.offset(q.limit * (q.page - 1))
					.execute(),
			])
			return Result.ok({
				items: documents,
				perPage: q.limit,
				currentPage: q.page,
				totalItems,
				totalPages: Math.ceil(totalItems / q.limit),
			})
		} catch (error: any) {
			return Result.err({ type: 'Unknown', message: error.message || 'Unknown error' })
		}
	}

	async getAccessList(
		userId: string,
		documentId: string,
	): Promise<ResultType<any, { type: 'Forbidden' | 'NotFound' }>> {
		const hasAccess = await db
			.select()
			.from(table.documentAccess)
			.where(and(eq(table.documentAccess.documentId, documentId), eq(table.documentAccess.userId, userId)))
			.then((r) => r.length > 0)
		if (!hasAccess) {
			return Result.err({ type: 'Forbidden', message: 'Forbidden' })
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
			.then((r) => r)
		if (!access.length) {
			return Result.err({ type: 'NotFound', message: 'No access records found for this document' })
		}
		return Result.ok({ access })
	}

	async patchAccess(
		userId: string,
		documentId: string,
		targetUserId: string,
		role: 'viewer' | 'editor' | 'owner',
	): Promise<ResultType<{ success: boolean }, { type: 'Forbidden' | 'Unknown'; message: string }>> {
		const isOwner = await db
			.select()
			.from(table.documentAccess)
			.where(
				and(
					eq(table.documentAccess.documentId, documentId),
					eq(table.documentAccess.userId, userId),
					eq(table.documentAccess.role, 'owner'),
				),
			)
			.then((r) => r.length > 0)
		if (!isOwner) {
			return Result.err({ type: 'Forbidden', message: 'Only owner can modify access' })
		}
		if (!role) {
			return Result.err({ type: 'Forbidden', message: 'Role is required' })
		}
		const existing = await db
			.select()
			.from(table.documentAccess)
			.where(and(eq(table.documentAccess.documentId, documentId), eq(table.documentAccess.userId, targetUserId)))
			.then((r) => r.length > 0)
		if (existing) {
			await db
				.update(table.documentAccess)
				.set({ role })
				.where(and(eq(table.documentAccess.documentId, documentId), eq(table.documentAccess.userId, targetUserId)))
		} else {
			await db.insert(table.documentAccess).values({
				documentId,
				userId: targetUserId,
				role,
			})
		}
		return Result.ok({ success: true })
	}

	async revokeAccess(
		userId: string,
		documentId: string,
		targetUserId: string,
	): Promise<ResultType<{ success: boolean }, { type: 'Forbidden' | 'Unknown'; message: string }>> {
		const isOwner = await db
			.select()
			.from(table.documentAccess)
			.where(
				and(
					eq(table.documentAccess.documentId, documentId),
					eq(table.documentAccess.userId, userId),
					eq(table.documentAccess.role, 'owner'),
				),
			)
			.then((r) => r.length > 0)
		if (!isOwner) {
			return Result.err({ type: 'Forbidden', message: 'Only owner can revoke access' })
		}
		await db
			.delete(table.documentAccess)
			.where(and(eq(table.documentAccess.documentId, documentId), eq(table.documentAccess.userId, targetUserId)))
		return Result.ok({ success: true })
	}

	async createLink(
		userId: string,
		documentId: string,
		origin: string,
	): Promise<
		ResultType<
			{ linkId: string; url: string; expiresAt: string },
			{ type: 'Forbidden' | 'NotFound' | 'Unknown'; message: string }
		>
	> {
		const access = await db
			.select()
			.from(table.documentAccess)
			.where(and(eq(table.documentAccess.documentId, documentId), eq(table.documentAccess.userId, userId)))
			.then((r) => r.length > 0)
		if (!access) {
			return Result.err({ type: 'Forbidden', message: 'Forbidden' })
		}
		const doc = await db
			.select({ id: table.documents.id, fileType: table.documents.fileType })
			.from(table.documents)
			.where(eq(table.documents.id, documentId))
			.then((r) => r.at(0))
		if (!doc) {
			return Result.err({ type: 'NotFound', message: 'Document not found' })
		}
		const linkId = ulid()
		const expiresAt = addHours(new Date(), 1).toISOString()
		const fileExtension = mime.getExtension(doc.fileType) ?? 'bin'
		await db.insert(table.documentLinks).values({
			id: linkId,
			documentId,
			fileExtension,
			fileMimeType: doc.fileType,
			expiresAt,
		})
		const path = `/documents/download/${linkId}.${fileExtension}`
		const url = `${origin}${path}`
		return Result.ok({ linkId, url, expiresAt })
	}

	async downloadByLink(
		filename: string,
	): Promise<
		ResultType<
			{ content: string; title: string; fileType: string; fileMimeType: string; fileExtension: string },
			{ type: 'NotFound' | 'Gone' }
		>
	> {
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
			.where(eq(table.documentLinks.id, linkId))
			.then((r) => r.at(0))
		if (!link) {
			return Result.err({ type: 'NotFound', message: 'Link not found' })
		}
		if (new Date(link.expiresAt) < new Date()) {
			return Result.err({ type: 'Gone', message: 'Link expired' })
		}
		const doc = await db
			.select({
				content: table.documents.content,
				title: table.documents.title,
				fileType: table.documents.fileType,
			})
			.from(table.documents)
			.where(eq(table.documents.id, link.documentId))
			.then((r) => r.at(0))
		if (!doc) {
			return Result.err({ type: 'NotFound', message: 'Document not found' })
		}
		return Result.ok({
			content: doc.content,
			title: doc.title,
			fileType: doc.fileType,
			fileMimeType: link.fileMimeType,
			fileExtension: link.fileExtension,
		})
	}
}
