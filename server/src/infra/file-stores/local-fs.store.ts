import fs from 'node:fs/promises'
import * as path from 'node:path'
import { Result } from '@carbonteq/fp'
import { inject, injectable } from 'tsyringe'
import { env } from '~/infra/env'
import type { FilestoreStrategy } from '~/infra/file-stores/filestore.strategy'
import { type ILogger, LOGGER_TOKEN } from '~/infra/logger'

@injectable()
export class LocalFSStore implements FilestoreStrategy {
	constructor(@inject(LOGGER_TOKEN) private logger: ILogger) {}

	async saveContent(ref: string, content: string): Promise<Result<string, Error>> {
		const filePath = path.join(env.DOCUMENTS_BASE_DIR, ref)
		try {
			await fs.mkdir(path.dirname(filePath), { recursive: true })
			await fs.writeFile(filePath, content)
			return Result.Ok(filePath)
		} catch (err) {
			this.logger.error('LocalFSStore.saveContent failed', { error: err, ref })
			return Result.Err(err instanceof Error ? err : new Error(String(err)))
		}
	}

	async fetchContent(ref: string): Promise<Result<string, Error>> {
		const filePath = path.join(env.DOCUMENTS_BASE_DIR, ref)
		try {
			const data = await fs.readFile(filePath, 'utf-8')
			return Result.Ok(data)
		} catch (err) {
			this.logger.error('LocalFSStore.fetchContent failed', {
				error: err,
				ref,
			})
			return Result.Err(err instanceof Error ? err : new Error(String(err)))
		}
	}

	async deleteContent(ref: string): Promise<Result<true, Error>> {
		const filePath = path.join(env.DOCUMENTS_BASE_DIR, ref)
		try {
			await fs.unlink(filePath)
			return Result.Ok(true)
		} catch (err) {
			this.logger.error('LocalFSStore.deleteContent failed', {
				error: err,
				ref,
			})
			return Result.Err(err instanceof Error ? err : new Error(String(err)))
		}
	}
}
