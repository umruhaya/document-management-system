import type { JwtPayload } from 'jsonwebtoken'

export type JWTContent = {
	userId: string
	username: string
}

export type JWTDecodedPayload = JwtPayload & JWTContent

export interface PaginationOptions<Filters extends Record<string, unknown> = {}> {
	page: number
	limit: number
	sort?: string
	filters: Filters
}

export interface PaginatedCollection<T> {
	items: T[]
	totalItems: number
	totalPages: number
	currentPage: number
	perPage: number
}
