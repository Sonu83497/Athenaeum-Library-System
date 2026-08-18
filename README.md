# Athenaeum — AI-Powered Library Management System

A full-stack library management system with an AI Library Assistant that's
wired into the real database — not a canned chatbot. Built with
React + Vite on the frontend and FastAPI + SQLAlchemy + MySQL on the
backend.

## Features

- **Auth & roles** — JWT auth, bcrypt password hashing, three roles
  (admin, librarian, member), protected routes on both frontend and backend.
- **Book management** — full CRUD, search/filter/sort/pagination, authors
  and categories, copy tracking.
- **Members** — profiles, borrowing history, activate/deactivate, outstanding
  fines at a glance.
- **Borrowing** — issue/return workflow with real validation: unavailable
  books, per-member borrowing limits, duplicate-loan prevention, double-return
  prevention.
- **Fines** — automatic calculation on return (`overdue_days × daily_rate`,
  configurable), pay/unpaid tracking.
- **Dashboard & reports** — real-time stats and charts (Recharts) driven
  entirely by live queries — no hard-coded numbers.
- **AI Library Assistant** — a chatbot that calls real backend tools
  (`search_books`, `get_my_fines`, `get_my_due_dates`, etc.) instead of
  hallucinating. Member-scoped tools are always bound to the authenticated
  user server-side, so the model can never fetch another member's data —
  see [`docs/architecture.md`](docs/architecture.md).
- **Voice** — Web Speech API for voice input and spoken replies, with
  graceful fallback when unsupported.
- **Feedback & notifications** — rating/message submission with staff
  review workflow; a per-member notification feed for issues, returns,
  overdue items, and fines.

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Axios, Recharts, Lucide |
| Backend | Python, FastAPI, SQLAlchemy, Alembic, Pydantic, JWT (python-jose), passlib/bcrypt |
| Database | MySQL 8+ (SQLite supported for local dev — same code, see below) |
| AI | Provider-abstracted (Anthropic or OpenAI), controlled tool-calling only, no raw SQL access for the model |

## Project structure

```
library-management-system/
├── frontend/            React + Vite app
├── backend/              FastAPI app
│   ├── app/
│   │   ├── api/routes/   HTTP endpoints
│   │   ├── core/         config, DB session, auth/security
│   │   ├── models/       SQLAlchemy models
│   │   ├── schemas/      Pydantic request/response schemas
│   │   ├── services/     business logic
│   │   └── ai/           AI assistant: tools, provider adapter, orchestrator
│   ├── alembic/          DB migrations
│   ├── tests/            pytest suite
│   └── requirements.txt
├── database/             raw schema.sql + seed.sql (reference/direct setup)
├── docs/                 architecture.md, api.md, database.md
├── docker-compose.yml
└── README.md
```

## Getting started

### Option A — Docker Compose (recommended, includes MySQL)

```bash
cp backend/.env.example backend/.env   # then set AI_API_KEY if you want the AI assistant to work
export AI_API_KEY=sk-ant-...           # or set it directly in docker-compose.yml
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend/API docs: http://localhost:8000/docs

The MySQL container runs `database/schema.sql` and `database/seed.sql`
automatically on first boot. Then seed demo user accounts (their passwords
need real bcrypt hashing, which the SQL seed intentionally doesn't do):

```bash
docker compose exec backend python -m app.utils.seed
```

### Option B — Manual local setup

**Backend:**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Default .env uses SQLite (sqlite:///./library.db) — zero setup needed.
# For MySQL, set DATABASE_URL=mysql+pymysql://user:pass@localhost:3306/library_db
python -m app.utils.seed        # creates demo users + catalog data
uvicorn app.main:app --reload   # http://localhost:8000
```

**Frontend (separate terminal):**
```bash
cd frontend
npm install
cp .env.example .env            # VITE_API_URL=http://localhost:8000
npm run dev                     # http://localhost:5173
```

### Running tests

```bash
cd backend
pip install -r requirements.txt
pytest -v
```

Tests use an in-memory SQLite DB per test (see `tests/conftest.py`) and
cover auth, book CRUD, borrow/return edge cases (unavailable books,
duplicate loans, double returns, unauthorized access, overdue fine
generation), and — importantly — that the AI assistant's member-scoped
tools can't be tricked into returning another member's data.

## Demo credentials

Created by `python -m app.utils.seed`:

| Role | Email | Password |
|---|---|---|
| Admin | admin@library.local | AdminPass123 |
| Librarian | librarian@library.local | LibrarianPass123 |
| Member | alice@library.local | MemberPass123 |
| Member | bob@library.local | MemberPass123 |

These are demo-only credentials for local evaluation — never reuse them in
a real deployment.

## Environment variables

See `backend/.env.example` and `frontend/.env.example`. Nothing in
application code hard-codes `localhost` — `DATABASE_URL`, `CORS_ORIGINS`,
and `VITE_API_URL` control everything, so the same code runs locally and in
production.

Key backend variables:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | `sqlite:///./library.db` for local dev, or `mysql+pymysql://user:pass@host:3306/db` |
| `JWT_SECRET` | Sign/verify tokens — set a real random value in production |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins |
| `AI_PROVIDER` | `anthropic`, `openai`, or `none` |
| `AI_API_KEY` | Your LLM provider API key |
| `DAILY_FINE_AMOUNT`, `DEFAULT_LOAN_PERIOD_DAYS`, `MAX_BOOKS_PER_MEMBER` | Business rules |

## API documentation

Interactive Swagger UI at `/docs`, ReDoc at `/redoc` once the backend is
running. Endpoint reference: [`docs/api.md`](docs/api.md).

## AI chatbot explanation

The assistant is not a generic LLM wrapper. Every fact it states comes from
a controlled backend tool call (`app/ai/tools.py`) against the real MySQL
data — never from the model's own memory. A member asking "what have I
borrowed?" is answered using `member_id` taken from their JWT, which the
model cannot override even via prompt injection (see
[`docs/architecture.md`](docs/architecture.md#ai-assistant-architecture) and
`backend/tests/test_ai_assistant.py`). If a tool returns nothing, the
assistant says so rather than inventing an answer.

## Project structure details

Full breakdowns in [`docs/architecture.md`](docs/architecture.md) and
[`docs/database.md`](docs/database.md).

## Deployment

- **Frontend** → Vercel (or any static host): `npm run build`, serve `dist/`,
  set `VITE_API_URL` to your deployed backend.
- **Backend** → Render/Railway/similar: set env vars from
  `backend/.env.example`, point `DATABASE_URL` at a managed MySQL instance.
- **Database** → any managed MySQL 8+.

No code changes are needed between environments — only environment
variables.

## Known limitations / next steps

- Rate limiting for the AI assistant is in-memory per-process
  (`app/ai/assistant.py`) — swap for Redis in a multi-process/multi-instance
  deployment.
- Notifications are generated but there's no push/email delivery — they're
  surfaced in-app only (`/notifications`).
- Alembic is configured but no initial migration is checked in yet — run
  `alembic revision --autogenerate -m "initial schema"` against your MySQL
  instance to generate one (see `docs/database.md`).
- Book cover images are stored as URLs only; there's no file upload/storage
  integration.
- This codebase was built and unit/logic-tested in an offline sandbox
  without registry access, so `pip install` / `npm install` and a live
  end-to-end run have not been executed by the author — run the test suite
  and do a manual smoke test after installing dependencies.
