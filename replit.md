# SpaceLink - Social Platform Replit.md

## Overview

SpaceLink is a modern social platform inspired by early MySpace, built with React, Express, and PostgreSQL. It features user profiles, file sharing, messaging, and extensive customization options with themes and layouts. The application uses Replit Auth for authentication and provides a nostalgic yet modern social media experience.

## System Architecture

### Full-Stack TypeScript Application
- **Frontend**: React with Vite, TypeScript, and shadcn/ui components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Real-time**: WebSocket support for messaging
- **Styling**: Tailwind CSS with custom themes

### Monorepo Structure
The application follows a monorepo pattern with shared TypeScript types and schemas:
- `client/` - React frontend application
- `server/` - Express.js backend API
- `shared/` - Shared TypeScript types and Drizzle schemas

## Key Components

### Frontend Architecture
- **Component Library**: Built on shadcn/ui with Radix UI primitives
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite with React plugin and custom aliases

### Backend Architecture
- **API Layer**: RESTful Express.js server with TypeScript
- **Database Layer**: Drizzle ORM with Neon PostgreSQL connection
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple
- **File Uploads**: Multer middleware for file handling
- **WebSocket**: Real-time messaging support

### Database Design
- **Users**: Core user profiles with customization options
- **Sessions**: Replit Auth session storage
- **Invites**: Invite-only registration system
- **Connections**: User relationships and connections
- **Files**: File upload and sharing system
- **Posts**: Social media posts and interactions
- **Messages**: Real-time messaging system
- **Profile Views**: Analytics for profile visits

## Data Flow

### Authentication Flow
1. User accesses application through Replit Auth
2. OpenID Connect verification with Replit servers
3. Session creation and storage in PostgreSQL
4. JWT token management for API requests

### File Upload Flow
1. Client uploads files through drag-and-drop interface
2. Multer processes multipart form data
3. Files stored in uploads directory
4. Metadata stored in PostgreSQL with Drizzle

### Real-time Messaging
1. WebSocket connection established on user login
2. Message routing through WebSocket server
3. Database persistence with read receipts
4. Real-time updates to active conversations

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **express**: Web framework for Node.js
- **passport**: Authentication middleware
- **openid-client**: OpenID Connect client

### UI Dependencies
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Minimalist routing for React
- **react-hook-form**: Form state management
- **zod**: TypeScript schema validation

### Development Dependencies
- **vite**: Fast build tool and dev server
- **typescript**: Type checking and compilation
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Replit Deployment
- **Environment**: Replit with Node.js 20 and PostgreSQL 16
- **Build Process**: Vite builds client, esbuild bundles server
- **Development**: Hot reload with Vite middleware
- **Production**: Static file serving with Express

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string
- **SESSION_SECRET**: Session encryption key
- **REPL_ID**: Replit environment identifier
- **ISSUER_URL**: OpenID Connect issuer URL

### File Structure
```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared TypeScript schemas
├── uploads/         # File upload directory
└── dist/           # Production build output
```

## Recent Changes

**June 25, 2025 - Complete Platform Launch**
- Built full-stack MySpace-inspired social platform "SpaceLink"
- Implemented Replit OAuth authentication system
- Created PostgreSQL database with comprehensive schema
- Added extensive customization features (themes, layouts, custom CSS)
- Built file sharing system supporting up to 50GB files
- Implemented real-time WebSocket messaging
- Created invite-only registration system
- Added demo data with invite codes: WELCOME2025, SPACEJOIN, CREATIVE
- Platform fully operational with landing page, user profiles, file gallery, messaging

**June 25, 2025 - Media Integration System**
- Added comprehensive video platform integration (YouTube, Rumble, BitChute, X, Odysee, Brighteon)
- Created MediaEmbed component with auto-detection and embedded playback
- Built MediaShareDialog for easy content sharing with URL parsing
- Implemented CommentSection with real-time commenting on posts
- Extended database schema to support media metadata (platform, title, description, thumbnail)
- Added demo media posts showcasing different video platforms
- Enhanced home page with media posting and viewing capabilities

## User Preferences

```
Preferred communication style: Simple, everyday language.
```