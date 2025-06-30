import { expressjwt } from 'express-jwt'
import jwt from 'jsonwebtoken'
import { env } from '~/env'
import type { JWTContent } from '~/presentation/http/types'

export const sign = (payload: JWTContent) => {
	return jwt.sign(payload, env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '4h' })
}

export const jwtMiddleware = () => {
	return expressjwt({
		algorithms: ['HS256'],
		secret: env.JWT_SECRET,
		requestProperty: 'jwtPayload',
	})
}
