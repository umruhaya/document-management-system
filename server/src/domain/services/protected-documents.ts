import { Result } from '@carbonteq/fp'
import type { AccessControlEntity } from '~/domain/access-control/access-control.entity'
import {
	AccessControlNotFoundError,
	AccessControlUnauthorizedOperation,
} from '~/domain/access-control/access-control.errors'
import { DocumentInvalidOperation } from '~/domain/document/document.errors'
import { UUID } from '~/hexapp'

export class ProtectedDocumentsService {
	static applyPatchToAccessControlList(
		invokerUserId: string,
		entryToPatch: AccessControlEntity,
		existingEntries: AccessControlEntity[],
	): Result<AccessControlEntity, AccessControlUnauthorizedOperation> {
		// check if the user has authorized access to modify any entry
		// this means there exist atleast one entry for invokerUserId and documentId where the role is `owner`
		const isAuthorized = existingEntries.find(
			(entry) => entry.userId === invokerUserId && entry.documentId && entry.role,
		)
		if (!isAuthorized) {
			return Result.Err(
				new AccessControlUnauthorizedOperation(
					`You do not have the permissions to modify Access Control For Document with ID: ${entryToPatch.documentId}`,
				),
			)
		}

		// Create the patch
		const newEntries = [
			// remove the `entryToPatch` if it already exists
			...existingEntries.filter(
				(entry) => !(entry.userId === entryToPatch.userId && entry.documentId === entryToPatch.documentId),
			),
			entryToPatch,
		]

		// after the operation applied, the resultant entries should be in a valid state (have atleast one owner)
		const hasOwner = newEntries.some((entry) => entry.role === 'owner')
		if (hasOwner === false) {
			return Result.Err(new DocumentInvalidOperation('Document must have at least one owner entry'))
		}

		// return the entry to be patched
		return Result.Ok(entryToPatch)
	}

	static validateEditAccessForDocument({ role }: AccessControlEntity): Result<boolean, DocumentInvalidOperation> {
		return role === 'owner' || role === 'editor'
			? Result.Ok(true)
			: Result.Err(new DocumentInvalidOperation('You dont have edit access to this document'))
	}

	static deleteEntryFromAccessControlList(
		invokerUserId: string,
		userId: string,
		documentId: string,
		existingEntries: AccessControlEntity[],
	): Result<
		Pick<AccessControlEntity, 'userId' | 'documentId'>,
		AccessControlNotFoundError | AccessControlUnauthorizedOperation | DocumentInvalidOperation
	> {
		// check if the user has authorized access to delete the entry
		// this means there exist atleast one entry for invokerUserId and documentId where the role is `owner`
		const isAuthorized = existingEntries.find(
			(entry) => entry.userId === invokerUserId && entry.documentId && entry.role,
		)
		if (!isAuthorized) {
			return Result.Err(
				new AccessControlUnauthorizedOperation(
					`You do not have the permissions to modify Access Control For Document with ID: ${documentId}`,
				),
			)
		}

		// check if the entry exists
		const idx = existingEntries.findIndex((entry) => entry.userId === userId && entry.documentId === documentId)
		if (idx === -1) {
			return Result.Err(
				new AccessControlNotFoundError(
					`Access control entry for userId=${userId} and documentId=${documentId} not found`,
				),
			)
		}
		const newEntries = [...existingEntries.slice(0, idx), ...existingEntries.slice(idx + 1)]

		// after the operation applied, the resultant entries should be in a valid state (have atleast one owner)
		const hasOwner = newEntries.some((entry) => entry.role === 'owner')
		if (hasOwner === false) {
			return Result.Err(new DocumentInvalidOperation('Document must have at least one owner entry'))
		}

		// return the entry to be deleted
		return Result.Ok({ userId: UUID.fromTrusted(userId), documentId: UUID.fromTrusted(documentId) })
	}
}
