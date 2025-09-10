# Supametrics Internal API 🚀

## Overview

This project is a high-performance backend API built with Hono and TypeScript, designed to provide comprehensive analytics, user, team, and project management. It leverages Drizzle ORM for type-safe interaction with a PostgreSQL database (Neon) and utilizes Redis for robust caching and rate limiting, ensuring efficient and scalable operations.

## Features

- **Authentication & Authorization**: Secure user authentication via email/password and OAuth (Google, GitHub) with robust JWT-based session management, refresh tokens, and role-based access control (RBAC).
- **User & Profile Management**: APIs for creating, managing, and updating user profiles, including managing subscription types, account status (active, suspended, read-only), and email verification.
- **Team Management**: Functionality to create and manage teams, including inviting members with specific roles (owner, member, viewer). Supports creating team-owned projects.
- **Project Management**: Comprehensive APIs for creating, listing, updating, and deleting projects, supporting both personal and team-based ownership. Projects can have defined types (web, mobile, backend).
- **API Key Management**: Secure generation, rotation, and revocation of API keys (public and secret) for each project to control external access to analytics data.
- **Real-time Analytics Collection**: Capture and aggregate various analytics events such as page views, visitor IDs, UTM parameters, browser/OS/device information, and event-specific data (e.g., `cta_clicked`).
- **Data Reporting**: Generate and retrieve custom reports based on collected analytics data for projects.
- **Rate Limiting**: Implements Redis-backed rate limiting to protect API endpoints from abuse and ensure service stability for different routes.
- **Scalable Data Storage**: Utilizes a PostgreSQL database (Neon Serverless) for reliable and scalable data persistence, managed through Drizzle ORM.
- **Efficient Caching**: Integrates Redis for high-speed data caching and transient storage for sessions and rate limiting.
- **Flexible Access Control**: Supports distinct roles for team members (owner, member, viewer) and project members (admin, editor, viewer), allowing granular permissions.

## Stacks / Technologies

| Technology                 | Purpose                                                 | Link                                                                                   |
| :------------------------- | :------------------------------------------------------ | :------------------------------------------------------------------------------------- |
| Hono                       | Fast, lightweight web framework                         | [Hono.dev](https://hono.dev/)                                                          |
| TypeScript                 | Statically typed superset of JavaScript                 | [TypeScriptLang.org](https://www.typescriptlang.org/)                                  |
| Drizzle ORM                | Type-safe Node.js ORM for SQL databases                 | [DrizzleORM.com](https://orm.drizzle.team/)                                            |
| PostgreSQL (Neon)          | Serverless, scalable relational database                | [Neon.tech](https://neon.tech/)                                                        |
| Redis (Upstash)            | In-memory data store for caching and rate limiting      | [Redis.io](https://redis.io/)                                                          |
| Better Auth                | Flexible and secure authentication library              | [BetterAuth.com](https://betterauth.com/) (example)                                    |
| Zod                        | TypeScript-first schema declaration and validation      | [Zod.dev](https://zod.dev/)                                                            |
| Nano ID                    | Tiny, secure, URL-friendly unique string ID generator   | [NPM Nano ID](https://www.npmjs.com/package/nanoid)                                    |
| `@hono/node-server`        | Node.js adapter for Hono applications                   | [NPM @hono/node-server](https://www.npmjs.com/package/@hono/node-server)               |
| `@neondatabase/serverless` | Serverless driver for Neon PostgreSQL                   | [NPM @neondatabase/serverless](https://www.npmjs.com/package/@neondatabase/serverless) |
| `bcrypt-ts`                | Password hashing library                                | [NPM bcrypt-ts](https://www.npmjs.com/package/bcrypt-ts)                               |
| `jsonwebtoken`             | JSON Web Token implementation                           | [NPM jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)                         |
| `dotenv`                   | Loads environment variables from a `.env` file          | [NPM dotenv](https://www.npmjs.com/package/dotenv)                                     |
| `crypto`                   | Node.js built-in module for cryptographic functionality | [Node.js Crypto](https://nodejs.org/api/crypto.html)                                   |

## Installation

### Prerequisites

Ensure you have Node.js (v18 or higher) and npm/yarn installed.

### Environment Variables

All required environment variables must be configured in a `.env` file in the project root. You can start by copying `.env.example` and filling in the values:

```bash
cp .env.example .env
```

| Variable               | Example                                         | Description                                                                                        |
| :--------------------- | :---------------------------------------------- | :------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`         | `postgresql://user:password@host:port/database` | Your PostgreSQL database connection string (e.g., from Neon).                                      |
| `GOOGLE_CLIENT_ID`     | `your-google-client-id`                         | Google OAuth 2.0 Client ID for authentication.                                                     |
| `GOOGLE_CLIENT_SECRET` | `your-google-client-secret`                     | Google OAuth 2.0 Client Secret for authentication.                                                 |
| `GITHUB_CLIENT_ID`     | `your-github-client-id`                         | GitHub OAuth App Client ID for authentication.                                                     |
| `GITHUB_CLIENT_SECRET` | `your-github-client-secret`                     | GitHub OAuth App Client Secret for authentication.                                                 |
| `BETTER_AUTH_SECRET`   | `your-randomly-generated-secret`                | Secret key used by `better-auth` for encrypting sessions. Generate with `openssl rand -base64 32`. |
| `AUTH_SECRET`          | `your-auth-secret`                              | Secret key for signing JWT access tokens.                                                          |
| `REFRESH_SECRET`       | `your-refresh-secret`                           | Secret key for signing JWT refresh tokens.                                                         |
| `REDIS_URL`            | `redis://user:password@host:port`               | Redis connection string (e.g., from Upstash).                                                      |
| `TRUSTED_ORIGIN`       | `http://localhost:3002`                         | Your frontend URL for CORS and OAuth redirects.                                                    |

### Database Migrations (Drizzle ORM)

After setting `DATABASE_URL`, ensure your database schema is up-to-date:

1.  **Generate Migration**:
    ```bash
    npx drizzle-kit generate:pg
    ```
2.  **Apply Migration**: (Requires a separate script to run the migration)
    - _Note_: The codebase implies migrations are handled via `drizzle-kit`, but an explicit migration script (e.g., `drizzle-kit push:pg`) is not shown. You might need to set one up or use a `drizzle-kit push:pg` command for direct schema synchronization if no migration files are manually applied.

### Local Development

1.  **Install Dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```
2.  **Run Development Server**:
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    This command uses `tsx` to watch for changes and restart the server automatically. The API will be available at `http://localhost:3004`.

### Production Build

1.  **Build Project**:
    ```bash
    npm run build
    # or
    yarn build
    ```
    This compiles the TypeScript code to JavaScript in the `dist/` directory.
2.  **Start Production Server**:
    ```bash
    npm run start
    # or
    yarn start
    ```
    This command runs the compiled application. The API will be available on the port configured in your environment variables (default: `3004`).

## Usage

Once the server is running, you can interact with the API using the documented endpoints. The base URL for all API endpoints is `http://localhost:3004/api/v1` (or your deployed domain).

Detailed API endpoints, request/response structures, and error codes are provided in the [API Documentation](#api-documentation) section of the main README. Authentication typically involves session cookies/tokens, which are handled by the `better-auth` library. For integrating analytics into your applications, use the generated project API keys for secure data submission.

## API Documentation

The existing `README.md` provides a comprehensive guide to all available API endpoints, including `GET /health`, `POST /auth/*` (for sign-up, sign-in, OAuth), `GET /overview`, `POST /projects/new`, `GET /projects`, `POST /projects/:id/rotate-key`, `DELETE /projects/:id`, `GET /projects/:id`, `POST /projects/:id/invite`, `PATCH /projects/:id/role`, `PATCH /projects/:id`, `GET /projects/:id/members`, `DELETE /projects/:id/leave`, `GET /:id/analytics`, `GET /:id/analytics/:eventName`, `GET /:id/reports`, `GET /teams`, and `POST /teams`. Please refer to the detailed descriptions above for specific request parameters, example responses, and error conditions for each endpoint.

## Contributing

We welcome contributions to the Supametrics API! If you're interested in improving the project, please follow these guidelines:

1.  **Fork the repository**: Start by forking the project to your GitHub account.
2.  **Clone the repository**: Clone your forked repository to your local machine.
3.  **Create a new branch**: Create a new branch for your feature or bug fix.
    ```bash
    git checkout -b feature/your-feature-name
    ```
4.  **Make your changes**: Implement your changes, following the existing code style and conventions.
5.  **Test your changes**: Ensure your changes work as expected and do not introduce regressions. Write new tests if necessary.
6.  **Commit your changes**: Write clear and concise commit messages.
    ```bash
    git commit -m "feat: Add new feature"
    ```
7.  **Push to your branch**: Push your local branch to your forked repository.
    ```bash
    git push origin feature/your-feature-name
    ```
8.  **Open a Pull Request**: Create a pull request to the `main` branch of the original repository. Provide a detailed description of your changes.

### Code Style

This project uses TypeScript and Hono. Please adhere to the existing patterns and practices.

## License

This project is licensed under the MIT License.

## Author Info

Connect with me:

- **Email**: [treasureuzoma650@gmail.com](mailto:treasureuzoma650@gmail.com)
- **X**: [@idolodev](https://twitter.com/idolodev)

[![Readme was generated by Readmit](https://img.shields.io/badge/Readme%20was%20generated%20by-Readmit-brightred)](https://readmit.vercel.app)
