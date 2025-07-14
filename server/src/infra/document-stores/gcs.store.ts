import { Result } from '@carbonteq/fp'
import { Storage } from '@google-cloud/storage'
import type { DocumentStoreStrategy } from '../../domain/document/document-store.strategy'

export class GCSStore implements DocumentStoreStrategy {
	private storage: Storage
	private bucket

	constructor(private bucketName: string) {
		this.storage = new Storage()
		this.bucket = this.storage.bucket(bucketName)
	}

	async saveContent(ref: string, content: string): Promise<Result<string, Error>> {
		try {
			const file = this.bucket.file(ref)
			await file.save(content)
			return Result.Ok(ref)
		} catch (err) {
			return Result.Err(err instanceof Error ? err : new Error(String(err)))
		}
	}

	async fetchContent(ref: string): Promise<Result<string, Error>> {
		try {
			const file = this.bucket.file(ref)
			const [data] = await file.download()
			return Result.Ok(data.toString('utf-8'))
		} catch (err) {
			return Result.Err(err instanceof Error ? err : new Error(String(err)))
		}
	}

	async deleteContent(ref: string): Promise<Result<true, Error>> {
		try {
			const file = this.bucket.file(ref)
			await file.delete()
			return Result.Ok(true)
		} catch (err) {
			return Result.Err(err instanceof Error ? err : new Error(String(err)))
		}
	}
}
