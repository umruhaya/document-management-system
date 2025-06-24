import { container } from 'tsyringe'
import type { Logger } from './logger/Logger'
import { WinstonLogger } from './logger/winston-logger'
import { DocumentsController } from './presentation/http/controllers/documents'
import { UsersController } from './presentation/http/controllers/users'
import { DocumentRepository } from './repositories/document'
import { UserRepository } from './repositories/user'

// Register Logger
container.register<Logger>('Logger', { useClass: WinstonLogger })

// Register repositories
container.register<UserRepository>(UserRepository, { useClass: UserRepository })
container.register<DocumentRepository>(DocumentRepository, { useClass: DocumentRepository })

// Register controllers
container.register<UsersController>(UsersController, { useClass: UsersController })
container.register<DocumentsController>(DocumentsController, { useClass: DocumentsController })

export { container }
