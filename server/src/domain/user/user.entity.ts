import type { Result } from '@carbonteq/fp'
import type { UserValidationError } from '~/domain/user/users.errors'
import { BaseEntity, type IEntity } from '~/domain/utils/base.entity'
import { parseULID, type ULID } from '~/domain/utils/refined.types'
import { UserGuards } from './user.guards'

export interface SerializedUser {
	/** ULID identifier */
	id: string
	createdAt: string
	updatedAt: string
	username: string
	hashedPassword: string
}

/** User domain model */
export class UserEntity extends BaseEntity implements IEntity {
	readonly username: string
	readonly hashedPassword: string

	private constructor(data: SerializedUser) {
		super()
		this._fromSerialized({
			id: data.id as ULID,
			createdAt: data.createdAt,
			updatedAt: data.updatedAt,
		})

		this.username = data.username
		this.hashedPassword = data.hashedPassword
	}

	/** Factory method for creating a user with validation */
	static create(input: {
		id: string
		username: string
		hashedPassword: string
		createdAt?: string
		updatedAt?: string
	}): Result<UserEntity, UserValidationError | Error> {
		const now = new Date().toISOString()
		return parseULID(input.id).flatMap((id) => {
			const serialized: SerializedUser = {
				id,
				createdAt: input.createdAt ?? now,
				updatedAt: input.updatedAt ?? now,
				username: input.username,
				hashedPassword: input.hashedPassword,
			}
			return UserGuards.validateCreate(serialized).map(() => new UserEntity(serialized))
		})
	}

	/** Serialize the entity into plain object */
	serialize() {
		return {
			...this._serialize(),
			username: this.username,
			hashedPassword: this.hashedPassword,
		}
	}
}
