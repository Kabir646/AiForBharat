# Scalability & Architecture Issues — AiForBharat

A comprehensive audit of every scalability problem, latency killer, and architectural flaw in the current codebase. Organized by severity.

---

## Table of Contents

1. [Critical Issues](#1-critical-issues)
2. [High Priority — Fix Before Judging](#2-high-priority--fix-before-judging)
3. [Medium Priority — Code Quality](#3-medium-priority--code-quality)
4. [Security Issues](#4-security-issues)
5. [Frontend-Specific Issues](#5-frontend-specific-issues)
6. [Database Design Issues](#6-database-design-issues)
7. [Dependency Issues](#7-dependency-issues)
8. [What Judges Will Ask](#8-what-judges-will-ask)
9. [Recommended Fix Order](#9-recommended-fix-order)

---

## 1. Critical Issues

### 1.1 — Synchronous PDF Analysis Blocks the HTTP Connection

**File:** `backend/app.py` — `/api/client/dprs/upload` route  
**Severity:** Critical — will cause 502/504 errors in production

**What's happening:**  
When a user uploads a PDF, the entire pipeline runs synchronously inside a single HTTP request:
1. Save file to disk
2. Upload to Gemini Files API (polling until processed)
3. Run `generate_json_from_file()` — a massive prompt analysis
4. Only then return a response

Gemini analysis of a complex PDF takes **2–5 minutes**. Render's HTTP request timeout is **30 seconds**. The connection is cut before Gemini finishes, causing a 502 error on the frontend even though the analysis may still be running.

**The fix:**  
- Return immediately with `HTTP 202 Accepted` and a `dpr_id`
- Run Gemini upload + analysis as a FastAPI `BackgroundTask`
- Add a `/api/dprs/{id}/status` endpoint
- Frontend polls until status is `analyzed` or `failed`

---

### 1.2 — In-Memory Chat Session State — Zero Horizontal Scalability

**File:** `backend/gemini_client.py` — lines 36–37  
**Severity:** Critical — breaks completely on any scaling event

**What's happening:**
```python
_chat_sessions = {}
_comparison_chat_sessions = {}
```

All chat sessions are stored in plain Python dictionaries in process memory. This means:
- Every redeploy wipes all active chat sessions
- Every server restart loses all sessions
- If Render ever runs two instances (auto-scaling), each has its own dict — a user routed to instance 2 loses their session from instance 1
- No persistence whatsoever

**The fix:**  
- Store chat message history in the database (already partially done in the DB schema)
- On each chat request, reconstruct the Gemini `ChatSession` from DB history using `model.start_chat(history=[...])`
- Remove the in-memory dicts entirely

---

### 1.3 — Admin Authentication is a localStorage Flag

**File:** `frontend/src/pages/AdminLogin.tsx`, `frontend/src/contexts/RoleContext.tsx`  
**Severity:** Critical — security bypass requires zero skill

**What's happening:**
```typescript
localStorage.setItem('adminAuthenticated', 'true')
```

After login, the app just sets a flag in localStorage. Every admin-protected UI route checks this flag. Anyone can open browser DevTools, type:
```javascript
localStorage.setItem('adminAuthenticated', 'true')
```
...and gain full admin access. The backend API routes themselves have no token validation either, so admin API calls are also unprotected.

**The fix:**  
- Issue a signed JWT on successful login
- Store it in an `httpOnly` cookie (not localStorage — XSS can't touch httpOnly cookies)
- Add a FastAPI dependency that validates the JWT on every admin route
- Frontend reads auth state from the token, not from localStorage

---

## 2. High Priority — Fix Before Judging

### 2.1 — N+1 Database Query Pattern

**File:** `backend/db.py` — `get_all_comparison_chats()`  
**Severity:** High — query time grows linearly with data

**What's happening:**
```python
for comparison in comparisons:
    cursor.execute("SELECT COUNT(*) FROM ... WHERE comparison_id = %s", (comparison['id'],))
```

For every comparison in the list, a separate `COUNT` query is fired. For 100 comparisons = 101 database round trips. For 1,000 comparisons = 1,001 round trips. Each round trip has network latency overhead.

**The fix:**
```sql
SELECT comparison_id, COUNT(*) as message_count
FROM comparison_chat_messages
GROUP BY comparison_id
```
Single query, join/merge with the comparisons list in Python.

---

### 2.2 — No Pagination on Any List Endpoint

**Files:** `backend/db.py`, `frontend/src/lib/api.ts`  
**Severity:** High — memory exhaustion and slow responses at scale

**What's happening:**  
Every list function fetches all rows unconditionally:
- `getProjects()` — all projects
- `getDPRs()` — all DPRs in a project
- `getChatHistory()` — all messages for a DPR
- `getComparisons()` — all comparisons
- `getComparisonChatHistory()` — all comparison messages

At 10,000 DPRs: the backend loads the entire table into memory, serializes it to JSON, sends it over the wire. The frontend tries to render all of it. Both sides run out of memory or become unresponsive.

**The fix:**  
- Add `LIMIT $1 OFFSET $2` to every list query
- Add `?page=1&limit=20` query params to every list endpoint
- Return `{ data: [...], total: N, page: 1, limit: 20 }` from each endpoint
- Implement infinite scroll or page controls on the frontend

---

### 2.3 — Missing Database Indexes on All Foreign Keys

**File:** `backend/db.py` — schema setup  
**Severity:** High — every filtered query is a full table scan

**What's happening:**  
The only indexes in the database are on `original_filename` and `users.email`. Every other query filters by `project_id`, `client_id`, `dpr_id`, or `comparison_id` — all without indexes. PostgreSQL performs a sequential scan of the entire table for each of these queries. As data grows, query time grows linearly.

**The fix — add these indexes:**
```sql
CREATE INDEX idx_dprs_project_id ON dprs(project_id);
CREATE INDEX idx_dprs_client_id ON dprs(client_id);
CREATE INDEX idx_dprs_status ON dprs(status);
CREATE INDEX idx_chat_messages_dpr_id ON chat_messages(dpr_id);
CREATE INDEX idx_comparison_messages_comparison_id ON comparison_chat_messages(comparison_id);
CREATE INDEX idx_projects_created_at ON projects(created_at);
CREATE INDEX idx_dprs_upload_ts ON dprs(upload_ts);
```

---

### 2.4 — Thread Pool Exhaustion — Blocking Async with psycopg2

**File:** `backend/app.py` — every database call  
**Severity:** High — hard concurrency ceiling

**What's happening:**  
`psycopg2` is a synchronous library. To use it inside async FastAPI, every DB call is wrapped in `asyncio.to_thread()`:
```python
result = await asyncio.to_thread(db.get_projects, ...)
```

This offloads blocking work to Python's thread pool. The default thread pool has `min(32, cpu_count + 4)` threads. Under concurrent load — say 20 simultaneous users — each request holds a thread for the duration of its DB calls. When the pool is exhausted, all new requests queue and wait. Latency spikes hard.

**The fix:**  
Replace `psycopg2` with `asyncpg`. All DB calls become truly `async/await` — no thread pool involvement. 10x concurrency improvement with the same hardware.

---

### 2.5 — Hardcoded Connection Pool (Not Thread-Safe, Max 10)

**File:** `backend/db_config.py`  
**Severity:** High — connection exhaustion under moderate load

**What's happening:**
```python
connection_pool = psycopg2.pool.SimpleConnectionPool(1, 10, ...)
```

Two problems:
1. `SimpleConnectionPool` is **not thread-safe**. Concurrent requests grabbing connections from the same pool can corrupt it. The correct class is `ThreadedConnectionPool`.
2. Max 10 connections. At 10 concurrent users each doing 2–3 DB operations, the pool is already exhausted. New requests throw `PoolError: connection pool exhausted`.

**The fix:**  
- Switch to `asyncpg` (see 2.4) which has a built-in async-safe pool
- If staying on psycopg2: use `ThreadedConnectionPool` and make pool size configurable via environment variable

---

### 2.6 — No Rate Limiting on Any Endpoint

**File:** `backend/app.py`  
**Severity:** High — Gemini quota exhaustion, denial of service

**What's happening:**  
No endpoint has any rate limiting. A single malicious or buggy client can:
- Spam the upload endpoint → exhaust your Gemini API quota for all users
- Spam the chat endpoints → flood Gemini with requests
- Hammer list endpoints → overload the database

There is no protection at all — not even a basic per-IP limit.

**The fix:**  
Add `slowapi` (FastAPI rate limiter):
```python
pip install slowapi

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/client/dprs/upload")
@limiter.limit("5/minute")
async def upload_dpr(...):
    ...

@app.post("/api/dprs/{dpr_id}/chat")
@limiter.limit("30/minute")
async def chat(...):
    ...
```

---

### 2.7 — No Timeouts on Gemini API Calls

**File:** `backend/gemini_client.py`  
**Severity:** High — threads hang forever, holding resources

**What's happening:**  
`generate_content()`, `upload_file()`, `get_file()` — none have timeouts. If Gemini's API hangs or takes unusually long, your `asyncio.to_thread()` call hangs forever. That thread is held, the DB connection acquired for that request is held, and the request slot is occupied — indefinitely. Under load, all threads can get stuck this way and the server becomes unresponsive.

**The fix:**
```python
try:
    response = await asyncio.wait_for(
        asyncio.to_thread(_generate),
        timeout=300  # 5 minutes max
    )
except asyncio.TimeoutError:
    raise HTTPException(status_code=504, detail="Gemini analysis timed out. Please try again.")
```

---

### 2.8 — No Frontend Request Timeouts

**File:** `frontend/src/lib/api.ts` — `authenticatedFetch()`  
**Severity:** High — UI hangs indefinitely on backend issues

**What's happening:**
```typescript
const response = await fetch(url, options)
```

No `AbortController`, no timeout. If the backend is slow, crashed, or hanging, the browser just waits forever with a spinner. Users have no way to know if the request is still running or dead.

**The fix:**
```typescript
const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout

try {
  const response = await fetch(url, { ...options, signal: controller.signal })
  clearTimeout(timeoutId)
  return response
} catch (err) {
  if (err.name === 'AbortError') throw new Error('Request timed out. Please try again.')
  throw err
}
```

---

### 2.9 — Hardcoded API URL — Breaks Across Environments

**File:** `frontend/src/config/api.ts` — line 7  
**Severity:** High — deployment is broken or misconfigured

**What's happening:**
```typescript
export const API_BASE_URL = 'http://localhost:8000'
```

A comment in the file says: *"env vars weren't working in Vercel so hardcoded"*. This means the production frontend is either pointing at `localhost` (which resolves to the user's machine, not the backend) or the URL was manually changed before deployment and will break again on next deploy.

**The fix:**  
Fix the Vite environment variable setup properly:
```typescript
// frontend/src/config/api.ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'
```
In Vercel dashboard → Project Settings → Environment Variables → add `VITE_API_BASE_URL` = your Render backend URL.

---

### 2.10 — No Transaction Management on Multi-Step Operations

**File:** `backend/db.py`, `backend/app.py`  
**Severity:** High — silent data corruption on partial failures

**What's happening:**  
The DPR upload flow does multiple operations in sequence:
1. Save file to disk
2. Upload to Gemini
3. Insert DB record
4. Upload to Cloudinary
5. Delete local file

If step 4 (Cloudinary) fails, the DB record exists pointing to a file that was never uploaded to Cloudinary. The data is now inconsistent. Similarly, `recalculate_project_dprs()` updates DPRs one at a time — if it crashes halfway, some DPRs have new scores and others have old ones.

**The fix:**  
Wrap related DB operations in explicit transactions:
```python
conn = db_config.get_connection()
try:
    conn.autocommit = False
    cursor = conn.cursor()
    # ... all related operations ...
    conn.commit()
except Exception:
    conn.rollback()
    raise
finally:
    db_config.release_connection(conn)
```

---

## 3. Medium Priority — Code Quality

### 3.1 — Duplicate Function Definitions

**File:** `backend/db.py`  
`get_user_by_email()` is defined **3 times** (approximately lines 1208, 1235, 1287). Python silently uses the last definition. The first two are dead code — any bugs fixed in the last definition were silently not fixed in the others. This also signals the file has grown without structure.

---

### 3.2 — Multiple Conflicting Google SDK Packages

**File:** `requirements.txt`

```
google-generativeai==0.8.5
google-genai
google-ai-generativelanguage
google-api-generativelanguage
```

Four different Google AI packages installed simultaneously. They overlap in functionality and conflict in import resolution — which is why `gemini_client.py` has a `try/except` workaround around the import. This causes:
- Unpredictable behavior depending on import order
- Larger container image → slower cold starts on Render
- Longer `pip install` times in CI/CD

**Fix:** Choose one (`google-generativeai` for stability or `google-genai` for latest), remove the others.

---

### 3.3 — No Caching on Repeated Data

Compliance weights, project metadata, and DPR summaries are re-fetched from the database on every request. These are read-heavy, rarely-changing datasets. No caching layer exists at any level (no Redis, no in-process cache, no HTTP cache headers).

**Fix:** Add `functools.lru_cache` for short-lived in-process caching, or Redis for distributed caching. At minimum, add `Cache-Control` headers to static-ish responses.

---

### 3.4 — Very Large Components With No Code Splitting

**Files:** `frontend/src/pages/DocumentDetail.tsx` (1,384 lines), `frontend/src/pages/ProjectDetail.tsx` (783 lines)

These components handle too many responsibilities. Large components:
- Increase bundle size (all code loaded upfront even if the user never reaches that tab)
- Make performance optimization harder (no isolated re-render boundaries)
- Make maintenance harder

**Fix:** Split into sub-components per tab/section. Use React `lazy()` + `Suspense` for route-level code splitting.

---

### 3.5 — Excessive `any` Types in TypeScript

**File:** `frontend/src/lib/api.ts` and throughout the frontend

```typescript
summary_json: any | null
```

Using `any` defeats the purpose of TypeScript. Type errors that would be caught at compile time silently become runtime bugs. Especially dangerous with the large `summary_json` object from Gemini — any schema change will break the UI silently.

**Fix:** Define proper TypeScript interfaces for all API response types, especially `DPRSummary`, `ComparisonResult`, and `ChatMessage`.

---

### 3.6 — Hardcoded State/Scheme/Sector Options in Frontend

**File:** `frontend/src/pages/Projects.tsx` — lines 23–76

All Indian states, government schemes, and sectors are hardcoded arrays in a React component. Adding a new scheme requires a code change and redeployment.

**Fix:** Move these to a backend config endpoint (`/api/config/options`) and fetch on app load. Cache aggressively since they never change.

---

### 3.7 — Missing Distributed Tracing / Request Correlation

No request IDs are generated or passed through the system. When something fails, you cannot correlate a frontend error with a backend log line, or a backend log line with a Gemini API call. Debugging production issues is essentially impossible.

**Fix:** Generate a `X-Request-ID` UUID at the API gateway level, pass it through all log lines, and return it in error responses so frontend can report it.

---

### 3.8 — No Error Boundaries in React

**File:** `frontend/src/pages/DocumentDetail.tsx`, `frontend/src/pages/ProjectDetail.tsx`

No React `ErrorBoundary` components wrap any section. A JavaScript error in the PDF viewer or chart component crashes the entire page to a blank white screen. Users see nothing and have no way to recover.

**Fix:** Wrap each major section (PDF viewer, charts, analysis tabs) in an `ErrorBoundary` that shows a friendly fallback UI.

---

## 4. Security Issues

### 4.1 — Secrets Exposed in .env File

**File:** `.env` (root directory)

The `.env` file contains live credentials:
- `GEMINI_API_KEY` — active Google API key
- `DB_PASSWORD` — live database password
- `CLOUDINARY_API_SECRET` — active Cloudinary secret
- `ADMIN_PASSWORD: 123` — trivially guessable

If this file is in version control (check `.gitignore`), these are already compromised and visible in git history. All keys must be **revoked and rotated immediately**.

**Fix:**
- Add `.env` to `.gitignore`
- Rotate all exposed credentials
- Use platform-level secrets (Render Environment Variables, Vercel Environment Variables)
- Never put real credentials in any file committed to git

---

### 4.2 — No Input Validation on File Uploads

**File:** `frontend/src/pages/ClientDashboard.tsx`

File type and size validation is missing. A user can attempt to upload an executable, a multi-GB file, or a malformed PDF. The backend only checks the file extension (`.pdf`), which is trivially bypassed by renaming any file.

**Fix:**
- Frontend: validate MIME type (`file.type === 'application/pdf'`) and size (`file.size < 50 * 1024 * 1024`) before uploading
- Backend: use `python-magic` to verify actual file MIME type from file content, not extension

---

### 4.3 — No CSRF Protection

The API uses token-based auth via a static `VITE_HACKATHON_ACCESS_TOKEN`, but there is no CSRF protection on state-mutating endpoints. Cross-site requests from malicious pages can trigger actions on behalf of authenticated users.

---

### 4.4 — No Audit Logging

No log exists of who approved/rejected DPRs, who changed compliance weights, or who deleted projects. In a government procurement context, this is a governance requirement — every admin action must be traceable to a specific user with a timestamp.

**Fix:** Add an `audit_log` table: `(id, user_id, action, resource_type, resource_id, timestamp, details_json)`. Log every write operation.

---

## 5. Frontend-Specific Issues

### 5.1 — No JWT Refresh Token Mechanism

**File:** `frontend/src/lib/api.ts`

```typescript
const token = import.meta.env.VITE_HACKATHON_ACCESS_TOKEN
```

A single static token is used for all API calls. There is no expiry, no refresh mechanism, no per-user token. If the token leaks (DevTools, network logs), anyone has permanent API access.

---

### 5.2 — Missing Loading States on Async Operations

**File:** `frontend/src/pages/ProjectDetail.tsx`

Multiple async operations (fetch project, fetch DPRs, fetch comparison) fire without coordinated loading indicators. The UI shows partial data while some operations are still in flight, creating a flickering experience.

---

### 5.3 — No Soft Deletes

All delete operations are hard `DELETE` SQL statements. Accidentally deleted DPRs or projects cannot be recovered. In a procurement platform, data loss is unacceptable.

**Fix:** Add `deleted_at TIMESTAMP NULL` column to all tables. Filter with `WHERE deleted_at IS NULL` on all reads. Show a 30-day recovery window in the UI.

---

## 6. Database Design Issues

### 6.1 — No Foreign Key Constraints

There are no explicit `FOREIGN KEY` constraints between tables (e.g., `dprs.project_id` → `projects.id`). Orphaned records can accumulate — DPRs pointing to deleted projects, chat messages pointing to deleted DPRs.

---

### 6.2 — Missing `updated_at` Columns on Mutable Tables

`dprs`, `projects`, and `comparisons` have no `updated_at` timestamp. You cannot tell when a record was last modified, which breaks any cache invalidation strategy and makes debugging data issues very difficult.

---

### 6.3 — String-Based State and Sector Validation

**File:** `backend/db.py` — `validate_dpr_against_project()`

State and sector matching is done with string comparison:
```python
if dpr_state.lower() != project_state.lower():
    ...
```

No normalization, no enum enforcement. Typos or formatting differences (`"Tamil Nadu"` vs `"tamilnadu"`) silently fail validation. These should be enforced at the DB level with a lookup table or `CHECK` constraint.

---

## 7. Dependency Issues

### 7.1 — `psycopg2-binary` vs `psycopg2`

`psycopg2-binary` bundles its own OpenSSL — it is not suitable for production (the psycopg2 maintainers explicitly warn against it for production deployments). It can conflict with the system OpenSSL and cause hard-to-debug SSL errors.

**Fix:** Switch to `asyncpg` (fully async, no C extension issues) or build `psycopg2` from source in the Docker/Render image.

---

### 7.2 — `pdfjs-dist` Version Mismatch

**File:** `frontend/package.json`

`pdfjs-dist ^3.11.174` — the PDF.js worker file path must match the exact version loaded. Version mismatches cause the PDF viewer to silently fail or show blank pages.

---

## 8. What Judges Will Ask

| Question | Root Cause |
|---|---|
| "What happens when Gemini takes 3 minutes?" | Issue 1.1 — Blocking HTTP connection |
| "What if you need to run 2 server instances?" | Issue 1.2 — In-memory session state |
| "What happens with 10,000 DPRs?" | Issue 2.2 — No pagination |
| "How does query time scale as data grows?" | Issue 2.3 — No DB indexes |
| "How many concurrent requests can you handle?" | Issue 2.4 — psycopg2 thread pool |
| "What's your throughput ceiling?" | Issue 2.5 — Pool size hardcoded to 10 |
| "How do you prevent a single user from killing the system?" | Issue 2.6 — No rate limiting |
| "What happens if Gemini's API hangs?" | Issue 2.7 — No timeouts |
| "How do you secure admin routes?" | Issue 1.3 — localStorage auth |
| "How do you deploy to staging vs production?" | Issue 2.9 — Hardcoded API URL |
| "What happens if the DB write succeeds but Cloudinary fails?" | Issue 2.10 — No transactions |

---

## 9. Recommended Fix Order

Fix these in order for maximum impact before the judging round:

1. **Issue 1.1** — Background task for PDF analysis (fixes 502 errors, most visible bug)
2. **Issue 2.9** — Fix the API URL config (fixes broken deployment)
3. **Issue 2.3** — Add DB indexes (immediate query performance win, 1-hour fix)
4. **Issue 2.2** — Add pagination to all list endpoints (scalability story)
5. **Issue 2.6** — Add rate limiting with `slowapi` (2-hour fix, huge credibility)
6. **Issue 2.4** — Switch to `asyncpg` (biggest concurrency improvement)
7. **Issue 1.2** — Persist chat sessions to DB (horizontal scalability)
8. **Issue 2.7 + 2.8** — Add timeouts on Gemini calls and frontend fetch
9. **Issue 1.3** — Proper JWT-based admin auth
10. **Issue 2.10** — Transaction management on multi-step operations
