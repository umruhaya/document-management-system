import type { ULID } from './refined.types'

export interface IEntity {
	readonly id: ULID
	readonly createdAt: Date
	readonly updatedAt: Date
}

export abstract class BaseEntity implements IEntity {
	id!: ULID
	createdAt!: Date
	updatedAt!: Date

	protected constructor() {
		// Use factory methods and `_fromSerialized` to initialize
	}

	protected _fromSerialized(data: { id: ULID; createdAt: string; updatedAt: string }): void {
		this.id = data.id
		this.createdAt = new Date(data.createdAt)
		this.updatedAt = new Date(data.updatedAt)
	}

	protected _serialize(): {
		id: string
		createdAt: string
		updatedAt: string
	} {
		return {
			id: this.id,
			createdAt: this.createdAt.toISOString(),
			updatedAt: this.updatedAt.toISOString(),
		}
	}
}
