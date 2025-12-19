# Research: Full-Stack Todo Web Application (Phase II)

**Date**: 2025-12-18
**Branch**: `002-fullstack-todo-web`
**Status**: Complete

## 1. Better Auth with FastAPI/Next.js Integration

### Decision
Use Better Auth's JWT plugin for token-based authentication. Better Auth handles auth on the Next.js frontend and generates JWT tokens. FastAPI validates tokens via the shared `BETTER_AUTH_SECRET` environment variable.

### Rationale
Better Auth is primarily designed for Next.js with cookie-based sessions but lacks official FastAPI backend support. The JWT plugin approach bridges this gap by enabling token-based authentication that both Next.js and FastAPI can validate independently.

### Alternatives Considered
- **NextAuth with FastAPI**: Requires `fastapi-nextauth-jwt` library; more tightly coupled
- **Pure JWT without Better Auth**: Less feature-rich (no social logins, 2FA out-of-box)
- **OAuth2 Password flow**: More verbose; Better Auth abstracts this complexity

### Implementation Details
- **Token Format**: EdDSA (default) or ES256, RSA256, PS256 (configurable)
- **Secret Requirement**: Minimum 32 characters (`openssl rand -hex 32`)
- **Token Storage**: HTTP-only cookies for sessions; Authorization header for API calls
- **Expiration**: Configure reasonable expiration (24 hours recommended)

---

## 2. SQLModel with Neon PostgreSQL

### Decision
Use SQLModel with Neon's PgBouncer pooled connection strings and set `pool_pre_ping=True` for serverless reliability.

### Rationale
Serverless databases like Neon scale to zero after 5 minutes of inactivity, creating "cold starts" (500ms-2s wake time). Stale connections cause timeouts. The pooled connection string combined with `pool_pre_ping` ensures fresh connections.

### Alternatives Considered
- **Direct (non-pooled) connections**: Sufficient only for small apps; exhausts connection limit
- **Prisma ORM**: Higher-level abstraction; less control over connection tuning
- **SQLAlchemy without SQLModel**: More verbose; loses Pydantic integration

### Configuration Pattern
```python
from sqlmodel import create_engine, Session

DATABASE_URL = os.getenv("DATABASE_URL")  # Includes -pooler suffix

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,      # Tests connection before use
    echo=False,
    connect_args={"sslmode": "require"}
)

def get_session():
    with Session(engine) as session:
        yield session
```

### Connection String Format
```
postgresql://user:pass@ep-region-hash-pooler.region.aws.neon.tech/database?sslmode=require
```

Key components:
- `-pooler` suffix in endpoint ID for transaction-level pooling
- `sslmode=require` mandatory
- Up to 10,000 concurrent connections via pooler

### Pooler Limitations (Transaction Mode)
- Cannot use `SET`/`RESET` statements
- `LISTEN`/`NOTIFY` disabled
- Use unpooled connection for migrations

---

## 3. FastAPI + Next.js App Router Integration

### Decision
Use FastAPI dependency injection with CORS middleware for type-safe, testable API routes. Store JWT in Authorization header.

### Rationale
FastAPI's dependency injection (`Depends()`) provides automatic validation, scoped session management, and testability. Next.js App Router benefits from server components for sensitive auth operations.

### Alternatives Considered
- **GraphQL**: More complex than REST for CRUD; overkill for todo app
- **tRPC**: Excellent type safety but adds complexity
- **NextAuth for full auth**: Better Auth already handles frontend auth

### CORS Configuration
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://yourdomain.com"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*", "Authorization"],
)
```

### JWT Validation Pattern
```python
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, BETTER_AUTH_SECRET, algorithms=["HS256"])
        return payload
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

### API Route Design
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /api/auth/register | User registration | No |
| POST | /api/auth/login | User sign in | No |
| POST | /api/auth/logout | User sign out | Yes |
| POST | /api/tasks | Create task | Yes |
| GET | /api/tasks | List user's tasks | Yes |
| GET | /api/tasks/{id} | Get single task | Yes |
| PUT | /api/tasks/{id} | Update task | Yes |
| DELETE | /api/tasks/{id} | Delete task | Yes |

---

## 4. Neon Serverless PostgreSQL

### Decision
Use Neon's hobby (free) tier with pooled connections for development. Upgrade to pro tier for production if needed.

### Rationale
Hobby tier is feature-complete for Phase II development with autoscaling, branching, and 0.5 GB storage. Connection pooling enables serverless-friendly architecture.

### Alternatives Considered
- **Traditional RDS PostgreSQL**: Always running; higher cost
- **PlanetScale (MySQL)**: Good for scaling; less feature parity with PostgreSQL
- **Supabase**: Includes auth; more opinionated
- **SQLite**: No serverless scaling; not suitable for multi-user production

### Hobby Tier Specifications
- **Storage**: 0.5 GB (fixed)
- **Compute**: 1/4 vCPU, 1 GB RAM
- **Connections**: 10 direct; 10,000 via pooler
- **Auto-suspend**: After 5 minutes inactivity

### Cold Start Mitigation
- Use `pool_pre_ping=True` in SQLAlchemy
- Keep-alive queries if needed
- Accept ~500ms-2s first request latency after suspend

### Migration Strategy
```bash
# Use unpooled connection for migrations
DATABASE_URL_UNPOOLED="..." alembic upgrade head

# Production uses pooled connection
DATABASE_URL="...pooler..." uvicorn main:app
```

---

## Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js App Router (Frontend)                              │
│  - Better Auth for sign-up/sign-in                          │
│  - Server Components for protected pages                    │
│  - Authorization header for API calls                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                   CORS + JWT
                       │
┌──────────────────────▼──────────────────────────────────────┐
│  FastAPI (Backend)                                          │
│  - Dependency Injection for auth & DB session               │
│  - JWT Bearer token validation                              │
│  - CRUD endpoints for tasks                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
           SQLModel + SQLAlchemy
                       │
┌──────────────────────▼──────────────────────────────────────┐
│  Neon Serverless PostgreSQL                                 │
│  - PgBouncer pooled connections                             │
│  - pool_pre_ping=True for reliability                       │
│  - User/Task models with relationships                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Environment Variables

### Backend (.env)
```bash
DATABASE_URL=postgresql://user:pass@ep-...-pooler.region.aws.neon.tech/db?sslmode=require
BETTER_AUTH_SECRET=<32+ random hex chars>
FRONTEND_URL=https://your-next-app.vercel.app
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://your-fastapi-app.com
BETTER_AUTH_SECRET=<same as backend>
```

---

## Risk Summary

| Risk | Mitigation | Priority |
|------|-----------|----------|
| JWT secret compromise | Rotate periodically; use secrets manager | High |
| Neon cold starts | `pool_pre_ping=True`; monitor response times | Medium |
| Pooler transaction limitations | Use unpooled for migrations | Low |
| CORS misconfiguration | Test preflight; include Authorization header | Medium |
