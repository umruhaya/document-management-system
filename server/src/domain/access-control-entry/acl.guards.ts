import { Result } from '@carbonteq/fp'
import { ACLEntryValidationError } from '~/domain/errors/errors.acls'
import type { DocumentRole, SerializedAcl } from './access-control-entry.entity'

/** Validation rules for ACL entries */
export class AclGuards {
	static validateRole(role: DocumentRole): Result<DocumentRole, ACLEntryValidationError> {
		const allowed: DocumentRole[] = ['viewer', 'editor', 'owner']
		return allowed.includes(role)
			? Result.Ok(role)
			: Result.Err(new ACLEntryValidationError(role, `Role must be one of ${allowed.join(', ')}`))
	}

	static validateCreate(data: SerializedAcl): Result<SerializedAcl, ACLEntryValidationError> {
		return AclGuards.validateRole(data.role).map(() => data)
	}
}
