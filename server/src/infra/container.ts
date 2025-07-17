import 'reflect-metadata'
import { container } from 'tsyringe'
import { DocumentService } from '~/app/services/document.service'
import { UserService } from '~/app/services/user.service'
import type { AccessControlRepository } from '~/domain/access-control/access-control.repository'
import type { DocumentRepository } from '~/domain/document/document.repository'
import type { UserRepository } from '~/domain/user/user.repository'
import { env } from '~/infra/env'
import { GCSStore } from '~/infra/file-stores/gcs.store'
import { LocalFSStore } from '~/infra/file-stores/local-fs.store'
import logger, { type ILogger, LOGGER_TOKEN } from '~/infra/logger'
import { AccessControlRepositoryPg } from '~/infra/repositories/pg/acl.repository.pg'
import { DocumentRepositoryPg } from '~/infra/repositories/pg/document.repository.pg'
import { UserRepositoryPg } from '~/infra/repositories/pg/user.repository.pg'

// Register repositories
container.register<DocumentRepository>('DocumentRepository', {
	useClass: DocumentRepositoryPg,
})
container.register<UserRepository>('UserRepository', {
	useClass: UserRepositoryPg,
})
container.register<AccessControlRepository>('AclRepository', {
	useClass: AccessControlRepositoryPg,
})

// Register document store strategy
container.register('FilestoreStrategy', {
	useFactory: (c) => new LocalFSStore(c.resolve<ILogger>(LOGGER_TOKEN)),
})
// To use GCSStore instead, uncomment below and provide your bucket name:
// container.register('DocumentStoreStrategy', {
// 	useFactory: (c) => new GCSStore(c.resolve<ILogger>(LOGGER_TOKEN)),
// })

// Register services
container.register(DocumentService, { useClass: DocumentService })
container.register(UserService, { useClass: UserService })

// Register logger instance for injection
container.registerInstance<ILogger>(LOGGER_TOKEN, logger)

export { container }
