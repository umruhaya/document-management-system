import type { Result } from '@carbonteq/fp'
import type { DocumentValidationError } from '~/domain/errors/errors.documents'
import { BaseEntity, type IEntity } from '~/domain/utils/base.entity'
import type { ULID } from '~/domain/utils/refined.types'
import { parseULID } from '~/domain/utils/refined.types'
import { DocumentGuards } from './document.guards'

/** Serialized form of DocumentEntity for persistence */
/** Serialized form of DocumentEntity for persistence */
export interface SerializedDocument {
	/** ULID identifier */
	id: string
	createdAt: string
	updatedAt: string
	title: string
	description: string
	fileType: string
	version: number
	size: number
	content: string
	tags: string[]
}

/** Document domain model */
export class DocumentEntity extends BaseEntity implements IEntity {
	readonly title: string
	readonly description: string
	readonly fileType: string
	readonly version: number
	readonly size: number
	readonly content: string
	readonly tags: string[]

	private constructor(data: SerializedDocument) {
		super()
		this._fromSerialized({
			id: data.id as ULID,
			createdAt: data.createdAt,
			updatedAt: data.updatedAt,
		})

		this.title = data.title
		this.description = data.description
		this.fileType = data.fileType
		this.version = data.version
		this.size = data.size
		this.content = data.content
		this.tags = data.tags
	}

	/** Factory method for creating a document with validation */
	/**
	 * Create a DocumentEntity from raw data (string IDs), performing ULID parsing
	 * and domain-level validation.
	 */
	static create(input: {
		id: string
		title: string
		description: string
		fileType: string
		version: number
		size: number
		content: string
		tags: string[]
		createdAt?: string
		updatedAt?: string
	}): Result<DocumentEntity, DocumentValidationError | Error> {
		const now = new Date().toISOString()
		return parseULID(input.id).flatMap((id) => {
			const serialized: SerializedDocument = {
				id,
				createdAt: input.createdAt ?? now,
				updatedAt: input.updatedAt ?? now,
				title: input.title,
				description: input.description,
				fileType: input.fileType,
				version: input.version,
				size: input.size,
				content: input.content,
				tags: input.tags,
			}
			return DocumentGuards.validateCreate(serialized).map(() => new DocumentEntity(serialized))
		})
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
			content: this.content,
			tags: this.tags,
		}
	}
}
