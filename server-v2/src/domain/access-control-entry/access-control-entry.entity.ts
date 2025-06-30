import { Result } from '@carbonteq/fp'

export type DocumentRole = 'viewer' | 'editor' | 'owner'

export class AccessControlListEntity {
	documentId: string
	userId: string
	role: DocumentRole

	private constructor(entry: AccessControlListEntity) {
		this.documentId = entry.documentId
		this.userId = entry.userId
		this.role = entry.role
	}

	static create(entry: AccessControlListEntity) {
		return Result.Ok(new AccessControlListEntity(entry))
	}
}
