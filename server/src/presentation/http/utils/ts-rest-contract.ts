import type { AppRouter } from '@ts-rest/core'
import type { RouterImplementation } from 'node_modules/@ts-rest/express/src/lib/types'

export type InferContract<TContract extends AppRouter> = RouterImplementation<TContract>
