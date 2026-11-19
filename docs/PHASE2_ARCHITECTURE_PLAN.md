# Phase 2 — Architecture & Migration Plan

**Project:** lexiexplorer-clone → Secure Backend-Driven Architecture  
**Target Stack:** Next.js (Vercel) + Node/Express (Render) + Supabase (PostgreSQL/Auth/Storage)  
**Status:** Proposed — awaiting approval before destructive/DB changes  

---

## 1. Target Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                           │
│  (Next.js frontend on Vercel — presentation & interaction only) │
└─────────────────────────────────────────────────────────────────┘
                              │ HTTPS REST API
                              │ NEXT_PUBLIC_API_URL
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (Node/Express on Render)             │
│  Routes → Controllers → Services → Repositories → Supabase      │
│  • Auth verification (Supabase JWT)                             │
│  • Rate limiting, CORS, input validation (Zod)                  │
│  • Business logic: XP, levels, quests, dialogue, subscriptions  │
│  • Authoritative source for protected operations                │
└─────────────────────────────────────────────────────────────────┘
                              │ supabase-js (service_role)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SUPABASE (PostgreSQL + Auth + Storage)        │
│  • RLS on all tables                                            │
│  • Auth: users, profiles                                        │
│  • Tables: vocab, quests, dialogues, user_progress, etc.        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Separation of Concerns

### Frontend (Vercel) — Presentation Layer Only
- All React components, UI, CSS, animations
- Client-side state (UI-only, not trusted)
- API client calls to Render backend
- Public assets (images, fonts — copied as-is)
- No secrets, no business logic, no auth validation

### Backend (Render) — Authority Layer
- Auth middleware (verify Supabase JWT)
- Business rules: XP calculation, level thresholds, quest completion
- Content serving (vocab, quests, dialogues from DB)
- User progress validation (never trust client)
- Admin operations
- Rate limiting, CORS, audit logging

### Supabase — Data Layer
- PostgreSQL tables with RLS
- Auth users + profiles
- Storage for any private media (if needed)

---

## 3. What Moves to Backend (from `german-engine.js`)

| Logic | Current Location | Target Location |
|-------|-----------------|-----------------|
| `GERMAN_VOCAB` database | `german-engine.js` (frontend) | Supabase `vocab` table + backend API |
| `QUESTS` definitions | `german-engine.js` (frontend) | Supabase `quests` table + backend API |
| `DIALOGUES` scripts | `german-engine.js` (frontend) | Supabase `dialogues` table + backend API |
| XP calculation & leveling | `State` in `german-engine.js` | Backend service |
| Quest completion validation | `handleItemInteraction` (frontend) | Backend endpoint |
| User progress (XP, level) | `localStorage` (frontend) | Supabase `user_progress` table |
| AI chat (Groq) | `api/german-chat.js` | Render backend route with JWT auth |

---

## 4. What Stays in Frontend

- All CSS files (preserved as-is)
- All page HTML structure (migrated to Next.js JSX, same visual design)
- React components and interactions
- Three.js 3D scene rendering (client-side)
- Public image/audio assets
- UI state (modals open/closed, form input, etc.)

---

## 5. Database Schema (Supabase)

### Tables (RLS enabled on all)

1. **`profiles`** — id (auth.users id), username, language_pref, created_at
2. **`user_progress`** — id, user_id, xp, level, completed_quests (jsonb), updated_at
3. **`vocab`** — key, de, en, ar, article, gender, example_de, example_ar, world
4. **`quests`** — id, world, title, title_ar, title_en, reward_xp
5. **`quest_tasks`** — id, quest_id, key, de, ar, gender
6. **`dialogues`** — id, world, title, speaker, avatar, reward_xp
7. **`dialogue_steps`** — id, dialogue_id, step_index, npc, npc_ar, choices (jsonb)
8. **`app_config`** — key, value (navigation, feature flags, settings)

---

## 6. API Endpoints (Backend `/api/v1/`)

### Public
- `GET /api/v1/health`
- `GET /api/v1/public/config` — app config (navigation, features)
- `GET /api/v1/public/vocab` — public vocab list (no user data)
- `GET /api/v1/public/quests` — public quest definitions

### Authenticated (require valid Supabase JWT)
- `GET /api/v1/me` — current user profile + progress
- `POST /api/v1/progress/xp` — add XP (validated)
- `POST /api/v1/progress/quest` — complete quest task (validated)
- `GET /api/v1/dialogues/:world` — dialogue for world
- `POST /api/v1/chat` — AI chat (replaces `api/german-chat.js`, JWT required)

### Admin
- `GET /api/v1/admin/users` — list users
- `POST /api/v1/admin/content` — manage vocab/quests

---

## 7. Security Controls

| Control | Implementation |
|---------|---------------|
| Authentication | Supabase Auth + JWT verification on backend |
| Authorization | RLS on Supabase + backend role checks |
| Rate limiting | `express-rate-limit` on sensitive routes |
| Input validation | Zod schemas on all request bodies |
| CORS | Restricted to `FRONTEND_ORIGIN` only |
| Secrets | `SUPABASE_SECRET_KEY` only in backend env vars |
| Headers | CSP, X-Frame-Options, etc. on both frontend & backend |
| Source maps | Disabled in production builds |

---

## 8. Environment Variables

**Frontend (`.env.example`):**
```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1
```

**Backend (`.env.example`):**
```
PORT=3000
NODE_ENV=production
FRONTEND_ORIGIN=https://your-frontend.vercel.app
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

---

## 9. Migration Phases (Incremental)

1. **Phase 3** — Create project directories + config files
2. **Phase 4** — Migrate frontend to Next.js (preserve design)
3. **Phase 5** — Implement Render backend with business logic
4. **Phase 6** — Supabase schema, RLS, auth
5. **Phase 7** — Connect frontend to backend APIs
6. **Phase 8** — Testing (security + functional)
7. **Phase 9** — Deployment instructions
8. **Phase 10** — Final report

---

## 10. Approval Required

Before I create Supabase migrations (Phase 6) or modify/delete any original files, I need your approval on this plan.

Specifically confirm:
1. ✅ Proceed with Phase 3 (create directories + config files only — no DB changes)
2. ⬜ Proceed with Phase 6 (Supabase migrations — creates new tables in Supabase, does not touch original project)
3. ⬜ Replace `api/german-chat.js` logic with Render backend endpoint

Shall I proceed with Phase 3 (create project structure and configuration files)?
