import { createApp } from '~/lib/create-app'
import { usersRouter } from '~/routes/users/users.index'
import { documentsRouter } from '~/routes/documents/documents.index'

const app = createApp()

// Register All the Routers
const routers = [
	usersRouter,
	documentsRouter,
] as const

routers.forEach((route) => {
	app.route('/', route)
})

// This can be useful for creating an rpc using `hono/client`
export type AppType = typeof routers[number]

export default app
