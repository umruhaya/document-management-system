import { Result } from '@carbonteq/fp'
import { BaseEntity, type IEntity } from '~/domain/base.entity'

type DocumentSpecificFields = {
	title: string
	description: string
	fileType: string
	version: number
	size: number
	content: string
	tags: string[]
	createdAt: Date
	updatedAt: Date
}

export class DocumentEntity extends BaseEntity implements IEntity {
	id: string
	title: string
	description: string
	fileType: string
	version: number
	size: number
	content: string
	tags: string[]
	createdAt: Date
	updatedAt: Date

	private constructor(entity: { id: string } & DocumentSpecificFields) {
		super({ id: entity.id })
		this.id = entity.id
		this.title = entity.title
		this.description = entity.description
		this.fileType = entity.fileType
		this.version = entity.version
		this.size = entity.size
		this.content = entity.content
		this.tags = entity.tags
		this.createdAt = entity.createdAt
		this.updatedAt = entity.updatedAt
	}

	static create(document: DocumentEntity) {
		return Result.Ok(new DocumentEntity(document))
	}
}
