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

**June 25, 2025 - App Marketplace & Plugin System**
- Built comprehensive app marketplace with 12+ demo apps (Spotify, YouTube, games, crypto trackers, tools)
- Created app installation system with user management and permissions
- Added AppWidget component for profile customization with live widgets
- Implemented app categories, ratings, search, and install counts
- Extended database with apps, user_apps, and app_reviews tables
- Integrated marketplace into navigation and profile pages
- Added demo apps: music players, weather widgets, games, social tools, crypto trackers

**June 25, 2025 - Collaborative Health Hub**
- Created comprehensive health information platform focused on independent sources
- Built discussion forums for vaccine injury support, alternative cancer treatments, COVID protocols
- Added alternative health resource directory (Burzynski, Gerson, Mexican clinics, FLCCC)
- Integrated real-time space weather monitoring for solar flares and geomagnetic activity
- Implemented emergency scanner with regional frequencies and live monitoring
- Added community ride sharing system for health-related travel
- Emphasized non-mainstream, non-pharmaceutical information sources

**June 25, 2025 - Cannabis & Plant Medicine Education**
- Added comprehensive cannabis medicine section with CBD/THC education
- Included responsible use guidelines, dosing protocols, and safety information
- Built psilocybin and psychedelic research database with clinical trial results
- Added microdosing guides and therapeutic benefits documentation
- Integrated legal status tracking and advocacy organization directory
- Featured harm reduction resources and set/setting guidelines
- Emphasized plant medicine as alternative to pharmaceutical dependency

**June 25, 2025 - Adult Content & Age Verification System**
- Implemented robust age verification system with multiple methods (birth date, ID upload, credit card)
- Created secure adult content areas with smooth access but protected from minors
- Added comprehensive content warnings and age gates for NSFW material
- Built adult content toggle with verification requirements
- Maintained complete free speech principles (only illegal content prohibited)
- Designed system to be safe, respectable, and comfortable for all users
- Ensured adult content remains completely separate from general platform areas

**June 25, 2025 - Human Trafficking Safety & Awareness Hub**
- Created comprehensive human trafficking awareness and education platform
- Integrated educational content from user's dedicated Rumble channels (Shatterlight, killchildtraffikers)
- Added content from independent creators (Conspiracy Files, Rotten Mango 2)
- Built global impact statistics and warning signs recognition guides
- Created emergency contact directory with 24/7 hotlines and crisis resources
- Included protection strategies and community safety protocols
- Featured video content from citizen journalists and independent researchers
- Added discussion forums for sharing educational content and safety tips
- Maintained sensitive content warnings while preserving educational value
- Emphasized independent sources avoiding mainstream media bias

**June 25, 2025 - Privacy & Security Center with Tor Browser & PGP**
- Built integrated Tor browser for anonymous .onion site access without external installation
- Created automatic PGP key generation and management system
- Implemented encrypted messaging with seamless key handling behind the scenes
- Added Tor circuit visualization and connection management
- Built onion bookmarks and secure browsing history
- Created PGP message encryption/decryption interface with copy/paste functionality
- Integrated secure chat with end-to-end encryption using PGP keys
- Added contact key management and verification system
- Maintained security best practices while simplifying user experience

**June 25, 2025 - Anonymous Email System with Temp Addresses & Self-Destruct**
- Built comprehensive .onion-based anonymous email client integrated into privacy center
- Created temporary email address generation with automatic expiration (24 hours)
- Implemented custom email alias system with random secure address generation
- Added self-destruct email functionality with configurable timers (1-168 hours)
- Integrated end-to-end encryption for all anonymous email communications
- Built email compose interface with alias selection and self-destruct options
- Created secure inbox with encryption indicators and expiration warnings
- Added email alias management with copy/paste functionality for easy sharing
- Routed all email traffic through Tor network for maximum anonymity

**June 25, 2025 - Civic Engagement & Community Unity Platform**
- Created dedicated civic engagement page emphasizing kindness, respect, and working together
- Built discussion forums for education (homeschool vs public), healthcare choices, community resources
- Integrated 211 helpline resource finder with regional adaptation capabilities
- Added automated congressional contact system with ZIP code representative lookup
- Implemented message preparation tool for contacting representatives regardless of party
- Emphasized core values: "It's okay to disagree, be wrong or right - treat each other with kindness"
- Built community guidelines focused on integrity, honesty, and finding common ground
- Added local resource finder for food, housing, healthcare, employment assistance
- Created civic guide promoting unity through understanding and shared values
- Expanded with comprehensive support group directory including AA meetings and recovery programs
- Added faith community finder covering Christian, Islamic, Jewish, Buddhist, Hindu, and LDS organizations
- Integrated crisis support resources (988, Crisis Text Line, SAMHSA) with specialized helplines
- Built specialized support section for veterans, domestic violence, LGBTQ+, and mental health resources

## User Preferences

```
Preferred communication style: Simple, everyday language.
```