# FoodTracker - Expiration Manager

## Overview

FoodTracker is a full-stack web application designed to help users track food expiration dates and reduce food waste. The application features a dark glass-themed UI with calendar views, countdown warnings, and smart notifications to alert users when food items are approaching their expiration dates. Users can manage food items across different categories (dairy, meat, vegetables, fruits, bakery, pantry, frozen), view items in both active and trash states, and receive timely notifications about expiring items.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Shadcn/ui component library built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with custom dark theme variables and glass morphism effects
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for REST API endpoints
- **Language**: TypeScript for end-to-end type safety
- **API Design**: RESTful endpoints for CRUD operations on food items
- **Storage Strategy**: Dual storage approach with in-memory storage (MemStorage) as default and database schema prepared for PostgreSQL via Drizzle ORM
- **Session Management**: Express sessions with PostgreSQL session store capability

### Data Storage Solutions
- **Current**: In-memory storage for development and testing
- **Prepared**: PostgreSQL database with Drizzle ORM for production deployment
- **Schema**: Single `food_items` table with fields for name, expiry date, category, notes, soft deletion, and timestamps
- **Migrations**: Drizzle Kit for database schema management and migrations

### Authentication and Authorization
- **Current State**: No authentication implemented (single-user application)
- **Session Storage**: Basic session management infrastructure in place for future multi-user support
- **Security**: Basic Express security middleware for request handling

### Key Features and Design Patterns
- **Soft Deletion**: Items are marked as deleted rather than permanently removed, allowing for trash/restore functionality
- **Real-time Updates**: Automatic refetching of data every minute to update expiration countdowns
- **Notification System**: Browser notification API integration with permission handling
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Component Composition**: Modular component architecture with reusable UI elements
- **Type Safety**: Shared schema validation between frontend and backend using Zod

## External Dependencies

### Core Runtime Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection for Neon cloud database
- **drizzle-orm**: Type-safe SQL query builder and ORM
- **drizzle-zod**: Integration between Drizzle and Zod for schema validation

### Frontend Dependencies
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Headless UI component primitives for accessibility
- **wouter**: Lightweight routing library
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Form validation resolvers
- **class-variance-authority**: Type-safe variant API for components
- **clsx**: Utility for conditional CSS classes
- **tailwindcss**: Utility-first CSS framework
- **date-fns**: Date manipulation and formatting

### Backend Dependencies
- **express**: Web application framework
- **connect-pg-simple**: PostgreSQL session store for Express
- **zod**: Schema validation library

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler for production builds
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Replit integration for development