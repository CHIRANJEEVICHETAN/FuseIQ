# Technology Stack

## Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with SWC plugin
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: TanStack React Query for server state
- **Forms**: React Hook Form with Zod validation
- **Routing**: React Router DOM
- **Theme**: next-themes for dark/light mode

## Backend
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with pg driver
- **Environment**: dotenv for configuration
- **Scheduling**: node-cron for background tasks

## Development Tools
- **Linting**: ESLint with TypeScript support
- **Type Checking**: TypeScript with strict configuration
- **Package Manager**: npm
- **Development**: Hot reload with Vite dev server

## Common Commands

### Frontend Development
```bash
npm run dev          # Start development server (port 8080)
npm run build        # Production build
npm run build:dev    # Development build
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Backend Development
```bash
cd backend
npm start            # Start backend server
```

## Path Aliases
- `@/*` maps to `./src/*` for clean imports
- Components use absolute imports from `@/components`
- Utils and lib functions from `@/lib`

## Code Style
- Use TypeScript strict mode disabled for flexibility
- Prefer function components with hooks
- Use Tailwind utility classes over custom CSS
- Follow shadcn/ui component patterns
- Environment variables in `.env` files