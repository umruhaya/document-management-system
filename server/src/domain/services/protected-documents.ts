import { Result } from '@carbonteq/fp'
import type { AccessControlEntity } from '~/domain/access-control/access-control.entity'
import { AccessControlNotFoundError } from '~/domain/access-control/access-control.errors'
import { DocumentInvalidOperation } from '~/domain/document/document.errors'

export class ProtectedDocumentsService {
	static applyPatchToAccessControlList(
		entryToPatch: AccessControlEntity,
		existingEntries: AccessControlEntity[],
	): Result<AccessControlEntity[], never> {
		const idx = existingEntries.findIndex((entry) => entry.id === entryToPatch.id)
		if (idx !== -1) {
			// Replace the existing entry with the patched one
			return Result.Ok([...existingEntries.slice(0, idx), entryToPatch, ...existingEntries.slice(idx + 1)])
		}
		// Add as new entry
		return Result.Ok([...existingEntries, entryToPatch])
	}

	static validateEntriesForDocument(entries: AccessControlEntity[]): Result<boolean, DocumentInvalidOperation> {
		const hasOwner = entries.some((entry) => entry.role === 'owner')
		if (hasOwner) {
			return Result.Ok(true)
		}
		return Result.Err(new DocumentInvalidOperation('Document must have at least one owner entry'))
	}

	static validateEditAccessForDocument({ role }: AccessControlEntity): Result<boolean, DocumentInvalidOperation> {
		return role === 'owner' || role === 'editor'
			? Result.Ok(true)
			: Result.Err(new DocumentInvalidOperation('Document must have at least one owner entry'))
	}

	static deleteEntryFromAccessControlList(
		userId: string,
		documentId: string,
		existingEntries: AccessControlEntity[],
	): Result<AccessControlEntity[], AccessControlNotFoundError> {
		const idx = existingEntries.findIndex((entry) => entry.userId === userId && entry.documentId === documentId)
		if (idx === -1) {
			return Result.Err(
				new AccessControlNotFoundError(
					`Access control entry for userId=${userId} and documentId=${documentId} not found`,
				),
			)
		}
		const newEntries = [...existingEntries.slice(0, idx), ...existingEntries.slice(idx + 1)]
		return Result.Ok(newEntries)
	}
}
