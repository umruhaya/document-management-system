# DMS Server

To install dependencies:

```sh
bun install
```

To run:

```sh
bun run dev
```

open http://localhost:3000

## Formatting

We are using [biome.js](https://biomejs.dev/guides/getting-started/#usage) for formatting

```bash
pnpm exec biome format --write # format all files
```

## Database Seeding

To populate the database with extensive fake data for development and testing, run:

```bash
pnpm run db:seed
```

The seed script uses faker.js to generate users, documents, and access control entries.
