# Document Management System

## Getting Started

1. Install [Bun.js](https://bun.sh/)

2. Install Packages using `bun`:

```bash
cd server
bun install
```

3. Start the development server:

```bash
bun dev
```

4. Also start the postgreSQL service using docker if you prefer docker for running PostgreSQL.

```bash
cd docker
docker compose up -d db
```

The `-d` flag will run the service in `detached mode`

## Contributuing Guide

### Consistent Formatting

According to this [Article](https://graphite.dev/guides/how-to-resolve-merge-conflicts-in-git#best-practices-for-handling-merge-conflicts) Most of the Merge conflicts arise from inconsistent formatting styles.

For this specific project, `.vscode` and `dprint.json` are setup and the purpose of this is to have consistent formatting across different environment for all contributers. For example, Dprint Formatter settings in this project does not allow semicolons at end of lines for `js/ts` files and add trailing commas. These changes take should take effect `On File Save`. However, if they dont you need to configure Dprint Formatter correctly on your system. For this project, I assume you are using vscode so `.vscode` defaults should work but if you use any other editor you should configure Dprint Formatter with it as well. It is your responsibility to configure your local dev environment correctly work with the formatting Guidelines for this project. See `dprint.json`.

#### Install Dprint formatter

Install using one of the methods below.

Shell (Mac, Linux, WSL):

```bash
curl -fsSL https://dprint.dev/install.sh | sh
```

Windows Installer
Powershell (Windows):

```bash
iwr https://dprint.dev/install.ps1 -useb | iex
```

Scoop (Windows):

```bash
scoop install dprint
```

Homebrew (Mac):

```bash
brew install dprint
```

## Database Migrations

### Auto Generating Migration File

```bash
bun run db:generate --name "create_user_table"
```

`--name` specifies the name of the migration file.

### Prototyping with Push

```bash
bun run db:push
```

This will run the migrations, but before that it will show you the DDL query generated for migrations and asks you for confirmation. It is a good idea to review it. sometimes it can creates queries that drop tables and you may not want that for your `production` database :expressionless:

- Note that this does not actually creates any record of migration in the database table `migrations` even tho it actually created a migration. Run `bun run db:migrate` to not only run the migration but also record it. you do not have run `db:push` command as it automatically migrates to latest migration but it does not show what SQL DDL queries it is running so I prefer to use `db:push` first to review the command and then follow it by `db:migrate`

### Run Database Studio

```bash
bun run db:studio
```
