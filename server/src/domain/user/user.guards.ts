import { Result } from '@carbonteq/fp'
import { UserValidationError } from '~/domain/errors/errors.users'
import type { SerializedUser } from './user.entity'

/**
 * Validation rules for UserEntity
 */
export class UserGuards {
	static validateUsername(username: string): Result<string, UserValidationError> {
		if (username.includes(' ')) {
			return Result.Err(new UserValidationError(username, 'Username cannot contain spaces'))
		}
		if (username.trim().length < 3) {
			return Result.Err(new UserValidationError(username, 'Username must be at least 3 characters'))
		}
		return Result.Ok(username)
	}

	static validateHashedPassword(hashedPassword: string): Result<string, UserValidationError> {
		if (!hashedPassword) {
			return Result.Err(new UserValidationError(hashedPassword, 'Password is required'))
		}
		return Result.Ok(hashedPassword)
	}

	static validateCreate(data: SerializedUser): Result<SerializedUser, UserValidationError> {
		return UserGuards.validateUsername(data.username)
			.flatMap(() => UserGuards.validateHashedPassword(data.hashedPassword))
			.map(() => data)
	}
}
