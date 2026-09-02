# COOP Report

**Academic Cooperative Training Documentation System — Huawei Tech Saudi**

A full-stack web application for producing high-quality academic cooperative training reports. Built to handle the complete workflow: from daily task logging, weekly summaries, AI-powered academic polishing, and bilingual export (Arabic + English) in DOCX, PDF, and standalone HTML — with real in-document navigation, zero-data-loss guarantees, and a professional bilingual interface.

---

## Architecture

```
COOP Report (Monorepo — npm Workspaces)
├── client/          React 18 + Vite + TypeScript + Tailwind CSS
├── server/          Node.js + Express + Prisma ORM + MySQL (XAMPP)
├── shared/          Pure TypeScript — types, constants, calculation engine
└── tests/           Vitest unit tests + Node.js E2E verification script
```

---

## Technology Stack

| Layer       | Technology                                                    |
|-------------|---------------------------------------------------------------|
| Frontend    | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons        |
| Backend     | Node.js, Express, Prisma ORM, JWT Authentication, bcrypt      |
| Database    | MySQL 8 (XAMPP), Prisma Migrations, ACID Transactions         |
| Documents   | `docx` library with real Word Bookmarks and InternalHyperlinks |
| PDF         | Browser Print API with `@media print` and `@page` A4 rules   |
| AI Services | REST endpoints for polish, spell-check, summarize, translate  |
| Testing     | Vitest (unit), Node.js E2E API verification script            |
| Integrity   | SHA-256 checksummed backup archives, soft-delete, revisions   |

---

## Core Features

### Daily Log
- Form with date, time range, category selector, title, and description
- Auto-save to `localStorage` on every keystroke (400ms debounce) — zero draft loss on refresh or crash
- Soft delete to a recoverable trash bin (no hard deletes)
- Revision history per entry — every edit snapshot is stored and revertable

### AI Enhancement Toolbar
- Academic polish: rewrites description into formal academic Arabic
- Spell and grammar check: corrects hamzas, tashkeel issues, punctuation
- Summarize: condenses while preserving numbers and key achievements
- Translate: instant Arabic ↔ English with academic register
- All actions show a diff-modal — accept, reject, or discard

### Weekly Summary
- Auto-groups entries by Saudi week (Sunday – Saturday)
- Per-week totals: hours, entries, estimated pages, categories breakdown
- Word count with green/red badge against 350 words/page standard

### Final Report
- Full profile form: trainee, supervisor, entity, department, address
- Auto-save draft to localStorage; loaded on mount if unsaved
- Bulk AI actions: audit all sections or auto-translate the entire report
- Interactive Table of Contents with anchor links for instant section/week jump

### Export Formats

| Format | Technology                         | Navigation                                   |
|--------|------------------------------------|----------------------------------------------|
| DOCX   | `docx` npm library                 | Real Word `Bookmark` + `InternalHyperlink`   |
| HTML   | Custom `htmlReportService`         | CSS anchor links + `@media print` page rules |
| PDF    | Browser print / Save as PDF        | Page breaks at chapter and week boundaries   |

### Data Integrity and Protection
- SHA-256 checksummed full-user archive export (JSON)
- Import with checksum verification before Prisma ACID upsert
- Soft-delete with `deletedAt` column — trash modal with one-click restore
- Entry revision snapshots on every update — revert to any previous version
- Routes: `GET /api/backup/export`, `POST /api/backup/import`, `GET /api/backup/trash`, `POST /api/backup/restore/:id`, `GET /api/backup/revisions/:entryId`, `POST /api/backup/revert/:entryId/:revisionId`

### Authentication
- JWT access tokens stored in `httpOnly` cookies
- bcrypt password hashing (cost factor 12)
- Role-based access: `trainee` and `supervisor`
- Supervisor–trainee linking by username code for review mode

---

## Database Schema

```prisma
model User {
  id         Int      @id @default(autoincrement())
  username   String   @unique
  password   String
  role       String   @default("trainee")
  entries    Entry[]
  profile    ReportProfile?
}

model Entry {
  id          Int              @id @default(autoincrement())
  userId      Int
  entryDate   String
  timeFrom    String
  timeTo      String
  title       String
  category    String
  description String           @db.Text
  deletedAt   DateTime?
  revisions   EntryRevision[]
  user        User             @relation(fields: [userId], references: [id])
}

model EntryRevision {
  id          Int      @id @default(autoincrement())
  entryId     Int
  title       String
  description String   @db.Text
  createdAt   DateTime @default(now())
  entry       Entry    @relation(fields: [entryId], references: [id])
}

model ReportProfile {
  id               Int    @id @default(autoincrement())
  userId           Int    @unique
  studentName      String
  trainingNumber   String
  department       String
  trainingUnit     String
  supervisorName   String
  responsibleName  String
  entityAddress    String
  employeesCount   String
  introText        String @db.Text
  entityIntroText  String @db.Text
  skillsText       String @db.Text
  conclusionText   String @db.Text
}
```

---

## Setup and Running

### Prerequisites

- Node.js 18+
- XAMPP with MySQL running on port 3306
- Database `coop_report` created in phpMyAdmin

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create `server/.env`:

```env
DATABASE_URL="mysql://root:@localhost:3306/coop_report"
JWT_SECRET="your-secret-key-here"
PORT=3001
```

### 3. Run Prisma migrations

```bash
# Stop any running tsx server first (DLL locking on Windows)
npm run prisma:migrate --workspace=server
```

### 4. Start development servers

```bash
# Terminal 1 — Backend (Express on :3001)
npm run dev:server

# Terminal 2 — Frontend (Vite on :5173)
npm run dev:client
```

### 5. Build for production

```bash
npm run build
```

---

## API Endpoints

### Authentication
| Method | Endpoint              | Description             |
|--------|-----------------------|-------------------------|
| POST   | `/api/auth/register`  | Register new user       |
| POST   | `/api/auth/login`     | Login and receive JWT   |
| POST   | `/api/auth/logout`    | Clear session cookie    |

### Entries
| Method | Endpoint            | Description                        |
|--------|---------------------|------------------------------------|
| GET    | `/api/entries`      | List user entries (excluding trash) |
| POST   | `/api/entries`      | Create new entry                   |
| PUT    | `/api/entries/:id`  | Update entry (auto-snapshots revision) |
| DELETE | `/api/entries/:id`  | Soft-delete to trash               |

### Reports
| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| GET    | `/api/reports/final`            | Aggregated report data   |
| GET    | `/api/reports/export/docx`      | Download Word file       |
| GET    | `/api/reports/export/html`      | Download HTML file       |
| PUT    | `/api/profile`                  | Save report profile      |

### Backup and Integrity
| Method | Endpoint                                | Description                  |
|--------|-----------------------------------------|------------------------------|
| GET    | `/api/backup/export`                    | Download SHA-256 archive     |
| POST   | `/api/backup/import`                    | Import and verify archive    |
| GET    | `/api/backup/trash`                     | List soft-deleted entries    |
| POST   | `/api/backup/restore/:id`               | Restore from trash           |
| GET    | `/api/backup/revisions/:entryId`        | List entry revisions         |
| POST   | `/api/backup/revert/:entryId/:revId`    | Revert to specific revision  |

### AI Processing
| Method | Endpoint           | Actions                                       |
|--------|--------------------|-----------------------------------------------|
| POST   | `/api/ai/process`  | `polish`, `spellcheck`, `summarize`, `translate` |

---

## Important Technical Notes

### Arabic Regex Boundaries
JavaScript `\b` does not match Arabic word boundaries. Use Unicode lookaheads:
```javascript
const pattern = /(?<![\u0600-\u06FF])word(?![\u0600-\u06FF])/g;
```

### Prisma on Windows (XAMPP)
Running `tsx watch` locks `query_engine-windows.dll.node`. Before running `prisma generate`:
1. Kill the running Node/tsx process
2. Run `npx prisma generate`
3. Restart the server

### Word Document Navigation
```typescript
import { Bookmark, InternalHyperlink } from 'docx';

// Create bookmark target
new Bookmark({ id: 'week_1', children: [new TextRun('Week 1')] })

// Create clickable hyperlink to bookmark
new InternalHyperlink({ anchor: 'week_1', children: [new TextRun('Go to Week 1')] })
```

---

## Project Structure

```
client/src/
├── components/
│   ├── auth/        AuthScreen (split-screen login/register)
│   ├── common/      Navbar, DiffModal
│   ├── log/         DailyLogTab (draft, AI toolbar, trash, revisions)
│   ├── weekly/      WeeklyTab (auto-grouped summaries)
│   ├── final/       FinalReportTab (profile, TOC, export, backup UI)
│   └── supervisor/  SupervisorTab (review mode)
├── context/         AuthContext (JWT + user state)
├── services/        api.ts (Axios instance)
├── App.tsx          Shell, tab routing, language toggle
└── index.css        Design system (tokens, utilities, print rules)

server/src/
├── routes/          auth, entries, reports, profile, ai, backup
├── services/        docxService, htmlReportService, aiService, backupService
├── middleware/       auth guard
└── app.ts           Express setup, CORS, cookie-parser

shared/src/
├── types.ts          EntryDTO, FinalReportData, ProfileInput, DiffChunk...
├── constants.ts      ENTRY_CATEGORIES
└── calculations.ts   calculateHoursBetween, countWords, estimatePageCount
```

---

## License

Private academic project for Huawei Tech Saudi cooperative training program.
Not for redistribution.
