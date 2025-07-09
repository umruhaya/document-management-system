import { matchOpt, Option, Result } from '@carbonteq/fp'
import { and, eq } from 'drizzle-orm'
import { PostgresError } from 'pg-error-enum'
import { match } from 'ts-pattern'
import { injectable } from 'tsyringe'
import { AccessControlEntity } from '~/domain/access-control/access-control.entity'
import {
	AccessControlAlreadyExistsError,
	AccessControlNotFoundError,
} from '~/domain/access-control/access-control.errors'
import { AccessControlRepository } from '~/domain/access-control/access-control.repository'
import { DocumentNotFoundError } from '~/domain/document/document.errors'
import type { AlreadyExistsError, InvalidOperation, NotFoundError, RepositoryResult } from '~/hexapp'
import { DatabaseError, db, table } from '~/infra/database/client'
import { TryCatchAsync } from '~/utils/trycatch'

@injectable()
export class AccessControlRepositoryPg extends AccessControlRepository {
	insert(entry: AccessControlEntity): Promise<RepositoryResult<AccessControlEntity, AlreadyExistsError>> {
		return TryCatchAsync({
			fn: async () => {
				return db
					.insert(table.documentAccess)
					.values(entry)
					.then(() => Result.Ok(entry))
			},
			onError: (error) =>
				match(error instanceof DatabaseError && error.code === PostgresError.UNIQUE_VIOLATION)
					.with(true, () => Result.Err(new AccessControlAlreadyExistsError(JSON.stringify(entry))))
					.otherwise(() => Result.Err(new Error(JSON.stringify(error)))),
		})
	}

	update(entry: AccessControlEntity): Promise<RepositoryResult<AccessControlEntity, NotFoundError>> {
		return TryCatchAsync({
			fn: async () => {
				const updatedEntryOpt = await db
					.update(table.documentAccess)
					.set(entry)
					.where(
						and(eq(table.documentAccess.userId, entry.userId), eq(table.documentAccess.documentId, entry.documentId)),
					)
					.returning()
					.then((r) => Option.fromNullable(r.at(0)))

				return matchOpt(updatedEntryOpt, {
					Some: (v) => AccessControlEntity.create(v),
					None: () => Result.Err(new AccessControlNotFoundError(JSON.stringify(entry))),
				})
			},
			onError: (error) => Result.Err(new Error(JSON.stringify(error))),
		})
	}

	delete(
		userId: AccessControlEntity['userId'],
		documentId: AccessControlEntity['documentId'],
	): Promise<RepositoryResult<true, NotFoundError | InvalidOperation>> {
		return TryCatchAsync({
			fn: async () => {
				const deletedEntryOpt = await db
					.delete(table.documentAccess)
					.where(and(eq(table.documentAccess.userId, userId), eq(table.documentAccess.documentId, documentId)))
					.returning()
					.then((r) => Option.fromNullable(r.at(0)))

				return matchOpt(deletedEntryOpt, {
					Some: () => Result.Ok(true as const),
					None: () => Result.Err(new AccessControlNotFoundError(JSON.stringify({ userId, documentId }))),
				})
			},
			onError: (error) => Result.Err(new Error(JSON.stringify(error))),
		})
	}

	fetch(
		userId: AccessControlEntity['userId'],
		documentId: AccessControlEntity['documentId'],
	): Promise<RepositoryResult<AccessControlEntity, NotFoundError>> {
		return TryCatchAsync({
			fn: async () => {
				const entryOpt = await db
					.select()
					.from(table.documentAccess)
					.where(and(eq(table.documentAccess.userId, userId), eq(table.documentAccess.documentId, documentId)))
					.then((r) => Option.fromNullable(r.at(0)))

				return matchOpt(entryOpt, {
					Some: (v) => AccessControlEntity.create(v),
					None: () => Result.Err(new AccessControlNotFoundError(JSON.stringify({ userId, documentId }))),
				})
			},
			onError: (error) => Result.Err(new Error(JSON.stringify(error))),
		})
	}

	fetchAllByDocumentId(documentId: string): Promise<RepositoryResult<AccessControlEntity[], NotFoundError>> {
		return TryCatchAsync({
			fn: async () => {
				const [exists, entries] = await Promise.all([
					db
						.select()
						.from(table.documents)
						.where(eq(table.documents.id, documentId))
						.execute()
						.then((r) => r.at(0) !== undefined),
					db.select().from(table.documentAccess).where(eq(table.documentAccess.documentId, documentId)).execute(),
				])

				return match(exists)
					.with(true, () => Result.all(...entries.map(AccessControlEntity.create)).mapErr((err) => err[0]))
					.otherwise(() => Result.Err(new DocumentNotFoundError(`No Document found with id: ${documentId}`)))
			},
			onError: (error) => Result.Err(new Error(JSON.stringify(error))),
		})
	}
}
