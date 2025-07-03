import { Result } from '@carbonteq/fp'
import { and, count, eq } from 'drizzle-orm'
import { injectable } from 'tsyringe'
import { AccessControlListEntity, type DocumentRole } from '~/domain/access-control-entry/access-control-entry.entity'
import { AclRepository } from '~/domain/access-control-entry/acl.repository'
import { ACLEntryNotFoundError, DocumentDomainError, UnknownError } from '~/domain/errors'
import { createULID } from '~/domain/utils/refined.types'
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

	private async isOwner(userId: string, documentId: string): Promise<boolean> {
		return db
			.select()
			.from(table.documentAccess)
			.where(and(eq(table.documentAccess.userId, userId), eq(table.documentAccess.documentId, documentId)))
			.execute()
			.then((r) => r.at(0)?.role === 'owner')
	}

	private async ownerCount(documentId: string): Promise<number> {
		return db
			.select({ count: count() })
			.from(table.documentAccess)
			.where(and(eq(table.documentAccess.documentId, documentId), eq(table.documentAccess.role, 'owner')))
			.execute()
			.then((r) => r.at(0)?.count ?? 0)
	}

	setAcl(userId: string, documentId: string, role: DocumentRole): Promise<Result<true, Error>> {
		return TryCatchAsync({
			fn: async () => {
				// Only owners can update roles
				const isOwner = await this.isOwner(userId, documentId)
				if (!isOwner) {
					return Result.Err(
						new DocumentDomainError({ userId, documentId, role }, 'Only an owner can update ACL entries'),
					)
				}

				// If demoting/removing owner, ensure at least one owner remains
				const currentEntry = await db
					.select()
					.from(table.documentAccess)
					.where(and(eq(table.documentAccess.userId, userId), eq(table.documentAccess.documentId, documentId)))
					.execute()
					.then((r) => r.at(0))

				if (currentEntry?.role === 'owner' && role !== 'owner') {
					const ownerCount = await this.ownerCount(documentId)
					if (ownerCount <= 1) {
						return Result.Err(
							new DocumentDomainError({ userId, documentId, role }, 'A document must have at least one owner'),
						)
					}
				}

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
				// Only owners can revoke
				const isOwner = await this.isOwner(userId, documentId)
				if (!isOwner) {
					return Result.Err(new DocumentDomainError({ userId, documentId }, 'Only an owner can revoke ACL entries'))
				}

				// If revoking owner, ensure at least one owner remains
				const currentEntry = await db
					.select()
					.from(table.documentAccess)
					.where(and(eq(table.documentAccess.userId, userId), eq(table.documentAccess.documentId, documentId)))
					.execute()
					.then((r) => r.at(0))

				if (currentEntry?.role === 'owner') {
					const ownerCount = await this.ownerCount(documentId)
					if (ownerCount <= 1) {
						return Result.Err(
							new DocumentDomainError({ userId, documentId }, 'A document must have at least one owner'),
						)
					}
				}

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
