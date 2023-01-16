# SaaS starter kit
*Forked from https://github.com/trpc/examples-next-prisma-starter*

## Features

- 🧙‍♂️ E2E typesafety with [tRPC](https://trpc.io)
- ⚡ Full-stack React with Next.js
- ⚡ Database with Prisma
  - 💿 PostgreSQL and MongoDB starter schemas
  - 🏘 Multi-tenancy arch
- 🔐 Auth with next-auth
- 💅 MUI integration
- 🔔 Notifications via notistack
- ⚙️ VSCode extensions
- 🎨 ESLint + Prettier
- 💚 CI setup using GitHub Actions:
  - ✅ E2E testing with [Playwright](https://playwright.dev/)
  - ✅ Linting
- 🔐 Validates your env vars on build and start

## Setup

**yarn:**

```bash
yarn create next-app --example https://github.com/lucafaggianelli/saas-starter my-new-saas
cd my-new-saas
yarn
yarn dx
```

**npm:**

```bash
npx create-next-app https://github.com/lucafaggianelli/saas-starter my-new-saas
cd my-new-saas
yarn
yarn dx
```

### Requirements

- Node >= 14
- Postgres

## Development

### Start project

```bash
yarn create next-app https://github.com/lucafaggianelli/saas-starter my-new-saas
cd my-new-saas
yarn
yarn dx
```

### Commands

```bash
yarn build      # runs `prisma generate` + `prisma migrate` + `next build`
yarn db-reset   # resets local db
yarn dev        # starts next.js
yarn dx         # starts postgres db + runs migrations + seeds + starts next.js
yarn test-dev   # runs e2e tests on dev
yarn test-start # runs e2e tests on `next start` - build required before
yarn test:unit  # runs normal jest unit tests
yarn test:e2e   # runs e2e tests
```

## Deployment

### Using [Render](https://render.com/)

The project contains a [`render.yaml`](./render.yaml) [_"Blueprint"_](https://render.com/docs/blueprint-spec) which makes the project easily deployable on [Render](https://render.com/).

Go to [dashboard.render.com/blueprints](https://dashboard.render.com/blueprints) and connect to this Blueprint and see how the app and database automatically gets deployed.

## Files of note

<table>
  <thead>
    <tr>
      <th>Path</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><a href="./prisma/schema.prisma"><code>./prisma/schema.prisma</code></a></td>
      <td>Prisma schema (PostgreSQL)</td>
    </tr>
    <tr>
      <td><a href="./prisma/schema.prisma"><code>./prisma/schema.mongo.prisma</code></a></td>
      <td>Prisma schema (MongoDB)</td>
    </tr>
    <tr>
      <td><a href="./src/pages/api/trpc/[trpc].ts"><code>./src/pages/api/trpc/[trpc].ts</code></a></td>
      <td>tRPC response handler</td>
    </tr>
    <tr>
      <td><a href="./src/pages/api/auth/[...nextauth].ts"><code>./src/pages/api/auth/[...nextauth].ts</code></a></td>
      <td>next-auth response handler and config</td>
    </tr>
    <tr>
      <td><a href="./src/middleware.js"><code>./src/middleware.js</code></a></td>
      <td>next-auth access control</td>
    </tr>
    <tr>
      <td><a href="./src/server/routers"><code>./src/server/routers</code></a></td>
      <td>Your app's different tRPC-routers</td>
    </tr>
  </tbody>
</table>

---

Created by [@alexdotjs](https://twitter.com/alexdotjs).
