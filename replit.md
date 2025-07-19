# Fantasy Football League Application

## Overview

This is a full-stack TypeScript application for managing a fantasy football prediction league. Players make predictions on football match results and compete for points based on accuracy. The application features a modern React frontend with shadcn/ui components and an Express.js backend with PostgreSQL database using Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

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
The application implements an interface-based storage pattern (`IStorage`) with a memory-based implementation (`MemStorage`). This allows for easy testing and potential future database implementations while maintaining type safety.

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