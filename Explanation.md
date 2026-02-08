# FraCTO: How This Project Works (And What You Can Learn From Building It)

## What Is This Thing?

FraCTO is a **digital maturity assessment tool** for enterprises. Think of it like a doctor's checkup, but for a company's technology health. An organization answers questions across 8 dimensions — from "how modern is your infrastructure?" to "are you actually using AI or just talking about it?" — and gets back a score, a radar chart, and a prioritized roadmap for improvement.

The name stands for **Fractional CTO** — the idea being that not every mid-market company can afford (or needs) a full-time Chief Technology Officer, but every company deserves an honest assessment of where they stand before they start spending money on "digital transformation."

---

## The 30-Second Architecture

```
┌─────────────────────────────────────────────────┐
│              GitHub Pages (Static)               │
│  ┌───────────────────────────────────────────┐   │
│  │           Next.js Static Export            │   │
│  │                                           │   │
│  │  Landing → Assessment → Results → Roadmap │   │
│  │       ↕              ↕           ↕        │   │
│  │  localStorage    localStorage  localStorage│   │
│  │       ↕              ↕           ↕        │   │
│  │  ┌─────────────────────────────────────┐  │   │
│  │  │    Supabase (when authenticated)    │  │   │
│  │  │  Auth · Database · Storage · RPC    │  │   │
│  │  └─────────────────────────────────────┘  │   │
│  └───────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

The entire frontend is a **statically exported Next.js app** hosted on GitHub Pages. There is no server. No Node.js running anywhere. The HTML, CSS, and JavaScript are generated at build time and served as flat files.

Supabase acts as the backend — but it's **optional**. Without it, everything still works using the browser's localStorage. This is the most important architectural decision in the project, and we'll come back to it.

---

## The Codebase, File by File

### Directory Structure

```
portal/
├── src/
│   ├── app/                          # Pages (Next.js App Router)
│   │   ├── page.tsx                  # Landing page
│   │   ├── layout.tsx                # Root layout (font, metadata)
│   │   ├── globals.css               # Design system + Tailwind config
│   │   ├── assessment/
│   │   │   ├── page.tsx              # The questionnaire
│   │   │   └── uploads/
│   │   │       └── page.tsx          # Enterprise data upload page
│   │   ├── results/
│   │   │   └── page.tsx              # Score visualization
│   │   ├── roadmap/
│   │   │   └── page.tsx              # 3-horizon transformation roadmap
│   │   ├── share/
│   │   │   └── page.tsx              # Public shared report viewer
│   │   ├── login/
│   │   │   └── page.tsx              # Email/password login
│   │   ├── signup/
│   │   │   └── page.tsx              # Account creation
│   │   └── dashboard/
│   │       └── page.tsx              # Assessment list (authenticated)
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components (incl. sonner toasts)
│   │   ├── app-header.tsx            # Shared header with logo, nav, sign-out
│   │   ├── report-actions.tsx        # PDF download + share link buttons
│   │   ├── upload-card.tsx           # Drag-and-drop file upload component
│   │   └── auth-guard.tsx            # Redirect-to-login wrapper
│   ├── data/
│   │   └── questionnaire.ts          # All 8 modules, questions, options
│   ├── hooks/
│   │   └── use-auth.ts               # Auth state hook
│   └── lib/
│       ├── supabase.ts               # Supabase client singleton
│       ├── store.ts                  # AssessmentStore abstraction
│       ├── scoring.ts                # Score computation + enrichment
│       ├── roadmap.ts                # Roadmap generation engine
│       ├── pdf-report.tsx            # React-PDF document template
│       ├── utils.ts                  # cn() helper
│       └── parsers/
│           ├── utils.ts              # CSV/JSON parsing, fuzzy field mapping
│           ├── architecture.ts       # Architecture data parser + metrics
│           ├── cmdb.ts               # CMDB data parser + metrics
│           └── process-logs.ts       # Process log parser + metrics
├── supabase/
│   └── migrations/
│       └── 001_schema.sql            # Full database schema + RLS + triggers
├── .env.example                      # Required environment variables
├── next.config.ts                    # Static export config
├── package.json
└── tsconfig.json
```

### How the Pieces Connect

Think of the app as a pipeline:

```
Questions → Answers → Scores → Roadmap
                        ↑
                Enterprise Data (optional enrichment)
```

1. **`questionnaire.ts`** defines the raw material: 8 modules, each with sections, each with questions. Every module declares which scoring dimensions it `feedsInto`.

2. **`assessment/page.tsx`** renders those questions as an interactive wizard. As you answer, it stores your choices. When you finish, answers go to the store.

3. **`scoring.ts`** takes the raw answers and computes dimension scores. MCQ answers have scores 1-5 baked in. Multi-select questions score based on how many substantive options you picked (more = higher). Free text and file uploads don't affect scores.

4. **`roadmap.ts`** takes those dimension scores and looks up relevant initiatives from a massive catalog. Low-scoring dimensions get "fix the foundation" initiatives in Horizon 1. High-scoring dimensions get "optimize and innovate" initiatives in Horizon 3.

5. **`results/page.tsx`** visualizes scores with a radar chart, dimension breakdown, and maturity scale. **`roadmap/page.tsx`** renders a Gantt-style timeline with swim lanes per dimension, initiative bars color-coded by priority, and hover tooltips — plotted across a 0–48 month axis split into three horizons.

6. **Enterprise data** (architecture CSVs, CMDB exports, process logs) can optionally adjust scores. The enrichment formula blends 60% survey data with 40% enterprise data signals.

---

## The Technologies (And Why Each One)

### Next.js 16 with Static Export

**What it is:** A React framework that normally runs on a Node.js server. We use it in `output: "export"` mode, which generates plain HTML/CSS/JS files.

**Why we chose it:** We wanted React's component model without paying for a server. GitHub Pages is free. Static files are fast, cacheable, and never go down. The `basePath: "/fracto-portal"` config makes it work under a subdirectory on GitHub Pages.

**The tradeoff:** No server-side rendering, no API routes, no dynamic paths. Every page must be known at build time. This bit us when we tried to create `/share/[token]` — more on that in the bugs section.

### Supabase

**What it is:** An open-source Firebase alternative. Gives you a Postgres database, authentication, file storage, and serverless functions — all accessible via a JavaScript client library.

**Why we chose it:** We needed a backend but didn't want to build one. Supabase gives you a full Postgres database with Row-Level Security (think: each user can only see their own data, enforced at the database level, not in application code). The JavaScript client talks directly to Supabase from the browser — no middleman server needed.

**The mental model:** Imagine Supabase as a bouncer at a club. You show your JWT token (your wristband), and Supabase checks the RLS policies (the guest list) to decide what data you're allowed to see. This happens in the database itself, not in your application code.

### Tailwind CSS v4 + shadcn/ui

**What they are:** Tailwind is a utility-first CSS framework (instead of writing `.button-primary { color: blue }`, you write `className="text-blue-500"`). shadcn/ui is a component library that gives you pre-built, customizable React components.

**Why:** Speed of development. The entire design system is defined in `globals.css` with CSS custom properties:

```css
--color-plum: #3D1F3E;        /* Primary brand color */
--color-periwinkle: #8B8FCF;   /* Accent color */
```

Every component references these variables: `bg-[var(--color-plum)]`. Change the variable, change the whole app.

### Recharts

**What it is:** A React charting library built on D3.

**Why:** The radar chart on the results page. Recharts makes it declarative — you pass data and configuration as React props, and it renders SVG. No imperative D3 code.

### @react-pdf/renderer + html2canvas

**What they are:** React-PDF lets you define PDF documents using React components. html2canvas screenshots a DOM element into a canvas/image.

**Why both?** React-PDF can't render SVG charts from recharts directly. So we use html2canvas to capture the radar chart as a PNG, then embed that PNG into the React-PDF document. It's a two-step dance: screenshot the chart, then build the PDF around it.

---

## The Dual-Mode Pattern: The Most Important Design Decision

The app works in two completely different modes, and the user barely notices:

| | Anonymous Mode | Authenticated Mode |
|---|---|---|
| **Storage** | localStorage | Supabase (Postgres) |
| **Auth** | None | Email/password |
| **Data persistence** | This browser only | Across devices |
| **Share links** | Not available | Available |
| **Enterprise uploads** | localStorage | Supabase Storage + DB |

This is implemented through the **Strategy pattern** in `store.ts`:

```typescript
interface AssessmentStore {
  loadAnswers(assessmentId?: string): Promise<Record<string, string | string[]>>;
  saveAnswers(answers: Record<string, string | string[]>, assessmentId?: string): Promise<void>;
  loadScores(assessmentId?: string): Promise<ScoreResult | null>;
  saveScores(scores: ScoreResult, assessmentId?: string): Promise<void>;
}
```

Two classes implement this interface: `LocalStorageStore` and `SupabaseStore`. A factory function picks the right one:

```typescript
export function getStore(authenticated: boolean): AssessmentStore {
  return authenticated ? supabaseStore : localStore;
}
```

The pages don't care which store they're talking to. They call `store.loadAnswers()` and get data back. This is textbook **dependency inversion** — the high-level modules (pages) don't depend on low-level modules (localStorage or Supabase). They both depend on an abstraction (the interface).

**Why this matters:** It means the free tier works perfectly without any backend infrastructure. You can deploy this to GitHub Pages with zero configuration and it's a fully functional assessment tool. Supabase adds persistence, sharing, and multi-user support on top.

---

## The Database Schema

Seven tables, each with a clear purpose:

```
organizations ──┐
                 ├── user_profiles (1:many)
                 ├── assessments (1:many)
                 │       ├── answers (1:many)
                 │       ├── scores (1:1)
                 │       ├── shared_reports (1:many)
                 │       └── enterprise_uploads (1:many)
```

**Row-Level Security (RLS)** is the key concept here. Every table has a policy that says "you can only see rows that belong to your organization." This is enforced by a helper function:

```sql
create or replace function user_org_id()
returns uuid as $$
  select org_id from user_profiles where id = auth.uid()
$$ language sql security definer stable;
```

When a user queries the `assessments` table, Postgres automatically appends `WHERE org_id = user_org_id()` to every query. You literally cannot access another organization's data, even if you write raw SQL. The database protects itself.

**The signup trigger** is worth understanding:

```sql
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
```

When someone signs up, Supabase creates a row in `auth.users`. Our trigger automatically creates an `organization` and a `user_profile` for them. The user never has to "create an organization" manually — it just happens. This is the kind of invisible UX that separates polished apps from clunky ones.

---

## The Scoring Engine

### Basic Scoring

The scoring in `scoring.ts` is straightforward but worth understanding:

1. **MCQ questions** have explicit scores: each option has a `score: 1-5` field. "We run everything on-prem with no documentation" might be a 1. "Fully cloud-native with infrastructure-as-code" might be a 5.

2. **Multi-select questions** are scored by breadth. If there are 6 substantive options and you picked 4, your ratio is 4/6 = 0.67, which maps to `Math.round(1 + 0.67 * 4)` = 3.7 ≈ 4.

3. **Free text and file uploads** aren't scored. They're qualitative inputs that matter for advisory engagements but can't be reduced to a number.

Each module's questions feed into specific dimensions via `feedsInto`. A module about "IT Infrastructure" feeds into "Software Robustness" and "Automation Scale." The dimension score is the average of all question scores that feed into it.

### Enterprise Data Enrichment

This is where it gets interesting. If you upload real data (your architecture inventory, your CMDB export, your process performance logs), the system can **adjust** your survey-based scores with objective signals.

For example, if your survey says "we're mostly cloud-native" (score: 4) but your architecture CSV shows only 20% of components are cloud-hosted, the system will pull your Software Robustness score down. The formula:

```
adjusted = survey_score * 0.60 + (survey_score + modifier) * 0.40
```

Where `modifier` is computed from the enterprise data and clamped to [-1.0, +1.0].

The insight here is that **self-reported data is unreliable**. People overestimate their maturity. Real data keeps them honest. The 60/40 weighting is a design choice — survey data still dominates, but enterprise data provides a reality check.

### How Enterprise Metrics Map to Dimensions

| Data Source | Metric | Dimension Affected | Logic |
|---|---|---|---|
| Architecture | % cloud-hosted | Software Robustness | 0% = -1.0, 100% = +1.0 |
| Architecture | % API-enabled | Software Robustness | Low APIs = less mature |
| Architecture | Average component age | Software Robustness | >7 years = negative signal |
| CMDB | License utilization | Software Robustness | Low usage = shelfware |
| CMDB | Vendor concentration (HHI) | Vendor Ecosystem | High concentration = risky |
| CMDB | % SaaS | Software Robustness | More SaaS = more modern |
| Process Logs | Automation rate | Automation Scale | Direct mapping |
| Process Logs | Exception rate | Process Standardization | High exceptions = immature |
| Process Logs | Cycle time variance | Process Standardization | High variance = inconsistent |

The HHI (Herfindahl-Hirschman Index) for vendor concentration is a nice touch — it's the same metric economists use to measure market concentration. If one vendor provides 90% of your software, that's a risk regardless of how good they are.

---

## The PDF Generation Pipeline

Generating PDFs in a browser-only app is trickier than you'd think. Here's the pipeline:

```
1. User clicks "Download PDF"
2. html2canvas captures the radar chart SVG → PNG
3. @react-pdf/renderer builds the PDF document
   - Cover page (plum background, logo, date)
   - Executive summary (overall score, strengths, gaps, radar PNG)
   - Dimension breakdown (score bars)
   - Roadmap (3 horizons with initiative cards)
4. PDF blob → download link → auto-click → browser saves file
```

Both libraries are **dynamically imported** to avoid SSR issues:

```typescript
const [{ pdf }, { default: PDFReport }, html2canvasModule] =
  await Promise.all([
    import("@react-pdf/renderer"),
    import("@/lib/pdf-report"),
    import("html2canvas"),
  ]);
```

This is important: `@react-pdf/renderer` uses Node.js APIs internally. If Next.js tries to include it during the build, it fails. Dynamic imports ensure it's only loaded when the user actually clicks the button, in the browser.

---

## The Share System

Sharing works through a clever use of Supabase's RPC (Remote Procedure Call) feature:

1. User clicks "Share" → creates a row in `shared_reports` with a random 32-character hex token
2. URL is constructed: `/share?token=abc123def456...`
3. Anyone with the link visits the page
4. The page calls a Supabase RPC function `get_shared_report(share_token)`:

```sql
create or replace function get_shared_report(share_token text)
returns jsonb as $$
  -- This function is SECURITY DEFINER, meaning it runs with
  -- the function creator's permissions, not the caller's.
  -- This bypasses RLS, allowing unauthenticated users to read
  -- the specific report without having access to anything else.
```

This is elegant: RLS blocks all unauthenticated access to the database tables, but this one function can reach through that wall to fetch a specific report. It's like having a locked building with one specific window that opens when you show the right key.

---

## The File Parsers

The parsers in `src/lib/parsers/` handle CSV and JSON files with **fuzzy field mapping**. This is worth studying because it solves a real-world problem: people's spreadsheets never have the exact headers you expect.

```typescript
const FIELD_ALIASES: Record<string, keyof ArchitectureRow> = {
  component_name: "component_name",
  name: "component_name",           // Just "name"? Probably component name.
  component: "component_name",      // "component"? Same thing.
  application: "component_name",    // "application"? Yep, still means component.
  app_name: "component_name",       // "app_name"? You guessed it.
  // ...
};
```

The `normalizeHeader()` function strips everything to lowercase alphanumeric with underscores, then checks if the normalized header matches any alias. This means a CSV with the header `"Component Name"`, `"component-name"`, `"COMPONENT_NAME"`, or just `"Name"` will all map correctly.

The CSV parser itself handles quoted fields properly — commas inside quotes don't split the field. This sounds trivial but it's the kind of thing that breaks 90% of naive CSV parsers:

```
"Smith, John",Engineering,"New York, NY"
```

Without quote handling, you'd get 5 columns instead of 3.

---

## Bugs We Hit and What They Teach

### Bug 1: Dynamic Routes Don't Work with Static Export

**What happened:** We created `/share/[token]/page.tsx` — a dynamic route where the token is part of the URL path. The build failed:

```
Page "/share/[token]" is missing "generateStaticParams()"
```

**Why:** `output: "export"` means Next.js generates HTML files at build time. For a dynamic route like `/share/[token]`, it needs to know ALL possible tokens in advance (via `generateStaticParams()`). Obviously, share tokens are created at runtime — we can't pre-generate pages for tokens that don't exist yet.

**The fix:** We restructured from a path parameter (`/share/abc123`) to a query parameter (`/share?token=abc123`). Query parameters are read client-side via `useSearchParams()` and don't affect static generation.

**The lesson:** **Know your deployment model before designing your URL structure.** If you're doing static export, you can't use dynamic routes unless you can enumerate all possible values at build time. This is a fundamental constraint of static site generation, and it's easy to forget when you're used to server-rendered Next.js.

### Bug 2: useSearchParams Needs a Suspense Boundary

**What happened:** After fixing the share route, the build failed again:

```
useSearchParams() should be wrapped in a suspense boundary at page "/assessment"
```

**Why:** In Next.js with static export, `useSearchParams()` causes a client-side rendering bailout — the page can't be prerendered because query parameters aren't known at build time. Next.js requires you to explicitly opt into this by wrapping the component in `<Suspense>`.

**The fix:** For every page using `useSearchParams()`, we split the component into a wrapper and inner component:

```tsx
export default function AssessmentPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AssessmentPageInner />
    </Suspense>
  );
}

function AssessmentPageInner() {
  const searchParams = useSearchParams();
  // ... rest of the component
}
```

Five pages needed this fix: assessment, results, roadmap, share, and uploads.

**The lesson:** **Framework constraints are not optional.** When a framework tells you to wrap something in Suspense, it's not a suggestion. It's telling you "this component can't render during static generation, so I need a fallback." Understanding *why* the framework requires something is more valuable than just knowing the fix.

### Bug 3: Type Mismatch with Generic Upload Component

**What happened:** The `UploadCard` component expected `parser: (content: string, filename: string) => Record<string, string>[]`, but the architecture parser returns `ArchitectureRow[]`. TypeScript complained because `ArchitectureRow` is an interface (no index signature), not a `Record<string, string>`.

**The fix:** Changed the UploadCard props to use `any[]` for the parser return type and onParsed callback. In a perfect world, we'd use generics, but the component renders a preview table by doing `Object.keys(row)`, which works fine with any object.

**The lesson:** **Generics are great until they make your component harder to use than the problem they solve.** Sometimes `any` with a comment explaining why is the pragmatic choice. The real type safety happens at the parser level (each parser returns its own typed rows). The upload card is just a UI shell that displays whatever it's given.

### Bug 4: Share URL Mismatch After Restructure

**What happened:** When we moved from `/share/[token]` to `/share?token=xxx`, we forgot to update the URL construction in `report-actions.tsx`. The share button was still building URLs like `/share/abc123` instead of `/share?token=abc123`.

**The lesson:** **When you change a contract (URL structure, API shape, function signature), grep your entire codebase for all consumers.** This is the kind of bug that's trivially easy to find but embarrassingly easy to miss. A good habit: after any structural change, search for the old pattern to make sure it's gone everywhere.

### Bug 5: Supabase Trigger Fails with "Database error saving new user"

**What happened:** Signing up produced a cryptic error: "Database error saving new user." The auth user was created in `auth.users`, but the `handle_new_user()` trigger — which auto-creates an organization and user profile — failed silently.

**Why:** The trigger function was declared as `SECURITY DEFINER` (runs with the creator's elevated permissions, bypassing RLS), which is correct. But it was missing `SET search_path = public`. Without an explicit search path, Postgres couldn't reliably resolve the table names `organizations` and `user_profiles` inside the function. Supabase's auth system runs triggers in a context where the default search path may not include `public`.

**The fix:** One line added to the function declaration:

```sql
-- Before (broken):
$$ language plpgsql security definer;

-- After (works):
$$ language plpgsql security definer set search_path = public;
```

**The lesson:** **`SECURITY DEFINER` functions in Supabase should always set `search_path = public`.** This is a Supabase-specific gotcha that doesn't appear in vanilla Postgres tutorials. The Supabase docs mention it, but it's easy to miss. When a trigger fails during auth, the error message is unhelpfully generic — you don't see the actual Postgres error. The debugging strategy is: check if the trigger function can actually reach the tables it references. Always be explicit about schema paths in functions that run outside the normal request context.

### Bug 6: Auth Race Condition — Results Always Showed Mock Data

**What happened:** After implementing Supabase auth and completing an assessment while logged in, the results page still showed the default mock score (2.8) instead of the real computed scores.

**Why:** The `useEffect` in the results page fires immediately on mount. At that point, `useAuth()` is still resolving the session asynchronously (`loading: true`). Since `authenticated` is `false` during loading, `getStore(false)` returns `LocalStorageStore` instead of `SupabaseStore`. The localStorage is empty (answers were saved to Supabase), so the page falls back to `mockResults`.

**The fix:** Add `authLoading` as a dependency and guard with an early return:

```typescript
const { authenticated, loading: authLoading } = useAuth();

useEffect(() => {
  if (authLoading) return; // Wait for auth to resolve
  // Now authenticated is correct, store points to the right backend
  const store = getStore(authenticated);
  // ...
}, [authLoading]);
```

Three pages needed this fix: assessment, results, and roadmap.

**The lesson:** **Async state initialization creates temporal coupling.** When one piece of state (auth) determines how another piece of state (data) is loaded, you must wait for the first to resolve before acting on the second. The pattern is simple — guard your effect with a loading check — but the bug is subtle because everything "works" with the wrong data source.

### Bug 7: get_shared_report Missing search_path (Same Class as Bug 5)

**What happened:** The `get_shared_report` RPC function had the exact same issue as the signup trigger — `SECURITY DEFINER` without `SET search_path = public`.

**The lesson:** **Bug patterns repeat.** When you fix a bug, grep your codebase for the same pattern elsewhere. We fixed `handle_new_user()` but didn't immediately check `get_shared_report()`. Both were `SECURITY DEFINER` functions. Same fix, same root cause, same one-line change. Systematic developers fix bug *classes*, not bug *instances*.

---

## Polish: The Last 10% That Makes It Feel Real

After all features were built, several polish items were completed:

### Shared Header Component
Every authenticated page had a copy-pasted header with logo and navigation. We extracted `app-header.tsx` — a single component that shows the FraCTO logo (clickable → dashboard), optional action buttons, and a Sign Out button when logged in. DRY principle in action: change the header once, every page updates.

### Toast Notifications
PDF generation and share link creation used to fail silently (just `console.error`). Now they use `sonner` toast notifications — small popup messages that confirm success ("Share link copied!") or report errors ("PDF generation failed"). The difference between a professional app and a prototype is *feedback* — the user should always know what happened.

### Working CSV Upload in Assessment
The assessment questionnaire included `csv-upload` question types that showed a nice drag-and-drop UI but didn't actually do anything. Now the component reads the file, stores its content as the answer value, and shows a green checkmark with the filename. Drag-and-drop, click-to-browse, and file replacement all work.

### Mobile-Responsive Gantt Timeline
The Gantt roadmap is complex — swim lanes, bars, tooltips. On mobile screens, it now shows a "scroll horizontally" hint and uses `overflow-x-auto` to remain usable. The summary cards above the timeline use a 2-column grid that adapts to screen size.

---

## Patterns Worth Stealing

### 1. The "Works Without a Backend" Pattern

Design your app to be fully functional without any external services. Add the backend as a progressive enhancement. This gives you:
- Zero-cost development and testing
- A free tier that works forever
- No single point of failure for basic functionality
- Faster development iteration (no waiting for API deploys)

### 2. The Strategy Pattern for Storage

Don't scatter `if (authenticated) { supabase.save() } else { localStorage.save() }` across every page. Centralize it in one place behind an interface. Your pages should never know or care where data lives.

### 3. CSS Custom Properties as a Design System

Instead of hardcoding colors:
```tsx
// Bad: change this in 47 places
<div className="bg-[#3D1F3E]">

// Good: change this in one place
<div className="bg-[var(--color-plum)]">
```

### 4. Dynamic Imports for Heavy Libraries

If a library is only needed when the user clicks a button, don't include it in the main bundle:

```typescript
// This is loaded on page load (bad for bundle size)
import { pdf } from "@react-pdf/renderer";

// This is loaded only when needed (good)
const { pdf } = await import("@react-pdf/renderer");
```

### 5. Fuzzy Field Mapping for File Uploads

If you're accepting user-uploaded data, don't demand exact headers. Map common variations to your expected fields. The 10 minutes you spend writing aliases saves every user from reformatting their data.

### 6. RLS Over Application-Level Authorization

Putting access control in the database is safer than putting it in your application code:
- **App-level auth:** "I hope nobody forgets the `WHERE org_id = ?` clause"
- **RLS:** "The database literally cannot return unauthorized data"

### 7. Suspense as a Loading Strategy

The Suspense boundary pattern isn't just for fixing build errors. It's a legitimate loading strategy: show a spinner while async data resolves, then render the component. The fallback UI is an explicit design decision, not an afterthought.

---

## How Good Engineers Think About This Stuff

### Start With the User Journey, Not the Architecture

We didn't start by designing a database schema. We started with: "Someone lands on the page, takes an assessment, sees their results, gets a roadmap." The architecture emerged from the user journey.

### Make the Common Case Easy, the Rare Case Possible

Anonymous users (the common case) just answer questions and see results. No signup, no configuration, no friction. Authenticated users (the power case) get persistence, sharing, and enterprise data. The app doesn't punish casual users to support power users.

### Name Things After What They Are, Not What They Do

- `questionnaire.ts` — it's the questionnaire data
- `scoring.ts` — it does scoring
- `roadmap.ts` — it generates the roadmap
- `store.ts` — it's the data store

You should be able to guess what a file does from its name. If you can't, the name is wrong.

### Read the Error Message (No, Actually Read It)

Every bug we hit gave us a clear error message:
- "missing generateStaticParams()" — we needed to generate static params or change our approach
- "should be wrapped in a suspense boundary" — we needed to wrap it in Suspense
- "Type X is not assignable to type Y" — the types didn't match

The fix was always in the error message. The skill isn't knowing every framework quirk — it's taking error messages seriously and understanding what they're actually telling you.

### Build in Layers

The project was built in explicit phases:
1. Supabase foundation (schema, client, auth)
2. PDF + sharing features
3. Enterprise data uploads + enrichment

Each phase was independently valuable. After Phase 1, you had a working app with persistence. After Phase 2, you could download and share reports. Phase 3 added depth to the scoring. No phase required a later phase to be useful.

---

## Setting Up Supabase

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click "New project"
3. Choose a name (e.g., "fracto"), set a database password, select a region
4. Wait ~2 minutes for provisioning

### Step 2: Get Your Credentials

1. In your Supabase dashboard, go to **Settings → API**
2. Copy the **Project URL** (looks like `https://xxxxx.supabase.co`)
3. Copy the **anon/public** key (starts with `eyJ...`)

### Step 3: Configure the App

Create a `.env.local` file in the `portal/` directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 4: Run the Database Migration

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Open `supabase/migrations/001_schema.sql` from this project
4. Copy the entire contents and paste it into the SQL Editor
5. Click "Run"

This creates all 7 tables, RLS policies, the signup trigger, and the shared report RPC function.

### Step 5: Enable Email Auth

1. Go to **Authentication → Providers** in Supabase
2. Make sure **Email** is enabled (it should be by default)
3. For development, go to **Authentication → Settings** and disable "Confirm email" (so you don't need real email addresses during testing)

### Step 6: Create a Storage Bucket

1. Go to **Storage** in your Supabase dashboard
2. Click "New bucket"
3. Name it `enterprise-uploads`
4. Set it to **private** (not public)
5. Add a storage policy: Go to **Policies** for the bucket, add a policy for authenticated users to read/write their own files:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "authenticated_uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'enterprise-uploads');

-- Allow authenticated users to read their files
CREATE POLICY "authenticated_reads" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'enterprise-uploads');
```

### Step 7: Test It

```bash
cd portal
npm run dev
```

1. Go to `http://localhost:3000/fracto-portal/signup`
2. Create an account
3. You should be redirected to the dashboard
4. Click "New Assessment" to start one
5. Complete the assessment — answers now persist in Supabase
6. On the results page, try "Share" — it should copy a shareable link
7. Open the link in an incognito window — the report should load without authentication

### Troubleshooting

**"Supabase is not configured" error on login:**
Make sure `.env.local` has the correct values and you restarted the dev server after creating it.

**Signup works but dashboard shows no assessments:**
Check the SQL Editor in Supabase — run `SELECT * FROM organizations;` and `SELECT * FROM user_profiles;` to verify the signup trigger created the org and profile.

**RLS errors (403 or empty results):**
Make sure you ran the complete migration including the `user_org_id()` function and all RLS policies. Without these, authenticated queries will return empty results.

**Share link shows "Report Not Found":**
Make sure the `get_shared_report` RPC function was created (check **Database → Functions** in Supabase). Also verify that scores were saved for the assessment (the share page needs scores to render).

---

## What's Not Built Yet

The plan included a **Phase 4** for direct API integrations (connecting to tools like Ardoq, ServiceNow, and Celonis via OAuth instead of file uploads). The connector interface is designed but not implemented:

```typescript
interface Connector {
  authorize(credentials: OAuthCredentials): Promise<void>;
  fetchData(): Promise<ArchitectureData | CMDBData | ProcessLogData>;
  testConnection(): Promise<boolean>;
}
```

OAuth token exchange would need to run in **Supabase Edge Functions** (serverless functions that can hold secrets), since the browser client can't safely store API credentials.

Other gaps:
- **Peer benchmarking** is mentioned on the landing page but not implemented
- **Assessment editing** — you can't go back and change answers after completion
- **Team collaboration** — the org model supports multiple users, but there's no invite flow

---

## The Stack at a Glance

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 16 | React with static export |
| Language | TypeScript 5 | Type safety |
| Styling | Tailwind CSS 4 | Utility-first CSS |
| Components | shadcn/ui (Radix UI) | Accessible UI primitives |
| Charts | Recharts 3 | Radar chart visualization |
| PDF | @react-pdf/renderer | Structured PDF generation |
| Screenshots | html2canvas | DOM-to-image for radar chart |
| Backend | Supabase | Auth, database, storage, RPC |
| Database | PostgreSQL (via Supabase) | Relational data with RLS |
| Hosting | GitHub Pages | Free static hosting |
| Notifications | Sonner | Toast notifications |
| State | React useState/useEffect | Client-side state management |
| Persistence | localStorage + Supabase | Dual-mode storage |
| CI/CD | GitHub Actions | Build + deploy to GitHub Pages |

---

*Built as a FraCTO (Fractional CTO) engagement tool. The assessment is free. The transformation is what you pay for.*
