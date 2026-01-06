# Content Verification System - Requirements Document

> **Version:** 1.2  
> **Last Updated:** January 6, 2026  
> **Architecture:** Custom Frontend + Custom Backend + Supabase Database  
> **Meeting Feedback:** December 17 & December 29, 2025 sync calls incorporated

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Technical Architecture](#technical-architecture)
4. [Functional Requirements](#functional-requirements)
5. [Non-Functional Requirements](#non-functional-requirements)
6. [API Specifications](#api-specifications)
7. [Database Schema](#database-schema)
8. [User Roles & Permissions](#user-roles--permissions)
9. [Third-Party Integrations](#third-party-integrations)
10. [Security Requirements](#security-requirements)
11. [Deployment Requirements](#deployment-requirements)

---

## Executive Summary

The **Content Verification System** is a web application designed to streamline SEO content verification workflows. It enables teams to manage projects, upload SEO keywords and content, perform automated content analysis, and facilitate review/approval processes.

### Key Features
- Role-based access control (RBAC) with 4 user roles
- Project & page management
- SEO keyword management with metrics from DataForSEO
- Content upload and parsing (from Google Sheets)
- Automated content analysis with scoring
- Content verification workflow (approve/reject/revision)
- Real-time keyword highlighting

---

## System Overview

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Browser)                                │
│                    React + TypeScript + Tailwind CSS                         │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │ HTTPS
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CUSTOM BACKEND API                                 │
│                         (Node.js / Python / Go)                              │
│  ┌──────────────┬───────────────┬──────────────┬──────────────────────────┐ │
│  │ Auth Service │ Project API   │ Analysis API │ Integration Service       │ │
│  │              │ Page API      │ Review API   │ (DataForSEO, Sheets, AI)  │ │
│  └──────────────┴───────────────┴──────────────┴──────────────────────────┘ │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SUPABASE                                        │
│  ┌──────────────────┐  ┌─────────────────┐  ┌────────────────────────────┐  │
│  │  Authentication  │  │   PostgreSQL    │  │   Storage (Optional)       │  │
│  │    (GoTrue)      │  │   Database      │  │   (Avatars, Files)         │  │
│  │                  │  │   + RLS         │  │                            │  │
│  └──────────────────┘  └─────────────────┘  └────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Zustand, React Router |
| **Backend** | Node.js (Express) or Python (FastAPI) or Go (Gin) |
| **Database** | Supabase (PostgreSQL with RLS) |
| **Authentication** | Supabase Auth (GoTrue) |
| **File Storage** | Supabase Storage (optional) |
| **External APIs** | DataForSEO, Google Sheets API, OpenAI (for analysis) |
| **Deployment** | Railway / Vercel / Render |

---

## Technical Architecture

### Frontend (React + TypeScript)

The frontend is a single-page application (SPA) built with:

- **React 18** with TypeScript for type-safe component development
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for styling
- **Zustand** for client-side state management
- **React Router** for navigation
- **Lucide React** for icons

#### Frontend Directory Structure

```
src/
├── components/        # Reusable UI components
│   ├── ui/           # Base UI components (Button, Input, Card, etc.)
│   ├── layout/       # Header, Sidebar, Layout components
│   └── features/     # Feature-specific components
├── pages/            # Page components (routes)
│   ├── auth/         # Login, Register pages
│   ├── dashboard/    # Dashboard page
│   ├── projects/     # Project list, detail, page detail
│   ├── settings/     # User settings
│   └── activity/     # Activity log
├── services/         # API service layer
│   ├── authService.ts
│   ├── projectService.ts
│   ├── pageService.ts
│   ├── seoService.ts
│   ├── contentService.ts
│   └── analysisService.ts
├── stores/           # Zustand state stores
├── hooks/            # Custom React hooks
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
└── lib/              # External library configurations
```

### Backend (Custom API Server)

The backend handles:
- Authentication via Supabase Auth
- Business logic and validation
- External API integrations (DataForSEO, Google Sheets, AI)
- Content analysis processing
- Database operations via Supabase client

#### Backend Directory Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── middleware/       # Auth, validation, error handling
│   ├── routes/           # API route definitions
│   │   ├── auth.ts
│   │   ├── projects.ts
│   │   ├── pages.ts
│   │   ├── seo.ts
│   │   ├── content.ts
│   │   └── analysis.ts
│   ├── services/         # Business logic
│   │   ├── authService.ts
│   │   ├── projectService.ts
│   │   ├── analysisService.ts
│   │   ├── dataForSEOService.ts
│   │   ├── googleSheetsService.ts
│   │   └── aiService.ts
│   ├── models/           # Database models/types
│   └── utils/            # Utilities
├── tests/
└── package.json
```

### Database (Supabase PostgreSQL)

Supabase provides:
- **PostgreSQL database** with Row Level Security (RLS)
- **Authentication** with email/password and OAuth
- **Real-time subscriptions** (optional)
- **Storage** for file uploads (optional)

---

## Functional Requirements

### FR-001: User Authentication & Authorization

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001.1 | Users can register with email and password | High |
| FR-001.2 | Users can log in with email and password | High |
| FR-001.3 | Admin can assign roles to users | High |
| FR-001.4 | System enforces role-based access control | High |
| FR-001.5 | Users can update their profile information | Medium |
| FR-001.6 | Users can reset password via email | Medium |
| FR-001.7 | Optional: OAuth login (Google, GitHub) | Low |

### FR-002: Project Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-002.1 | Admin/SEO Analyst can create projects | High |
| FR-002.2 | Projects have name, website URL, and description | High |
| FR-002.3 | Admin can delete projects | High |
| FR-002.4 | Admin/SEO Analyst can add members to projects | High |
| FR-002.5 | Users can view projects they are members of | High |
| FR-002.6 | Admin/SEO Analysts can view all projects | High |
| FR-002.7 | Projects display page count and status summary | Medium |

### FR-003: Page Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-003.1 | Admin/SEO Analyst can create pages within projects | High |
| FR-003.2 | Pages have name, slug, and status | High |
| FR-003.3 | Admin can delete pages | High |
| FR-003.4 | Page status follows workflow: draft → awaiting_seo → awaiting_content → processing → pending_review → approved/rejected/revision_requested | High |
| FR-003.5 | All project members can view pages | High |

### FR-004: SEO Keyword Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-004.1 | SEO Analyst can upload **primary keywords** (1-3 high-priority target keywords) for a page | High |
| FR-004.2 | SEO Analyst can upload **secondary keywords** (supporting/long-tail keywords) for a page | High |
| FR-004.3 | Primary and secondary keywords are stored and displayed separately | High |
| FR-004.4 | System validates keyword input (non-empty, reasonable limits) | High |
| FR-004.5 | System fetches keyword metrics from DataForSEO: **CPC, Search Volume, Difficulty, Bid Range** | High |
| FR-004.6 | **AI auto-ranks/orders keywords** based on DataForSEO metrics (higher-value keywords at top) | High |
| FR-004.7 | All project members can view SEO keywords and metrics | High |
| FR-004.8 | SEO Analyst can update keywords (creates new version) | Medium |
| FR-004.9 | System maintains version history of keyword uploads | Medium |

### FR-005: Content Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-005.1 | Content Writer can upload content via Google Sheet URL | High |
| FR-005.2 | System parses Google Sheet content (meta title, description, headings, paragraphs, alt texts) | High |
| FR-005.3 | Content Writer can manually input/edit content | Medium |
| FR-005.4 | All project members can view content | High |
| FR-005.5 | **Content Writer sees SEO keywords highlighted** while editing/viewing content | High |
| FR-005.6 | Content Writer can update content (creates new version) | Medium |
| FR-005.7 | System maintains **version history of all content revisions** for tracking progression | Medium |
| FR-005.8 | *(Future)* Option to **generate content using AI** instead of manual upload | Low |

### FR-006: Content Analysis

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-006.1 | System automatically triggers analysis when both keywords and content are uploaded | High |
| FR-006.2 | Analysis calculates overall score (0-100) | High |
| FR-006.3 | Analysis calculates individual scores: **SEO** (primary focus), Readability, Keyword Density, Grammar, Content Intent, Technical Health | High |
| FR-006.4 | **Primary keyword checks:** Must appear in Title Tag, H1, H2, First Paragraph, with density < 2% | High |
| FR-006.5 | **Secondary keyword analysis:** Show frequency and placement breakdown (Title, H1, H2, H3, Paragraphs) | High |
| FR-006.6 | **Detailed placement breakdown:** For each keyword, show count per placement type (not just total) | High |
| FR-006.7 | **Weighted Keyword Scoring:** `Score = CPC × Usage Count` - motivates using high-value keywords more | High |
| FR-006.8 | Analysis generates suggestions for improvement | High |
| FR-006.9 | Analysis generates highlighted content HTML with keywords marked | High |
| FR-006.10 | All project members can view analysis results | High |

### FR-007: Content Review & Verification

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-007.1 | Content Verifier can view content with keyword highlighting | High |
| FR-007.2 | Content Verifier can approve content (status → approved) | High |
| FR-007.3 | Content Verifier can reject content (status → rejected) | High |
| FR-007.4 | Content Verifier can request revision (status → revision_requested) | High |
| FR-007.5 | Content Verifier can add **review comments** visible to Writer and SEO Analyst | High |
| FR-007.6 | **Auto-routing threshold:** Content only reaches Verifier if ALL scores are ≥ 90% | High |
| FR-007.7 | If scores < 90%, content stays with Writer/SEO for revision (AI gatekeeper) | High |
| FR-007.8 | Page history shows all status changes and revision iterations | Medium |
| FR-007.9 | *(Future)* **ClickUp integration:** Status changes create/update ClickUp tasks | Low |

### FR-008: Dashboard & Reporting

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-008.1 | Dashboard shows summary of projects and pages | High |
| FR-008.2 | Dashboard shows **all pages with their status** in a simple list view | High |
| FR-008.3 | **Project overview stats:** Total pages, pending reviews count, approved count, **average score** | High |
| FR-008.4 | Dashboard shows recent activity | Medium |
| FR-008.5 | Dashboard provides quick actions based on user role | Medium |
| FR-008.6 | **No separate "My Tasks" section** - avoid additional notification systems | Medium |
| FR-008.7 | **Process guidelines (?) icon:** Clickable help icon showing complete workflow process for all users | Medium |

### FR-009: Admin Functions

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-009.1 | Admin can view all users | High |
| FR-009.2 | Admin can change user roles | High |
| FR-009.3 | Admin can delete users | Medium |
| FR-009.4 | Admin can view audit log of all actions | Medium |

---

## Non-Functional Requirements

### NFR-001: Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-001.1 | Page load time | < 2 seconds |
| NFR-001.2 | API response time | < 500ms for most endpoints |
| NFR-001.3 | Content analysis processing | < 30 seconds |
| NFR-001.4 | Support concurrent users | 100+ |

### NFR-002: Scalability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-002.1 | Handle projects | Up to 1,000 |
| NFR-002.2 | Handle pages per project | Up to 500 |
| NFR-002.3 | Handle users | Up to 500 |

### NFR-003: Reliability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-003.1 | System uptime | 99.5% |
| NFR-003.2 | Data backup frequency | Daily |
| NFR-003.3 | Error recovery | Graceful degradation |

### NFR-004: Security

| ID | Requirement |
|----|-------------|
| NFR-004.1 | All data transmitted over HTTPS |
| NFR-004.2 | Passwords hashed with bcrypt |
| NFR-004.3 | JWT tokens for session management |
| NFR-004.4 | Row-level security enforced at database level |
| NFR-004.5 | API rate limiting implemented |
| NFR-004.6 | Input validation and sanitization |

### NFR-005: Usability

| ID | Requirement |
|----|-------------|
| NFR-005.1 | Responsive design (desktop, tablet, mobile) |
| NFR-005.2 | Intuitive navigation |
| NFR-005.3 | Clear error messages |
| NFR-005.4 | Loading states for async operations |

---

## API Specifications

### Base URL

```
Production: https://api.yourapp.com/v1
Development: http://localhost:3001/v1
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |
| POST | `/auth/logout` | Logout user |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password with token |
| GET | `/auth/me` | Get current user profile |
| PUT | `/auth/me` | Update current user profile |

### Project Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/projects` | List user's projects | All |
| POST | `/projects` | Create project | Admin, SEO Analyst |
| GET | `/projects/:id` | Get project details | Members |
| PUT | `/projects/:id` | Update project | Admin, Creator |
| DELETE | `/projects/:id` | Delete project | Admin |
| GET | `/projects/:id/members` | List project members | Members |
| POST | `/projects/:id/members` | Add project member | Admin, Creator |
| DELETE | `/projects/:id/members/:userId` | Remove member | Admin, Creator |

### Page Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/projects/:projectId/pages` | List project pages | Members |
| POST | `/projects/:projectId/pages` | Create page | Admin, SEO Analyst |
| GET | `/pages/:id` | Get page details | Members |
| PUT | `/pages/:id` | Update page | Admin, SEO Analyst |
| DELETE | `/pages/:id` | Delete page | Admin |
| PUT | `/pages/:id/status` | Update page status | Role-dependent |

### SEO Data Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/pages/:pageId/seo` | Get SEO data | Members |
| POST | `/pages/:pageId/seo` | Upload SEO keywords | Admin, SEO Analyst |
| PUT | `/pages/:pageId/seo` | Update SEO keywords | Admin, SEO Analyst |
| GET | `/pages/:pageId/seo/metrics` | Get keyword metrics | Members |

### Content Data Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/pages/:pageId/content` | Get content data | Members |
| POST | `/pages/:pageId/content` | Upload content | Admin, Content Writer |
| PUT | `/pages/:pageId/content` | Update content | Admin, Content Writer |
| POST | `/pages/:pageId/content/parse-sheet` | Parse Google Sheet | Admin, Content Writer |

### Analysis Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/pages/:pageId/analysis` | Get analysis results | Members |
| POST | `/pages/:pageId/analysis/trigger` | Trigger analysis | Admin, System |
| GET | `/pages/:pageId/analysis/highlighted` | Get highlighted content | Members |

### Review Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/pages/:pageId/comments` | Get review comments | Members |
| POST | `/pages/:pageId/comments` | Add review comment | Admin, Content Verifier |
| POST | `/pages/:pageId/approve` | Approve page | Admin, Content Verifier |
| POST | `/pages/:pageId/reject` | Reject page | Admin, Content Verifier |
| POST | `/pages/:pageId/request-revision` | Request revision | Admin, Content Verifier |

### Admin Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/admin/users` | List all users | Admin |
| PUT | `/admin/users/:id/role` | Update user role | Admin |
| DELETE | `/admin/users/:id` | Delete user | Admin |
| GET | `/admin/audit-log` | Get audit log | Admin |

---

## Database Schema

### Tables Overview

| Table | Description |
|-------|-------------|
| `users` | User profiles (extends auth.users) |
| `projects` | Project information |
| `project_members` | Project membership assignments |
| `pages` | Pages within projects |
| `seo_data` | SEO keywords per page |
| `content_data` | Page content data |
| `analysis_results` | Content analysis results |
| `review_comments` | Review comments on pages |
| `audit_log` | Admin audit trail |

### Entity Relationship Diagram

```
┌──────────────────┐       ┌──────────────────┐
│      users       │       │     projects     │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │
│ email            │       │ name             │
│ name             │       │ website_url      │
│ role             │◄──────│ created_by (FK)  │
│ avatar_url       │       │ description      │
│ created_at       │       │ created_at       │
│ updated_at       │       │ updated_at       │
└──────────────────┘       └─────────┬────────┘
         │                           │
         │                           │
         ▼                           ▼
┌──────────────────┐       ┌──────────────────┐
│ project_members  │       │      pages       │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │
│ project_id (FK)  │       │ project_id (FK)  │
│ user_id (FK)     │       │ name             │
│ role             │       │ slug             │
│ joined_at        │       │ status           │
└──────────────────┘       │ created_at       │
                           │ updated_at       │
                           └─────────┬────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
          ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
          │   seo_data   │  │ content_data │  │  analysis    │
          ├──────────────┤  ├──────────────┤  ├──────────────┤
          │ id (PK)      │  │ id (PK)      │  │ id (PK)      │
          │ page_id (FK) │  │ page_id (FK) │  │ page_id (FK) │
          │ primary_kw   │  │ sheet_url    │  │ scores       │
          │ secondary_kw │  │ content JSON │  │ suggestions  │
          │ uploaded_by  │  │ uploaded_by  │  │ processed_at │
          │ version      │  │ version      │  └──────────────┘
          └──────────────┘  └──────────────┘
```

### Enum Types

```sql
-- User roles
CREATE TYPE user_role AS ENUM (
    'admin',
    'seo_analyst',
    'content_writer',
    'content_verifier'
);

-- Page status
CREATE TYPE page_status AS ENUM (
    'draft',
    'awaiting_seo',
    'awaiting_content',
    'processing',
    'pending_review',
    'revision_requested',
    'approved',
    'rejected'
);
```

> **Note:** Full database schema with SQL is available in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

---

## User Roles & Permissions

### Role Definitions

| Role | Description |
|------|-------------|
| `admin` | System administrator with full access |
| `seo_analyst` | SEO specialist who manages keywords and projects |
| `content_writer` | Creates and uploads content |
| `content_verifier` | Reviews and approves/rejects content |

### Permission Matrix

| Action | Admin | SEO Analyst | Content Writer | Content Verifier |
|--------|:-----:|:-----------:|:--------------:|:----------------:|
| **Users** |||||
| Create users | ✅ | ❌ | ❌ | ❌ |
| Manage roles | ✅ | ❌ | ❌ | ❌ |
| View all users | ✅ | ❌ | ❌ | ❌ |
| **Projects** |||||
| Create project | ✅ | ✅ | ❌ | ❌ |
| Delete project | ✅ | ❌ | ❌ | ❌ |
| View all projects | ✅ | ✅ | ❌ | ❌ |
| View assigned projects | ✅ | ✅ | ✅ | ✅ |
| Add/remove members | ✅ | ✅ | ❌ | ❌ |
| **Pages** |||||
| Create page | ✅ | ✅ | ❌ | ❌ |
| Delete page | ✅ | ✅ | ❌ | ❌ |
| View pages | ✅ | ✅ | ✅ | ✅ |
| **SEO Data** |||||
| Upload keywords | ✅ | ✅ | ❌ | ❌ |
| Edit keywords | ✅ | ✅ | ❌ | ❌ |
| View keywords | ✅ | ✅ | ✅ | ✅ |
| **Content** |||||
| Upload content | ✅ | ❌ | ✅ | ❌ |
| Edit content | ✅ | ❌ | ✅ | ❌ |
| View content | ✅ | ✅ | ✅ | ✅ |
| **Review** |||||
| Approve/Reject | ✅ | ❌ | ❌ | ✅ |
| Request revision | ✅ | ❌ | ❌ | ✅ |
| Add comments | ✅ | ❌ | ❌ | ✅ |
| View analysis | ✅ | ✅ | ✅ | ✅ |

---

## Third-Party Integrations

### 1. DataForSEO API

**Purpose:** Fetch keyword metrics and enable AI-powered keyword ranking

| Configuration | Value |
|---------------|-------|
| API Endpoint | `https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live` |
| Auth Method | Basic Auth |
| Rate Limit | 2 seconds between requests |
| Batch Size | Up to 1000 keywords per request |
| Fallback | Mock data when API unavailable |

**Metrics Fetched:**

| Metric | Description | Usage |
|--------|-------------|-------|
| CPC | Cost per click | Used in weighted scoring formula |
| Search Volume | Monthly search volume | Keyword ranking |
| Difficulty | Keyword difficulty score | Keyword ranking |
| Bid Range | Low/high bid range | Display to users |
| Competition | Competition level | Display to users |

**Environment Variables:**
```
DATAFORSEO_LOGIN=your_login
DATAFORSEO_PASSWORD=your_password
```

### 2. Google Sheets API

**Purpose:** Parse content from Google Sheets

| Configuration | Value |
|---------------|-------|
| Auth Method | Service Account or OAuth2 |
| Scopes | `https://www.googleapis.com/auth/spreadsheets.readonly` |

**Environment Variables:**
```
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

### 3. OpenAI API (Optional)

**Purpose:** Content analysis, grammar checking, suggestions

| Configuration | Value |
|---------------|-------|
| API Endpoint | `https://api.openai.com/v1` |
| Model | GPT-4 or GPT-3.5-turbo |

**Environment Variables:**
```
OPENAI_API_KEY=sk-...
```

---

## Security Requirements

### Authentication & Authorization

1. **JWT Tokens:** Use Supabase Auth JWTs for session management
2. **Token Expiry:** Access tokens expire in 1 hour, refresh tokens in 7 days
3. **Role Verification:** Backend validates user role for every protected endpoint
4. **Row-Level Security:** Supabase RLS policies enforce data access at database level

### Data Protection

1. **Encryption in Transit:** All API communication over HTTPS (TLS 1.2+)
2. **Encryption at Rest:** Supabase encrypts data at rest by default
3. **Password Security:** Passwords hashed with bcrypt (via Supabase Auth)
4. **API Keys:** All third-party API keys stored as environment variables

### Input Validation

1. **Sanitization:** All user inputs sanitized before database operations
2. **Validation:** Backend validates request body schemas
3. **XSS Prevention:** React's default escaping + sanitized HTML for highlighted content
4. **SQL Injection:** Prevented via parameterized queries (Supabase client)

### Rate Limiting

1. **API Rate Limits:** Configurable per endpoint
2. **DataForSEO:** 2-second minimum between requests
3. **Authentication:** Max 5 login attempts per minute per IP

### Audit Logging

1. **Actions Logged:** User creates, updates, deletes; role changes; status changes
2. **Log Retention:** 90 days minimum
3. **Admin Access:** Only admins can view audit logs

---

## Deployment Requirements

### Frontend Deployment (Vercel / Netlify / Railway)

**Build Configuration:**
```bash
npm run build
# Output: dist/
```

**Environment Variables:**
```
VITE_API_URL=https://api.yourapp.com
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Backend Deployment (Railway / Render / Fly.io)

**Environment Variables:**
```
# Server
PORT=3001
NODE_ENV=production

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...

# Third-party APIs
DATAFORSEO_LOGIN=your_login
DATAFORSEO_PASSWORD=your_password
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
OPENAI_API_KEY=sk-...

# Security
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=https://yourapp.com
```

### Supabase Configuration

1. **Project Setup:** Create Supabase project
2. **Database:** Run migration scripts from `supabase/migrations/`
3. **Auth:** Enable email/password authentication
4. **RLS:** Enable Row Level Security on all tables
5. **API Settings:** Configure CORS for frontend domain

---

## Appendix

### A. Page Status Workflow

```
                        ┌───────────────┐
                        │     draft     │
                        └───────┬───────┘
                                │
              ┌─────────────────┼─────────────────┐
              ▼                                   ▼
     ┌─────────────────┐               ┌─────────────────┐
     │  awaiting_seo   │               │awaiting_content │
     │ (content added) │               │ (keywords added)│
     └────────┬────────┘               └────────┬────────┘
              │                                   │
              └─────────────────┬─────────────────┘
                                │ (both uploaded)
                                ▼
                        ┌───────────────┐
                        │  processing   │
                        └───────┬───────┘
                                │ (analysis complete)
                                ▼
                        ┌───────────────┐
                        │pending_review │
                        └───────┬───────┘
                                │
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                 ▼
     ┌──────────────┐  ┌───────────────┐  ┌────────────────┐
     │   approved   │  │   rejected    │  │revision_request│
     └──────────────┘  └───────────────┘  └───────┬────────┘
                                                   │
                                                   ▼
                                          ┌───────────────┐
                                          │pending_review │
                                          └───────────────┘
```

### B. Content Parse Structure (Google Sheets)

Expected columns in Google Sheet:

| Column | Description |
|--------|-------------|
| Meta Title | Page meta title |
| Meta Description | Page meta description |
| H1 | Main headline(s) |
| H2 | Section headings |
| H3 | Sub-section headings |
| Paragraph | Body content paragraphs |
| Alt Text | Image alt text descriptions |

### C. Analysis Score Calculation

| Score Component | Weight | Description |
|-----------------|--------|-------------|
| SEO Score | 20% | Keyword usage in key positions |
| Readability Score | 20% | Flesch-Kincaid, sentence length |
| Keyword Density Score | 15% | Optimal density < 2% for primary keyword |
| Grammar Score | 15% | Grammar and spelling errors |
| Content Intent Score | 15% | Alignment with search intent |
| Technical Health Score | 15% | Meta tags, structure |

> **Auto-Routing Threshold:** All scores must be ≥ 90% for content to be sent to Content Verifier. Below threshold, content remains with Writer/SEO for improvement.

### D. Primary Keyword Placement Requirements

| Placement | Required | Description |
|-----------|----------|-------------|
| Title Tag | ✅ Yes | Primary keyword must appear in meta title |
| H1 | ✅ Yes | Primary keyword must appear in main heading |
| H2 | ✅ Yes | Primary keyword should appear in at least one H2 |
| First Paragraph | ✅ Yes | Primary keyword must appear in first paragraph |
| Density | < 2% | Primary keyword density should not exceed 2% |

### E. Secondary Keyword Tracking

For each secondary keyword, the system tracks and displays:

| Metric | Description |
|--------|-------------|
| Total Frequency | Total count across all content |
| Title Tag Count | Occurrences in meta title |
| H1 Count | Occurrences in H1 headings |
| H2 Count | Occurrences in H2 headings |
| H3 Count | Occurrences in H3 headings |
| Paragraph Count | Occurrences in body paragraphs |
| Density | Percentage of total word count |

### F. Weighted Keyword Scoring Formula

**Formula:** `Keyword Score = CPC Score × Usage Count in Content`

This scoring motivates content writers to use high-value (high CPC) keywords more frequently.

| Example | CPC | Usage Count | Keyword Score |
|---------|-----|-------------|---------------|
| Keyword A | 1 | 10 times | 10 |
| Keyword B | 5 | 2 times | 10 |
| Keyword C | 3 | 5 times | 15 |

> **Note:** Higher-value keywords (higher CPC) require fewer usages to achieve the same score, but using them more still increases overall content value.

### G. AI Keyword Ranking Algorithm

When SEO Analyst uploads keywords, the system automatically ranks them:

1. Fetch metrics from DataForSEO (CPC, Volume, Difficulty)
2. Calculate composite ranking score based on:
   - Search Volume (weight: 40%)
   - CPC (weight: 35%)
   - Inverse Difficulty (weight: 25%)
3. Order keywords from highest to lowest ranking score
4. Display ranked keywords with highest-value at top

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-06 | System | Initial requirements document |
| 1.1 | 2026-01-06 | System | Added Dec 17 feedback: primary/secondary keywords, enhanced SEO checks, 90% threshold auto-routing, keyword highlighting for writers, version history, ClickUp integration (future), AI content generation (future) |
| 1.2 | 2026-01-06 | System | Added Dec 29 feedback: process guidelines UI, AI keyword ranking/ordering, weighted keyword scoring (CPC × Usage), enhanced DataForSEO metrics (CPC, Volume, Difficulty, Bid Range), project dashboard stats |

---

> **Next Steps:** Review this document and provide feedback. Once approved, proceed with implementation plan.
