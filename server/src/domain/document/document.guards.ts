import { Result } from '@carbonteq/fp'
import { DocumentValidationError } from '~/domain/errors/errors.documents'
import type { SerializedDocument } from './document.entity'

/**
 * Validation rules for DocumentEntity
 */
export class DocumentGuards {
	static validateTitle(title: string): Result<string, DocumentValidationError> {
		if (!title.trim()) {
			return Result.Err(new DocumentValidationError(title, 'Title must not be empty'))
		}
		return Result.Ok(title)
	}

	static validateVersion(version: number): Result<number, DocumentValidationError> {
		if (version < 1) {
			return Result.Err(new DocumentValidationError(version, 'Version must be at least 1'))
		}
		return Result.Ok(version)
	}

	static validateContent(content: string): Result<string, DocumentValidationError> {
		if (!content) {
			return Result.Err(new DocumentValidationError(content, 'Content must not be empty'))
		}
		return Result.Ok(content)
	}

	static validateCreate(data: SerializedDocument): Result<SerializedDocument, DocumentValidationError> {
		return DocumentGuards.validateTitle(data.title)
			.flatMap(() => DocumentGuards.validateVersion(data.version))
			.flatMap(() => DocumentGuards.validateContent(data.content))
			.map(() => data)
	}
}
