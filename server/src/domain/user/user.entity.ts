import type { Result } from '@carbonteq/fp'
import { BaseEntity, type DateTime, type UUID } from '@carbonteq/hexapp'
import type { UserValidationError } from '~/domain/user/users.errors'
import { UserGuards } from './user.guards'

export interface IUserEntity {
	readonly id: UUID
	readonly createdAt: DateTime
	readonly updatedAt: DateTime
	readonly username: string
	readonly hashedPassword: string
}

export interface SerializedUser {
	readonly id: string
	readonly createdAt: Date
	readonly updatedAt: Date
	readonly username: string
	readonly hashedPassword: string
}

/** User domain model */
export class UserEntity extends BaseEntity implements IUserEntity {
	readonly username: string
	readonly hashedPassword: string

	private constructor(data: Pick<IUserEntity, 'username' | 'hashedPassword'>) {
		super()
		this.username = data.username
		this.hashedPassword = data.hashedPassword
	}

	/** Serialize the entity into plain JS object */
	serialize(): SerializedUser {
		return {
			...this._serialize(),
			username: this.username,
			hashedPassword: this.hashedPassword,
		}
	}

	/** Static factory (Creation) */
	static create(obj: Omit<SerializedUser, 'id' | 'createdAt' | 'updatedAt'>): Result<UserEntity, UserValidationError> {
		return UserGuards.validateCreate(obj).map(() => new UserEntity(obj))
	}

	/** Static factory from serialized (Reconstituion) */
	static fromSerialized(obj: SerializedUser): Result<UserEntity, UserValidationError> {
		return UserGuards.validateReconstitution(obj)
			.map(() => new UserEntity(obj))
			.map((user) => user._fromSerialized(obj))
	}
}
