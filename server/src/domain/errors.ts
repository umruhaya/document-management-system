export class EntityError extends Error {}

export class EntityValidationError extends EntityError {
	constructor(entity: string, input: unknown, reason: string) {
		super(`[${entity}] ${reason} \nInput: ${JSON.stringify(input)}`)
	}
}
export class EntityAlreadyExistsError extends EntityError {
	constructor(entity: string, input: unknown) {
		super(`[${entity}] Resource already exists \nInput: ${JSON.stringify(input)}`)
	}
}
export class EntityNotFoundError extends EntityError {
	constructor(entity: string, input: unknown) {
		super(`[${entity}] Resource not found \nInput: ${JSON.stringify(input)}`)
	}
}
export class EntityUnknownError extends EntityError {
	constructor(entity: string, input: unknown, reason: string) {
		super(`[${entity}] Unknown error: ${reason} \nInput: ${JSON.stringify(input)}`)
	}
}
export class AuthenticationError extends EntityError {
	constructor(entity: string, input: unknown, reason: string) {
		super(`[${entity}] Unknown error: ${reason} \nInput: ${JSON.stringify(input)}`)
	}
}
