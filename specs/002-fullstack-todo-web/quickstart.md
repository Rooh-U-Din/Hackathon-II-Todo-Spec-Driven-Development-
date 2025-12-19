# Quickstart: Full-Stack Todo Web Application (Phase II)

**Date**: 2025-12-18
**Branch**: `002-fullstack-todo-web`

This guide walks you through setting up and running the Phase II Todo web application locally.

## Prerequisites

- **Python 3.13+** (backend)
- **Node.js 18+** (frontend)
- **Git** (version control)
- **Neon Account** (PostgreSQL database - free tier available)

## 1. Clone and Setup

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd Todo

# Switch to the feature branch
git checkout 002-fullstack-todo-web
```

## 2. Database Setup (Neon PostgreSQL)

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project named `todo-app`
3. Copy the **pooled** connection string (with `-pooler` in the hostname)

Your connection string should look like:
```
postgresql://user:password@ep-cool-name-123456-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
```

## 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Configure Environment Variables

Create `backend/.env`:

```bash
# Database (use pooled connection string from Neon)
DATABASE_URL=postgresql://user:pass@ep-...-pooler.region.aws.neon.tech/db?sslmode=require

# Authentication (generate with: openssl rand -hex 32)
BETTER_AUTH_SECRET=your-32-character-secret-here

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000
```

### Run Database Migrations

```bash
# Initialize Alembic (first time only)
alembic init migrations

# Create and apply migrations
alembic revision --autogenerate -m "Initial schema"
alembic upgrade head
```

### Start Backend Server

```bash
# Development mode with hot reload
uvicorn app.main:app --reload --port 8000

# Server will be available at http://localhost:8000
# API docs at http://localhost:8000/docs
```

## 4. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install
```

### Configure Environment Variables

Create `frontend/.env.local`:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Authentication (same secret as backend)
BETTER_AUTH_SECRET=your-32-character-secret-here
```

### Start Frontend Development Server

```bash
# Development mode with hot reload
npm run dev

# Application will be available at http://localhost:3000
```

## 5. Verify Installation

### Test Backend API

```bash
# Check API health (should return {"status": "healthy"})
curl http://localhost:8000/health

# View API documentation
open http://localhost:8000/docs
```

### Test Full Application

1. Open http://localhost:3000 in your browser
2. Click "Register" to create a new account
3. Enter email and password (min 8 characters)
4. After registration, you'll be redirected to the task list
5. Create, view, update, and delete tasks

## 6. Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html
```

### Frontend Tests

```bash
cd frontend

# Run unit tests
npm test

# Run with coverage
npm test -- --coverage
```

## Common Issues

### Database Connection Errors

**Error**: `connection refused` or `timeout`

**Solution**:
- Verify your Neon database is active (not suspended)
- Ensure you're using the pooled connection string
- Check that `sslmode=require` is in the connection string

### CORS Errors

**Error**: `Access-Control-Allow-Origin` blocked

**Solution**:
- Verify `FRONTEND_URL` in backend `.env` matches your frontend URL exactly
- Restart the backend server after changing environment variables

### JWT Token Issues

**Error**: `Invalid token` on authenticated requests

**Solution**:
- Ensure `BETTER_AUTH_SECRET` is identical in both frontend and backend
- Check that the token hasn't expired (24-hour default)
- Clear browser storage and re-login

### Cold Start Latency

**Symptom**: First request after idle period is slow (1-2 seconds)

**Explanation**: Neon suspends idle databases after 5 minutes. First request wakes the database.

**Mitigation**: This is expected behavior on the free tier. Production deployments should use Pro tier for always-on compute.

## Project Structure

```
Todo/
├── src/                     # Phase I (DO NOT MODIFY)
├── backend/
│   ├── app/
│   │   ├── main.py         # FastAPI entry point
│   │   ├── config.py       # Environment config
│   │   ├── models/         # SQLModel entities
│   │   ├── api/            # Route handlers
│   │   ├── services/       # Business logic
│   │   └── db/             # Database session
│   ├── tests/
│   ├── requirements.txt
│   └── .env
└── frontend/
    ├── src/
    │   ├── app/            # Next.js App Router pages
    │   ├── components/     # React components
    │   ├── lib/            # API client, types
    │   └── hooks/          # Custom React hooks
    ├── tests/
    ├── package.json
    └── .env.local
```

## Next Steps

After completing the quickstart:

1. Review the [API documentation](http://localhost:8000/docs)
2. Run the test suite to verify everything works
3. Explore the codebase structure
4. Begin implementing features from `tasks.md` (when available)
