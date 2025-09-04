# Project Structure

## Root Directory
```
├── src/                    # Frontend React application
├── backend/                # Express.js API server
├── supabase/              # Legacy Supabase migrations
├── docs/                  # Project documentation
├── public/                # Static assets
├── .kiro/                 # Kiro AI assistant configuration
└── prompt/                # Project prompts and specifications
```

## Frontend Structure (`src/`)
```
src/
├── components/            # React components organized by feature
│   ├── ui/               # shadcn/ui base components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard-specific components
│   ├── admin/            # Admin panel components
│   ├── attendance/       # Attendance tracking components
│   ├── expenses/         # Expense management components
│   ├── leave/            # Leave management components
│   ├── tasks/            # Task management components
│   └── time/             # Time tracking components
├── contexts/             # React context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
├── pages/                # Top-level page components
├── types/                # TypeScript type definitions
├── App.tsx               # Main application component
└── main.tsx              # Application entry point
```

## Backend Structure (`backend/`)
```
backend/
├── src/
│   ├── config/           # Database and app configuration
│   ├── controllers/      # Route handlers and business logic
│   ├── migrations/       # Database migration scripts
│   ├── routes/           # API route definitions
│   └── services/         # Business logic and data access
├── server.ts             # Express server entry point
├── .env                  # Environment variables
└── package.json          # Backend dependencies
```

## Configuration Files
- `components.json` - shadcn/ui configuration
- `tailwind.config.ts` - Tailwind CSS configuration with custom theme
- `vite.config.ts` - Vite build configuration with path aliases
- `tsconfig.json` - TypeScript configuration with project references
- `eslint.config.js` - ESLint rules and plugins

## Key Conventions
- Components are organized by feature/domain
- Use PascalCase for component files and directories
- Environment variables stored in `.env` files
- Database types defined in `src/types/database.ts`
- Authentication context provides user state globally
- API routes follow RESTful conventions