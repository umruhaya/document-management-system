import type { Result } from '@carbonteq/fp'

export interface FilestoreStrategy {
	saveContent(ref: string, content: string): Promise<Result<string, Error>>
	fetchContent(ref: string): Promise<Result<string, Error>>
	deleteContent(ref: string): Promise<Result<true, Error>>
}
