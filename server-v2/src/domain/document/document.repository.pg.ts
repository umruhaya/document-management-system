import { Result } from '@carbonteq/fp'
import { eq } from 'drizzle-orm'
import { PostgresError } from 'pg-error-enum'
import { DocumentEntity } from '~/domain/document/document.entity'
import { DocumentRepository } from '~/domain/document/document.repository'
import { EntityAlreadyExistsError, type EntityError, EntityNotFoundError, EntityUnknownError } from '~/domain/errors'
import { DatabaseError, db, table } from '~/infra/database/client'
import { TryCatchAsync } from '~/utils/trycatch'

export class DocumentRepositoryPg extends DocumentRepository {
	getById(documentId: string): Promise<Result<DocumentEntity, EntityError>> {
		return TryCatchAsync({
			fn: async () => {
				const document = await db
					.select()
					.from(table.documents)
					.where(eq(table.documents.id, documentId))
					.execute()
					.then((r) => r.at(0))
				return document
					? DocumentEntity.create({
							...document,
							createdAt: new Date(document.createdAt),
							updatedAt: new Date(document.updatedAt),
						})
					: Result.Err(new EntityNotFoundError('document', `No Document Found With ID: ${documentId}`))
			},
			onError: (error) =>
				Result.Err(new EntityUnknownError('DocumentRepository', `Error: ${error}`, 'Failed document.get')),
		})
	}

	create(document: DocumentEntity): Promise<Result<DocumentEntity, EntityError>> {
		return TryCatchAsync({
			fn: async () => {
				await db.insert(table.documents).values({
					...document,
					createdAt: document.createdAt.toISOString(),
					updatedAt: document.updatedAt.toISOString(),
				})
				return Result.Ok(document)
			},
			onError: (error) =>
				Result.Err(
					error instanceof DatabaseError && error.code === PostgresError.UNIQUE_VIOLATION
						? new EntityAlreadyExistsError('DocumentRepository', `Document Already Exists With ID: ${document.id}`)
						: new EntityUnknownError(
								'DocumentRepository',
								`Document Insert Failed With values ${JSON.stringify(document)}`,
								'Failed document.create',
							),
				),
		})
	}

	update(
		document: { id: string } & Partial<Omit<DocumentEntity, 'id' | 'createdAt' | 'updatedAt'>>,
	): Promise<Result<true, EntityError>> {
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
					return Result.Err(new EntityNotFoundError('DocumentRepository', `No Document found With ID: ${document.id}`))
				}
				return Result.Ok(true)
			},
			onError: (error) =>
				Result.Err(
					new EntityUnknownError(
						'DocumentRepository',
						`Document Update Failed With values ${JSON.stringify(document)}, Details: ${error}`,
						'Failed document.update',
					),
				),
		})
	}
}
