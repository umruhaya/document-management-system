import jwt from 'jsonwebtoken'
import { JWTContent, JWTDecodedPayload } from '~/presentation/http/types'
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

declare global {
  namespace Express {
	interface Request {
	  jwtPayload?: JWTDecodedPayload; // Make it optional if it might not always be present
	}
  }
}