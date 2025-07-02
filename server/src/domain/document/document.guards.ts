import { Result } from '@carbonteq/fp'
import { DocumentValidationError } from '~/domain/errors/errors.documents'
import type { SerializedDocument } from './document.entity'

/**
 * Validation rules for DocumentEntity
 */
export class DocumentGuards {
	static validateTitle(id: string, title: string): Result<string, DocumentValidationError> {
		if (!title.trim()) {
			return Result.Err(new DocumentValidationError({ id, title }, 'Title must not be empty'))
		}
		return Result.Ok(title)
	}

	static validateVersion(id: string, version: number): Result<number, DocumentValidationError> {
		if (version < 1) {
			return Result.Err(new DocumentValidationError({ id, version }, 'Version must be at least 1'))
		}
		return Result.Ok(version)
	}

	static validateContent(id: string, content: string): Result<string, DocumentValidationError> {
		if (!content) {
			return Result.Err(new DocumentValidationError({ id, content }, 'Content must not be empty'))
		}
		return Result.Ok(content)
	}

	static validateCreate(data: SerializedDocument): Result<SerializedDocument, DocumentValidationError> {
		return DocumentGuards.validateTitle(data.id, data.title)
			.flatMap(() => DocumentGuards.validateVersion(data.id, data.version))
			.flatMap(() => DocumentGuards.validateContent(data.id, data.content))
			.map(() => data)
	}
}
