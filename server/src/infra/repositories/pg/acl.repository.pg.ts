import { Result } from '@carbonteq/fp'
import { and, eq } from 'drizzle-orm'
import { injectable } from 'tsyringe'
import { ulid } from 'ulidx'
import { AccessControlListEntity, type DocumentRole } from '~/domain/access-control-entry/access-control-entry.entity'
import { AclRepository } from '~/domain/access-control-entry/acl.repository'
import { ACLEntryNotFoundError, UnknownError } from '~/domain/errors'
import { createULID, parseULID } from '~/domain/utils/refined.types'
import { db, table } from '~/infra/database/client'
import { TryCatchAsync } from '~/utils/trycatch'

@injectable()
export class AclRepositoryPg extends AclRepository {
	getByDocumentId(documentId: string): Promise<Result<AccessControlListEntity[], Error>> {
		return TryCatchAsync({
			fn: async () => {
				const entries = await db
					.select()
					.from(table.documentAccess)
					.where(eq(table.documentAccess.documentId, documentId))
					.execute()

				return Result.all(
					...entries.map((entry) => AccessControlListEntity.create({ ...entry, id: createULID() })),
				).mapErr((err) => err[0] as Error)
			},
			onError: (error) => {
				console.debug({ documentId })
				console.debug(error)
				return Result.Err(
					new UnknownError(
						`ACL fetch failed for documentId: ${documentId}, Details: ${error}`,
						'Failed acl.getByDocumentId',
					),
				)
			},
		})
	}

	getAcl(userId: string, documentId: string): Promise<Result<AccessControlListEntity, Error>> {
		return TryCatchAsync({
			fn: async () => {
				const aclEntry = await db
					.select()
					.from(table.documentAccess)
					.where(and(eq(table.documentAccess.userId, userId), eq(table.documentAccess.documentId, documentId)))
					.execute()
					.then((r) => r.at(0))
				return aclEntry
					? AccessControlListEntity.create({ ...aclEntry, id: createULID() })
					: Result.Err(new ACLEntryNotFoundError({ userId, documentId }))
			},
			onError: (error) =>
				Result.Err(
					new UnknownError(`ACL set failed for documentId: ${documentId}, Details: ${error}`, 'Failed acl.setAcl'),
				),
		})
	}

	setAcl(userId: string, documentId: string, role: DocumentRole): Promise<Result<true, Error>> {
		return TryCatchAsync({
			fn: async () => {
				const entry = await db
					.insert(table.documentAccess)
					.values({ userId, documentId, role })
					.returning()
					.execute()
					.then((r) => r.at(0))

				// upsert
				if (entry === undefined) {
					await db
						.update(table.documentAccess)
						.set({ role })
						.where(and(eq(table.documentAccess.userId, userId), eq(table.documentAccess.documentId, documentId)))
				}
				return Result.Ok(true)
			},
			onError: (error) =>
				Result.Err(
					new UnknownError(`ACL set failed for documentId: ${documentId}, Details: ${error}`, 'Failed acl.setAcl'),
				),
		})
	}

	revokeAcl(userId: string, documentId: string): Promise<Result<true, Error>> {
		return TryCatchAsync({
			fn: async () => {
				const _entry = await db
					.delete(table.documentAccess)
					.where(and(eq(table.documentAccess.userId, userId), eq(table.documentAccess.documentId, documentId)))
					.returning()
					.execute()
					.then((r) => r.at(0))
				return Result.Ok(true)
			},
			onError: (error) =>
				Result.Err(
					new UnknownError(`ACL set failed for documentId: ${documentId}, Details: ${error}`, 'Failed acl.setAcl'),
				),
		})
	}
}
