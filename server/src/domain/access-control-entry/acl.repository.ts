import type { Result } from '@carbonteq/fp'
import type { AccessControlListEntity, DocumentRole } from './access-control-entry.entity'
/** Repository interface for ACL entries */
export abstract class AclRepository {
	abstract getByDocumentId(documentId: string): Promise<Result<AccessControlListEntity[], Error>>
	abstract getAcl(userId: string, documentId: string): Promise<Result<AccessControlListEntity, Error>>
	abstract setAcl(userId: string, documentId: string, role: DocumentRole): Promise<Result<true, Error>>
	abstract revokeAcl(userId: string, documentId: string): Promise<Result<true, Error>>
}
