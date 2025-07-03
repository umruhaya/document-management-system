import { Result } from '@carbonteq/fp'
import { and, arrayContains, countDistinct, eq, ilike, sql } from 'drizzle-orm'
import { PostgresError } from 'pg-error-enum'
import { injectable } from 'tsyringe'
import { DocumentEntity, type SerializedDocument } from '~/domain/document/document.entity'
import { DocumentRepository } from '~/domain/document/document.repository'
import { DocumentAlreadyExistsError, DocumentNotFoundError, UnknownError } from '~/domain/errors'
import { DatabaseError, db, table } from '~/infra/database/client'
import type { PaginatedCollection, PaginationOptions } from '~/presentation/types'
import { TryCatchAsync } from '~/utils/trycatch'

@injectable()
export class DocumentRepositoryPg extends DocumentRepository {
	search(
		userId: string,
		option: PaginationOptions<{
			title?: string
			fileType?: string
			sort?: string
			tags?: string[]
			version?: number
			author?: string
			exlcudeContent?: 'true'
		}>,
	): Promise<Result<PaginatedCollection<DocumentEntity>, Error>> {
		return TryCatchAsync({
			fn: async () => {
				const { page, limit, filters } = option
				const filtersQuery = and(
					eq(table.documentAccess.userId, userId), // user has access
					filters.title ? ilike(table.documents.title, `%${filters.title}%`) : undefined,
					filters.tags?.length ? arrayContains(table.documents.tags, filters.tags) : undefined,
					filters.fileType ? eq(table.documents.fileType, filters.fileType) : undefined,
				)

				// fetch count and raw rows
				const [totalItems, rawRows] = await Promise.all([
					db
						.select({ count: countDistinct(table.documents.id) })
						.from(table.documents)
						.innerJoin(table.documentAccess, eq(table.documents.id, table.documentAccess.documentId))
						.where(filtersQuery)
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
							content: filters.exlcudeContent ? sql<string>`'NO_CONTENT'` : table.documents.content,
							tags: table.documents.tags,
							createdAt: table.documents.createdAt,
							updatedAt: table.documents.updatedAt,
						})
						.from(table.documents)
						.innerJoin(table.documentAccess, eq(table.documents.id, table.documentAccess.documentId))
						.where(filtersQuery)
						.limit(limit)
						.offset(limit * (page - 1))
						.execute(),
				])

				// map raw rows to domain entities
				const items: DocumentEntity[] = []
				for (const doc of rawRows) {
					const docRes = DocumentEntity.create(doc)
					if (docRes.isErr()) {
						return Result.Err(docRes.unwrapErr())
					}
					items.push(docRes.unwrap())
				}

				return Result.Ok({
					items,
					perPage: limit,
					currentPage: page,
					totalItems,
					totalPages: Math.ceil(totalItems / limit),
				})
			},
			onError: (error) => Result.Err(new UnknownError(`Error: ${error}`, 'Failed document.search')),
		})
	}

	getById(documentId: string): Promise<Result<DocumentEntity, Error>> {
		return TryCatchAsync({
			fn: async () => {
				const document = await db
					.select()
					.from(table.documents)
					.where(eq(table.documents.id, documentId))
					.execute()
					.then((r) => r.at(0))
				return document ? DocumentEntity.create(document) : Result.Err(new DocumentNotFoundError({ documentId }))
			},
			onError: (error) => Result.Err(new UnknownError(`Error: ${error}`, 'Failed document.get')),
		})
	}

	create(
		userId: string,
		docInput: Omit<SerializedDocument, 'createdAt' | 'updatedAt'>,
	): Promise<Result<DocumentEntity, Error>> {
		return TryCatchAsync({
			fn: async () => {
				// build entity via factory
				const now = new Date().toISOString()
				const serialized = {
					...docInput,
					createdAt: now,
					updatedAt: now,
				}
				const entRes = DocumentEntity.create(serialized)
				if (entRes.isErr()) {
					return Result.Err(entRes.unwrapErr())
				}
				const document = entRes.unwrap()
				await db.transaction(async (tx) => {
					await tx.insert(table.documents).values({
						...document.serialize(),
					})
					// create ACL entry so user has owner access
					await tx.insert(table.documentAccess).values({ userId, documentId: document.id, role: 'owner' })
				})
				return Result.Ok(document)
			},
			onError: (error) =>
				Result.Err(
					error instanceof DatabaseError && error.code === PostgresError.UNIQUE_VIOLATION
						? new DocumentAlreadyExistsError({ id: docInput.id })
						: new UnknownError(
								`Document Insert Failed With values ${JSON.stringify(docInput)}`,
								'Failed document.create',
							),
				),
		})
	}

	update(
		document: { id: string } & Partial<Omit<DocumentEntity, 'id' | 'createdAt' | 'updatedAt'>>,
	): Promise<Result<true, Error>> {
		return TryCatchAsync({
			fn: async () => {
				const updatedDocument = await db
					.update(table.documents)
					.set(document)
					.where(eq(table.documents.id, document.id))
					.returning()
					.execute()
					.then((r) => r.at(0))
				if (updatedDocument === undefined) {
					return Result.Err(new DocumentNotFoundError({ id: document.id }))
				}
				return Result.Ok(true)
			},
			onError: (error) =>
				Result.Err(
					new UnknownError(
						`Document Update Failed With values ${JSON.stringify(document)}, Details: ${error}`,
						'Failed document.update',
					),
				),
		})
	}
}
