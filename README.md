# Lesson Builder

A full-stack educational app where **teachers** create math lessons and generate AI-powered multiple-choice quizzes, and **students** browse published lessons and take interactive quizzes.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript, Vite, Material UI (MUI), React Query, Zustand, React Router |
| **Backend** | Node.js, Express 5, TypeScript |
| **Database** | MongoDB with Mongoose |
| **AI** | Google Gemini API (`gemini-2.0-flash`) |
| **Auth** | JWT (Bearer tokens), bcrypt password hashing |

## Project Structure

```
taskSnunit/
├── client/          # React frontend (Vite)
└── server/          # Express API + MongoDB
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** — local install or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier
- **Gemini API key** — free from [Google AI Studio](https://aistudio.google.com/apikey) (no credit card required)

### 1. Clone and install dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Set up MongoDB

**Option A — MongoDB Atlas (recommended for quick setup)**

1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free **M0 cluster**.
3. Under **Database Access**, create a database user with read/write permissions.
4. Under **Network Access**, allow your IP (or `0.0.0.0/0` for development).
5. Click **Connect → Drivers** and copy the connection string.
6. Replace `<password>` with your database user password.

**Option B — Local MongoDB**

Install MongoDB locally and use:

```
mongodb://localhost:27017/lesson-builder
```

### 3. Get a Gemini API key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey).
2. Sign in with a Google account.
3. Click **Create API key**.
4. Copy the key — the free tier is sufficient for development and demo use.

### 4. Configure environment variables

**Server** — copy `server/.env.example` to `server/.env`:

```env
PORT=3001
NODE_ENV=development

MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/lesson-builder

JWT_SECRET=your_secure_random_secret_here
JWT_EXPIRES_IN=7d

GEMINI_API_KEY=your_gemini_api_key_here

CLIENT_URL=http://localhost:5173
```

> **Important:** The server will refuse to start if `JWT_SECRET` is not set or still has a placeholder value. Generate a strong secret with `openssl rand -hex 32`.

**Client** — copy `client/.env.example` to `client/.env`:

```env
VITE_API_URL=http://localhost:3001/api
```

> In development, Vite also proxies `/api` to the backend, so the client works even without `VITE_API_URL` if you use the default Vite dev server.

### 5. Seed the database (test accounts)

Registration always creates **student** accounts. To get a **teacher** account for testing, run the seed script:

```bash
cd server
npm run seed
```

This clears existing data and creates:

| Role | Email | Password |
|------|-------|----------|
| Teacher | `teacher@test.com` | `Teacher123!` |
| Student | `student@test.com` | `Student123!` |

The seed also creates two sample lessons (one published, one draft) with pre-built question sets.

> **Important:** Use the seed script to create the teacher account. The `/api/auth/register` endpoint always assigns the `STUDENT` role regardless of any client-side input.

### 6. Run the app

Open two terminals:

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:3001/api](http://localhost:3001/api)
- Health check: [http://localhost:3001/api/health](http://localhost:3001/api/health)

---

## User Roles

| Role | Capabilities |
|------|-------------|
| **Teacher** | Create/edit/delete lessons, publish/unpublish, generate and edit AI quiz questions |
| **Student** | Browse published lessons, read content, take interactive quizzes |

---

## API Endpoints

All authenticated routes require `Authorization: Bearer <token>`.

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/register` | Public | Register a new student account |
| `POST` | `/login` | Public | Login and receive JWT |
| `GET` | `/me` | Required | Get current user profile |

### Lessons — `/api/lessons`

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| `GET` | `/published?page=1&limit=12` | Required | Any | List published lessons (paginated) |
| `GET` | `/published/:id` | Required | Any | Get a published lesson by ID |
| `GET` | `/my?page=1&limit=12` | Required | Teacher | List teacher's own lessons (paginated) |
| `GET` | `/:id` | Required | Teacher | Get lesson by ID (owner only) |
| `POST` | `/` | Required | Teacher | Create a new lesson (draft) |
| `PATCH` | `/:id` | Required | Teacher | Update lesson title/content |
| `PATCH` | `/:id/status` | Required | Teacher | Publish or unpublish a lesson |
| `DELETE` | `/:id` | Required | Teacher | Delete lesson and its question set |

### Quiz — `/api/quiz`

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| `GET` | `/lesson/:lessonId` | Required | Any | Get question set (students: published lessons only) |
| `POST` | `/generate` | Required | Teacher | Generate AI questions (rate limited: 5/min) |
| `PATCH` | `/:id` | Required | Teacher | Update question set (manual edits) |
| `DELETE` | `/:id` | Required | Teacher | Delete a question set |

### Health

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Server health check |

### Response format

```json
{
  "success": true,
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

### HTTP status codes

| Code | When |
|------|------|
| `400` | Invalid input or malformed ID |
| `401` | Missing/invalid/expired token, bad credentials |
| `403` | Authenticated but insufficient permissions |
| `404` | Resource or route not found |
| `409` | Duplicate entry (e.g. email already registered) |
| `429` | Rate limit exceeded |
| `502` | AI generation failed |
| `503` | AI service not configured |
| `500` | Unexpected server error (details hidden in production) |

---

## Question JSON Schema

Each question in a question set follows this format (`formatVersion: 1`):

```json
{
  "questionText": "What is 2/4 in simplest form?",
  "options": ["1/4", "1/2", "2/8", "3/4"],
  "correctAnswerIndex": 1,
  "explanation": "2/4 simplifies to 1/2 by dividing numerator and denominator by 2."
}
```

| Field | Type | Rules |
|-------|------|-------|
| `questionText` | `string` | Required, non-empty |
| `options` | `string[4]` | Exactly 4 non-empty strings |
| `correctAnswerIndex` | `number` | Integer 0–3 (index into `options`) |
| `explanation` | `string` | Required, non-empty |

A full question set document:

```json
{
  "_id": "...",
  "lessonId": "...",
  "formatVersion": 1,
  "questions": [ /* array of question objects */ ],
  "createdAt": "2026-05-24T...",
  "updatedAt": "2026-05-24T..."
}
```

When generating questions via AI, you can specify:

```json
{
  "lessonId": "...",
  "numberOfQuestions": 5,
  "difficulty": "medium"
}
```

- `numberOfQuestions`: 1–10 (default: 5)
- `difficulty`: `"easy"` | `"medium"` | `"hard"` (default: `"medium"`)

---

## Design Decisions

### Why MongoDB?

Lessons and question sets are document-shaped data — a lesson has nested-like content and a question set is an array of question objects. MongoDB's document model maps naturally to this structure without joins. For a project of this scope, schema flexibility (e.g. evolving the question format via `formatVersion`) outweighs the need for relational normalization.

### Why a separate backend?

- **Security**: The Gemini API key and JWT secret stay server-side and are never exposed to the browser.
- **Validation**: All input validation and authorization checks happen in one trusted layer before touching the database or AI service.
- **Separation of concerns**: The React frontend focuses on UI and user experience; the Express API handles business logic, persistence, and external integrations.

### Why Gemini?

Google Gemini offers a generous free tier via AI Studio with no credit card required, making it ideal for a take-home project or demo. The `gemini-2.0-flash` model is fast and cost-effective for structured JSON generation tasks like multiple-choice questions.

### How AI errors are handled

1. **Missing API key** → `503` with a user-friendly message ("Quiz generation is not configured").
2. **Gemini returns invalid/malformed JSON** → The server attempts JSON repair and validates the structure. If validation fails, it retries once automatically.
3. **Retry exhaustion** → `502` with "Failed to generate questions. Please try again." — no internal error details are sent to the client.
4. **Unexpected errors** → Logged server-side; client receives a generic message in production (`500` responses never leak stack traces or internal messages).

---

## Security & Scalability

### Security measures

- **JWT secret enforcement** — server refuses to start without a strong `JWT_SECRET`
- **Password hashing** — bcrypt with 10 salt rounds
- **Input validation** — all endpoints validate and sanitize input before processing
- **Ownership checks** — teachers can only modify their own lessons; students cannot access draft lessons or their questions
- **CORS** — restricted to configured frontend origin
- **Helmet** — sets secure HTTP headers
- **Error sanitization** — internal errors are never leaked to clients in production

### Rate limiting

- **Auth endpoints** (login/register) — 20 requests per 15 minutes per IP
- **AI generation** — 5 requests per minute per IP
- **General API** — 200 requests per 15 minutes per IP

### Performance

- **MongoDB indexes** on `ownerTeacherId`, `status`, and `email` for fast queries
- **Pagination** on lesson list endpoints (configurable page size, max 50)
- **Lean queries** for read-only endpoints to reduce memory overhead

---

## What I'd Add With More Time

- **Student progress tracking** — save quiz scores and completion status per student
- **Rich text editor** — WYSIWYG lesson content instead of plain textarea
- **Question preview mode** — teachers can preview the student quiz experience before publishing
- **Automated tests** — unit tests for validators/controllers, integration tests for API routes, component tests for key UI flows
- **Email verification and password reset**
- **Admin dashboard** — manage users and moderate published content
- **Docker Compose** — one-command setup for MongoDB + server + client
- **CI/CD pipeline** — lint, type-check, and test on every push

---

## Scripts Reference

### Server (`server/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production build |
| `npm run seed` | Reset DB and create test teacher/student accounts |
| `npm run lint` | Run ESLint |

### Client (`client/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
