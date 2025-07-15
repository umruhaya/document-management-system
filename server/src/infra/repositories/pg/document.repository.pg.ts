import { Result } from '@carbonteq/fp'
import { ExponentialBackoff, handleAll, retry, TimeoutStrategy, timeout } from 'cockatiel'
import { and, arrayContains, countDistinct, eq, ilike } from 'drizzle-orm'
import { PostgresError } from 'pg-error-enum'
import { injectable } from 'tsyringe'
import { DocumentEntity } from '~/domain/document/document.entity'
import { DocumentAlreadyExistsError, DocumentNotFoundError } from '~/domain/document/document.errors'
import { DocumentRepository } from '~/domain/document/document.repository'
import type {
	AlreadyExistsError,
	InvalidOperation,
	NotFoundError,
	Paginated,
	PaginationOptions,
	RepositoryResult,
} from '~/hexapp'
import { DatabaseError, db, table } from '~/infra/database/client'
import { TryCatchAsync } from '~/utils/trycatch'

@injectable()
export class DocumentRepositoryPg extends DocumentRepository {
	private readonly retryPolicy = retry(handleAll, { maxAttempts: 3, backoff: new ExponentialBackoff() })
	private readonly timeoutPolicy = timeout(2000, TimeoutStrategy.Aggressive)
	private runWithPolicy<T>(fn: () => Promise<T>): Promise<T> {
		return this.retryPolicy.execute(() => this.timeoutPolicy.execute(fn))
	}

	insert(document: DocumentEntity): Promise<RepositoryResult<DocumentEntity, AlreadyExistsError>> {
		return TryCatchAsync({
			fn: async () => {
				await this.runWithPolicy(() => db.insert(table.documents).values(document.serialize()))
				return Result.Ok(document)
			},
			onError: (error) =>
				Result.Err(
					error instanceof DatabaseError && error.code === PostgresError.UNIQUE_VIOLATION
						? new DocumentAlreadyExistsError(`Document with ID: ${document.id} Already Exists`)
						: new Error(JSON.stringify(error)),
				),
		})
	}

	insertWithAccessControl(
		userId: string,
		document: DocumentEntity,
	): Promise<RepositoryResult<DocumentEntity, AlreadyExistsError>> {
		return TryCatchAsync({
			fn: async () => {
				await this.runWithPolicy(() =>
					db.transaction(async (tx) => {
						await tx.insert(table.documents).values(document.serialize())
						await tx.insert(table.documentAccess).values({ userId, documentId: document.id, role: 'owner' })
					}),
				)
				return Result.Ok(document)
			},
			onError: (error) =>
				Result.Err(
					error instanceof DatabaseError && error.code === PostgresError.UNIQUE_VIOLATION
						? new DocumentAlreadyExistsError(`Document with ID: ${document.id} Already Exists`)
						: new Error(JSON.stringify(error)),
				),
		})
	}

	fetchById(documentId: DocumentEntity['id']): Promise<RepositoryResult<DocumentEntity, NotFoundError>> {
		return TryCatchAsync({
			fn: async () => {
				const document = await this.runWithPolicy(() =>
					db
						.select()
						.from(table.documents)
						.where(eq(table.documents.id, documentId))
						.execute()
						.then((r) => r.at(0)),
				)
				return document
					? DocumentEntity.fromSerialized(document)
					: Result.Err(new DocumentNotFoundError(`No Document Found with ID: ${documentId}`))
			},
			onError: (error) => Result.Err(new Error(JSON.stringify(error))),
		})
	}

	update(document: DocumentEntity): Promise<RepositoryResult<DocumentEntity, NotFoundError>> {
		return TryCatchAsync({
			fn: async () => {
				const updatedDocument = await this.runWithPolicy(() =>
					db
						.update(table.documents)
						.set(document)
						.where(eq(table.documents.id, document.id))
						.returning()
						.execute()
						.then((r) => r.at(0)),
				)
				return updatedDocument
					? Result.Ok(document)
					: Result.Err(new DocumentNotFoundError(`No Document Found with ID: ${document.id}`))
			},
			onError: (error) => Result.Err(new Error(JSON.stringify(error))),
		})
	}

	patch(
		document: Partial<DocumentEntity> & { id: DocumentEntity['id'] },
	): Promise<RepositoryResult<DocumentEntity, NotFoundError>> {
		return TryCatchAsync({
			fn: async () => {
				const updatedDocument = await this.runWithPolicy(() =>
					db
						.update(table.documents)
						.set(document)
						.where(eq(table.documents.id, document.id))
						.returning()
						.execute()
						.then((r) => r.at(0)),
				)
				return updatedDocument
					? DocumentEntity.fromSerialized(updatedDocument)
					: Result.Err(new DocumentNotFoundError(`No Document Found with ID: ${document.id}`))
			},
			onError: (error) => Result.Err(new Error(JSON.stringify(error))),
		})
	}

	search(
		userId: string,
		filters: Pick<DocumentEntity, 'title' | 'fileType' | 'tags' | 'version'>,
		paginationOptions: PaginationOptions,
	): Promise<RepositoryResult<Paginated<DocumentEntity>, InvalidOperation>> {
		return TryCatchAsync({
			fn: async () => {
				const { pageNum, pageSize } = paginationOptions
				const filtersQuery = and(
					eq(table.documentAccess.userId, userId),
					filters.title ? ilike(table.documents.title, `%${filters.title}%`) : undefined,
					filters.tags?.length ? arrayContains(table.documents.tags, filters.tags) : undefined,
					filters.fileType ? eq(table.documents.fileType, filters.fileType) : undefined,
				)

				const [totalItems, rawRows] = await this.runWithPolicy(() =>
					Promise.all([
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
								tags: table.documents.tags,
								createdAt: table.documents.createdAt,
								updatedAt: table.documents.updatedAt,
							})
							.from(table.documents)
							.innerJoin(table.documentAccess, eq(table.documents.id, table.documentAccess.documentId))
							.where(filtersQuery)
							.limit(pageSize)
							.offset(pageSize * (pageNum - 1))
							.execute(),
					]),
				)

				const totalPages = Math.ceil(totalItems / pageSize)
				return Result.all(...rawRows.map(DocumentEntity.fromSerialized))
					.map((docs) => ({
						data: docs,
						pageNum,
						pageSize,
						totalPages,
					}))
					.mapErr((e) => (e as [Error])[0])
			},
			onError: (error) => Result.Err(new Error(JSON.stringify(error))),
		})
	}
}
