import { createExpressEndpoints, initServer } from '@ts-rest/express'
import express from 'express'
import { documentsContract } from '~/presentation/contracts/documents'
import { usersContract } from '~/presentation/contracts/users'
import { documentsController } from '~/presentation/controllers/documents.controller'
import { usersController } from '~/presentation/controllers/users.controller'
import { openapiDocument, swaggerHtml } from '~/presentation/openapi'

const app = express()

app.use(express.json())

app.use((req, res, next) => {
	console.log(`[${req.method}] ${req.path}`)
	next()
})

// app.use('/users', usersRouter)
// app.use('/documents', documentsRouter)

app.get('/', (_, res) => {
	res.send(`<div><h1>DMS Server is Up</h1><a href='/docs'>View Docs</a></div>`)
})

app.get('/healthz', (_, res) => {
	res.send('Server Is Healthy\n')
})

// OpenAPI Setup
app.get('/docs', (_, res) => {
	res.send(swaggerHtml)
})

app.get('/docs.json', (_, res) => {
	res.json(openapiDocument)
})

// Registering with TS Rest
const s = initServer()

const usersRouter = s.router(usersContract, usersController)
const documentsRouter = s.router(documentsContract, documentsController)

createExpressEndpoints(usersContract, usersRouter, app)
createExpressEndpoints(documentsContract, documentsRouter, app)

export const expressApp = app
