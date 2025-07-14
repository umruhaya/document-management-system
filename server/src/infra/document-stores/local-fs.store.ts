import fs from 'node:fs/promises'
import * as path from 'node:path'
import { Result } from '@carbonteq/fp'
import type { DocumentStoreStrategy } from '~/domain/document/document-store.strategy'

export class LocalFSStore implements DocumentStoreStrategy {
	constructor(private baseDir: string) {}

	async saveContent(ref: string, content: string): Promise<Result<string, Error>> {
		const filePath = path.join(this.baseDir, ref)
		try {
			await fs.mkdir(path.dirname(filePath), { recursive: true })
			await fs.writeFile(filePath, content)
			return Result.Ok(filePath)
		} catch (err) {
			return Result.Err(err instanceof Error ? err : new Error(String(err)))
		}
	}

	async fetchContent(ref: string): Promise<Result<string, Error>> {
		const filePath = path.join(this.baseDir, ref)
		try {
			const data = await fs.readFile(filePath, 'utf-8')
			return Result.Ok(data)
		} catch (err) {
			return Result.Err(err instanceof Error ? err : new Error(String(err)))
		}
	}

	async deleteContent(ref: string): Promise<Result<true, Error>> {
		const filePath = path.join(this.baseDir, ref)
		try {
			await fs.unlink(filePath)
			return Result.Ok(true)
		} catch (err) {
			return Result.Err(err instanceof Error ? err : new Error(String(err)))
		}
	}
}
