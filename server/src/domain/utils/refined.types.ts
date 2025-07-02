import { Result } from '@carbonteq/fp'
import { ulid } from 'ulidx'

// Branded type for UUID
export type UUID = string & { readonly __brand: unique symbol }

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function parseUUID(input: string): Result<UUID, Error> {
	return UUID_REGEX.test(input) ? Result.Ok(input as UUID) : Result.Err(new Error(`Invalid UUID: ${input}`))
}

// Branded type for DateTime (ISO string)
export type DateTime = string & { readonly __brandDateTime: unique symbol }

export function parseDateTime(input: string): Result<DateTime, Error> {
	const date = new Date(input)
	return Number.isNaN(date.getTime())
		? Result.Err(new Error(`Invalid DateTime: ${input}`))
		: Result.Ok(input as DateTime)
}

// Branded type for Email
export type Email = string & { readonly __brandEmail: unique symbol }

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export function parseEmail(input: string): Result<Email, Error> {
	return EMAIL_REGEX.test(input) ? Result.Ok(input as Email) : Result.Err(new Error(`Invalid Email: ${input}`))
}

// Helper for optional fields (nullable)
export function Optional<T>(value: T | null | undefined): T | null {
	return value == null ? null : value
}

// Branded type for ULID
export type ULID = string & { readonly __brandULID: unique symbol }

const ULID_REGEX = /^[0-9A-HJKMNP-TV-Z]{26}$/

/**
 * Parse a ULID string into a branded ULID type, or return Err if invalid
 */
export function parseULID(input: string): Result<ULID, Error> {
	return ULID_REGEX.test(input) ? Result.Ok(input as ULID) : Result.Err(new Error(`Invalid ULID: ${input}`))
}

export const createULID = () => ulid() as ULID
