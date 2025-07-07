import type { Result } from '@carbonteq/fp'
import { BaseEntity, type DateTime, UUID } from '@carbonteq/hexapp'
import { AccessControlGuards } from './acl.guards'

/** Allowed roles for document access */
export type DocumentRole = 'viewer' | 'editor' | 'owner'

export interface IAccessControlEntity {
	readonly id: UUID
	readonly createdAt: DateTime
	readonly updatedAt: DateTime
	readonly documentId: UUID
	readonly userId: UUID
	readonly role: DocumentRole
}

export interface SerializedAccessControl {
	id: string
	createdAt: Date
	updatedAt: Date
	documentId: string
	userId: string
	role: DocumentRole
}

/** ACL domain model */
export class AccessControlEntity extends BaseEntity implements IAccessControlEntity {
	readonly documentId: UUID
	readonly userId: UUID
	readonly role: DocumentRole

	private constructor(data: Omit<SerializedAccessControl, 'id' | 'createdAt' | 'updatedAt'>) {
		super()
		// since we are validating uuid in create methods and guards, the `data` is trusted to have valid UUID fields
		this.documentId = UUID.fromTrusted(data.documentId)
		this.userId = data.userId = UUID.fromTrusted(data.userId)
		this.role = data.role
	}

	/** Factory for ACL entry with validation */
	static create(
		input: Omit<SerializedAccessControl, 'id' | 'createdAt' | 'updatedAt'>,
	): Result<AccessControlEntity, Error> {
		return AccessControlGuards.validateCreate(input).map(() => new AccessControlEntity(input))
	}

	/** Static factory from serialized (Reconstitution) */
	static fromSerialized(obj: SerializedAccessControl): Result<AccessControlEntity, Error> {
		return AccessControlGuards.validateReconstitution(obj)
			.map(() => new AccessControlEntity(obj))
			.map((acl) => acl._fromSerialized(obj))
	}

	/** Convert to plain object */
	serialize(): SerializedAccessControl {
		return {
			...this._serialize(),
			documentId: this.documentId,
			userId: this.userId,
			role: this.role,
		}
	}
}
