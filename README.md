# Supametrics: A Unified Analytics Platform 🚀

Supametrics is a robust, developer-focused analytics platform designed to provide insightful data with a minimal, premium interface. This monorepo project combines a powerful Next.js dashboard, a high-performance Hono (TypeScript) API for user and project management, and an efficient Go Fiber API for real-time analytics ingestion. It's built for precision, selfhosting and scalability, empowering developers to understand their applications' usage patterns.

## Features

- **Real-time Analytics Ingestion**: Efficiently logs and tracks analytics events via a dedicated Go Fiber API, secured by public API keys.
- **Comprehensive User & Project Management**: Manage users, create and organize projects, and oversee teams through a robust Hono (TypeScript) API.
- **Secure Authentication & Authorization**: Implements email/password authentication, supports OAuth (Google, GitHub), and includes session management with JWT and refresh tokens.
- **Role-Based Access Control (RBAC)**: Defines granular permissions for users (`user`, `admin`, `superadmin`), teams (`owner`, `member`, `viewer`), and projects (`admin`, `editor`, `viewer`).
- **API Key Management**: Generate and rotate public and secret API keys for secure data ingestion and authorized analytics retrieval.
- **Intelligent Rate Limiting & Quotas**: Protects against abuse and enforces plan-based usage limits using Redis for caching and rate-limiting.
- **Dynamic Reporting**: Generate and manage various reports on project analytics data through a dedicated API.
- **Modern Interactive Dashboard**: A sleek Next.js dashboard provides a visually appealing and highly responsive interface for data visualization, powered by Tailwind CSS, shadcn/ui, and Framer Motion.

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

| Category         | Technology                                                            | Purpose                                                                 |
| :--------------- | :-------------------------------------------------------------------- | :---------------------------------------------------------------------- |
| **Frontend**     | [Next.js](https://nextjs.org/)                                        | React framework for building user interfaces                            |
|                  | [React](https://react.dev/)                                           | JavaScript library for building interactive UIs                         |
|                  | [Tailwind CSS](https://tailwindcss.com/)                              | Utility-first CSS framework for rapid styling                           |
|                  | [shadcn/ui](https://ui.shadcn.com/)                                   | Reusable UI components based on Radix UI and Tailwind CSS               |
|                  | [Framer Motion](https://www.framer.com/motion/)                       | Animation library for smooth UI transitions                             |
|                  | [Lucide Icons](https://lucide.dev/)                                   | Modern icon set for the dashboard                                       |
|                  | [axios](https://axios-http.com/)                                      | Promise-based HTTP client for the browser and Node.js                   |
|                  | [sonner](https://sonner.emilkowal.ski/)                               | Accessible toast library for notifications                              |
| **Backend (TS)** | [Hono](https://hono.dev/)                                             | Web framework for building fast APIs with TypeScript                    |
|                  | [Node.js](https://nodejs.org/en)                                      | JavaScript runtime environment                                          |
|                  | [Drizzle ORM](https://orm.drizzle.team/)                              | TypeScript ORM for PostgreSQL database interactions                     |
|                  | [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)            | JSON Web Token implementation for authentication                        |
|                  | [better-auth](https://www.npmjs.com/package/better-auth)              | Authentication utilities                                                |
|                  | [nanoid](https://www.npmjs.com/package/nanoid)                        | Tiny, secure, URL-friendly, unique string ID generator                  |
|                  | [zod](https://zod.dev/)                                               | Schema declaration and validation library                               |
| **Backend (Go)** | [Go](https://go.dev/)                                                 | Programming language for building efficient and reliable software       |
|                  | [Fiber](https://gofiber.io/)                                          | Express.js-inspired web framework for Go                                |
|                  | [github.com/google/uuid](https://pkg.go.dev/github.com/google/uuid)   | Package for UUID generation                                             |
|                  | [github.com/joho/godotenv](https://github.com/joho/godotenv)          | GoDotEnv for loading environment variables from `.env` files            |
| **Database**     | [Neon PostgreSQL](https://neon.tech/)                                 | Serverless PostgreSQL database for persistent storage                   |
|                  | [Redis](https://redis.io/)                                            | In-memory data store for caching, rate-limiting, and session management |
| **Monorepo**     | [Turborepo](https://turbo.build/repo)                                 | High-performance build system for JavaScript and TypeScript monorepos   |
|                  | [npm Workspaces](https://docs.npmjs.com/cli/v10/using-npm/workspaces) | Manages multiple packages within a single root project                  |
| **Tooling**      | [TypeScript](https://www.typescriptlang.org/)                         | Superset of JavaScript for type safety                                  |
|                  | [ESLint](https://eslint.org/)                                         | Pluggable JavaScript linter                                             |
|                  | [Prettier](https://prettier.io/)                                      | Opinionated code formatter                                              |

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

[![Main Workflow](https://github.com/Supametrics/supametrics/actions/workflows/main.yml/badge.svg)](https://github.com/supamettrics/supametrics/actions/workflows/main.yml)
[![Top Language](https://img.shields.io/github/languages/top/supaetrics/supametrics?color=blue)](https://github.com/supaetrics/supametrics)
[![Repo Size](https://img.shields.io/github/repo-size/supaetrics/supametrics)](https://github.com/supaetrics/supametrics)
[![Contributors](https://img.shields.io/github/contributors/supaetrics/supametrics)](https://github.com/supaetrics/supametrics/graphs/contributors)
[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)
