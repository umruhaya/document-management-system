import express from 'express'
import { openapiDocument, swaggerHtml } from '~/presentation/openapi'
import { documentsRouter } from '~/presentation/routes/documents'
import { usersRouter } from '~/presentation/routes/users'

const app = express()

app.use(express.json())
app.use('/users', usersRouter)
app.use('/documents', documentsRouter)

app.get('/', (_, res) => {
	res.send(`<div><h1>DMS Server is Up</h1><a href='/docs'>View Docs</a></div>`)
})

app.get('/healthz', (_, res) => {
	res.send('Server Is Healthy\n')
})

app.get('/docs', (_, res) => {
	res.send(swaggerHtml)
})

app.get('/docs.json', (_, res) => {
	res.json(openapiDocument)
})

export const expressApp = app
