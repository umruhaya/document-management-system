import { jwt } from 'hono/jwt'
import { env } from '~/env'

export const jwtMiddleware = () => jwt({ secret: env.JWT_SECRET, alg: 'HS256' })
