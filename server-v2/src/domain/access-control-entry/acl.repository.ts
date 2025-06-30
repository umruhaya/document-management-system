import type { Result } from '@carbonteq/fp'
import type { AccessControlListEntity, DocumentRole } from '~/domain/access-control-entry/access-control-entry.entity'
import type { EntityError } from '~/domain/errors'

export abstract class AclRepository {
	abstract getByDocumentId(documentId: string): Promise<Result<AccessControlListEntity[], EntityError>>
	abstract setAcl(userId: string, documentId: string, role: DocumentRole): Promise<Result<true, EntityError>>
	abstract revokeAcl(userId: string, documentId: string): Promise<Result<true, EntityError>>
}
