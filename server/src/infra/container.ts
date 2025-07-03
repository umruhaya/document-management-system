import 'reflect-metadata'
import { container } from 'tsyringe'
import { DocumentService } from '~/app/services/document.service'
import { UserService } from '~/app/services/user.service'
import type { AclRepository } from '~/domain/access-control-entry/acl.repository'
import type { DocumentRepository } from '~/domain/document/document.repository'
import type { UserRepository } from '~/domain/user/user.repository'
import { AclRepositoryPg } from '~/infra/repositories/pg/acl.repository.pg'
import { DocumentRepositoryPg } from '~/infra/repositories/pg/document.repository.pg'
import { UserRepositoryPg } from '~/infra/repositories/pg/user.repository.pg'

// Register repositories
container.register<DocumentRepository>('DocumentRepository', { useClass: DocumentRepositoryPg })
container.register<UserRepository>('UserRepository', { useClass: UserRepositoryPg })
container.register<AclRepository>('AclRepository', { useClass: AclRepositoryPg })

// Register services
container.register(DocumentService, { useClass: DocumentService })
container.register(UserService, { useClass: UserService })

export { container }
