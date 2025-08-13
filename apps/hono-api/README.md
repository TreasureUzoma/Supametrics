# Supametrics API 🚀

## Overview

This project is a high-performance backend API built with Hono and TypeScript, designed to provide comprehensive analytics, user, team, and project management. It leverages Drizzle ORM for type-safe interaction with a PostgreSQL database (Neon) and utilizes Redis for robust caching and rate limiting, ensuring efficient and scalable operations.

## Features

- **Authentication & Authorization**: Secure user authentication via email/password and OAuth (Google, GitHub) with robust session management and role-based access control (RBAC).
- **User & Profile Management**: APIs for creating, managing, and updating user profiles, including subscription types and email verification status.
- **Team Management**: Functionality to create and manage teams, including inviting members with specific roles (owner, member, viewer).
- **Project Management**: Comprehensive APIs for creating, listing, updating, and deleting projects, supporting both personal and team-based ownership.
- **API Key Management**: Secure generation, rotation, and revocation of API keys for each project to control external access.
- **Real-time Analytics Collection**: Capture and aggregate various analytics events (page views, visitor IDs, UTM parameters, device info) for projects.
- **Data Reporting**: Generate and retrieve custom reports based on collected analytics data.
- **Rate Limiting**: Implements Redis-backed rate limiting to protect API endpoints from abuse and ensure service stability.
- **Scalable Data Storage**: Utilizes a PostgreSQL database (Neon Serverless) for reliable and scalable data persistence.
- **Efficient Caching**: Integrates Redis for high-speed data caching and transient storage for sessions and rate limiting.

## Getting Started

### Environment Variables

All required environment variables must be configured in a `.env` file in the project root:

| Variable               | Example                                         | Description                                                                                        |
| :--------------------- | :---------------------------------------------- | :------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`         | `postgresql://user:password@host:port/database` | Your PostgreSQL database connection string (e.g., from Neon).                                      |
| `GOOGLE_CLIENT_ID`     | `your-google-client-id`                         | Google OAuth 2.0 Client ID for authentication.                                                     |
| `GOOGLE_CLIENT_SECRET` | `your-google-client-secret`                     | Google OAuth 2.0 Client Secret for authentication.                                                 |
| `GITHUB_CLIENT_ID`     | `your-github-client-id`                         | GitHub OAuth App Client ID for authentication.                                                     |
| `GITHUB_CLIENT_SECRET` | `your-github-client-secret`                     | GitHub OAuth App Client Secret for authentication.                                                 |
| `BETTER_AUTH_SECRET`   | `your-randomly-generated-secret`                | Secret key used by `better-auth` for encrypting sessions. Generate with `openssl rand -base64 32`. |
| `AUTH_SECRET`          | `your-auth-secret`                              | General authentication secret.                                                                     |
| `REDIS_URL`            | `redis://user:password@host:port`               | Redis connection string (e.g., from Upstash).                                                      |

## API Documentation

### Base URL

The base URL for all API endpoints is `http://localhost:3004/api/v1` (or your deployed domain).

### Endpoints

#### GET /health

Checks the health of the API server.
**Request**:
No payload.
**Response**:

```json
{
  "message": "Server is healthy!"
}
```

**Errors**:

- `429 Too Many Requests`: If the rate limit (5 requests per minute) is exceeded.

#### POST /auth/\*

Handles various authentication flows (e.g., sign-up, login, OAuth callbacks).
**Request**:
Payload structure varies depending on the specific authentication sub-path (e.g., email/password, OAuth redirect parameters). Refer to `better-auth` documentation for specific sub-routes and their payloads.
**Response**:
Varies based on authentication flow (e.g., session tokens, user information on success).
**Errors**:

- `400 Bad Request`: Invalid input or authentication attempt.
- `401 Unauthorized`: Authentication failed (e.g., wrong credentials).

#### GET /overview

Retrieves an overview of the user's projects and related analytics.
**Request**:
Query Parameters:

- `teamId` (optional, string): Filter projects by a specific team ID.
- `personal` (optional, boolean): Set to `true` to retrieve only personal projects.
  **Response**:

```json
{
  "totalProjects": 5,
  "totalReports": 12,
  "totalVisitors": 1500,
  "totalVisitorsThisWeek": {
    "count": 250,
    "change": "+15.2%"
  }
}
```

**Errors**:

- `401 Unauthorized`: User is not authenticated.

#### POST /projects/new

Creates a new project.
**Request**:

```json
{
  "name": "My New Project",
  "description": "A description for my project.",
  "teamId": "optional-team-uuid"
}
```

**Response**:

```json
{
  "success": true,
  "project": {
    "id": 123,
    "uuid": "project-uuid-123",
    "userId": "user-uuid-123",
    "teamId": null,
    "name": "My New Project",
    "slug": "my-new-project",
    "description": "A description for my project.",
    "createdAt": "2024-07-20T10:00:00.000Z",
    "updatedAt": "2024-07-20T10:00:00.000Z"
  }
}
```

**Errors**:

- `400 Bad Request`: Invalid input (e.g., missing name).
- `401 Unauthorized`: User is not authenticated.
- `403 Forbidden`: User's plan limits exceeded (e.g., free plan project limit).
- `404 Not Found`: Team not found if `teamId` is provided.

#### GET /projects

Retrieves a list of projects the authenticated user has access to.
**Request**:
Query Parameters:

- `page` (optional, integer): The page number for pagination (default: 1).
- `limit` (optional, integer): The number of items per page (default: 20, max: 100).
- `search` (optional, string): Filter projects by name.
- `type` (optional, string): Filter by `personal` or `team` projects.
  **Response**:

```json
{
  "success": true,
  "projects": [
    {
      "id": 1,
      "uuid": "project-uuid-abc",
      "name": "Personal Blog",
      "slug": "personal-blog",
      "description": "Analytics for my personal blog.",
      "userId": "user-uuid-123",
      "teamId": null,
      "createdAt": "2023-01-15T08:00:00.000Z",
      "updatedAt": "2023-07-20T11:30:00.000Z",
      "role": "owner",
      "analytics": {
        "totalVisitors": 500,
        "uniqueVisitors": 120,
        "totalVisitsChange": "+10.5%",
        "uniqueVisitorsChange": "+5.1%"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

**Errors**:

- `401 Unauthorized`: User is not authenticated.

#### POST /projects/:id/rotate-key

Rotates the API keys for a specific project.
**Request**:
No payload.
**Response**:

```json
{
  "success": true,
  "apiKey": {
    "publicKey": "new-public-key",
    "secretKey": "new-secret-key"
  }
}
```

**Errors**:

- `401 Unauthorized`: User is not authenticated.
- `401 Unauthorized`: Project is missing or does not exist.
- `403 Forbidden`: User does not have admin privileges for the project.

#### DELETE /projects/:id

Deletes a project.
**Request**:
No payload.
**Response**:

```json
{
  "success": true
}
```

**Errors**:

- `401 Unauthorized`: User is not authenticated.
- `401 Unauthorized`: Project cannot be null.
- `403 Forbidden`: User is not the project owner or an admin for team-owned projects.

#### GET /projects/:id

Retrieves details for a specific project, including API keys if the user has appropriate permissions.
**Request**:
No payload.
**Response**:

```json
{
  "success": true,
  "project": {
    "id": 1,
    "uuid": "project-uuid-abc",
    "name": "Personal Blog",
    "slug": "personal-blog",
    "description": "Analytics for my personal blog.",
    "userId": "user-uuid-123",
    "teamId": null,
    "createdAt": "2023-01-15T08:00:00.000Z",
    "updatedAt": "2023-07-20T11:30:00.000Z"
  },
  "role": "admin",
  "apiKeys": [
    {
      "publicKey": "pk_1234567890abcdef",
      "secretKey": "sk_abcdef1234567890",
      "revoked": false
    }
  ]
}
```

**Errors**:

- `401 Unauthorized`: User is not authenticated.
- `403 Forbidden`: Project cannot be null or user is not a member of the project.

#### POST /projects/:id/invite

Invites a user to a project (internal invite management, not email sending).
**Request**:

```json
{
  "email": "invitee@example.com",
  "role": "editor"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Invite to invitee@example.com with role editor created (not sent for now)"
}
```

**Errors**:

- `400 Bad Request`: Invalid role provided.
- `401 Unauthorized`: User is not authenticated.
- `403 Forbidden`: Only project admins can send invites.

#### PATCH /projects/:id/role

Updates a project member's role.
**Request**:

```json
{
  "targetUserId": "target-user-uuid",
  "newRole": "viewer"
}
```

**Response**:

```json
{
  "success": true
}
```

**Errors**:

- `400 Bad Request`: Invalid role provided.
- `401 Unauthorized`: User is not authenticated.
- `403 Forbidden`: Only project admins can update member roles.

#### PATCH /projects/:id

Updates project details such as name and description.
**Request**:

```json
{
  "name": "Updated Project Name",
  "description": "New description for the project."
}
```

**Response**:

```json
{
  "success": true
}
```

**Errors**:

- `401 Unauthorized`: User is not authenticated.
- `403 Forbidden`: Project cannot be null or only project admins/owners can update the project.

#### GET /projects/:id/members

Retrieves a list of members associated with a project.
**Request**:
No payload.
**Response**:

```json
{
  "success": true,
  "members": [
    {
      "userId": "user-uuid-1",
      "role": "admin"
    },
    {
      "userId": "user-uuid-2",
      "role": "editor"
    }
  ]
}
```

**Errors**:

- `401 Unauthorized`: User is not authenticated.
- `403 Forbidden`: Project cannot be null or user is not part of the project.

#### DELETE /projects/:id/leave

Allows a user to leave a project.
**Request**:
No payload.
**Response**:

```json
{
  "success": true
}
```

**Errors**:

- `401 Unauthorized`: User is not authenticated.
- `400 Bad Request`: User is not a member of the project.
- `403 Forbidden`: Admins cannot leave the project (must transfer ownership or delete the project).

#### GET /:id/analytics

Retrieves general analytics data for a specific project.
**Request**:
Query Parameters:

- `filter` (optional, string): Defines the time range for analytics. Allowed values: `10secs`, `5mins`, `today`, `yesterday`, `thisweek`, `thismonth`, `thisyear`, `last3years` (default: `today`).
  **Response**:

```json
{
  "success": true,
  "filter": "today",
  "osSummary": [
    { "count": 120, "osName": "Windows" },
    { "count": 80, "osName": "macOS" }
  ],
  "deviceSummary": [
    { "count": 150, "deviceType": "Desktop" },
    { "count": 50, "deviceType": "Mobile" }
  ],
  "browserSummary": [
    { "count": 100, "browserName": "Chrome" },
    { "count": 70, "browserName": "Firefox" }
  ],
  "topPaths": [
    { "count": 60, "pathname": "/home" },
    { "count": 40, "pathname": "/about" }
  ],
  "topReferrers": [
    { "count": 25, "referrer": "google.com" },
    { "count": 15, "referrer": "facebook.com" }
  ],
  "topHostnames": [{ "count": 200, "hostname": "example.com" }],
  "topUtmSources": [{ "count": 30, "utmSource": "newsletter" }],
  "totalVisits": 200,
  "uniqueVisitors": 150,
  "totalVisitsChange": "+10.0%",
  "uniqueVisitorsChange": "+5.0%",
  "frequency": [
    {
      "time": "2024-07-20T00:00:00.000Z",
      "totalVisits": 10,
      "uniqueVisitors": 8
    }
  ]
}
```

**Errors**:

- `400 Bad Request`: Invalid filter provided.
- `401 Unauthorized`: User is not authenticated.
- `403 Forbidden`: User does not have membership to the project.

#### GET /:id/analytics/:eventName

Retrieves analytics data filtered by a specific event name for a project.
**Request**:
Path Parameter:

- `eventName` (string): The name of the event to filter by.
  Query Parameters:
- `filter` (optional, string): Defines the time range for analytics. Allowed values: `10secs`, `5mins`, `today`, `yesterday`, `thisweek`, `thismonth`, `thisyear`, `last3years` (default: `today`).
  **Response**:
  (Same structure as `GET /:id/analytics`, but filtered by `eventName`)
  **Errors**:
- `400 Bad Request`: Invalid filter provided.
- `401 Unauthorized`: User is not authenticated.
- `403 Forbidden`: User does not have membership to the project.

#### GET /:id/reports

Retrieves a list of reports for a specific project.
**Request**:
Query Parameters:

- `page` (optional, integer): The page number for pagination (default: 1).
- `limit` (optional, integer): The number of items per page (default: 20).
  **Response**:

```json
{
  "success": true,
  "reports": [
    {
      "id": 1,
      "uuid": "report-uuid-1",
      "projectId": "project-uuid-abc",
      "name": "Monthly Traffic Report",
      "description": "Overview of website traffic for the last month.",
      "type": "traffic_summary",
      "data": {},
      "created_by": "user-uuid-123",
      "created_at": "2024-06-01T10:00:00.000Z",
      "updated_at": "2024-06-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

**Errors**:

- `401 Unauthorized`: User is not authenticated.
- `403 Forbidden`: User does not have membership to the project.

#### GET /teams

Retrieves a list of all teams the authenticated user is a member of.
**Request**:
No payload.
**Response**:

```json
{
  "success": true,
  "teams": [
    {
      "id": 1,
      "uuid": "team-uuid-1",
      "name": "Marketing Team",
      "slug": "marketing-team",
      "ownerId": "owner-user-uuid",
      "createdAt": "2023-03-10T14:00:00.000Z",
      "role": "member"
    }
  ]
}
```

**Errors**:

- `401 Unauthorized`: User is not authenticated.

#### POST /teams

Creates a new team.
**Request**:

```json
{
  "name": "New Team Name"
}
```

**Response**:

```json
{
  "success": true,
  "team": {
    "id": 2,
    "uuid": "new-team-uuid",
    "name": "New Team Name",
    "slug": "new-team-name",
    "ownerId": "current-user-uuid",
    "createdAt": "2024-07-20T15:00:00.000Z"
  }
}
```

**Errors**:

- `401 Unauthorized`: User is not authenticated.
- `403 Forbidden`: User's subscription type does not allow team creation (e.g., free plan).

---

## Usage

To start the Supametrics API server:

1.  **Set up Environment Variables**: Populate your `.env` file with the required variables as detailed in the "Environment Variables" section.
2.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    This command uses `tsx` to watch for changes and restart the server automatically.
3.  **Build and Start for Production**:
    ```bash
    npm run build
    npm run start
    ```
    `npm run build` compiles the TypeScript code to JavaScript, and `npm run start` runs the compiled application.

The API will be available at `http://localhost:3004`. Use the documented endpoints with appropriate authentication (session cookies/tokens handled by `better-auth`) to interact with the system. For integrating analytics into your applications, use the generated project API keys for secure data submission.

## Technologies Used

| Technology        | Purpose                                               | Link                                                  |
| :---------------- | :---------------------------------------------------- | :---------------------------------------------------- |
| Hono              | Fast, lightweight web framework                       | [Hono.dev](https://hono.dev/)                         |
| TypeScript        | Statically typed superset of JavaScript               | [TypeScriptLang.org](https://www.typescriptlang.org/) |
| Drizzle ORM       | Type-safe Node.js ORM for SQL databases               | [DrizzleORM.com](https://orm.drizzle.team/)           |
| PostgreSQL (Neon) | Serverless, scalable relational database              | [Neon.tech](https://neon.tech/)                       |
| Redis (Upstash)   | In-memory data store for caching and rate limiting    | [Redis.io](https://redis.io/)                         |
| Better Auth       | Flexible and secure authentication library            | [BetterAuth.com](https://betterauth.com/) (example)   |
| Zod               | TypeScript-first schema declaration and validation    | [Zod.dev](https://zod.dev/)                           |
| Nano ID           | Tiny, secure, URL-friendly unique string ID generator | [NPM Nano ID](https://www.npmjs.com/package/nanoid)   |

## License

This project is licensed under the MIT License.

## Author Info

Connect with me:

- **Email**: [treasureuzoma650@gmail.com](mailto:treasureuzoma650@gmail.com)
- **X**: [@idolodev](https://twitter.com/idolodev)

---

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)
