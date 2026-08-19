# 📚 Athenaeum — Library Management System

> **A modern, full-stack Library Management System with AI-powered assistance, secure authentication, automated book circulation, fines, notifications, and production-ready deployment.**

[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react\&logoColor=white)](https://react.dev/)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi\&logoColor=white)](https://fastapi.tiangolo.com/)
[![Database](https://img.shields.io/badge/Database-MySQL-4479A1?logo=mysql\&logoColor=white)](https://www.mysql.com/)
[![ORM](https://img.shields.io/badge/ORM-SQLAlchemy-D71F00)](https://www.sqlalchemy.org/)
[![Deployment](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://vercel.com/)
[![Deployment](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render\&logoColor=black)](https://render.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](#-license)

---

## 🌐 Live Application

### 🚀 Frontend

**Athenaeum Library Management System**

https://athenaeum-library-system-woad.vercel.app/

### ⚡ Backend API

https://athenaeum-library-system-2.onrender.com

### 📖 API Documentation

https://athenaeum-library-system-2.onrender.com/docs

The backend provides interactive Swagger/OpenAPI documentation for testing and exploring the available APIs.

---

# 📌 Table of Contents

* [About the Project](#-about-the-project)
* [Project Objectives](#-project-objectives)
* [Key Features](#-key-features)
* [User Roles](#-user-roles)
* [AI Library Assistant](#-ai-library-assistant)
* [Technology Stack](#-technology-stack)
* [System Architecture](#-system-architecture)
* [Project Structure](#-project-structure)
* [Database Design](#-database-design)
* [Authentication & Security](#-authentication--security)
* [Environment Variables](#-environment-variables)
* [Local Development](#-local-development)
* [Database Migrations](#-database-migrations)
* [Running the Backend](#-running-the-backend)
* [Running the Frontend](#-running-the-frontend)
* [API Documentation](#-api-documentation)
* [Production Deployment](#-production-deployment)
* [CORS Configuration](#-cors-configuration)
* [Testing](#-testing)
* [Troubleshooting](#-troubleshooting)
* [Future Improvements](#-future-improvements)
* [Contributing](#-contributing)
* [License](#-license)
* [Author](#-author)

---

# 📖 About the Project

**Athenaeum** is a full-stack Library Management System designed to digitize and simplify the complete library management workflow.

The system provides separate functionality for:

* 👑 Administrators
* 📚 Librarians
* 👤 Library Members

It manages the complete lifecycle of library resources, users, borrowing transactions, returns, overdue books, fines, notifications, feedback, and audit records.

The system also integrates an **AI-powered Library Assistant** that can interact with users and provide intelligent assistance using configurable AI providers.

The application is built using a modern architecture with a React frontend, FastAPI backend, MySQL database, SQLAlchemy ORM, JWT authentication, Alembic migrations, and cloud deployment.

---

# 🎯 Project Objectives

The main objectives of Athenaeum are:

1. Digitize traditional library operations.
2. Provide secure authentication and authorization.
3. Manage books, authors, categories, and physical copies.
4. Manage library members and staff.
5. Automate borrowing and returning workflows.
6. Track overdue books and fines.
7. Provide notifications to members.
8. Maintain audit logs for important system activities.
9. Provide an AI-powered library assistant.
10. Provide a scalable REST API.
11. Support production deployment.
12. Provide a clean and responsive user experience.

---

# ✨ Key Features

## 🔐 Authentication & Authorization

* User registration
* User login
* JWT-based authentication
* Secure password hashing using bcrypt
* Authenticated user profile
* Role-based access control
* Active/inactive account management
* Token expiration
* Protected API endpoints

### Supported Roles

* `admin`
* `librarian`
* `member`

---

## 👤 Member Management

Members can:

* Create an account
* Login securely
* View their profile
* Receive a unique membership ID
* Browse library books
* Borrow available books
* Return borrowed books
* View borrowing history
* Track active loans
* View overdue books
* View fines
* View notifications
* Submit feedback
* Use the AI Library Assistant

Membership IDs are automatically generated in the format:

```text
LIBXXXXXX
```

Example:

```text
LIB400064
```

---

# 👑 Admin Features

Administrators have elevated access for managing the library system.

Typical administrative operations include:

* User management
* Librarian management
* Member management
* Book management
* Author management
* Category management
* Book copy management
* Borrowing oversight
* Fine management
* Notifications
* Audit logs
* System-level administration

---

# 📚 Librarian Features

Librarians can manage day-to-day library operations including:

* Books
* Authors
* Categories
* Physical book copies
* Members
* Borrow transactions
* Book returns
* Overdue books
* Fines
* Notifications
* Library operations

---

# 🤖 AI Library Assistant

Athenaeum includes an integrated **AI Library Assistant**.

The assistant is designed to help users interact with the library system through natural language.

Possible use cases include:

* Finding books
* Understanding library functionality
* Getting recommendations
* Answering library-related questions
* Helping users understand borrowing rules
* Explaining fines and due dates
* Providing general library assistance

The AI layer is designed to support multiple providers.

### Supported Providers

```text
groq
gemini
anthropic
openai
none
```

The provider can be configured through environment variables without hard-coding API credentials into the source code.

---

# 🧠 AI Configuration

The backend uses configurable AI settings:

```env
AI_PROVIDER=groq
AI_API_KEY=your_api_key
AI_MODEL=openai/gpt-oss-120b
AI_MAX_TOKENS=1024
AI_MAX_INPUT_CHARS=2000
```

### Security Rule

> **Never commit AI API keys to GitHub.**

Use:

* `.env` for local development
* Render Environment Variables for production

---

# 🛠️ Technology Stack

## Frontend

| Technology      | Purpose               |
| --------------- | --------------------- |
| React           | UI development        |
| Vite            | Frontend build tool   |
| JavaScript      | Application logic     |
| CSS             | Styling               |
| React Router    | Client-side routing   |
| Fetch/API layer | Backend communication |

---

## Backend

| Technology  | Purpose                     |
| ----------- | --------------------------- |
| Python      | Backend language            |
| FastAPI     | REST API framework          |
| Pydantic    | Request/response validation |
| SQLAlchemy  | ORM                         |
| Alembic     | Database migrations         |
| PyMySQL     | MySQL database driver       |
| python-jose | JWT handling                |
| Passlib     | Password hashing            |
| Uvicorn     | ASGI server                 |

---

## AI

| Technology                  | Purpose              |
| --------------------------- | -------------------- |
| Groq                        | AI provider          |
| Google Gemini               | Optional AI provider |
| Anthropic                   | Optional AI provider |
| OpenAI-compatible providers | Optional AI provider |

---

## Database

```text
MySQL
```

Production database hosting:

```text
Aiven
```

---

## Deployment

```text
Frontend → Vercel
Backend  → Render
Database → Aiven MySQL
```

---

# 🏗️ System Architecture

```text
                    ┌──────────────────────────┐
                    │        User Browser      │
                    │                          │
                    │    React + Vite App      │
                    └────────────┬─────────────┘
                                 │
                                 │ HTTPS / REST API
                                 ▼
                    ┌──────────────────────────┐
                    │      FastAPI Backend     │
                    │                          │
                    │  Authentication          │
                    │  Business Logic          │
                    │  AI Assistant            │
                    │  Validation               │
                    │  Authorization            │
                    └────────────┬─────────────┘
                                 │
                                 │ SQLAlchemy
                                 ▼
                    ┌──────────────────────────┐
                    │       MySQL Database     │
                    │                          │
                    │ Users                    │
                    │ Members                  │
                    │ Books                    │
                    │ Authors                  │
                    │ Categories               │
                    │ Borrow Transactions      │
                    │ Fines                    │
                    │ Notifications            │
                    │ Audit Logs               │
                    └──────────────────────────┘

                         ┌─────────────────┐
                         │   AI Providers  │
                         │                 │
                         │ Groq            │
                         │ Gemini          │
                         │ Anthropic       │
                         │ OpenAI          │
                         └─────────────────┘
```

---

# 📁 Project Structure

```text
library-management-system/
│
├── backend/
│   │
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── auth.py
│   │   │       └── ...
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   ├── deps.py
│   │   │   └── security.py
│   │   │
│   │   ├── models/
│   │   │   ├── enums.py
│   │   │   ├── user.py
│   │   │   ├── member.py
│   │   │   ├── book.py
│   │   │   ├── author.py
│   │   │   ├── category.py
│   │   │   ├── borrow_transaction.py
│   │   │   ├── fine.py
│   │   │   ├── notification.py
│   │   │   └── ...
│   │   │
│   │   ├── schemas/
│   │   │   ├── auth.py
│   │   │   └── ...
│   │   │
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   └── ...
│   │   │
│   │   └── main.py
│   │
│   ├── alembic/
│   │   ├── versions/
│   │   ├── env.py
│   │   └── script.py.mako
│   │
│   ├── requirements.txt
│   ├── .env.example
│   └── ...
│
├── frontend/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── ...
│   │
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json
│   └── .env.example
│
├── README.md
└── .gitignore
```

---

# 🗄️ Database Design

The system uses MySQL with SQLAlchemy ORM.

Major entities include:

```text
users
members
books
authors
categories
book_copies
book_authors
book_categories
borrow_transactions
fines
notifications
feedback
audit_logs
```

### Main Relationships

```text
User
 │
 └── Member
       │
       ├── Borrow Transactions
       ├── Fines
       └── Notifications

Book
 │
 ├── Authors
 ├── Categories
 └── Book Copies

Member
 │
 └── Borrow Transactions
        │
        └── Book
```

---

# 🔄 Borrowing Workflow

A typical borrowing workflow is:

```text
Member
   │
   ▼
Select Book
   │
   ▼
Check Availability
   │
   ▼
Create Borrow Transaction
   │
   ▼
Assign Book Copy
   │
   ▼
Calculate Due Date
   │
   ▼
Book Issued
```

Returning a book:

```text
Book Returned
      │
      ▼
Check Due Date
      │
      ├── On Time
      │
      └── Overdue
             │
             ▼
        Calculate Fine
             │
             ▼
        Update Fine
```

---

# 💰 Library Business Rules

The application includes configurable business rules.

Default configuration:

```env
DAILY_FINE_AMOUNT=5.0
DEFAULT_LOAN_PERIOD_DAYS=14
MAX_BOOKS_PER_MEMBER=5
```

Therefore, by default:

* Loan period = **14 days**
* Fine = **₹5 per overdue day**
* Maximum active books per member = **5**

These values can be changed through application configuration.

---

# 🔐 Authentication & Security

The application uses JWT-based authentication.

Authentication flow:

```text
Login
  │
  ▼
Validate Email & Password
  │
  ▼
Verify Password Hash
  │
  ▼
Create JWT
  │
  ▼
Return Access Token
  │
  ▼
Frontend Stores Token
  │
  ▼
Authenticated API Requests
```

JWT payload contains:

```json
{
  "sub": "user_id",
  "role": "member",
  "iat": "...",
  "exp": "..."
}
```

Passwords are never stored as plain text.

Passwords are hashed using:

```text
bcrypt
```

---

# 🔑 Environment Variables

## Backend

Create:

```text
backend/.env
```

Example:

```env
APP_NAME=Library Management System API
ENV=development
DEBUG=True

DATABASE_URL=mysql+pymysql://USERNAME:PASSWORD@HOST:PORT/DATABASE?ssl=true

JWT_SECRET=CHANGE_ME_TO_A_LONG_RANDOM_SECRET
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480

CORS_ORIGINS=http://localhost:5173

AI_PROVIDER=groq
AI_API_KEY=YOUR_AI_API_KEY
AI_MODEL=openai/gpt-oss-120b

AI_MAX_TOKENS=1024
AI_MAX_INPUT_CHARS=2000

DAILY_FINE_AMOUNT=5.0
DEFAULT_LOAN_PERIOD_DAYS=14
MAX_BOOKS_PER_MEMBER=5
```

---

# 🌐 Frontend Environment Variables

Create:

```text
frontend/.env
```

Example:

```env
VITE_API_URL=http://localhost:8000
```

For production:

```env
VITE_API_URL=https://athenaeum-library-system-2.onrender.com
```

---

# ⚠️ Environment Variable Security

Never commit:

```text
.env
```

to GitHub.

Never expose:

```text
JWT_SECRET
DATABASE_URL
AI_API_KEY
```

in frontend source code.

Use:

```text
.env
```

locally and platform environment variables in production.

---

# 💻 Local Development

## 1. Clone the Repository

```bash
git clone https://github.com/Sonu83497/Athenaeum-Library-System.git
cd Athenaeum-Library-System
```

---

# 🐍 Backend Setup

Move into backend:

```bash
cd backend
```

Create a virtual environment:

### Windows

```powershell
python -m venv .venv
```

Activate it:

```powershell
.venv\Scripts\activate
```

### macOS/Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
```

---

# 📦 Install Backend Dependencies

```bash
pip install -r requirements.txt
```

---

# ⚙️ Configure Backend

Create:

```text
backend/.env
```

Set the required environment variables.

For local development:

```env
DATABASE_URL=mysql+pymysql://...
CORS_ORIGINS=http://localhost:5173
```

---

# 🗃️ Database Migration

The project uses **Alembic** for database schema management.

From:

```text
backend/
```

run:

```bash
alembic upgrade head
```

To check the current migration:

```bash
alembic current
```

To see available migration heads:

```bash
alembic heads
```

---

# 🆕 Creating a New Migration

After changing SQLAlchemy models:

```bash
alembic revision --autogenerate -m "describe your change"
```

Then:

```bash
alembic upgrade head
```

### Important

Always review autogenerated migrations before applying them to production.

---

# 🚀 Running the Backend

From the `backend` directory:

```bash
uvicorn app.main:app --reload
```

The API will normally be available at:

```text
http://localhost:8000
```

Swagger documentation:

```text
http://localhost:8000/docs
```

---

# ⚛️ Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

# 🏗️ Frontend Production Build

Run:

```bash
npm run build
```

Vite will generate:

```text
frontend/dist/
```

To preview the production build:

```bash
npm run preview
```

---

# 📖 API Documentation

FastAPI automatically generates OpenAPI documentation.

### Swagger UI

```text
https://athenaeum-library-system-2.onrender.com/docs
```

### OpenAPI JSON

```text
https://athenaeum-library-system-2.onrender.com/openapi.json
```

---

# 🔌 Important API Endpoints

## Health Check

```http
GET /api/health
```

Example response:

```json
{
  "status": "ok",
  "env": "production"
}
```

---

## Authentication

### Register

```http
POST /api/auth/register
```

### Login

```http
POST /api/auth/login
```

### Current User

```http
GET /api/auth/me
```

Protected endpoints require a Bearer token:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

# 🧪 Testing the API

Swagger UI can be used to test API endpoints.

Recommended workflow:

```text
1. Open /docs
2. Register a user
3. Login
4. Copy access_token
5. Click Authorize
6. Enter Bearer token
7. Test protected endpoints
```

---

# 🌍 Production Deployment

The production environment uses:

```text
Frontend → Vercel
Backend  → Render
Database → Aiven MySQL
```

---

# ▲ Frontend Deployment — Vercel

The frontend is deployed using Vercel.

Build command:

```bash
npm run build
```

Output directory:

```text
dist
```

Install command:

```bash
npm install
```

Environment variable:

```env
VITE_API_URL=https://athenaeum-library-system-2.onrender.com
```

---

# 🚀 Vercel SPA Routing

Because the application uses client-side routing, Vercel requires a rewrite configuration.

`frontend/vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This prevents direct routes such as:

```text
/register
/login
/dashboard
```

from returning a Vercel `404 NOT_FOUND`.

---

# 🟢 Backend Deployment — Render

The FastAPI backend is deployed on Render.

Build/install dependencies:

```bash
pip install -r requirements.txt
```

Start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Production environment variables should be configured in Render.

---

# 🐬 Database Deployment — Aiven

The production database uses:

```text
Aiven MySQL
```

The backend connects using SQLAlchemy and PyMySQL.

Example:

```env
DATABASE_URL=mysql+pymysql://USER:PASSWORD@HOST:PORT/DATABASE?ssl=true
```

Never commit the actual database password to GitHub.

---

# 🌐 CORS Configuration

Because the frontend and backend are hosted on different domains, CORS must allow the Vercel frontend origin.

Example:

```env
CORS_ORIGINS=http://localhost:5173,https://athenaeum-library-system-woad.vercel.app
```

The backend should configure:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

# 🩺 Health Monitoring

The backend exposes a health endpoint:

```text
GET /api/health
```

This can be used to verify that the production backend is running.

Example:

```json
{
  "status": "ok",
  "env": "production"
}
```

---

# 🧪 Testing Checklist

Before releasing a new version, verify:

### Authentication

* [ ] Register member
* [ ] Register librarian
* [ ] Register admin
* [ ] Login
* [ ] Invalid password handling
* [ ] Protected routes
* [ ] Token expiration
* [ ] Logout/session handling

### Books

* [ ] Create book
* [ ] Update book
* [ ] Delete book
* [ ] Search books
* [ ] Manage authors
* [ ] Manage categories
* [ ] Manage copies

### Borrowing

* [ ] Issue book
* [ ] Return book
* [ ] Due date calculation
* [ ] Overdue detection
* [ ] Fine calculation
* [ ] Maximum borrowing limit

### Members

* [ ] Profile
* [ ] Membership ID
* [ ] Borrowing history
* [ ] Active loans
* [ ] Fines
* [ ] Notifications

### AI

* [ ] AI assistant opens
* [ ] AI request succeeds
* [ ] Provider configuration works
* [ ] API key is not exposed
* [ ] Invalid AI configuration is handled

### Production

* [ ] Frontend loads
* [ ] Backend health endpoint works
* [ ] Swagger documentation works
* [ ] Database connection works
* [ ] CORS works
* [ ] Direct frontend routes work
* [ ] HTTPS works

---

# 🐛 Troubleshooting

## Frontend says:

```text
Unable to connect to the library server.
```

Check:

```env
VITE_API_URL=https://athenaeum-library-system-2.onrender.com
```

Then rebuild:

```bash
npm run build
```

and redeploy.

---

## CORS Error

If browser DevTools shows:

```text
CORS error
```

check:

```env
CORS_ORIGINS=http://localhost:5173,https://YOUR-VERCEL-DOMAIN.vercel.app
```

Redeploy the backend after changing the variable.

---

## Vercel 404 on `/register`

Make sure:

```text
frontend/vercel.json
```

contains:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## Database Table Does Not Exist

If you receive:

```text
Table 'defaultdb.users' doesn't exist
```

run:

```bash
cd backend
alembic upgrade head
```

If no migration exists, generate one:

```bash
alembic revision --autogenerate -m "initial database schema"
```

Then:

```bash
alembic upgrade head
```

---

## MySQL SSL Error

If PyMySQL reports an error similar to:

```text
AttributeError: 'str' object has no attribute 'get'
```

do not pass an incorrect SSL dictionary through the SQLAlchemy URL.

Use the database connection URL supplied by the hosting provider in the format supported by the configured MySQL driver.

Example:

```env
DATABASE_URL=mysql+pymysql://USER:PASSWORD@HOST:PORT/DATABASE?ssl=true
```

---

## Login Returns:

```text
Incorrect email or password
```

Verify:

1. The user exists in the production database.
2. The email is correct.
3. The password is correct.
4. The account is active.
5. The frontend is calling the production backend.

---

# 📊 Project Configuration

Default business configuration:

```text
Application:
Library Management System API

Environment:
development / production

Authentication:
JWT

Token Expiration:
8 hours

Loan Period:
14 days

Daily Fine:
₹5

Maximum Books:
5 per member

Default AI Provider:
Groq
```

---

# 🔒 Security Best Practices

This project follows several security practices:

* Password hashing with bcrypt
* JWT authentication
* Token expiration
* Role-based authorization
* Environment-based secrets
* Pydantic validation
* CORS configuration
* Database ORM
* Production HTTPS
* API key protection
* No hard-coded production credentials

### Never commit secrets

Do not commit:

```text
.env
.env.local
database passwords
JWT secrets
AI API keys
private certificates
```

Use `.gitignore` to prevent accidental commits.

---

# 📈 Performance Considerations

The application uses:

* SQLAlchemy connection pooling
* Database indexes
* Pydantic validation
* FastAPI asynchronous-capable architecture
* Production ASGI server
* Vite production builds
* Frontend asset compression
* Database query filtering
* Environment-based configuration

For larger deployments, the application can be extended with:

* Redis caching
* Background workers
* CDN
* Database read replicas
* Horizontal scaling
* Dedicated monitoring

---

# 🔮 Future Improvements

Possible future enhancements include:

### 📱 Mobile

* Progressive Web App
* Native Android application
* Native iOS application

### 📊 Analytics

* Library usage dashboard
* Most borrowed books
* Active members
* Revenue/fine analytics
* Monthly borrowing reports

### 🔔 Notifications

* Email notifications
* SMS notifications
* Push notifications
* Automated due-date reminders

### 🤖 AI

* Personalized book recommendations
* Semantic book search
* RAG-based library assistant
* Natural-language database queries
* AI-powered reading recommendations

### ⚡ Infrastructure

* Redis caching
* Background task processing
* Automated CI/CD
* Docker support
* Kubernetes deployment
* Advanced observability

---

# 🤝 Contributing

Contributions are welcome.

## 1. Fork the repository

```bash
git clone https://github.com/Sonu83497/Athenaeum-Library-System.git
```

## 2. Create a feature branch

```bash
git checkout -b feature/your-feature
```

## 3. Make your changes

Follow the existing project architecture and coding conventions.

## 4. Test your changes

Run the backend and frontend locally and verify affected functionality.

## 5. Commit

```bash
git add .
git commit -m "feat: add your feature"
```

## 6. Push

```bash
git push origin feature/your-feature
```

## 7. Open a Pull Request

Describe:

* What changed
* Why it was changed
* How it was tested
* Any additional configuration required

---

# 📝 Development Guidelines

When adding new functionality:

1. Keep business logic inside service layers.
2. Keep API routes focused on HTTP concerns.
3. Use Pydantic schemas for validation.
4. Use SQLAlchemy models for database entities.
5. Create Alembic migrations for schema changes.
6. Never hard-code secrets.
7. Update environment examples when adding variables.
8. Test protected endpoints with proper authentication.
9. Keep frontend API URLs environment-based.
10. Maintain backward compatibility where possible.

---

# 📜 License

This project is licensed under the **MIT License**.

You are free to:

* Use the software
* Modify the software
* Distribute the software
* Use it for private or commercial purposes

subject to the conditions of the MIT License.

---

# 👨‍💻 Author

## Sonu Prajapati

**Athenaeum — Library Management System**

Built with:

```text
React
FastAPI
Python
MySQL
SQLAlchemy
Alembic
JWT
AI
Vercel
Render
Aiven
```

---

# ⭐ Support the Project

If you find this project useful:

* ⭐ Star the repository
* 🍴 Fork the project
* 🐛 Report bugs
* 💡 Suggest improvements
* 🤝 Contribute to the project

---

# 🎓 Project Summary

**Athenaeum** is a production-deployed full-stack Library Management System that combines traditional library management functionality with modern web technologies and AI assistance.

The project demonstrates practical implementation of:

```text
Frontend Development
        ↓
REST API Development
        ↓
Authentication & Authorization
        ↓
Database Design
        ↓
ORM & Migrations
        ↓
AI Integration
        ↓
Cloud Deployment
        ↓
Production Debugging
        ↓
Full-Stack Application Architecture
```

### 🚀 Current Production Stack

```text
┌─────────────────────────────────────────────┐
│                  FRONTEND                   │
│              React + Vite                   │
│                 Vercel                      │
└──────────────────────┬──────────────────────┘
                       │
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────┐
│                  BACKEND                    │
│                 FastAPI                     │
│              Python + JWT                   │
│                 Render                      │
└──────────────────────┬──────────────────────┘
                       │
                       │ SQLAlchemy / PyMySQL
                       ▼
┌─────────────────────────────────────────────┐
│                 DATABASE                   │
│                  MySQL                      │
│                 Aiven                      │
└─────────────────────────────────────────────┘

                       │
                       ▼
              ┌─────────────────┐
              │  AI Assistant   │
              │                 │
              │ Groq / Gemini   │
              │ Anthropic       │
              │ OpenAI          │
              └─────────────────┘
```

---

## 🌟 Athenaeum

> **A smarter way to manage libraries.**

Built as a complete full-stack application with modern architecture, secure authentication, relational database management, AI integration, and cloud deployment.
