# Architecture

## Overview

```
React + Vite Frontend  --(Axios/REST, JWT bearer)-->  FastAPI Backend  --(SQLAlchemy)-->  MySQL
                                                              |
                                                              v
                                                        AI Service (app/ai)
                                                              |
                                                              v
                                                   LLM Provider (Anthropic/OpenAI)
```

The frontend and backend are fully separate deployables. The frontend never
talks to MySQL or the LLM directly — every request goes through the FastAPI
REST API, which is the single source of truth for authorization and data
access.

## Backend layout

```
backend/app/
  core/       # config, DB session, security (JWT/bcrypt), auth dependencies
  models/     # SQLAlchemy ORM models — one source of truth for the schema
  schemas/    # Pydantic request/response models (validation + serialization)
  services/   # business logic: auth, catalog, borrowing, fines, reports, feedback
  ai/         # the AI assistant: tool functions, tool schemas, provider adapter, orchestrator
  api/routes/ # FastAPI routers — thin, delegate to services
  main.py     # app assembly: middleware, routers, global error handlers
```

Each layer has one job:
- **models** define the schema and relationships.
- **schemas** validate input and shape output — the API never returns raw
  ORM objects.
- **services** hold all business rules (issuing/returning books, fine
  calculation, member limits) so routes stay thin and rules aren't
  duplicated between the API and the AI tool layer.
- **api/routes** wire HTTP verbs/paths to services and enforce
  authentication/authorization via `app/core/deps.py`.

## AI Assistant architecture

```
User message
   |
   v
POST /api/chat  (JWT required)
   |
   v
app/ai/assistant.ask_assistant(member_id from JWT, message)
   |
   v
LLM provider (Anthropic/OpenAI) with a fixed tool list (app/ai/tool_schemas.py)
   |
   v
Model requests a tool call (e.g. search_books, get_my_fines)
   |
   v
app/ai/tools.py — executes a real, read-only, pre-shaped DB query
   |
   v
Tool result fed back to the model -> final natural-language answer
```

Key design decision: **the LLM never sees a database connection or writes
SQL.** It can only call the functions in `app/ai/tools.py`, and any
member-scoped tool (`get_my_borrowed_books`, `get_my_due_dates`,
`get_my_fines`) ignores whatever `member_id` the model tries to pass and
always uses the ID from the authenticated request. This is enforced in
`app/ai/assistant._execute_tool`, and covered by tests in
`backend/tests/test_ai_assistant.py`.

## Provider abstraction

`app/ai/provider.py` defines an `LLMProvider` interface with
`AnthropicProvider` and `OpenAIProvider` implementations. Which one is used
is controlled entirely by `AI_PROVIDER` in `.env` — no application code
changes are needed to switch providers.

## Why SQLite works interchangeably with MySQL

SQLAlchemy abstracts the SQL dialect. All models use portable types and
the ORM query layer, so the same code runs against `DATABASE_URL=sqlite:///...`
for local development/tests and `DATABASE_URL=mysql+pymysql://...` in
production. The one dialect-specific spot is the monthly trend queries in
`report_service.py`, which branch on `db.bind.dialect.name` to use
`strftime` (SQLite) vs `date_format` (MySQL) for month bucketing.

## Frontend layout

```
frontend/src/
  pages/       # one file per route
  components/  # shared UI: modals, cards, badges, empty/loading states
  layouts/     # AppLayout (sidebar + topbar shell)
  context/     # AuthContext (JWT/session), ToastContext (notifications)
  services/    # api.js (axios instance + interceptors), resources.js (per-resource calls)
```

Routing and role protection live in `App.jsx` via `ProtectedRoute`, which
redirects unauthenticated users to `/login` and redirects users without the
required role away from staff-only pages (e.g. a `member` hitting
`/members`).

## No hard-coded environments

- Backend: `DATABASE_URL`, `CORS_ORIGINS`, `JWT_SECRET`, `AI_*` all come from
  `.env` (see `backend/.env.example`).
- Frontend: `VITE_API_URL` is the only backend reference, read from
  `frontend/.env` (see `frontend/.env.example`). Nothing in application code
  hard-codes `localhost` or `127.0.0.1`.
