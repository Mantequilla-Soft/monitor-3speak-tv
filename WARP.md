# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**3Speak Gateway Monitor & Aid** is a comprehensive monitoring and fallback system for the 3Speak video encoding infrastructure. The system has two main components:

1. **Gateway Monitor**: Real-time monitoring dashboard for job queues, encoder performance, and system health
2. **Gateway Aid Fallback System**: Automatic fallback mechanism that allows encoders to continue working when the legacy gateway is unavailable

## Quick Start Commands

### Development
```bash
# Start both frontend and backend in development mode
npm run dev

# Or start individually
npm run dev:server   # Backend only (port 3005)
npm run dev:client   # Frontend only (port 3000)
```

### Building
```bash
# Build both frontend and backend
npm run build

# Or build individually
npm run build:server
npm run build:client
```

### Testing
```bash
# Run all tests
npm test

# Or test individually
npm run test:server   # Backend tests
npm run test:client   # Frontend tests
```

### Linting
```bash
# Backend linting
cd backend && npm run lint        # Check for issues
cd backend && npm run lint:fix    # Auto-fix issues

# Frontend linting
cd frontend && npm run lint
cd frontend && npm run lint:fix
```

### Database Operations
```bash
# Initialize SQLite database schema
npm run db:init
```

### Docker
```bash
# Build Docker image
npm run docker:build

# Run with docker-compose
npm run docker:run
```

## Architecture Overview

### Tech Stack
- **Backend**: Node.js, TypeScript, Express, WebSockets
- **Frontend**: React, TypeScript, Vite, Material-UI, Recharts
- **Databases**: MongoDB (job storage), SQLite (encoder metadata)
- **Authentication**: HTTP Basic Auth (admin), DID-based auth (encoders)

### Core System Components

#### 1. Gateway Aid Fallback System
**Purpose**: Provides job claiming/processing APIs when the legacy gateway is unavailable.

**Key Files**:
- `backend/src/routes/aid.ts` - Aid API endpoints
- `backend/src/middleware/aid-auth.ts` - DID-based encoder authentication
- `backend/src/services/aid-timeout-monitor.ts` - Automatic job timeout handling

**API Endpoints** (all under `/aid/v1/`):
- `POST /list-jobs` - List available jobs (requires DID auth)
- `POST /claim-job` - Atomically claim a job (requires DID auth)
- `POST /update-job` - Update job progress (requires DID auth)
- `POST /complete-job` - Mark job as complete (requires DID auth)
- `GET /health` - Health check (no auth required)

**How It Works**:
1. Encoders authenticate via DID keys (checked against SQLite encoder registry)
2. Jobs are atomically claimed from MongoDB (status: pending → assigned)
3. Encoders must ping jobs every hour or they auto-release back to pending
4. Discord webhooks alert when Aid system is first activated
5. Timeout monitor runs every 5 minutes to release stale jobs

#### 2. Gateway Monitor Dashboard
**Purpose**: Real-time visibility into encoding infrastructure health and performance.

**Frontend Pages** (`frontend/src/pages/`):
- `Dashboard.tsx` - Gateway health, workload gauge, job counts
- `Jobs.tsx` - Available/Active/Completed job lists with auto-refresh
- `Encoders.tsx` - Encoder CRUD operations (protected by Basic Auth)
- `Analytics.tsx` - Charts, KPIs, encoder performance metrics

**Backend Routes** (`backend/src/routes/`):
- `jobs.ts` - Job listing and management
- `encoders.ts` - Encoder registry CRUD (mutations require Basic Auth)
- `statistics.ts` - Analytics, daily stats, gateway health

#### 3. Database Services

**MongoDB** (`backend/src/services/mongodb.ts`):
- Connects to 3Speak's production MongoDB database
- Manages job lifecycle: pending → assigned → running → completed/failed
- Provides atomic job claiming for Aid system
- Tracks Aid-specific job metadata (assigned_via_aid flag)

**SQLite** (`backend/src/services/sqlite.ts`):
- Local encoder registry (DID → human-readable name mapping)
- Encoder stats tracking
- Active encoder management
- Used for Aid system DID authorization

**Key Methods**:
- `claimJobForAid(jobId, encoderDid)` - Atomic job assignment
- `releaseTimedOutAidJobs()` - Auto-release stale jobs
- `updateJobProgressForAid()` - Progress tracking with heartbeat
- `isFirstAidServicedJob()` - Detects first Aid activation

#### 4. Real-time Updates
- **WebSocket Server** (`backend/src/services/websocket.ts`) - Port 3002 by default
- Broadcasts gateway health, job status, encoder status
- Frontend auto-subscribes to relevant channels

#### 5. Authentication & Security

**Admin Authentication** (`backend/src/utils/auth.ts`):
- HTTP Basic Auth for encoder mutations (Create/Update/Delete)
- Credentials: `ADMIN_USERNAME` and `ADMIN_PASSWORD` from `.env`
- Public endpoints: GET operations, encoder heartbeats

**Encoder Authentication** (`backend/src/middleware/aid-auth.ts`):
- DID-based authorization for Aid API endpoints
- Verifies encoder exists in SQLite and is active
- Attaches encoder info to request context

## Environment Configuration

### Required Variables (backend/.env)
```bash
# MongoDB (3Speak Production Database)
MONGODB_URI=mongodb://username:password@host:port/
DATABASE_NAME=spk-encoder-gateway
MONGODB_VERIFICATION_ENABLED=true

# Gateway API
GATEWAY_BASE_URL=https://encoder.3speak.tv/api/v0

# Admin Credentials (for encoder management UI)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password

# Local Database
SQLITE_DB_PATH=./data/gateway-monitor.db

# Ports
PORT=3005                    # Backend API
FRONTEND_PORT=3000           # Frontend dev server
WEBSOCKET_PORT=3002          # WebSocket server
```

### Optional Variables
```bash
LOG_LEVEL=info                          # winston log level
GATEWAY_POLL_INTERVAL=5000              # Gateway health check interval (ms)
ACTIVE_JOBS_POLL_INTERVAL=30000         # Job monitoring interval (ms)
STATISTICS_RETENTION_DAYS=30            # Stats retention period
CORS_ORIGINS=http://localhost:3000      # Allowed CORS origins (comma-separated)
```

## Key Development Patterns

### Adding New Aid Endpoints
1. Define request/response types in `backend/src/types/index.ts`
2. Add route handler in `backend/src/routes/aid.ts` with `validateEncoderDID` middleware
3. Implement MongoDB operations in `backend/src/services/mongodb.ts`
4. Update error codes in `AidErrorCode` enum if needed

### Adding New Frontend Pages
1. Create component in `frontend/src/pages/`
2. Add route in `frontend/src/App.tsx`
3. Use Material-UI components and theme from `frontend/src/theme.ts`
4. For protected pages, implement Basic Auth prompt logic

### Working with MongoDB Jobs
- All job status changes should update `last_pinged` timestamp
- Aid-claimed jobs set `assigned_via_aid: true` flag
- Use atomic operations for job claiming to prevent race conditions
- Status flow: `pending` → `assigned` → `running` → `completed`/`failed`

### Encoder Registry Management
- SQLite is single source of truth for encoder authorization
- DID keys format: `did:key:z6Mk...` (base58-encoded Ed25519 public key)
- Encoder names used for human-readable display in UI
- `is_active` flag controls Aid API access

## Testing & Debugging

### Backend Tests
- Framework: Jest + ts-jest
- Located in `backend/src/**/*.test.ts`
- Run: `cd backend && npm test`

### Frontend Tests
- Framework: Jest
- Located in `frontend/src/**/*.test.tsx`
- Run: `cd frontend && npm test`

### Manual Testing
- Test scripts in `tests/` directory
- Gateway health: `GET http://localhost:3005/health`
- Aid health: `GET http://localhost:3005/aid/v1/health`

## Common Issues & Solutions

### MongoDB Connection Fails at Startup
- Server starts anyway (non-blocking initialization)
- Check `MONGODB_URI` credentials and network access
- Monitor logs for connection timeout warnings

### Aid Jobs Not Auto-Releasing
- Verify `AidTimeoutMonitor` is running (logs: "✅ Gateway Aid timeout monitor started")
- Check timeout threshold: 1 hour since last ping
- Monitor runs every 5 minutes

### Frontend Port Conflicts
- Default ports: Backend 3005, Frontend 3000, WebSocket 3002
- Configure in `.env` file (see `.env.example`)
- Vite may auto-increment if port is busy

### Basic Auth Not Working for Encoder Management
- Verify `ADMIN_USERNAME` and `ADMIN_PASSWORD` set in `backend/.env`
- Clear browser credentials if cached incorrectly
- Check browser console for 401/403 errors

## Important Notes

### Job Timeout System
- Aid-claimed jobs auto-release after 1 hour without ping
- Prevents stuck jobs if encoder crashes/disconnects
- Timeout monitor logs releases and sends Discord alerts

### Gateway Aid Activation
- First Aid job claim triggers Discord webhook alert
- Indicates legacy gateway is down/unreachable
- Encoders continue working seamlessly via Aid system

### Database Performance
- MongoDB queries use indexes on `status`, `assigned_to`, `assigned_via_aid`
- SQLite is fast for encoder lookups (small dataset)
- Consider pagination for large job lists

### TypeScript Considerations
- Backend uses CommonJS (`module: "commonjs"` in tsconfig)
- Frontend uses ES modules (Vite requirement)
- Shared types defined in `backend/src/types/index.ts`

## Related Documentation
- `README.md` - User-facing documentation and setup guide
- `docs/project-setup.md` - Detailed architecture and configuration
- `.env.example` - Environment variable templates
