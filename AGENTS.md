# ErrandHub — Build Process

## Overview
A production-ready local services & personal assistance marketplace connecting clients with trusted service providers (agents). Inspired by TaskRabbit, Airtasker, Thumbtack, and Fiverr.

## Tech Stack
- **Backend**: Laravel 12, PHP 8.2+, MySQL, Sanctum (auth), Spatie Permission (roles), Laravel Reverb (real-time)
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, React Router, TanStack Query, Zustand, React Hook Form, Lucide Icons
- **Infrastructure**: Laravel Queue (database driver for MVP), caching (database driver for MVP)
- **Testing**: PHPUnit (backend), Vitest (frontend) — not yet written

## Product Spec Reference
Full spec: `instructions.md`

### Two Workflows
1. **Client Posts Request** → agents browse → one accepts → client confirms → work begins
2. **Provider Lists Services** → client searches → client books → provider accepts → work begins

### Core Domain Models (all UUID primary keys)
- **User** (client, agent, super-admin) — Sanctum auth, roles via Spatie, email + phone verification
- **AgentProfile** — extended profile per agent: bio, skills, languages, coverage area, location, ratings, verification status
- **ServiceListing** — services offered by providers: title, category, description, price, photos, availability, tags, location
- **ServiceRequest** — what clients post: title, description, category, budget, location, deadline, 10-status lifecycle
- **Booking** — formal booking linking requests or services to provider/client pairs
- **PortfolioItem** — agent portfolio images with descriptions
- **Review** — multi-dimensional (Communication, Professionalism, Timeliness, Quality, Overall), bidirectional, admin moderation
- **Message** — real-time chat with file sharing, typing indicators, read receipts, location sharing
- **ServiceRequestStatus** — status transition history for requests
- **VerificationRequest** — government ID, address, business document verification
- **NotificationPreference** — per-user toggle for email/database/request/booking/chat/marketing

## Project Structure
```
ErrandHub/
├── backend/                      # Laravel 12 API
│   ├── app/
│   │   ├── Broadcasting/         # Reverb event classes (NewMessageSent)
│   │   ├── Console/              # ExpireStaleRequests command
│   │   ├── Events/               # ServiceRequestAccepted, Cancelled, Completed, BookingStatusChanged
│   │   ├── Http/
│   │   │   ├── Controllers/Api/  # 13 controllers (Auth, Dashboard, + 11 entity controllers)
│   │   │   ├── Requests/         # 10 Form Request classes with auth + validation
│   │   │   └── Resources/        # 12 API Resource classes (consistent JSON shapes)
│   │   ├── Listeners/            # SendRequestStatusNotification, SendBookingStatusNotification
│   │   ├── Models/               # 12 models, all HasUuids
│   │   ├── Notifications/        # RequestStatusNotification, BookingStatusNotification
│   │   ├── Policies/             # Mission, Message, Review, AgentProfile policies
│   │   └── Services/             # 12 service classes (business logic layer)
│   ├── config/
│   ├── database/
│   │   ├── migrations/           # 23 migrations
│   │   └── seeders/              # 3 idempotent seeders (roles, 75 categories, demo data)
│   └── routes/
│       ├── api.php               # 75 routes, rate-limited
│       └── channels.php          # Reverb private channel auth
├── frontend/                     # React SPA (Vite)
│   └── src/
│       ├── components/           # Layout, ProtectedRoute, ErrorBoundary, NotificationBell, Skeleton
│       ├── hooks/                # useChatSocket (WebSocket)
│       ├── pages/                # 23 page components (all lazy-loaded)
│       ├── services/             # Axios API client (baseURL: /api)
│       ├── stores/               # Zustand auth store (token + user)
│       └── App.tsx               # Routes with lazy + Suspense + ErrorBoundary
├── instructions.md               # Full product spec
└── AGENTS.md
```

## Progress by Phase

### Phase 1 — Foundation
- [x] Create database (MySQL)
- [x] Scaffold Laravel 12 in `backend/` — Sanctum + Spatie Permission + Reverb installed
- [x] Scaffold React + Vite in `frontend/` — all packages installed
- [x] Tailwind CSS v4 configured
- [x] Database queue driver for MVP
- [x] Database cache driver for MVP

### Phase 2 — Auth & Roles
- [x] User model + migration + roles (client/agent/super-admin)
- [x] Register + Login + Logout endpoints with throttling
- [x] Login/Register pages in React
- [x] Forgot Password flow (backend + pages)
- [x] Email Verification (MustVerifyEmail, signed URL, VerifyEmail page, dashboard banner)
- [x] Phone Verification (code-based, backend + banner)
- [x] Avatar upload
- [x] `GET /api/me` returns user + agent_profile
- [ ] Social Login (future)

### Phase 3 — Architecture Refactor
- [x] Service Layer — 12 service classes (Auth, Agent, Mission, Message, Review, Category, Dashboard, Booking, ServiceListing, Portfolio, Verification, Dashboard)
- [x] Form Requests — 10 classes with authorize() + validation rules
- [x] Policies — Mission, Message, Review, AgentProfile policies
- [x] All controllers delegate to Services + Form Requests

### Phase 4 — Provider Profiles & Portfolio
- [x] AgentProfile model + migration (UUID, JSON columns, location coords)
- [x] Profile builder API (POST/GET/PUT /my-profile)
- [x] Profile builder UI page
- [x] Photo upload for profile avatar
- [x] PortfolioItem model + migration (images, descriptions, category)
- [x] Portfolio CRUD API + UI
- [x] Verification system (government ID, address, business docs)
- [x] Verified badge display

### Phase 5 — Service Listings
- [x] ServiceListing model + migration (price_type, starting_price, negotiable, location, coords, coverage_radius, photos, availability, tags, experience, estimated_duration, status)
- [x] Service CRUD API endpoints
- [x] Service creation/management UI for providers
- [x] Service browsing/search UI for clients
- [x] Photo upload for services (POST /services/{id}/photos)

### Phase 6 — Client Requests
- [x] ServiceRequest model + migration (renamed from Mission)
- [x] ServiceRequest CRUD API endpoints (renamed: /requests)
- [x] ServiceRequest create/browse/detail pages
- [x] Rename "Mission" → "Request" throughout (model: ServiceRequest, DB: service_requests, all routes/pages)
- [x] Photo upload for requests (photos column, POST /requests/{id}/photos)
- [x] Request lifecycle: draft → published → accepted → client_confirmed → travelling → waiting → in_progress → completed → reviewed (+ cancel/expire)

### Phase 7 — Booking System
- [x] Booking model + migration (UUID, links to request or service_listing, both workflows)
- [x] Booking endpoints: book, accept, decline, reschedule, cancel, complete
- [x] Booking UI (MyBookings page with action buttons)
- [x] BookingForm page (schedule + notes)
- [x] "Book This Service" button on ServiceDetail
- [x] Nav links to bookings

### Phase 8 — Discovery & Search
- [x] Agent discovery API with keyword search + filters
- [x] Category listing API (75 categories in 10 groups)
- [x] Full-text keyword search on requests/services/agents
- [x] Location-based search + haversine distance filtering (lat/lng on listings + profiles)
- [x] Filters: price_type, min/max price, negotiable, experience_years, tags, verified_agent, min_rating, budget_min/max
- [x] Sorting: newest, price, experience, jobs, rating, deadline
- [x] Pagination with per_page param
- [x] Rate limiting (auth: 5-10/min, public reads: 60/min, authenticated: 120/min)

### Phase 9 — Task Lifecycle
- [x] Status transitions (accept, confirm, start-travelling, mark-waiting, start, complete, cancel)
- [x] Status timeline (service_request_statuses table)
- [x] Lifecycle events: ServiceRequestAccepted, ServiceRequestCompleted, ServiceRequestCancelled, BookingStatusChanged
- [x] Event listeners send database + broadcast notifications
- [x] Cancellation flow with cancellation_reason + cancelled_by_id
- [x] Expiry handling: ExpireStaleRequests artisan command (hourly)
- [x] "Travelling" and "Waiting" status support

### Phase 10 — Reviews
- [x] Reviews table + migration (UUID, bidirectional)
- [x] Review API endpoints (create, list by user)
- [x] Review UI component
- [x] Multi-dimensional ratings (Communication, Professionalism, Timeliness, Quality, Overall) — 5 axes
- [x] Average rating calculations stored on agent_profiles (5 avg columns + total_reviews_count)
- [x] Review moderation (admin: list, flagged, hide, show) via super-admin role

### Phase 11 — Chat
- [x] Messages table + migration (content, type, metadata, file_url, read_at)
- [x] Laravel Reverb installed (config/broadcasting.php, channels.php)
- [x] Chat API endpoints (index, store, markAsRead)
- [x] Chat UI with WebSocket connection (useChatSocket hook, replaces polling)
- [x] Image/file sharing in chat (file upload, file_url column)
- [x] Typing indicators (client-event "client-typing")
- [x] Read receipts (POST .../messages/read + Check/CheckCheck icons)
- [x] Location sharing (Geolocation API → maps link)

### Phase 12 — Notifications
- [x] Notifications table + migration (UUID, morphs, read_at)
- [x] Real-time notifications via Reverb broadcast channel
- [x] Email notifications (toMail() on RequestStatusNotification + BookingStatusNotification)
- [x] Notification preferences (model + migration + GET/PUT /notifications/preferences)
- [x] Notification UI: bell icon with dropdown + NotificationsPage with preferences toggles

### Phase 13 — Dashboards
- [x] DashboardService + DashboardController (GET /dashboard/stats)
- [x] Client dashboard: stat cards, status breakdown, quick actions, recent requests
- [x] Agent dashboard: stat cards, status breakdown, profile widget, quick-nav tiles
- [x] Admin dashboard: platform overview grid, pending verifications table

### Phase 14 — Polish & Production Readiness
- [x] Database indexes — 25+ composite indexes on all 10 tables
- [x] API Resource classes — 12 classes for consistent JSON responses
- [x] All controllers updated — all 13 controllers use Resource classes
- [x] Error boundary — React ErrorBoundary wraps entire route tree
- [x] Lazy loading — all 23 pages via React.lazy() + Suspense
- [x] Skeleton components — CardSkeleton, ListSkeleton, DetailSkeleton, TableSkeleton
- [x] Seeders idempotent — RoleSeeder/CategorySeeder use firstOrCreate, DemoDataSeeder skips if users exist
- [ ] Image optimization (thumbnails, responsive)
- [ ] Tests (unit, feature, API, component, E2E)
- [ ] API documentation
- [ ] Installation/deployment/developer docs

### Phase 15 — Data & Demo
- [x] RoleSeeder (3 roles, idempotent)
- [x] CategorySeeder (75 categories in 10 groups, idempotent)
- [x] DemoDataSeeder (5 users, 3 profiles, 7 service listings, 6 portfolio items, 8 requests, 5 messages, 3 multi-dim reviews, 5 bookings, idempotent)

## Database Schema (12 tables, all UUID primary keys)

### `users`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | HasUuids trait |
| name | string | |
| email | string | unique |
| password | string | bcrypt, hashed cast |
| role | string | client, agent, super-admin |
| phone | string | nullable |
| avatar | string | nullable |
| email_verified_at | timestamp | nullable |
| phone_verified_at | timestamp | nullable |
| is_verified | boolean | default false |
| timestamps | | |

### `agent_profiles`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | |
| user_id | uuid | unique, cascade |
| bio | text | nullable |
| skills | json | array cast |
| languages | json | array cast |
| coverage_area | text | nullable |
| latitude | decimal(10,7) | nullable |
| longitude | decimal(10,7) | nullable |
| vehicle | string | nullable |
| available_hours | json | array cast |
| experience_years | integer | nullable |
| completed_jobs_count | integer | default 0 |
| avg_response_time | integer | nullable |
| avg_completion_time | integer | nullable |
| profile_completion_score | integer | default 0 |
| is_online | boolean | default false |
| avg_overall_rating | decimal | nullable |
| avg_communication_rating | decimal | nullable |
| avg_professionalism_rating | decimal | nullable |
| avg_timeliness_rating | decimal | nullable |
| avg_quality_rating | decimal | nullable |
| total_reviews_count | integer | default 0 |
| timestamps | | |

### `categories`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | |
| name | string | |
| slug | string | unique |
| description | text | nullable |
| icon | string | nullable |
| parent_id | uuid | nullable, self-ref |
| is_active | boolean | default true |
| timestamps | | |

### `service_requests`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | |
| client_id | uuid | users |
| agent_id | uuid | nullable |
| category_id | uuid | nullable |
| title | string | |
| description | text | |
| status | string | draft/published/accepted/client_confirmed/travelling/waiting/in_progress/completed/reviewed/cancelled/expired |
| priority | string | low/medium/high/urgent |
| location | text | nullable |
| latitude | decimal(10,7) | nullable |
| longitude | decimal(10,7) | nullable |
| deadline | datetime | nullable |
| budget_range | json | nullable |
| instructions | text | nullable |
| photos | json | nullable |
| cancellation_reason | text | nullable |
| cancelled_by_id | uuid | nullable |
| expires_at | datetime | nullable |
| timestamps | | |

### `service_request_statuses`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | |
| service_request_id | uuid | cascade |
| from_status | string | nullable |
| to_status | string | |
| note | text | nullable |
| user_id | uuid | who made the change |
| timestamps | | |

### `messages`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | |
| service_request_id | uuid | cascade |
| sender_id | uuid | users |
| content | text | |
| type | string | text/image/voice/location |
| metadata | json | nullable |
| file_url | string | nullable |
| read_at | timestamp | nullable |
| timestamps | | |

### `reviews`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | |
| service_request_id | uuid | unique, cascade |
| reviewer_id | uuid | users |
| reviewee_id | uuid | users |
| rating | tinyInteger | 1-5 (overall) |
| communication_rating | tinyInteger | nullable, 1-5 |
| professionalism_rating | tinyInteger | nullable, 1-5 |
| timeliness_rating | tinyInteger | nullable, 1-5 |
| quality_rating | tinyInteger | nullable, 1-5 |
| comment | text | nullable |
| is_hidden | boolean | default false (moderation) |
| hidden_by | uuid | nullable |
| hidden_at | timestamp | nullable |
| timestamps | | |

### `service_listings`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | |
| agent_id | uuid | users |
| category_id | uuid | categories |
| title | string | |
| description | text | |
| price_type | string | fixed/hourly/negotiable |
| starting_price | decimal(10,2) | nullable |
| is_negotiable | boolean | default true |
| location | text | |
| latitude | decimal(10,7) | nullable |
| longitude | decimal(10,7) | nullable |
| coverage_radius | integer | km |
| photos | json | nullable |
| availability | json | nullable |
| tags | json | nullable |
| experience_years | integer | nullable |
| estimated_duration | integer | minutes |
| status | string | active/inactive/paused |
| timestamps | | |

### `bookings`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | |
| request_id | uuid | nullable (workflow 1) |
| service_listing_id | uuid | nullable (workflow 2) |
| client_id | uuid | users |
| provider_id | uuid | users |
| status | string | pending/accepted/declined/rescheduled/cancelled/completed |
| scheduled_at | datetime | nullable |
| notes | text | nullable |
| timestamps | | |

### `portfolio_items`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | |
| agent_id | uuid | users |
| title | string | |
| description | text | nullable |
| images | json | |
| category_id | uuid | nullable |
| timestamps | | |

### `verification_requests`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | |
| user_id | uuid | users |
| type | string | government_id/address/business |
| documents | json | file paths |
| status | string | pending/approved/rejected |
| admin_note | text | nullable |
| reviewed_by | uuid | nullable |
| reviewed_at | datetime | nullable |
| timestamps | | |

### `notification_preferences`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | |
| user_id | uuid | unique |
| email_notifications | boolean | default true |
| database_notifications | boolean | default true |
| request_updates | boolean | default true |
| booking_updates | boolean | default true |
| chat_messages | boolean | default true |
| marketing_emails | boolean | default false |
| timestamps | | |

## Current State Summary

### What's Built (all 15 phases complete or near-complete)
- **12 Eloquent models** (all UUID) with 23 migrations + 25+ composite indexes
- **13 API controllers** with 75 routes — all using Resource classes for consistent JSON
- **12 Service classes** — business logic decoupled from controllers
- **10 Form Request classes** — validation + authorization in one place
- **4 Policy classes** — Mission, Message, Review, AgentProfile
- **4 Event classes** + **2 Listeners** — lifecycle events with notifications
- **2 Notification classes** — database + broadcast + email channels
- **1 Artisan command** — ExpireStaleRequests (hourly cron)
- **Reverb broadcasting** — private channel auth + NewMessageSent event
- **React SPA** — 23 lazy-loaded pages + ErrorBoundary + skeleton loading + optimized bundle
- **Frontend WebSocket** — real-time chat replacing polling (typing, read receipts, file sharing, location sharing)
- **Role-specific dashboards** — client, agent, super-admin with aggregated stats
- **Idempotent seeders** — roles, 75 categories, full demo dataset (5 users, 7 services, 6 portfolio, 8 requests, 5 bookings, 3 reviews)

### Demo Accounts (password: `password`)
| Role | Email | Name |
|------|-------|------|
| Client | alice@example.com | Alice Johnson |
| Client | bob@example.com | Bob Smith |
| Agent | carlos@example.com | Carlos Rivera |
| Agent | diana@example.com | Diana Chen |
| Agent | elena@example.com | Elena Foster |

### What's Missing
- Tests (PHPUnit, Vitest, E2E)
- API documentation
- Image optimization (thumbnails, responsive)
- Accessibility audit
- SEO setup
- Installation/deployment/developer docs
- Social login
- Full admin dashboard (analytics, charts, user management)
- Calendar/availability sync
- Payments/escrow/wallet

## Key Design Decisions
- **Monorepo** with separate `backend/` and `frontend/` directories
- **Laravel Sanctum** for SPA cookie-based API auth
- **Spatie Permission** for role management (client/agent/super-admin)
- **UUID primary keys** on all 12 models (HasUuids trait)
- **Laravel Reverb** for WebSocket real-time messaging (not Pusher)
- **MySQL** for all environments
- **Database driver** for queues + cache (MVP pragmatism, swap to Redis later)
- **Service layer pattern** — controllers thin, business logic in Services
- **API Resource classes** — consistent JSON shapes across all endpoints
- **Two business workflows** — client-posts and provider-lists, both supported
- **Bidirectional reviews** with multi-dimensional ratings (5 axes)
- **10-status lifecycle** for requests (draft → ... → reviewed + cancel/expire)
- **Payments handled outside platform** for V1

## Pre-Deployment Checklist (from security audit)
- [ ] Set `APP_DEBUG=false`, `APP_ENV=production` in `.env`
- [ ] Set non-empty `DB_PASSWORD`, configure strong MySQL user
- [ ] Set `SANCTUM_EXPIRATION` to sensible value (e.g., 1440 minutes)
- [ ] Move token from localStorage to httpOnly Sanctum cookies
- [ ] Add HTTPS enforcement: TrustProxies, SESSION_SECURE_COOKIE, SESSION_ENCRYPT
- [ ] Register Spatie middleware explicitly in bootstrap/app.php
- [ ] Add CSP header (nginx/Apache or meta tag)
- [ ] Replace hardcoded `http://localhost:8000` with `VITE_STORAGE_URL` env var
- [ ] Add CSRF protection to frontend Axios config
- [ ] Add mime restrictions to file upload endpoints (StoreMessageRequest, photo uploads)
- [ ] Enable TypeScript strict mode (`"strict": true` in tsconfig)
- [ ] Switch Reverb to WSS in production
- [ ] Add custom exception handler for consistent JSON error responses

## Notes
- Run `php artisan db:seed --force` to seed fresh demo data (or `migrate:fresh --seed`)
- Run `php artisan requests:expire` (or set up scheduler) to auto-expire stale requests
- Photo upload uses local `public/storage` for dev — switch to S3 for production
- All 12 models use UUID instead of auto-increment IDs — factor this into any raw SQL queries
- Future scalability includes: payments/wallet/escrow, subscriptions, business accounts, company teams, multi-tenancy, white-label portals, mobile apps, AI recommendations, route optimization, scheduling, video calls, live tracking, referral program, premium memberships
