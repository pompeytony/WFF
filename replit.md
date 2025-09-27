# Williams Friends & Family League Application

## Overview

This is a full-stack TypeScript application for managing the Williams Friends & Family League, a football prediction competition. Players predict match results, earning points based on accuracy. The application features a React frontend with shadcn/ui components and an Express.js backend using PostgreSQL and Drizzle ORM. The project aims to provide an engaging and user-friendly platform for friends and family to compete in football predictions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query) for server state
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom football-themed color variables
- **Build Tool**: Vite

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Pattern**: RESTful API endpoints under `/api`
- **Session Management**: express-session with PostgreSQL store (connect-pg-simple)

### Core Features & Design Decisions
- **Prediction System**: Players submit predictions for match scores with joker multipliers.
- **Scoring System**: Awards 5 points for correct score (10 with joker) and 3 points for correct result (6 with joker). Players who don't submit receive the lowest score of participating players.
- **League Table**: Displays player rankings, weekly scores, and aggregated points.
- **Admin Functionality**:
    - Edit existing fixture results (with automatic score recalculation).
    - Edit existing fixtures (teams, kickoff times, gameweek assignments).
    - Gameweek management (activation, creation, duplicate prevention).
    - Player management (admin access, email reminders).
- **Authentication**: Replit authentication system with session management and admin roles.
- **UI/UX**: Responsive design with mobile optimization, modern UI components (shadcn/ui), and a royal blue, white, and red color scheme.
- **Team Badges**: Integrated Premier League team badges with custom SVG designs for specific teams and fallback icons.
- **Timezone Handling**: Consistent UK timezone display for fixtures.

### Project Structure
- `client/` - React frontend
- `server/` - Express.js backend
- `shared/` - Shared TypeScript types and database schema
- `migrations/` - Database migration files

### Key Components
- **Database Schema**: Defines `Players`, `Gameweeks`, `Fixtures`, `Predictions`, and `Weekly Scores`.
- **API Endpoints**: CRUD operations for players, gameweeks, fixtures, predictions, and weekly scores.
- **Frontend Pages**: Dashboard, League Table, Results, and Admin.

## External Dependencies

- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI components
- **wouter**: Lightweight routing
- **zod**: Runtime type validation
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store