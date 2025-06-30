import { z } from 'zod'

export const envSchema = z.object({
	HOST: z.string().default('0.0.0.0'),
	PORT: z.coerce.number().default(8000),

	DATABASE_HOST: z.string(),
	DATABASE_NAME: z.string(),
	DATABASE_USERNAME: z.string(),
	DATABASE_PASSWORD: z.string().optional(),
	DATABASE_PORT: z.coerce.number().default(5432),

	JWT_SECRET: z.string(),
	HMAC_SIGNING_KEY: z.string(),
})

export const env = envSchema.parse(process.env)
