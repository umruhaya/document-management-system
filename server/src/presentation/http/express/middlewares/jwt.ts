import jwt from 'jsonwebtoken'
import { JWTContent } from '../../types'
import { env } from '~/env'
import { expressjwt } from 'express-jwt'

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
