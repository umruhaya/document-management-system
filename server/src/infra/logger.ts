import { createLogger, format, transports, Logger as WinstonLogger } from 'winston'

/** Logger type alias from Winston. */
export type ILogger = WinstonLogger

/** Injection token for ILogger. */
export const LOGGER_TOKEN = Symbol('Logger')

/**
 * Winston logger implementation for the application.
 * Logs to the console; in production level is 'info', otherwise 'debug'.
 */
const logger: ILogger = createLogger({
   level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
   format: format.combine(
       format.timestamp(),
       format.errors({ stack: true }),
       format.splat(),
       format.json(),
   ),
   transports: [
       new transports.Console({
           format: format.combine(format.colorize(), format.simple()),
       }),
   ],
})

export default logger
