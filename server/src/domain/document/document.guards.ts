import { Result } from '@carbonteq/fp'
import { z } from 'zod'
import { DocumentValidationError } from '~/domain/document/document.errors'
import type { SerializedDocument } from './document.entity'

const documentSchema = z.object({
	title: z.string().min(1, 'Title must not be empty'),
	description: z.string(),
	fileType: z.string(),
	version: z.number().min(1, 'Version must be at least 1'),
	size: z.number(),
	content: z.string().min(1, 'Content must not be empty'),
	tags: z.array(z.string()),
})

const documentInitSchema = documentSchema.extend({
	id: z.string().uuid(),
	createdAt: z.union([z.string(), z.number(), z.date()]).pipe(z.coerce.date()),
	updatedAt: z.union([z.string(), z.number(), z.date()]).pipe(z.coerce.date()),
})

/**
 * Validation rules for DocumentEntity
 */
export class DocumentGuards {
	static validateCreate(
		data: Omit<SerializedDocument, 'id' | 'createdAt' | 'updatedAt'>,
	): Result<Omit<SerializedDocument, 'id' | 'createdAt' | 'updatedAt'>, DocumentValidationError> {
		const res = documentSchema.safeParse(data)
		if (res.success) {
			return Result.Ok(res.data)
		}
		return Result.Err(new DocumentValidationError(res.error.message))
	}

	static validateReconstitution(data: SerializedDocument): Result<SerializedDocument, DocumentValidationError> {
		const res = documentInitSchema.safeParse(data)
		if (res.success) {
			return Result.Ok(res.data)
		}
		return Result.Err(new DocumentValidationError(res.error.message))
	}
}
