<div align="center">

<br />

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/-%20COOP%20REPORT%20-C0102A?style=for-the-badge&labelColor=0d0d0d&color=C0102A&logoColor=white" />
  <img alt="COOP Report" src="https://img.shields.io/badge/-%20COOP%20REPORT%20-C0102A?style=for-the-badge&labelColor=f3f1ec&color=C0102A" />
</picture>

<br /><br />

<h1>سجل التدريب التعاوني الأكاديمي الذكي</h1>
<h3>Academic Cooperative Training Documentation System</h3>

<br />

<p>
  <a href="https://github.com/0iprx/COOP-Report/blob/main/README.md">
    <img src="https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  </a>
  <a href="https://react.dev">
    <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" />
  </a>
  <a href="https://nodejs.org">
    <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white" />
  </a>
  <a href="https://www.prisma.io">
    <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white" />
  </a>
  <a href="https://mysql.com">
    <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white" />
  </a>
  <a href="https://vitejs.dev">
    <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white" />
  </a>
  <a href="https://tailwindcss.com">
    <img src="https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  </a>
  <img src="https://img.shields.io/badge/build-passing-2A6348?style=flat-square" />
  <img src="https://img.shields.io/badge/security-hardened-C0102A?style=flat-square" />
</p>

<br />

> نظام ويب متكامل يُعنى بتوثيق التدريب التعاوني الأكاديمي بأعلى معايير الجودة —  
> من التسجيل اليومي، إلى التنقيح بالذكاء الاصطناعي، إلى التقرير النهائي بثلاث صيغ احترافية.

<br />

---

### [البدء السريع](#-البدء-السريع) · [المميزات](#-المميزات-الكاملة) · [هيكل المشروع](#-هيكل-المشروع) · [API](#-api-reference) · [الأمان](#-الأمان)

---

</div>

<br />

## لماذا COOP Report؟

كتابة تقرير التدريب التعاوني تقليدياً تعني:
ساعات في تنسيق Word، فقدان البيانات عند الإغلاق المفاجئ، تقرير يفتقر إلى الأسلوب الأكاديمي، وتصدير يدوي ممل.

**COOP Report** يحل كل هذا دفعة واحدة.

<br />

## المميزات الكاملة

<br />

### التسجيل اليومي وحماية البيانات

```
الكتابة  →  حفظ تلقائي للمسودة  →  لا خسارة للبيانات أبداً
التعديل →  snapshot تلقائي      →  رجوع لأي نسخة سابقة
الحذف   →  سلة المحذوفات        →  استرجاع فوري بنقرة واحدة
التصدير →  أرشيف SHA-256        →  تحقق من سلامة الملف
```

| الخاصية | التفاصيل |
|---------|----------|
| **حفظ تلقائي** | Debounce 400ms — كل حرف تكتبه يُحفظ فوراً في `localStorage` |
| **Soft Delete** | لا يُحذف شيء نهائياً — كل إدخال يمر بسلة قابلة للاسترجاع |
| **Revision History** | كل تعديل يُنشئ snapshot محفوظ — رجوع لأي لحظة سابقة |
| **SHA-256 Backup** | أرشيف JSON كامل بتوقيع رقمي — استيراد مع التحقق من السلامة |
| **ACID Transactions** | الاستيراد يكتب بقاعدة البيانات أو يتراجع كاملاً |

<br />

### أدوات الذكاء الاصطناعي

كل إدخال يومي يمكن معالجته بأربعة أوضاع، مع عرض الفرق قبل القبول:

| الوضع | ما يفعله |
|-------|----------|
| **تنقيح أكاديمي** | يعيد صياغة النص بأسلوب مؤسسي رسمي مناسب للتقارير الجامعية |
| **تصحيح إملائي** | يعالج الهمزات، التشكيل، علامات الترقيم، والأخطاء النحوية |
| **اختصار وإيجاز** | يضغط النص مع حفظ الأرقام والإنجازات الجوهرية |
| **ترجمة ذاتية** | عربي ↔ إنجليزي أكاديمي — بدون تدخل يدوي |

> جميع العمليات تعرض **Diff Modal** — يمكنك رؤية التغييرات وقبولها أو رفضها.

<br />

### التقرير النهائي والتصدير

<table>
<thead>
<tr>
<th>الصيغة</th>
<th>التقنية</th>
<th>التنقل الداخلي</th>
<th>الصفحات</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>DOCX</b></td>
<td>مكتبة <code>docx</code></td>
<td>Word <code>Bookmark</code> + <code>InternalHyperlink</code> حقيقية</td>
<td><code>pageBreakBefore</code> لكل فصل وأسبوع</td>
</tr>
<tr>
<td><b>PDF</b></td>
<td>Browser Print API</td>
<td>CSS anchor links مع smooth scroll</td>
<td><code>@page { size: A4; margin: 2.5cm }</code></td>
</tr>
<tr>
<td><b>HTML</b></td>
<td>Standalone htmlReportService</td>
<td>فهرس تفاعلي مع anchor لكل أسبوع</td>
<td>CSS <code>page-break</code> classes</td>
</tr>
</tbody>
</table>

**الفهرس التفاعلي** — انتقال مباشر لأي من الأقسام:

```
صفحة الغلاف  →  المقدمة  →  جهة التدريب  →  الأسبوع 1...N  →  المهارات  →  الخاتمة
```

**مؤشر الحجم** — بادج أخضر/أحمر مقارنة بمعيار 20 صفحة أكاديمية (350 كلمة/صفحة).

<br />

## هيكل المشروع

```
COOP-Report/                          ← npm Workspaces Monorepo
│
├── client/                           ← React 18 + Vite + Tailwind CSS
│   └── src/
│       ├── components/
│       │   ├── auth/                 ← AuthScreen — split-screen، password strength bar
│       │   ├── common/               ← Navbar (glass morphism)، DiffModal
│       │   ├── log/                  ← DailyLogTab — auto-save، AI toolbar، trash، revisions
│       │   ├── weekly/               ← WeeklyTab — تجميع أسبوعي تلقائي، إحصائيات
│       │   ├── final/                ← FinalReportTab — TOC، backup UI، bulk AI، export
│       │   └── supervisor/           ← SupervisorTab — بوابة مراجعة المشرف
│       ├── context/                  ← AuthContext — JWT + حالة المستخدم
│       ├── services/                 ← api.ts — Axios instance مع cookie credentials
│       ├── App.tsx                   ← Shell — tabs، language toggle، branded spinner
│       └── index.css                 ← Design System — tokens، glass، animations، print
│
├── server/                           ← Node.js + Express + Prisma
│   ├── prisma/
│   │   └── schema.prisma             ← MySQL schema — soft-delete، revisions، profile
│   └── src/
│       ├── routes/
│       │   ├── auth.ts               ← register، login، logout، /me
│       │   ├── entries.ts            ← CRUD + soft-delete + auto-revision snapshot
│       │   ├── reports.ts            ← weekly، final، DOCX export، HTML export
│       │   ├── profile.ts            ← report profile upsert
│       │   ├── ai.ts                 ← polish، spellcheck، summarize، translate
│       │   ├── backup.ts             ← export، import، trash، restore، revisions، revert
│       │   └── supervisor.ts         ← trainee linking، review access
│       ├── services/
│       │   ├── docxService.ts        ← Word generation — Bookmarks + InternalHyperlinks
│       │   ├── htmlReportService.ts  ← HTML standalone — print rules + anchor TOC
│       │   ├── aiService.ts          ← AI processing — Arabic-aware regex
│       │   └── backupService.ts      ← SHA-256 archive export/import — ACID restore
│       ├── middleware/
│       │   ├── auth.ts               ← JWT verify — crashes in prod if secret missing
│       │   └── rateLimiter.ts        ← auth: 10/15min · api: 120/min
│       ├── db.ts                     ← Prisma client singleton
│       ├── logger.ts                 ← Pino structured logging
│       └── app.ts                    ← Express — helmet، cors، cookie-parser
│
├── shared/                           ← Pure TypeScript — no runtime dependencies
│   └── src/
│       ├── types.ts                  ← EntryDTO، FinalReportData، ProfileInput، DiffChunk
│       ├── constants.ts              ← ENTRY_CATEGORIES
│       └── calculations.ts           ← calculateHoursBetween، countWords، estimatePageCount
│
└── tests/
    ├── calculations.test.ts          ← Vitest — 10 unit tests، all passing
    └── e2e-api-check.js              ← E2E script — register، login، entries، exports
```

<br />

## قاعدة البيانات

```prisma
// schema.prisma

model User {
  id           Int            @id @default(autoincrement())
  username     String         @unique
  passwordHash String                          // bcrypt cost factor 12
  role         String         @default("trainee")
  supervisorId Int?
  supervisor   User?          @relation("SupervisorTrainees", fields: [supervisorId], references: [id])
  trainees     User[]         @relation("SupervisorTrainees")
  entries      Entry[]
  profile      ReportProfile?
  createdAt    DateTime       @default(now())
  @@map("users")
}

model Entry {
  id          Int             @id @default(autoincrement())
  userId      Int
  entryDate   String
  timeFrom    String
  timeTo      String
  title       String
  category    String
  description String          @db.Text
  deletedAt   DateTime?                        // soft-delete — never truly lost
  createdAt   DateTime        @default(now())
  revisions   EntryRevision[]
  user        User            @relation(fields: [userId], references: [id])
  @@map("entries")
}

model EntryRevision {
  id          Int      @id @default(autoincrement())
  entryId     Int
  title       String
  description String   @db.Text
  createdAt   DateTime @default(now())         // auto-snapshot on every PUT
  entry       Entry    @relation(fields: [entryId], references: [id])
  @@map("entry_revisions")
}

model ReportProfile {
  id              Int    @id @default(autoincrement())
  userId          Int    @unique
  studentName     String @default("")
  trainingNumber  String @default("")
  department      String @default("")
  trainingUnit    String @default("")
  supervisorName  String @default("")
  responsibleName String @default("")
  entityAddress   String @default("")           // free field — any company
  employeesCount  String @default("")
  introText       String @db.Text
  entityIntroText String @db.Text
  skillsText      String @db.Text
  conclusionText  String @db.Text
  @@map("report_profile")
}
```

<br />

## البدء السريع

### المتطلبات

| الأداة | الإصدار الأدنى |
|--------|---------------|
| Node.js | 18 |
| MySQL | 8.0 |
| npm | 9 |

<br />

**1 — Clone & Install**

```bash
git clone https://github.com/0iprx/COOP-Report.git
cd COOP-Report
npm install
```

<br />

**2 — Environment Variables**

```bash
# server/.env
DATABASE_URL="mysql://root:@localhost:3306/coop_report"
JWT_SECRET="generate-with: openssl rand -hex 32"
NODE_ENV="development"
PORT=3001
```

> في بيئة الإنتاج: السيرفر يرفض الإقلاع تماماً إذا لم يُضبط `JWT_SECRET`.

<br />

**3 — Database Setup**

```sql
-- في phpMyAdmin أو MySQL CLI
CREATE DATABASE coop_report
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

```bash
npm run prisma:migrate --workspace=server
```

<br />

**4 — Development**

```bash
# Terminal 1
npm run dev:server     # Express → http://localhost:3001

# Terminal 2
npm run dev:client     # Vite   → http://localhost:5173
```

<br />

**5 — Production Build**

```bash
npm run build          # builds both server (tsc) and client (vite)
```

<br />

## API Reference

### Authentication — `/api/auth`

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | `{ username, password, role }` | تسجيل مستخدم جديد |
| `POST` | `/login` | `{ username, password }` | دخول — يُعيد JWT في httpOnly cookie |
| `POST` | `/logout` | — | مسح الجلسة |
| `GET` | `/me` | — | بيانات المستخدم الحالي |

### Entries — `/api/entries`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | قائمة الإدخالات النشطة (deletedAt = null) |
| `POST` | `/` | إنشاء إدخال جديد (مع Zod validation) |
| `PUT` | `/:id` | تعديل — ينشئ EntryRevision snapshot تلقائياً |
| `DELETE` | `/:id` | soft-delete — ينقل لسلة المحذوفات |

### Reports & Export — `/api/reports`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/weekly?week=YYYY-MM-DD` | تقرير أسبوع محدد |
| `GET` | `/final` | بيانات التقرير النهائي كاملة |
| `GET` | `/export/docx?lang=ar\|en` | تنزيل Word مع Bookmarks حقيقية |
| `GET` | `/export/html?lang=ar\|en` | تنزيل HTML مستقل |

### AI Processing — `/api/ai`

```http
POST /api/ai/process
Content-Type: application/json

{
  "text": "النص المراد معالجته",
  "action": "polish" | "spellcheck" | "summarize" | "translate",
  "targetLang": "ar" | "en",
  "context": "سياق اختياري"
}
```

**Response:**
```json
{
  "result": "النص بعد المعالجة",
  "diff": [{ "type": "equal|insert|delete", "value": "..." }]
}
```

### Backup & Integrity — `/api/backup`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/export` | أرشيف JSON كامل مع checksum SHA-256 |
| `POST` | `/import` | استيراد مع التحقق من checksum ثم ACID upsert |
| `GET` | `/trash` | قائمة الإدخالات في سلة المحذوفات |
| `POST` | `/restore/:id` | استرجاع إدخال من السلة |
| `GET` | `/revisions/:entryId` | قائمة النسخ السابقة لإدخال |
| `POST` | `/revert/:entryId/:revId` | الرجوع لنسخة تاريخية محددة |

<br />

## الأمان

```
┌─────────────────────────────────────────────────────────────────┐
│                     Security Architecture                       │
├──────────────────────────┬──────────────────────────────────────┤
│ كلمة المرور              │ bcrypt — cost factor 12              │
│ SQL Injection            │ Prisma Prepared Statements — ممنوع   │
│ XSS                      │ helmet headers على كل Response       │
│ JWT                      │ httpOnly cookie — JS لا يقرأه        │
│ CSRF                     │ sameSite: lax + origin check         │
│ Brute Force              │ 10 محاولات / 15 دقيقة لكل IP         │
│ Data Isolation           │ userId من JWT — لا من المدخلات       │
│ Input Validation         │ Zod schema على كل endpoint           │
│ JWT Secret               │ يرفض الإقلاع في prod بدون env var    │
│ Backup Integrity         │ SHA-256 checksum verification        │
└──────────────────────────┴──────────────────────────────────────┘
```

<details>
<summary><b>ملاحظات تقنية مهمة للمطورين</b></summary>

<br />

**Arabic Word Boundaries في JavaScript**

`\b` لا تعمل مع العربية — استخدم Unicode lookaheads:

```typescript
// خطأ — \b لا تتعرف على الحروف العربية
const wrong = /\bكلمة\b/g;

// صحيح
const correct = /(?<![\u0600-\u06FF])كلمة(?![\u0600-\u06FF])/g;
```

**Prisma على Windows — DLL Locking**

`tsx watch` يقفل `query_engine-windows.dll.node`. الحل:

```powershell
# 1. أوقف السيرفر
# 2. نفّذ
npx prisma generate --workspace=server
# 3. أعد التشغيل
npm run dev:server
```

**Word Document Navigation**

```typescript
import { Bookmark, InternalHyperlink, TextRun } from 'docx';

// هدف الرابط
new Bookmark({ id: 'week_3', children: [new TextRun('الأسبوع الثالث')] })

// الرابط القابل للنقر في الفهرس
new InternalHyperlink({ anchor: 'week_3', children: [new TextRun('3. الأسبوع الثالث')] })
```

**XAMPP MySQL على Windows**

```powershell
# من C:\xampp فقط — my.ini يستخدم مسارات نسبية
.\mysql\bin\mysqld.exe --defaults-file=mysql\bin\my.ini --standalone
```

</details>

<br />

## التقنيات المستخدمة

<table>
<tr>
<td valign="top" width="33%">

**Frontend**
- React 18 + TypeScript (strict)
- Vite 5
- Tailwind CSS 3
- TanStack Query v5
- Lucide React Icons
- Axios

</td>
<td valign="top" width="33%">

**Backend**
- Node.js 18 + Express
- Prisma ORM (MySQL 8)
- JWT + bcrypt
- helmet + cors
- express-rate-limit
- Pino (structured logging)

</td>
<td valign="top" width="34%">

**أدوات**
- `docx` — Word generation
- Vitest — Unit testing
- npm Workspaces Monorepo
- TypeScript (strict mode)
- Zod — Runtime validation
- SHA-256 Integrity checks

</td>
</tr>
</table>

<br />

---

<div align="center">

**COOP Report** — Built for academic excellence

*من أول سطر تكتبه يومياً، إلى تقرير نهائي احترافي*  
*بدون ضياع بيانات · بدون تسوية في الجودة · بدون عمل يدوي*

<br />

<img src="https://img.shields.io/badge/Made%20with-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Database-MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white" />
<img src="https://img.shields.io/badge/ORM-Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white" />
<img src="https://img.shields.io/badge/Region-Saudi Arabia-006C35?style=flat-square" />

</div>
