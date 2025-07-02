import type { Result } from '@carbonteq/fp'
import { BaseEntity, type IEntity } from '~/domain/utils/base.entity'
import type { ULID } from '~/domain/utils/refined.types'
import { parseULID } from '~/domain/utils/refined.types'
import { AclGuards } from './acl.guards'

/** Allowed roles for document access */
export type DocumentRole = 'viewer' | 'editor' | 'owner'

/** Serialized form of ACL entry for persistence */
/** Raw serialized ACL entry for persistence */
export interface SerializedAcl {
	/** ULID identifier */
	id: string
	createdAt: string
	updatedAt: string
	documentId: string
	userId: string
	role: DocumentRole
}

/** ACL domain model */
export class AccessControlListEntity extends BaseEntity implements IEntity {
	readonly documentId: ULID
	readonly userId: ULID
	readonly role: DocumentRole

	private constructor(data: SerializedAcl) {
		super()
		this._fromSerialized({ id: data.id as ULID, createdAt: data.createdAt, updatedAt: data.updatedAt })
		this.documentId = data.documentId as ULID
		this.userId = data.userId as ULID
		this.role = data.role
	}

	/** Factory for ACL entry with validation */
	/**
	 * Create an ACL entry from raw data (string IDs), performing ULID parsing
	 * and domain-level validation.
	 */
	/**
	 * Create an ACL entry from raw IDs, parsing them and validating domain rules.
	 */
	static create(
		input: Omit<SerializedAcl, 'createdAt' | 'updatedAt'> & {
			createdAt?: string
			updatedAt?: string
		},
	): Result<AccessControlListEntity, Error> {
		const now = new Date().toISOString()
		return parseULID(input.id).flatMap((id) =>
			parseULID(input.documentId).flatMap((did) =>
				parseULID(input.userId).flatMap((uid) => {
					const serialized: SerializedAcl = {
						id,
						createdAt: input.createdAt ?? now,
						updatedAt: input.updatedAt ?? now,
						documentId: did,
						userId: uid,
						role: input.role,
					}
					return AclGuards.validateCreate(serialized).map(() => new AccessControlListEntity(serialized))
				}),
			),
		)
	}

	/** Convert to plain object */
	serialize(): SerializedAcl {
		return { ...this._serialize(), documentId: String(this.documentId), userId: this.userId, role: this.role }
	}
}
