import type { Result } from '@carbonteq/fp'

/**
 * Generic base repository providing common CRUD operations.
 */
export abstract class BaseRepository<T> {
	abstract getById(id: string): Promise<Result<T, Error>>
	abstract insert(entity: T): Promise<Result<T, Error>>
	abstract update(entity: T): Promise<Result<true, Error>>
	abstract delete(id: string): Promise<Result<true, Error>>
}
