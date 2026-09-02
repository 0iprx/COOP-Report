<div align="center">

<br/>

<img src="https://img.shields.io/badge/COOP%20Report-Academic%20Training%20System-C0102A?style=for-the-badge&labelColor=18181A" alt="COOP Report"/>

<br/><br/>

```
   ██████╗ ██████╗  ██████╗ ██████╗     ██████╗ ███████╗██████╗  ██████╗ ██████╗ ████████╗
  ██╔════╝██╔═══██╗██╔═══██╗██╔══██╗    ██╔══██╗██╔════╝██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝
  ██║     ██║   ██║██║   ██║██████╔╝    ██████╔╝█████╗  ██████╔╝██║   ██║██████╔╝   ██║   
  ██║     ██║   ██║██║   ██║██╔═══╝     ██╔══██╗██╔══╝  ██╔═══╝ ██║   ██║██╔══██╗   ██║   
  ╚██████╗╚██████╔╝╚██████╔╝██║         ██║  ██║███████╗██║     ╚██████╔╝██║  ██║   ██║   
   ╚═════╝ ╚═════╝  ╚═════╝ ╚═╝         ╚═╝  ╚═╝╚══════╝╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝   
```

**سجل التدريب التعاوني الأكاديمي الذكي**  
*Academic Cooperative Training Documentation System*

<br/>

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://mysql.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-Private-C0102A?style=flat-square)](.)

<br/>

[البدء السريع](#-البدء-السريع) · [المميزات](#-المميزات) · [هيكل المشروع](#-هيكل-المشروع) · [API Reference](#-api-reference) · [التصدير](#-تصدير-التقارير)

<br/>

---

</div>

## نظرة عامة

**COOP Report** هو تطبيق ويب متكامل يُعنى بتوثيق التدريب التعاوني الأكاديمي بأعلى معايير الجودة. يتيح للمتدرب تسجيل إنجازاته اليومية، وتنقيح نصوصه أكاديمياً بالذكاء الاصطناعي، وتوليد تقرير نهائي احترافي قابل للتصدير بثلاثة صيغ متكاملة مع فهرسة وتنقل حقيقي بين الأقسام.

```
المتدرب يكتب ← AI يُنقّح ← التقرير يُوثَّق ← DOCX / PDF / HTML يُصدَّر
```

<br/>

---

## المميزات

<table>
<tr>
<td width="50%" valign="top">

### التسجيل والتوثيق

- حفظ تلقائي للمسودة في `localStorage` أثناء الكتابة (debounce 400ms) — صفر خسارة للبيانات
- تصنيف المهام بأكثر من 10 فئات تقنية وإدارية
- حساب الساعات الفعلية مع دعم التحولات الليلية
- تجميع أسبوعي تلقائي (الأحد–السبت بالتوقيت السعودي)

</td>
<td width="50%" valign="top">

### الذكاء الاصطناعي المدمج

- **تنقيح أكاديمي** — إعادة صياغة بأسلوب رسمي مؤسسي
- **تصحيح إملائي** — يعالج الهمزات والتشكيل والترقيم
- **اختصار وإيجاز** — يضغط النص مع حفظ الأرقام والإنجازات
- **ترجمة ذاتية** — العربية ↔ الإنجليزية الأكاديمية بدون تدخل
- عرض Diff التغييرات قبل القبول أو الرفض

</td>
</tr>
<tr>
<td width="50%" valign="top">

### حماية البيانات (Zero Data Loss)

- حذف ناعم `soft-delete` — لا يُمحى شيء نهائياً
- سلة محذوفات قابلة للاسترجاع بنقرة واحدة
- **snapshot تلقائي** لكل تعديل — يمكن الرجوع لأي نسخة سابقة
- تصدير أرشيف مشفر بـ **SHA-256** للتحقق من السلامة
- استيراد ذكي مع التحقق من checksum قبل الكتابة (ACID transactions)

</td>
<td width="50%" valign="top">

### التقرير النهائي

- فهرس تفاعلي — انتقال مباشر لأي قسم أو أسبوع
- مؤشر حجم التقرير (معيار 20 صفحة / 350 كلمة للصفحة)
- واجهة عربية وإنجليزية — تبديل بنقرة واحدة
- تدقيق إملائي شامل لكل فقرات التقرير دفعة واحدة
- ترجمة ذاتية للتقرير كاملاً بدون تدخل يدوي

</td>
</tr>
</table>

<br/>

---

## تصدير التقارير

<table>
<tr>
<th align="center">الصيغة</th>
<th align="center">التقنية</th>
<th align="center">التنقل الداخلي</th>
<th align="center">فواصل الصفحات</th>
<th align="center">اللغة</th>
</tr>
<tr>
<td align="center"><b>DOCX</b></td>
<td>مكتبة <code>docx</code></td>
<td>Word Bookmarks + InternalHyperlink حقيقية</td>
<td>pageBreakBefore لكل فصل وأسبوع</td>
<td>AR / EN</td>
</tr>
<tr>
<td align="center"><b>PDF</b></td>
<td>Browser Print API</td>
<td>روابط anchor CSS</td>
<td><code>@page { size: A4; margin: 2.5cm }</code></td>
<td>AR / EN</td>
</tr>
<tr>
<td align="center"><b>HTML</b></td>
<td>htmlReportService</td>
<td>smooth scroll + anchor links</td>
<td>CSS page-break classes</td>
<td>AR / EN</td>
</tr>
</table>

<br/>

---

## هيكل المشروع

```
COOP-Report/
│
├── client/                          # Frontend — React 18 + Vite + Tailwind
│   └── src/
│       ├── components/
│       │   ├── auth/                # AuthScreen (split-screen, password strength)
│       │   ├── common/              # Navbar, DiffModal
│       │   ├── log/                 # DailyLogTab (draft, AI toolbar, trash, revisions)
│       │   ├── weekly/              # WeeklyTab (auto-grouped, hours stats)
│       │   ├── final/               # FinalReportTab (profile, TOC, export, backup)
│       │   └── supervisor/          # SupervisorTab (review mode)
│       ├── context/                 # AuthContext (JWT + user state)
│       ├── services/                # api.ts (Axios instance)
│       ├── App.tsx                  # Shell — tab routing, language toggle
│       └── index.css                # Design system (tokens, glass, animations, print)
│
├── server/                          # Backend — Node.js + Express + Prisma
│   ├── prisma/
│   │   └── schema.prisma            # MySQL schema with soft-delete and revisions
│   └── src/
│       ├── routes/                  # auth, entries, reports, profile, ai, backup
│       ├── services/
│       │   ├── docxService.ts       # Word generation with real bookmarks
│       │   ├── htmlReportService.ts # HTML export with print rules
│       │   ├── aiService.ts         # AI polish, spellcheck, summarize, translate
│       │   └── backupService.ts     # SHA-256 archive export and import
│       ├── middleware/              # JWT auth guard
│       └── app.ts                   # Express setup, CORS, cookie-parser
│
├── shared/                          # Pure TypeScript — shared across client + server
│   └── src/
│       ├── types.ts                 # EntryDTO, FinalReportData, ProfileInput, DiffChunk
│       ├── constants.ts             # ENTRY_CATEGORIES
│       └── calculations.ts          # calculateHoursBetween, countWords, estimatePageCount
│
└── tests/
    ├── calculations.test.ts          # Vitest unit tests (10 passing)
    └── e2e-api-check.js              # Full E2E API verification script
```

<br/>

---

## قاعدة البيانات

```prisma
model User {
  id        Int            @id @default(autoincrement())
  username  String         @unique
  password  String                          // bcrypt cost 12
  role      String         @default("trainee")
  entries   Entry[]
  profile   ReportProfile?
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
  deletedAt   DateTime?                     // soft-delete
  revisions   EntryRevision[]
  user        User            @relation(fields: [userId], references: [id])
  @@map("entries")
}

model EntryRevision {
  id          Int      @id @default(autoincrement())
  entryId     Int
  title       String
  description String   @db.Text
  createdAt   DateTime @default(now())      // auto-snapshot on every update
  entry       Entry    @relation(fields: [entryId], references: [id])
  @@map("entry_revisions")
}

model ReportProfile {
  id              Int    @id @default(autoincrement())
  userId          Int    @unique
  studentName     String
  trainingNumber  String
  department      String
  trainingUnit    String
  supervisorName  String
  responsibleName String
  entityAddress   String                    // free field — any company
  employeesCount  String
  introText       String @db.Text
  entityIntroText String @db.Text
  skillsText      String @db.Text
  conclusionText  String @db.Text
  @@map("report_profile")
}
```

<br/>

---

## البدء السريع

### المتطلبات

| الأداة | الإصدار |
|--------|---------|
| Node.js | 18 أو أحدث |
| MySQL | 8.0 (XAMPP مُوصى به) |
| npm | 9+ |

### 1 — تثبيت الحزم

```bash
git clone https://github.com/0iprx/COOP-Report.git
cd COOP-Report
npm install
```

### 2 — إعداد البيئة

أنشئ ملف `server/.env`:

```env
DATABASE_URL="mysql://root:@localhost:3306/coop_report"
JWT_SECRET="replace-with-long-random-secret"
PORT=3001
```

### 3 — إنشاء قاعدة البيانات

```sql
-- في phpMyAdmin أو MySQL CLI
CREATE DATABASE coop_report CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4 — تطبيق الـ migrations

```bash
# أوقف أي server يعمل أولاً (Windows DLL locking)
npm run prisma:migrate --workspace=server
```

### 5 — تشغيل بيئة التطوير

```bash
# Terminal 1 — Backend (Express على المنفذ 3001)
npm run dev:server

# Terminal 2 — Frontend (Vite على المنفذ 5173)
npm run dev:client
```

### 6 — البناء للإنتاج

```bash
npm run build
```

<br/>

---

## API Reference

### المصادقة

| الطريقة | المسار | الوصف |
|---------|--------|-------|
| `POST` | `/api/auth/register` | تسجيل مستخدم جديد (trainee / supervisor) |
| `POST` | `/api/auth/login` | تسجيل دخول — يُعيد JWT في httpOnly cookie |
| `POST` | `/api/auth/logout` | تسجيل الخروج ومسح الجلسة |

### الإدخالات اليومية

| الطريقة | المسار | الوصف |
|---------|--------|-------|
| `GET` | `/api/entries` | قائمة الإدخالات (يستثني المحذوف) |
| `POST` | `/api/entries` | إضافة إدخال جديد |
| `PUT` | `/api/entries/:id` | تعديل إدخال (يُنشئ snapshot تلقائياً) |
| `DELETE` | `/api/entries/:id` | حذف ناعم إلى السلة |

### التقارير والملف الشخصي

| الطريقة | المسار | الوصف |
|---------|--------|-------|
| `GET` | `/api/reports/final` | بيانات التقرير النهائي المجمّعة |
| `GET` | `/api/reports/export/docx?lang=ar` | تنزيل ملف Word مع bookmarks |
| `GET` | `/api/reports/export/html?lang=ar` | تنزيل HTML مستقل |
| `PUT` | `/api/profile` | حفظ بيانات غلاف التقرير |

### الذكاء الاصطناعي

| الطريقة | المسار | الإجراءات المدعومة |
|---------|--------|-------------------|
| `POST` | `/api/ai/process` | `polish` · `spellcheck` · `summarize` · `translate` |

**مثال على الطلب:**
```json
{
  "text": "النص المراد معالجته",
  "action": "polish",
  "targetLang": "ar",
  "context": "سياق اختياري للنص"
}
```

### حماية البيانات والنسخ الاحتياطية

| الطريقة | المسار | الوصف |
|---------|--------|-------|
| `GET` | `/api/backup/export` | تنزيل أرشيف JSON مشفر بـ SHA-256 |
| `POST` | `/api/backup/import` | استيراد أرشيف مع التحقق من checksum |
| `GET` | `/api/backup/trash` | قائمة الإدخالات المحذوفة |
| `POST` | `/api/backup/restore/:id` | استرجاع إدخال من السلة |
| `GET` | `/api/backup/revisions/:entryId` | قائمة النسخ السابقة لإدخال |
| `POST` | `/api/backup/revert/:entryId/:revId` | الرجوع لنسخة سابقة محددة |

<br/>

---

## ملاحظات تقنية مهمة

<details>
<summary><b>Regex والعربية في JavaScript</b></summary>

<br/>

`\b` في JavaScript لا تعمل مع الحروف العربية لأنها تعتمد على ASCII فقط. استخدم Unicode lookaheads بدلاً منها:

```typescript
// خطأ
const pattern = /\bكلمة\b/g;

// صحيح
const pattern = /(?<![\u0600-\u06FF])كلمة(?![\u0600-\u06FF])/g;
```

</details>

<details>
<summary><b>Prisma على Windows مع XAMPP</b></summary>

<br/>

تشغيل `tsx watch` يُقفل الملف `query_engine-windows.dll.node`. قبل تشغيل `prisma generate`:

```powershell
# 1. أوقف السيرفر أولاً
# 2. ثم ولّد
npx prisma generate --workspace=server
# 3. أعد تشغيل السيرفر
npm run dev:server
```

</details>

<details>
<summary><b>Word Document Navigation — Bookmarks و InternalHyperlinks</b></summary>

<br/>

```typescript
import { Bookmark, InternalHyperlink, TextRun } from 'docx';

// إنشاء bookmark (الهدف)
new Bookmark({
  id: 'week_1',
  children: [new TextRun({ text: 'الأسبوع الأول', bold: true })]
})

// إنشاء رابط داخلي قابل للنقر
new InternalHyperlink({
  anchor: 'week_1',
  children: [new TextRun({ text: 'انتقال للأسبوع الأول', style: 'Hyperlink' })]
})
```

</details>

<details>
<summary><b>XAMPP MySQL — تشغيل صحيح على Windows</b></summary>

<br/>

يجب تشغيل `mysqld.exe` من المجلد `C:\xampp` لأن `my.ini` يستخدم مسارات نسبية:

```powershell
# في PowerShell — من مجلد C:\xampp
.\mysql\bin\mysqld.exe --defaults-file=mysql\bin\my.ini --standalone
```

</details>

<br/>

---

## حزمة التقنيات

<table>
<tr>
<td valign="top" width="33%">

**Frontend**
- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3
- Lucide Icons
- TanStack Query v5
- Axios

</td>
<td valign="top" width="33%">

**Backend**
- Node.js 18+
- Express.js
- Prisma ORM
- MySQL 8 (XAMPP)
- JWT + bcrypt
- cookie-parser

</td>
<td valign="top" width="34%">

**أدوات وخدمات**
- `docx` — Word generation
- Vitest — Unit testing
- TypeScript Monorepo
- npm Workspaces
- SHA-256 Integrity
- ACID Transactions

</td>
</tr>
</table>

<br/>

---

<div align="center">

**COOP Report** — Built for academic excellence

*من التسجيل اليومي إلى التقرير النهائي — بدون ضياع بيانات، بدون تسوية في الجودة*

</div>
