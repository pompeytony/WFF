# Williams Friends & Family League Application

## Overview

This is a full-stack TypeScript application for managing the Williams Friends & Family League - a football prediction competition. Players make predictions on football match results and compete for points based on accuracy. The application features a modern React frontend with shadcn/ui components and an Express.js backend with PostgreSQL database using Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**January 30, 2025**
- **MOBILE OPTIMIZATION:** Implemented responsive dropdown navigation menu for mobile devices
- Fixed off-screen menu issue with hamburger menu that drops down properly on mobile
- Added league branding display on mobile navigation header
- **LOGIN SYSTEM ENHANCEMENT:** Created two-stage login flow with dropdown player selection
- Added public players endpoint for login dropdown without requiring authentication
- Enhanced "I'm a New Player" button visibility with gold styling and user-plus icon
- **GAMEWEEK MANAGEMENT FIX:** Fixed critical gameweek activation issue
- Resolved dashboard not updating when new gameweeks are activated
- Ensured only one gameweek can be active at a time with proper deactivation logic
- **PREDICTION FORM FIX:** Fixed locked prediction inputs when gameweek has no deadline
- Corrected null deadline handling to prevent form lockout
- Predictions now work properly for gameweeks without set deadlines

**January 20, 2025**
- **MAJOR:** Implemented complete Replit authentication system for user login
- Added session management with PostgreSQL store for user authentication
- Created beautiful landing page for logged-out users with sign-in functionality
- Updated database schema to support user accounts with session storage
- Implemented admin player management system with isAdmin field and edit functionality
- Added user profile display in header with logout functionality
- Authentication routes: /api/login, /api/logout, /api/auth/user
- Applied deployment initialization fixes to resolve production startup issues
- Enhanced server startup with comprehensive error handling and try-catch blocks
- Added database connection testing before seeding to prevent initialization failures
- **SECURITY FIX:** Fixed major security vulnerability - player management now requires admin authentication
- Cleared all old demo match data from database for clean start
- Updated navigation to hide admin-only links for non-admin users
- Applied royal blue and white color scheme with red trimmings throughout application
- Fixed all text visibility issues on landing page
- **FUNCTIONALITY RESTORED:** Fixed "Add New Fixtures" button with complete creation forms
- Added "mixed" as third gameweek type option alongside Premier League and International
- Fixed gameweek creation validation by making deadline field optional
- Fixed fixture creation validation with proper string-to-Date transformation
- Both admin forms now fully functional with proper error handling and debugging

**January 19, 2025**
- Successfully migrated from in-memory storage to PostgreSQL database
- Added Drizzle ORM with proper schema relations
- Implemented automatic database seeding on startup
- All fantasy football data now persists between sessions

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom football-themed color variables
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Pattern**: RESTful API endpoints under `/api` namespace
- **Session Management**: express-session with PostgreSQL store (connect-pg-simple)

### Project Structure
- `client/` - React frontend application
- `server/` - Express.js backend application
- `shared/` - Shared TypeScript types and database schema
- `migrations/` - Database migration files

## Key Components

### Database Schema (shared/schema.ts)
- **Players**: User accounts with name and email
- **Gameweeks**: Competition periods (Premier League or International)
- **Fixtures**: Individual football matches with teams, kickoff times, and results
- **Predictions**: Player predictions for match scores with joker multipliers
- **Weekly Scores**: Aggregated points per player per gameweek

### API Endpoints (server/routes.ts)
- Players: GET/POST `/api/players`
- Gameweeks: GET `/api/gameweeks`, GET `/api/gameweeks/active`
- Fixtures: GET `/api/fixtures` with gameweek filtering
- Predictions: Full CRUD operations with points calculation
- Weekly Scores: GET with gameweek filtering

### Frontend Pages
- **Dashboard**: Main prediction form and player stats
- **League Table**: Rankings and weekly scores
- **Results**: Historical match results and predictions
- **Admin**: Match result entry and points calculation

### Data Storage Strategy
The application implements an interface-based storage pattern (`IStorage`) with a PostgreSQL database implementation (`DatabaseStorage`). The system uses Drizzle ORM for type-safe database operations and includes automatic database seeding on startup. The previous memory-based implementation (`MemStorage`) is maintained for reference and testing purposes.

## Data Flow

1. **Prediction Submission**: Users submit predictions through the frontend form
2. **Real-time Updates**: TanStack Query manages cache invalidation and refetching
3. **Points Calculation**: Automatic calculation when match results are entered
4. **League Updates**: Weekly scores are aggregated and rankings updated

### Scoring System
- Correct score: 5 points (10 with joker)
- Correct result (win/draw/loss): 3 points (6 with joker)
- Incorrect prediction: 0 points

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI components
- **wouter**: Lightweight routing
- **zod**: Runtime type validation

### Development Dependencies
- **Vite**: Build tool and dev server
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **esbuild**: Server bundling for production

## Deployment Strategy

### Development
- Vite dev server for frontend with HMR
- tsx for TypeScript execution in development
- Integrated development setup with proxy configuration

### Production Build
- Frontend: Vite build to `dist/public`
- Backend: esbuild bundle to `dist/index.js`
- Single-command deployment with `npm run build`

### Environment Configuration
- Database URL via `DATABASE_URL` environment variable
- Drizzle configuration for PostgreSQL dialect
- Vite configuration with path aliases and asset handling

### Database Management
- Drizzle Kit for schema migrations
- Push schema changes with `npm run db:push`
- Type-safe schema generation with drizzle-zod

The application is designed for easy deployment on platforms like Replit, with integrated development tools and a streamlined build process.