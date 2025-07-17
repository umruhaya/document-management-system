import { Result } from '@carbonteq/fp'
import { Storage } from '@google-cloud/storage'
import { inject, injectable } from 'tsyringe'
import { type ILogger, LOGGER_TOKEN } from '~/infra/logger'
import type { FilestoreStrategy } from '~/infra/file-stores/filestore.strategy'

@injectable()
export class GCSStore implements FilestoreStrategy {
	private storage
	private bucket

	constructor(@inject(LOGGER_TOKEN) private logger: ILogger) {
		this.storage = new Storage()
		this.bucket = this.storage.bucket(process.env.BUCKET_NAME ?? '')
	}

	async saveContent(ref: string, content: string): Promise<Result<string, Error>> {
		try {
			const file = this.bucket.file(ref)
			await file.save(content)
			return Result.Ok(ref)
		} catch (err) {
			this.logger.error('GCSStore.saveContent failed', { error: err, ref })
			return Result.Err(err instanceof Error ? err : new Error(String(err)))
		}
	}

	async fetchContent(ref: string): Promise<Result<string, Error>> {
		try {
			const file = this.bucket.file(ref)
			const [data] = await file.download()
			return Result.Ok(data.toString('utf-8'))
		} catch (err) {
			this.logger.error('GCSStore.fetchContent failed', { error: err, ref })
			return Result.Err(err instanceof Error ? err : new Error(String(err)))
		}
	}

	async deleteContent(ref: string): Promise<Result<true, Error>> {
		try {
			const file = this.bucket.file(ref)
			await file.delete()
			return Result.Ok(true)
		} catch (err) {
			this.logger.error('GCSStore.deleteContent failed', { error: err, ref })
			return Result.Err(err instanceof Error ? err : new Error(String(err)))
		}
	}
}
