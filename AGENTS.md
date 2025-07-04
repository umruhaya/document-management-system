# Server Directory Documentation

Project Name: Document Management System

at top level we have the `server` directory which is our main concern for the most part.

This document provides an overview of the `server` codebase, its organization following Domain-Driven Design (DDD) principles, the technology stack, key libraries, and instructions for getting started.

## Table of Contents
- [Introduction](#introduction)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Directory Structure](#directory-structure)
- [Domain-Driven Design Layers](#domain-driven-design-layers)
  - [Domain Layer](#domain-layer)
  - [Application Layer](#application-layer)
  - [Infrastructure Layer](#infrastructure-layer)
  - [Presentation Layer](#presentation-layer)
  - [Utilities](#utilities)
- [Dependency Injection](#dependency-injection)
- [Database Configuration](#database-configuration)
- [OpenAPI & Routing (TS-Rest)](#openapi--routing-ts-rest)
- [Scripts & Tooling](#scripts--tooling)

## Introduction

The `server` directory implements the backend for the Document Management System (DMS). It is built with TypeScript and follows a layered architecture inspired by Domain-Driven Design (DDD). The project leverages modern libraries and frameworks to enforce strong typing, validation, dependency injection, and easy API contract definitions.

## Tech Stack

- **Language & Runtime**: TypeScript (via `tsx`), Node.js-compatible (Bun recommended for development).
- **Web Framework**: Express (v5)
- **API Contract & Documentation**: `@ts-rest/express`, `@ts-rest/open-api`, Swagger UI
- **ORM & Database**: Drizzle ORM (`drizzle-orm`), Drizzle Kit, PostgreSQL (`postgres` driver)
- **Dependency Injection**: `tsyringe`
- **Validation & Types**: Zod
- **Security**: Argon2 (password hashing), JSON Web Tokens (`jsonwebtoken`)
- **Logging**: Winston
- **Utilities**: `@carbonteq/fp`, `date-fns`, `mime`, `ulidx`

## Getting Started

1. Copy or rename `.env.example` to `.env` and fill in your environment variables.
2. Install dependencies:
   ```bash
   bun install
   ```
3. Run in development mode:
   ```bash
   bun run dev
   ```
4. Open your browser at `http://localhost:3000` (or the host/port configured in `.env`).

## Directory Structure

```
├── .env.example
├── drizzle.config.js          # Drizzle Kit configuration for migrations
├── package.json
├── pnpm-lock.yaml
├── README.md
├── server.md                 # ← this documentation file
├── src
│   ├── app                   # Application services (use-cases)
│   ├── domain                # Domain layer: entities, repositories, errors, guards
│   ├── infra                 # Infrastructure: DI container, DB client, low-level services
│   ├── presentation          # HTTP controllers, contracts, DTOs, middlewares, OpenAPI setup
│   ├── utils                 # Shared utilities (mappers, helpers)
│   ├── main.ts               # CLI entry-point using Commander
│   └── server.ts             # Bootstrap script for HTTP server
├── tsconfig.json
└── ...
```

## Domain-Driven Design Layers

### Domain Layer

Located in `src/domain`, this layer encapsulates the core business logic, entities, and rules:

- **Entities** (`*.entity.ts`): Rich domain models that represent business objects (e.g., User, Document, AccessControlEntry).
- **Repositories** (`*.repository.ts`): Interfaces defining persistence operations for each aggregate.
- **Guards** (`*.guards.ts`): Domain invariants and preconditions enforcement.
- **Errors** (`*.errors.ts`): Domain-specific error classes.
- **Utilities** in `src/domain/utils`: Base classes and shared types for entities and repositories.

### Application Layer

Located in `src/app`, this layer contains the application services (use-cases) that orchestrate domain operations. It implements business workflows by combining domain entities, repositories, and guards.

### Infrastructure Layer

Located in `src/infra`, this layer provides concrete implementations for external concerns:

- **DI Container** (`container.ts`): Sets up `tsyringe` to wire up services and repositories.
- **Environment** (`env.ts`): Loads and validates environment variables.
- **Database Client** (`database/client.ts`): Drizzle ORM client configuration for PostgreSQL.
- **Repositories** (`repositories/pg`): PostgreSQL implementations of domain repository interfaces.
- **Low-level Services** (`services`): Cross-cutting services (e.g., authorization, presigned URL generation).

### Presentation Layer

Located in `src/presentation`, this layer handles HTTP interactions and API contract enforcement:

- **Contracts** (`contracts/*.ts`): Type-safe API schemas powered by `@ts-rest`.
- **Controllers** (`controllers/*.controller.ts`): Implementation matching each contract operation, delegating to application services.
- **DTOs** (`dtos/*.ts`): Data transfer objects for request/response shapes.
- **OpenAPI** (`openapi/index.ts`): Generates Swagger/OpenAPI JSON and HTML UI.
- **App Setup** (`app.ts`): Express application instantiation, global middleware, health checks, docs routes, and TS-Rest route registration.

### Utilities

Shared helpers and mappers in `src/utils` and `src/presentation/utils`:

- `http-mapper.ts`, `result-match.ts`: Helpers to translate service results into HTTP responses.
- Contract/DTO helpers for TS-Rest and plain JavaScript objects.

## Dependency Injection

The project uses `tsyringe` to manage dependencies. The DI container is configured in `src/infra/container.ts`, where implementations are registered against domain interfaces. This enables loose coupling and easy testing.

## Database Configuration

Configuration for migrations and schema is defined in `drizzle.config.js`. The database models (Drizzle schema definitions) live under `src/infra/database/models`.

## OpenAPI & Routing (TS-Rest)

API contracts are declared with `@ts-rest/core` and exposed via Express using `@ts-rest/express`. The OpenAPI specification is generated automatically, and Swagger UI is served under `/docs`.

## Scripts & Tooling

Scripts defined in `package.json`:

```json
{
  "dev": "tsx --watch --env-file=.env src/main.ts serve",
  "start": "tsx src/main.ts serve",
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:push": "drizzle-kit push",
  "db:studio": "drizzle-kit studio --verbose"
}
```

- **Formatter**: Biome.js for code formatting (`pnpm exec biome format --write`).

## Domain Overview

At the heart of the DMS domain are **documents**, **users**, and **access control entries**. We apply
Domain-Driven Design (DDD) principles to structure our code and enforce business invariants.

### Core Entities

- **User**: Represents a system user with credentials and identity.
- **Document**: Represents a file or content artifact that can be uploaded, versioned, and shared.
- **AccessControlEntry**: Represents a permission grant (viewer, editor, owner) linking a user to a document.

### Value Objects & Primitives

We use refined primitives and value objects for strong typing and validation:

- **ULID**: Globally unique identifier for entities.
- **DateTime**: ISO8601 timestamp for creation and update fields.
- **Email**: Branded types for user email and other identifiers.

### Aggregates & Repositories

Each aggregate has a single root entity and a repository interface:

- **UserRepository**: CRUD operations for users.
- **DocumentRepository**: Search, retrieve, create, and update documents with pagination support.
- **AclRepository**: Manage permission grants (create, retrieve, revoke).

Repositories hide persistence details and expose methods that operate on domain entities.

## Domain Rules & Validation Guards

Domain guards enforce invariants at entity creation and updates:

- **UserGuards**: Validate username and password hash formats.
- **DocumentGuards**: Ensure non-empty title/content and valid version numbers.
- **AclGuards**: Enforce allowed roles (`viewer`, `editor`, `owner`).

Validation errors are represented by domain-specific error types (e.g., `DocumentValidationError`,
`ACLEntryValidationError`) which capture the invalid input and a reason.

## Domain Errors

We classify errors to distinguish failure modes:

- **ValidationError**: Invalid input or invariant violation.
- **AlreadyExistsError**: Conflict when creating a resource that already exists.
- **NotFoundError**: Attempt to retrieve a missing resource.
- **AuthenticationError**, **UnknownError**: Cross-cutting errors.

## Business Use Cases

### User Management

1. **Register User**: Create a new user with a unique username and hashed password.
2. **Authenticate User**: Verify credentials and issue a session or token.
3. **Update User**: Change username or password after validation.

### Document Lifecycle

1. **Create Document**: Upload new content, assign initial version and metadata.
2. **Update Document**: Modify content or metadata, increment version.
3. **Retrieve Document**: Fetch document details and content (or metadata only).
4. **Search Documents**: List documents by filters (title, tags, author) with pagination.

### Access Control

1. **Grant Permission**: Assign a role for a user on a document (`viewer`, `editor`, `owner`).
2. **Revoke Permission**: Remove a user's access to a document.
3. **Check Permission**: Enforce permissions before document operations in application services.

## Domain Constraints & Invariants

- **Unique Username**: No two users may share the same username.
- **Document Version Monotonicity**: Version numbers start at 1 and increment by 1 on updates.
- **Non-Empty Content**: A document must have non-empty content and title.
- **Valid Roles**: ACL roles must be one of the predefined set (`viewer`, `editor`, `owner`).
- **Permission Enforcement**: Only users with appropriate roles can read or modify a document.

## Intuition & Rationale

By modeling our domain with strong types, guards, and dedicated repositories, we ensure that
business rules are enforced consistently across the application. Aggregates encapsulate
invariants and mutations, while application services orchestrate workflows (e.g., sharing a
document or publishing a new version) without leaking persistence or transport concerns.

This design promotes clarity, maintainability, and a ubiquitous language shared between
developers and domain experts.