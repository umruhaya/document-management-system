import 'reflect-metadata'
import { container } from 'tsyringe'
import { DocumentService } from '~/app/services/document.service'
import { UserService } from '~/app/services/user.service'
import type { AccessControlRepository } from '~/domain/access-control/access-control.repository'
import type { DocumentRepository } from '~/domain/document/document.repository'
import type { UserRepository } from '~/domain/user/user.repository'
import { GCSStore } from '~/infra/document-stores/gcs.store'
import { LocalFSStore } from '~/infra/document-stores/local-fs.store'
import { env } from '~/infra/env'
import { AccessControlRepositoryPg } from '~/infra/repositories/pg/acl.repository.pg'
import { DocumentRepositoryPg } from '~/infra/repositories/pg/document.repository.pg'
import { UserRepositoryPg } from '~/infra/repositories/pg/user.repository.pg'

// Register repositories
container.register<DocumentRepository>('DocumentRepository', { useClass: DocumentRepositoryPg })
container.register<UserRepository>('UserRepository', { useClass: UserRepositoryPg })
container.register<AccessControlRepository>('AclRepository', { useClass: AccessControlRepositoryPg })

// Register document store strategy
container.register('DocumentStoreStrategy', {
	useFactory: () => new LocalFSStore(env.DOCUMENTS_BASE_DIR),
})
// To use GCSStore instead, uncomment below and provide your bucket name:
// container.register('DocumentStoreStrategy', { useFactory: () => new GCSStore(env.BUCKET_NAME) })

// Register services
container.register(DocumentService, { useClass: DocumentService })
container.register(UserService, { useClass: UserService })

export { container }
