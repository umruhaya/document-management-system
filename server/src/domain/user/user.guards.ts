import { Result } from '@carbonteq/fp'
import { z } from 'zod'
import { UserValidationError } from '~/domain/user/users.errors'
import type { SerializedUser } from './user.entity'

const userSchema = z.object({
	username: z.string().min(4),
	hashedPassword: z.string(),
})

const userInitSchema = userSchema.extend({
	id: z.string().uuid(),
	createdAt: z.union([z.string(), z.number(), z.date()]).pipe(z.coerce.date()),
	updatedAt: z.union([z.string(), z.number(), z.date()]).pipe(z.coerce.date()),
})

/**
 * Validation rules for UserEntity
 */
export class UserGuards {
	static validateCreate(
		data: Omit<SerializedUser, 'id' | 'createdAt' | 'updatedAt'>,
	): Result<Omit<SerializedUser, 'id' | 'createdAt' | 'updatedAt'>, UserValidationError> {
		const res = userSchema.safeParse(data)
		if (res.success) {
			return Result.Ok(res.data)
		}
		return Result.Err(new UserValidationError(res.error.message))
	}

	static validateReconstitution(data: SerializedUser): Result<SerializedUser, UserValidationError> {
		const res = userInitSchema.safeParse(data)
		if (res.success) {
			return Result.Ok(res.data)
		}
		return Result.Err(new UserValidationError(res.error.message))
	}
}
