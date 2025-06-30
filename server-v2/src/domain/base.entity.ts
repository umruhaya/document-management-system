export interface IEntity {
	id: string
	createdAt: Date
	updatedAt: Date
}

export class BaseEntity implements IEntity {
	id: string
	createdAt: Date
	updatedAt: Date
	constructor(entity: { id: string }) {
		this.id = entity.id
		this.createdAt = new Date()
		this.updatedAt = new Date()
	}
}
