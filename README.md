# Supametrics: A Unified Analytics Platform 🚀

Supametrics is a robust, developer-focused analytics platform designed to provide insightful data with a minimal, premium interface. This monorepo project combines a powerful Next.js dashboard, a high-performance Hono (TypeScript) API for user and project management, and an efficient Go Fiber API for real-time analytics ingestion. It's built for precision, selfhosting and scalability, empowering developers to understand their applications' usage patterns. Supametrics aims to be a privacy-first, open-source web analytics solution, offering a lightweight and privacy-friendly alternative to Google Analytics, designed for self-hosting and complete data ownership.

## Features

- **Real-time Analytics Ingestion**: Efficiently logs and tracks analytics events via a dedicated Go Fiber API, secured by public API keys, supporting batched ingestion and caching hot data in Redis.
- **Comprehensive User & Project Management**: Manage users, create and organize projects, and oversee teams through a robust Hono (TypeScript) API. Includes CRUD operations for projects and teams, inviting users to teams and projects, and assigning roles.
- **Secure Authentication & Authorization**: Implements email/password authentication with JWT and refresh tokens, supports OAuth (Google, GitHub), role-based access control (user, admin, superadmin for users; owner, member, viewer for teams/projects), session management (revoke, list, expire), and account restriction (suspended, read-only).
- **API Key Management**: Secure generation, rotation, and revocation of public and secret API keys for each project to control external access, with project-scoped access and enforcement.
- **Intelligent Rate Limiting & Quotas**: Protects against abuse and enforces plan-based usage limits (free, paid, enterprise) for both API requests and monthly event quotas, utilizing Redis for caching and rate-limiting.
- **Dynamic Reporting & Analytics Retrieval**: Generate and retrieve custom reports based on collected analytics data (e.g., event summaries, OS, device, browser summaries, top paths, referrers, hostnames, UTM sources), with secret key access for project owners and pagination for large datasets.
- **Advanced Analytics Processing**: Features cron jobs for rolling up analytics into summary tables, archiving old raw events, recalculating cached aggregates, and sending daily/weekly reports via email. Future plans include async ingestion via Redis queues and bulk inserts to PostgreSQL for scaling.
- **Modern Interactive Dashboard**: A sleek Next.js dashboard provides a visually appealing and highly responsive interface for data visualization, powered by Tailwind CSS, shadcn/ui, and Framer Motion.
- **Subscription Plan Enforcement**: Support for multiple user plans (free, paid, enterprise) with usage tracking (project count, team count) and plan upgrades/downgrades.
- **Admin Capabilities**: (Roadmap) Includes viewing user logs, suspending/restricting user accounts, audit log access, and a system metrics dashboard for super admins.

## Getting Started

Follow these steps to set up and run the Supametrics project locally.

### Installation

To get started, first clone the repository and install the dependencies:

```bash
git clone https://github.com/supametrics/supametrics.git
cd supametrics
npm install
```

### Environment Variables

Each application in the monorepo requires specific environment variables. Create `.env.local` files in the respective directories (`apps/dashboard/`, `apps/hono-api/`, `apps/go-server/`) based on their `.env.example` templates.

#### `apps/hono-api/.env.local`

```
DATABASE_URL=postgresql://user:password@host:port/database
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
BETTER_AUTH_SECRET=your-randomly-generated-secret
AUTH_SECRET=your-auth-secret
REDIS_URL=your-upstash-redis-url
TRUSTED_ORIGIN=http://localhost:3002
```

#### `apps/go-server/.env.local`

```
DB_URL=postgresql://user:password@host:port/database # Must be the same as hono-api
REDIS_URL=your-upstash-redis-url
AI_REPORT_PROMPT="Your AI prompt for report generation"
```

#### `apps/dashboard/.env.local`

```
NEXT_PUBLIC_API_URL=http://localhost:3004
```

### Database Setup

The Hono API uses Drizzle ORM for PostgreSQL. Run migrations to set up your database schema:

1.  Navigate to the `hono-api` directory:
    ```bash
    cd apps/hono-api
    ```
2.  Run Drizzle migrations (ensure your `DATABASE_URL` is set in `.env.local`):
    ```bash
    npx drizzle-kit push:pg
    ```
    (Note: If `drizzle-kit` is not globally installed, use `npx drizzle-kit` or install it with `npm install -g drizzle-kit`)

### Running Services

Supametrics is a monorepo managed with Turborepo. You can run all services concurrently or individually.

1.  **Start the Hono API (TypeScript Backend)**:

    ```bash
    npm run dev --filter=hono-api
    # Or navigate to apps/hono-api and run:
    # tsx watch src/index.ts
    ```

    The Hono API will run on `http://localhost:3004`.

2.  **Start the Go Server (Analytics Ingestion Backend)**:

    ```bash
    cd apps/go-server
    go run main.go
    ```

    The Go server will run on `http://localhost:3005`.

3.  **Start the Next.js Dashboard (Frontend)**:
    ```bash
    npm run dev --filter=dashboard
    # Or navigate to apps/dashboard and run:
    # next dev --port 3002 --turbopack
    ```
    The Next.js dashboard will be accessible at `http://localhost:3002`.

## Usage

Once all services are running, you can interact with the platform:

### Dashboard Access

Navigate to `http://localhost:3002` in your web browser. You can:

- **Sign Up / Log In**: Create a new account or log in using email/password or OAuth (if configured).
- **Manage Projects**: Create new projects, view existing ones, manage API keys, and invite team members.
- **View Analytics**: Explore overview statistics, project-specific analytics, and generated reports. The dashboard provides a visual representation of the data ingested by the Go analytics server.

### API Reference

Supametrics exposes two distinct API services: the main Hono API for core functionalities and the Go Fiber API for high-volume analytics ingestion.

#### Base URL

- **Hono API**: `http://localhost:3004/api/v1`
- **Go Fiber API**: `http://localhost:3005/api/v1`

#### Endpoints

---

#### Hono API (Core Services)

Go to /apps/hono-api for further details

#### Go Fiber API (Analytics Ingestion)

Go to /apps/go-server for further details

## Technologies Used

| Category         | Technology                                                            | Purpose                                                                 | Link                                                                    |
| :--------------- | :-------------------------------------------------------------------- | :---------------------------------------------------------------------- | :---------------------------------------------------------------------- |
| **Monorepo**     | [Turborepo](https://turbo.build/repo)                                 | High-performance build system for JavaScript and TypeScript monorepos   | [Turborepo.com](https://turbo.build/repo)                               |
|                  | [npm Workspaces](https://docs.npmjs.com/cli/v10/using-npm/workspaces) | Manages multiple packages within a single root project                  | [npmjs.com](https://docs.npmjs.com/cli/v10/using-npm/workspaces)        |
| **Frontend**     | [Next.js](https://nextjs.org/)                                        | React framework for building user interfaces                            | [Nextjs.org](https://nextjs.org/)                                       |
|                  | [React](https://react.dev/)                                           | JavaScript library for building interactive UIs                         | [React.dev](https://react.dev/)                                         |
|                  | [Tailwind CSS](https://tailwindcss.com/)                              | Utility-first CSS framework for rapid styling                           | [Tailwindcss.com](https://tailwindcss.com/)                             |
|                  | [shadcn/ui](https://ui.shadcn.com/)                                   | Reusable UI components based on Radix UI and Tailwind CSS               | [Ui.shadcn.com](https://ui.shadcn.com/)                                 |
|                  | [Framer Motion](https://www.framer.com/motion/)                       | Animation library for smooth UI transitions                             | [Framer.com](https://www.framer.com/motion/)                            |
|                  | [Lucide Icons](https://lucide.dev/)                                   | Modern icon set for the dashboard                                       | [Lucide.dev](https://lucide.dev/)                                       |
|                  | [Tabler Icons React](https://tabler-icons-react.vercel.app/)          | Another icon set used for specific components                           | [Tabler-icons-react.vercel.app](https://tabler-icons-react.vercel.app/) |
|                  | [Axios](https://axios-http.com/)                                      | Promise-based HTTP client for the browser and Node.js                   | [Axios-http.com](https://axios-http.com/)                               |
|                  | [Sonner](https://sonner.emilkowal.ski/)                               | Accessible toast library for notifications                              | [Sonner.emilkowal.ski](https://sonner.emilkowal.ski/)                   |
|                  | [next-themes](https://www.npmjs.com/package/next-themes)              | Manages theme switching (light/dark mode)                               | [npmjs.com](https://www.npmjs.com/package/next-themes)                  |
|                  | [Zustand](https://zustand-store.app/)                                 | Small, fast, and scalable bearbones state-management solution           | [Zustand-store.app](https://zustand-store.app/)                         |
|                  | [@tanstack/react-query](https://tanstack.com/query/latest)            | Data-fetching and state management for React                            | [Tanstack.com](https://tanstack.com/query/latest)                       |
| **Backend (TS)** | [Hono](https://hono.dev/)                                             | Web framework for building fast APIs with TypeScript                    | [Hono.dev](https://hono.dev/)                                           |
|                  | [Node.js](https://nodejs.org/en)                                      | JavaScript runtime environment                                          | [Nodejs.org](https://nodejs.org/en)                                     |
|                  | [Drizzle ORM](https://orm.drizzle.team/)                              | TypeScript ORM for PostgreSQL database interactions                     | [Orm.drizzle.team](https://orm.drizzle.team/)                           |
|                  | [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)            | JSON Web Token implementation for authentication                        | [npmjs.com](https://www.npmjs.com/package/jsonwebtoken)                 |
|                  | [bcrypt-ts](https://www.npmjs.com/package/bcrypt-ts)                  | TypeScript-first bcrypt implementation for password hashing             | [npmjs.com](https://www.npmjs.com/package/bcrypt-ts)                    |
|                  | [nanoid](https://www.npmjs.com/package/nanoid)                        | Tiny, secure, URL-friendly, unique string ID generator                  | [npmjs.com](https://www.npmjs.com/package/nanoid)                       |
|                  | [Zod](https://zod.dev/)                                               | TypeScript-first schema declaration and validation library              | [Zod.dev](https://zod.dev/)                                             |
| **Backend (Go)** | [Go](https://go.dev/)                                                 | Programming language for building efficient and reliable software       | [Go.dev](https://go.dev/)                                               |
|                  | [Fiber](https://gofiber.io/)                                          | Express.js-inspired web framework for Go                                | [Gofiber.io](https://gofiber.io/)                                       |
|                  | [github.com/google/uuid](https://pkg.go.dev/github.com/google/uuid)   | Package for UUID generation                                             | [pkg.go.dev](https://pkg.go.dev/github.com/google/uuid)                 |
|                  | [github.com/joho/godotenv](https://github.com/joho/godotenv)          | GoDotEnv for loading environment variables from `.env` files            | [Github.com](https://github.com/joho/godotenv)                          |
|                  | [github.com/lib/pq](https://github.com/lib/pq)                        | PostgreSQL driver for Go&apos;s database/sql package                    | [Github.com](https://github.com/lib/pq)                                 |
|                  | [github.com/redis/go-redis/v9](https://github.com/redis/go-redis/v9)  | Redis client for Go                                                     | [Github.com](https://github.com/redis/go-redis/v9)                      |
| **Database**     | [Neon PostgreSQL](https://neon.tech/)                                 | Serverless PostgreSQL database for persistent storage                   | [Neon.tech](https://neon.tech/)                                         |
|                  | [Redis](https://redis.io/)                                            | In-memory data store for caching, rate-limiting, and session management | [Redis.io](https://redis.io/)                                           |
| **Tooling**      | [TypeScript](https://www.typescriptlang.org/)                         | Superset of JavaScript for type safety                                  | [Typescriptlang.org](https://www.typescriptlang.org/)                   |
|                  | [ESLint](https://eslint.org/)                                         | Pluggable JavaScript linter                                             | [Eslint.org](https://eslint.org/)                                       |
|                  | [Prettier](https://prettier.io/)                                      | Opinionated code formatter                                              | [Prettier.io](https://prettier.io/)                                     |
|                  | [tsx](https://www.npmjs.com/package/tsx)                              | TypeScript execution environment for Node.js                            | [npmjs.com](https://www.npmjs.com/package/tsx)                          |

## Contributing

We welcome contributions to Supametrics! To contribute:

**Fork the repository** and clone it locally.
Create a new branch for your feature or bug fix: `git checkout -b feature/your-feature-name`.
Make your changes, ensuring they adhere to the project's coding standards.
Run tests and ensure all checks pass.
Commit your changes with a clear, descriptive message: `git commit -m "feat: Add new feature X"`.
Push your branch: `git push origin feature/your-feature-name`.
Open a pull request against the `main` branch, detailing your changes.

## License

MIT

## Author Info

Connect with the author of Supametrics:

- **X**: [@idolodev](https://x.com/idolodev)

---

[![Main Workflow](https://github.com/Supametrics/supametrics/actions/workflows/main.yml/badge.svg)](https://github.com/Supametrics/supametrics/actions/workflows/main.yml)
[![Top Language](https://img.shields.io/github/languages/top/supametrics/supametrics?color=blue)](https://github.com/Supametrics/supametrics)
[![Repo Size](https://img.shields.io/github/repo-size/supametrics/supametrics)](https://github.com/Supametrics/supametrics)
[![Contributors](https://img.shields.io/github/contributors/supametrics/supametrics)](https://github.com/Supametrics/supametrics/graphs/contributors)
[![Readme was generated by Readmit](https://img.shields.io/badge/Readme%20was%20generated%20by-Readmit-brightred)](https://readmit.vercel.app)
