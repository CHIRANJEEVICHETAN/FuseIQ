# EvolveSync Backend

A Node.js/Express backend with TypeScript, Prisma ORM, PostgreSQL (Neon), and Redis caching.

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route handlers and business logic
│   ├── middleware/       # Express middleware
│   ├── routes/           # API route definitions
│   ├── services/         # Business logic and data access
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   └── server.ts         # Express server entry point
├── dist/                 # Compiled JavaScript output
├── prisma/               # Prisma schema and migrations
├── .env                  # Environment variables (create from .env.example)
├── .env.example          # Environment variables template
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- npm

### Local Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development environment:**
   ```bash
   # Start PostgreSQL and Redis containers
   npm run docker:up

   # Start the development server (in another terminal)
   npm run dev

   # Or start everything together
   npm run dev:full
   ```

3. **Environment Configuration:**
   The `.env` file is already configured for local Docker development. For production, copy `.env.example` and update the values.

### Docker Services

The Docker Compose setup includes:
- **PostgreSQL** (port 5432) - Main database
- **Redis** (port 6379) - Caching and session storage  
- **pgAdmin** (port 8080) - PostgreSQL GUI (admin@evolve-sync.com / admin123)
- **Redis Commander** (port 8081) - Redis GUI

### Production Setup

For production deployment without Docker:

1. Set up PostgreSQL and Redis servers
2. Copy `.env.example` to `.env` and configure with production values
3. Build and start:
   ```bash
   npm run build
   npm start
   ```

### Available Scripts

#### Development
- `npm run dev` - Start development server with hot reloading
- `npm run dev:full` - Start Docker services and development server
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server

#### Docker Management
- `npm run docker:up` - Start all Docker services
- `npm run docker:down` - Stop all Docker services
- `npm run docker:logs` - View Docker service logs
- `npm run docker:clean` - Stop services and remove volumes

#### Database (Prisma)
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio GUI
- `npm run prisma:reset` - Reset database and run migrations

### Database Access

- **pgAdmin**: http://localhost:8080 (admin@evolve-sync.com / admin123)
- **Redis Commander**: http://localhost:8081
- **Prisma Studio**: Run `npm run prisma:studio`

### Troubleshooting

1. **Port conflicts**: Ensure ports 3001, 5432, 6379, 8080, 8081 are available
2. **Docker issues**: Run `npm run docker:clean` to reset containers
3. **Database connection**: Verify PostgreSQL container is running with `npm run docker:logs`

## Environment Variables

See `.env.example` for all required environment variables including:

- Database connection (PostgreSQL)
- Redis connection
- JWT secrets
- SMTP configuration
- File upload settings
- Security settings

## API Endpoints

The server provides a health check endpoint:
- `GET /health` - Server health status

Additional API endpoints will be added as development progresses.

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis
- **Authentication**: JWT with bcrypt
- **Validation**: Zod
- **Security**: Helmet, CORS, Rate Limiting