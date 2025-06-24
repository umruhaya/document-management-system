import { injectable } from 'tsyringe'
import winston from 'winston'
import type { Logger } from './Logger'

@injectable()
export class WinstonLogger implements Logger {
	private readonly logger: winston.Logger

	constructor() {
		this.logger = winston.createLogger({
			level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
			format: winston.format.combine(
				winston.format.timestamp(),
				winston.format.printf(
					({ timestamp, level, message, ...rest }) =>
						`${timestamp} ${level.toUpperCase()}: ${message} ${Object.keys(rest).length ? JSON.stringify(rest) : ''}`,
				),
			),
			transports: [new winston.transports.Console()],
		})
	}

	debug(msg: string, meta?: unknown) {
		this.logger.debug(msg, meta)
	}
	info(msg: string, meta?: unknown) {
		this.logger.info(msg, meta)
	}
	warn(msg: string, meta?: unknown) {
		this.logger.warn(msg, meta)
	}
	error(msg: string, meta?: unknown) {
		this.logger.error(msg, meta)
	}
}
