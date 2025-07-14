import type { Result } from '@carbonteq/fp'
import { BaseEntity, type DateTime, type UUID } from '~/hexapp'
import { DocumentGuards } from './document.guards'

export interface IDocumentEntity {
	readonly id: UUID
	readonly createdAt: DateTime
	readonly updatedAt: DateTime
	readonly title: string
	readonly description: string
	readonly fileType: string
	readonly version: number
	readonly size: number
	readonly tags: string[]
}

export interface SerializedDocument {
	id: string
	createdAt: Date
	updatedAt: Date
	title: string
	description: string
	fileType: string
	version: number
	size: number
	tags: string[]
}

/** Document domain model */
export class DocumentEntity extends BaseEntity implements IDocumentEntity {
	readonly title: string
	readonly description: string
	readonly fileType: string
	readonly version: number
	readonly size: number
	readonly tags: string[]

	private constructor(data: Omit<SerializedDocument, 'id' | 'createdAt' | 'updatedAt'>) {
		super()
		this.title = data.title
		this.description = data.description
		this.fileType = data.fileType
		this.version = data.version
		this.size = data.size
		this.tags = data.tags
	}

	/** Serialize the entity into plain object */
	serialize(): SerializedDocument {
		return {
			...this._serialize(),
			title: this.title,
			description: this.description,
			fileType: this.fileType,
			version: this.version,
			size: this.size,
			tags: this.tags,
		}
	}

	/** Static factory (Creation) */
	static create(obj: Omit<SerializedDocument, 'id' | 'createdAt' | 'updatedAt'>): Result<DocumentEntity, Error> {
		return DocumentGuards.validateCreate(obj).map(() => new DocumentEntity(obj))
	}

	/** Static factory from serialized (Reconstitution) */
	static fromSerialized(obj: SerializedDocument): Result<DocumentEntity, Error> {
		return DocumentGuards.validateReconstitution(obj)
			.map(() => new DocumentEntity(obj))
			.map((doc) => doc._fromSerialized(obj))
	}
}
