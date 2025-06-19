import { JwtPayload } from 'jsonwebtoken'

export type JWTContent = {
	userId: string
	username: string
}

export type JWTDecodedPayload = JwtPayload & JWTContent
