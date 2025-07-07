import { Result } from '@carbonteq/fp'
import { z } from 'zod'
import { AccessControlValidationError } from '~/domain/access-control-entry/acl.errors'
import type { SerializedAccessControl } from './access-control-entry.entity'

const aclSchema = z.object({
	documentId: z.string(),
	userId: z.string(),
	role: z.enum(['viewer', 'editor', 'owner']),
})

const aclInitSchema = aclSchema.extend({
	id: z.string(),
	createdAt: z.union([z.string(), z.number(), z.date()]).pipe(z.coerce.date()),
	updatedAt: z.union([z.string(), z.number(), z.date()]).pipe(z.coerce.date()),
})

/** Validation rules for ACL entries */
export class AccessControlGuards {
	static validateCreate(
		data: Omit<SerializedAccessControl, 'id' | 'createdAt' | 'updatedAt'>,
	): Result<Omit<SerializedAccessControl, 'id' | 'createdAt' | 'updatedAt'>, AccessControlValidationError> {
		const res = aclSchema.safeParse(data)
		if (res.success) {
			return Result.Ok(res.data)
		}
		return Result.Err(new AccessControlValidationError(res.error.message))
	}

	static validateReconstitution(
		data: SerializedAccessControl,
	): Result<SerializedAccessControl, AccessControlValidationError> {
		const res = aclInitSchema.safeParse(data)
		if (res.success) {
			return Result.Ok(res.data)
		}
		return Result.Err(new AccessControlValidationError(res.error.message))
	}
}
