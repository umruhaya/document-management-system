# Document Management System

## Getting Started

1. Install [Node.js](https://nodejs.org/) (version 22 or above recommended).\
   It is recommended to use [nvm](https://github.com/nvm-sh/nvm) for managing Node versions:

   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   # Restart your terminal, then:
   nvm install 22
   nvm use 22
   ```

2. Install [pnpm](https://pnpm.io/):

   ```bash
   npm install -g pnpm
   ```

3. Install packages using `pnpm`:

   ```bash
   cd server
   pnpm install
   ```

4. Start the development server:

   ```bash
   pnpm dev
   ```

5. Also start the PostgreSQL service using Docker if you prefer Docker for running PostgreSQL:

   ```bash
   cd docker
   docker compose up -d db
   ```

   The `-d` flag will run the service in detached mode.

## Database Migrations

### Auto Generating Migration File

```bash
pnpm run db:generate --name "create_user_table"
```

`--name` specifies the name of the migration file.

### Prototyping with Push

```bash
pnpm run db:push
```

This will run the migrations, but before that it will show you the DDL query generated for migrations and asks you for confirmation. It is a good idea to review it. sometimes it can creates queries that drop tables and you may not want that for your `production` database :expressionless:

- Note that this does not actually creates any record of migration in the database table `migrations` even tho it actually created a migration. Run `bun run db:migrate` to not only run the migration but also record it. you do not have run `db:push` command as it automatically migrates to latest migration but it does not show what SQL DDL queries it is running so I prefer to use `db:push` first to review the command and then follow it by `db:migrate`

### Run Database Studio

```bash
pnpm run db:studio
```
