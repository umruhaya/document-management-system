import { Result } from '@carbonteq/fp'
import { BaseEntity, type IEntity } from '~/domain/base.entity'
import { UserValidationError } from '~/domain/errors'

type UserSpecificField = { username: string; hashedPassword: string }

export class UserEntity extends BaseEntity implements IEntity {
	id: string
	createdAt: Date
	updatedAt: Date
	username: string
	hashedPassword: string

	private constructor(entity: { id: string } & UserSpecificField) {
		super({ id: entity.id })
		this.id = entity.id
		this.createdAt = new Date()
		this.updatedAt = new Date()
		this.username = entity.username
		this.hashedPassword = entity.hashedPassword
	}

	static validateUsername(user: UserEntity) {
		return user.username.includes(' ')
			? Result.Err(new UserValidationError({ username: user.username }, 'Username cannot contain spaces'))
			: Result.Ok(user)
	}

	static create(user: UserEntity) {
		return Result.Ok(new UserEntity(user)).flatMap(UserEntity.validateUsername)
	}
}
