import { createRouter } from '~/lib/create-app'
import { get } from './documents.get'

export const documentsRouter = createRouter()
	.openapi(...get)
