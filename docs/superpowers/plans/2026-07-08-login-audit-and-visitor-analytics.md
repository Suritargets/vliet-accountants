# Login-audit + bezoekersstatistieken Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Log elke admin-loginpoging (geslaagd/mislukt, met IP) in een nieuwe `/admin/logins`-pagina, en bouw een eigen, privacy-vriendelijk bezoekersrapport (`/admin/statistieken`) — aantal bezoeken, unieke bezoekers, land, apparaat, dagelijkse trend — zonder ooit een IP-adres van een sitebezoeker op te slaan.

**Architecture:** Twee onafhankelijke, additieve features. Login-logging haakt in op de bestaande `login()`-server-actie. Bezoekersstatistieken werkt via een client-side "beacon"-component (in de publieke `[locale]`-layout) die bij elke paginalading een lichte `POST /api/track` afvuurt; die route berekent server-side een dagelijks-roterende, onomkeerbare hash van IP+user-agent (nooit het IP zelf opgeslagen) plus land (uit Vercel's edge-header) en apparaattype (uit user-agent geparsed). Beide features krijgen een eigen admin-lijstpagina volgens het bestaande `/admin/afspraken`-patroon.

**Tech Stack:** Next.js 16 App Router, TypeScript strict, Drizzle ORM + Neon Postgres, Node `crypto` (sha256), Tailwind v4. Geen nieuwe dependencies.

## Global Constraints

- Geen testframework — verificatie via `npx tsc --noEmit`, `npm run lint`, `npm run build`, en functionele live-checks (tijdelijke, niet-underscore-geprefixte testroutes voor server-actions/API's, curl, directe DB-checks via `node -e` met `.env.local` geladen), daarna opruimen.
- Elke commit: specifieke bestanden toevoegen, nooit `git add -A`. Tijdelijke testroutes mogen NOOIT in git terechtkomen.
- `npx dotenv -e .env.local -- <command>` laadt `.env.local` voor niet-Next.js scripts (drizzle-kit, node-scripts).
- **Bekend risico bij schema-migraties in dit project**: `drizzle-kit push` stelt bij ELKE push voor om de `pages`-tabel te TRUNCATEN vanwege een bestaand, ongerelateerd drizzle-kit-quirk met de `UNIQUE NULLS NOT DISTINCT`-constraint op die tabel (2 echte productie-rijen). **Nooit** dat prompt blind accepteren. Als dat prompt verschijnt: stop de push, en pas de nieuwe tabellen/enums in plaats daarvan toe via handgeschreven SQL die kolom-voor-kolom overeenkomt met de Drizzle-schemadefinitie (zelfde procedure als eerder in dit project toegepast voor `contact_messages` — zie git-geschiedenis commit "Add contact_messages table" voor het precedent), en verifieer daarna dat `pages` volledig ongewijzigd is gebleven (rijen + constraint-definitie) én dat een herhaalde `drizzle-kit push` geen voorstel meer doet voor de nieuwe tabellen.
- `npm run dev` draait op poort 3000 — sluit bestaande node-processen af (`taskkill //F //IM node.exe` op Windows) vóór een nieuwe `npm run dev`.
- Geen wijziging aan de cookie-banner of privacyverklaring nodig voor deze feature (bevestigd in het design-document — geen persoonsgegevens/IP's worden opgeslagen voor sitebezoekers; login-IP-logging betreft alleen (pogende) admin-gebruikers).

---

### Task 1: Schema — `admin_login_events` en `page_views`

**Files:**
- Modify: `drizzle/schema.ts`

**Interfaces:**
- Produces: `adminLoginEvents` tabel + `AdminLoginEvent` type, `pageViews` tabel + `PageView` type — herbruikt door Tasks 2-5.

- [ ] **Step 1: Tabellen toevoegen aan `drizzle/schema.ts`**

Voeg toe na het `contact_messages`-blok (zelfde stijl/positie-conventie als de rest van het bestand):

```ts
export const adminLoginEvents = pgTable("admin_login_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  success: boolean("success").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const deviceTypeEnum = pgEnum("device_type", ["mobile", "tablet", "desktop"]);

export const pageViews = pgTable("page_views", {
  id: uuid("id").defaultRandom().primaryKey(),
  path: varchar("path", { length: 255 }).notNull(),
  country: varchar("country", { length: 2 }).notNull().default("XX"),
  deviceType: deviceTypeEnum("device_type").notNull().default("desktop"),
  locale: varchar("locale", { length: 2 }).notNull().default("nl"),
  visitorHash: varchar("visitor_hash", { length: 64 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

Voeg de bijbehorende types toe in het `// ── Types ──`-blok, na `ContactMessage`:

```ts
export type AdminLoginEvent = typeof adminLoginEvents.$inferSelect;
export type PageView = typeof pageViews.$inferSelect;
```

- [ ] **Step 2: Schema naar Neon pushen**

```bash
npx dotenv -e .env.local -- npx drizzle-kit push
```

Verwacht: een prompt over het TRUNCATEN van `pages` verschijnt (bekend, ongerelateerd quirk — zie Global Constraints). Beantwoord dit NIET. In plaats daarvan: pas de twee nieuwe tabellen + de nieuwe enum handmatig toe via directe SQL, exact overeenkomend met de Drizzle-definities hierboven (check de kolomtypes tegen een bestaande vergelijkbare kolom, bv. `contact_messages.id` voor het `gen_random_uuid()`-defaultpatroon):

```bash
node -e "
require('dotenv').config({path:'.env.local'});
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
(async () => {
  await sql\`CREATE TABLE admin_login_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email varchar(255) NOT NULL,
    success boolean NOT NULL,
    ip_address varchar(45),
    created_at timestamp NOT NULL DEFAULT now()
  )\`;
  console.log('admin_login_events aangemaakt');
  await sql\`CREATE TYPE device_type AS ENUM ('mobile', 'tablet', 'desktop')\`;
  console.log('device_type enum aangemaakt');
  await sql\`CREATE TABLE page_views (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    path varchar(255) NOT NULL,
    country varchar(2) NOT NULL DEFAULT 'XX',
    device_type device_type NOT NULL DEFAULT 'desktop',
    locale varchar(2) NOT NULL DEFAULT 'nl',
    visitor_hash varchar(64) NOT NULL,
    created_at timestamp NOT NULL DEFAULT now()
  )\`;
  console.log('page_views aangemaakt');
})();
" 2>&1 | grep -v "tip:"
```

- [ ] **Step 3: Verifiëren — nieuwe tabellen correct, `pages` ongewijzigd**

```bash
node -e "
require('dotenv').config({path:'.env.local'});
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
(async () => {
  const t1 = await sql\`SELECT column_name, data_type FROM information_schema.columns WHERE table_name='admin_login_events' ORDER BY ordinal_position\`;
  console.log('admin_login_events:', t1);
  const t2 = await sql\`SELECT column_name, data_type FROM information_schema.columns WHERE table_name='page_views' ORDER BY ordinal_position\`;
  console.log('page_views:', t2);
  const pagesRows = await sql\`SELECT slug, locale FROM pages\`;
  console.log('pages (moet nog steeds 2 rijen zijn):', pagesRows);
  const cons = await sql\`SELECT conname, pg_get_constraintdef(oid) as def FROM pg_constraint WHERE conrelid = 'pages'::regclass\`;
  console.log('pages constraints (ongewijzigd):', cons);
})();
" 2>&1 | grep -v "tip:"
```

Verwacht: `admin_login_events` heeft 5 kolommen, `page_views` heeft 7 kolommen, `pages` heeft nog steeds precies 2 rijen met de `UNIQUE NULLS NOT DISTINCT (slug, locale)`-constraint intact.

Draai daarna `npx dotenv -e .env.local -- npx drizzle-kit push` nogmaals — verwacht: geen voorstel meer over `admin_login_events`/`page_views` (schema en database zijn nu in sync voor deze tabellen), alleen nog het bekende, ongerelateerde `pages`-prompt.

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: geen output, exit code 0.

- [ ] **Step 5: Commit**

```bash
git add drizzle/schema.ts
git commit -m "Add admin_login_events and page_views tables"
```

---

### Task 2: Login-pogingen loggen

**Files:**
- Modify: `app/(admin)/admin/login/_actions.ts`

**Interfaces:**
- Consumes: `adminLoginEvents` (`@/drizzle/schema`), `db` (`@/lib/db`).

- [ ] **Step 1: `_actions.ts` bijwerken**

Huidige volledige inhoud (ter referentie — dit bestand bestaat al):

```ts
"use server";

import { redirect } from "next/navigation";
import { createSession, validateCredentials } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

export interface LoginState {
  error: string | null;
}

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`login:${ip}`).allowed) {
    return { error: "Te veel pogingen. Probeer het over enkele minuten opnieuw." };
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!validateCredentials(email, password)) {
    return { error: "Onjuiste inloggegevens." };
  }

  await createSession(email);
  redirect("/admin");
}
```

Vervang volledig door:

```ts
"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSession, validateCredentials } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { adminLoginEvents } from "@/drizzle/schema";

export interface LoginState {
  error: string | null;
}

async function logAttempt(email: string, success: boolean, ip: string) {
  try {
    await db.insert(adminLoginEvents).values({
      email,
      success,
      ipAddress: ip === "unknown" ? null : ip,
    });
  } catch (error) {
    // Logging must never break the login flow itself.
    console.error("logAttempt failed:", error);
  }
}

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`login:${ip}`).allowed) {
    return { error: "Te veel pogingen. Probeer het over enkele minuten opnieuw." };
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!validateCredentials(email, password)) {
    await logAttempt(email, false, ip);
    return { error: "Onjuiste inloggegevens." };
  }

  await logAttempt(email, true, ip);
  await createSession(email);
  redirect("/admin");
}
```

Let op: `logAttempt` wordt zelf fail-open gehouden (eigen try/catch) zodat een database-hikje het inloggen niet kapotmaakt — zelfde filosofie als de rest van dit project (rate-limit, mail).

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: geen output, exit code 0.

- [ ] **Step 3: Functionele test — geslaagde én mislukte poging, beide gelogd**

```bash
npm run dev &
sleep 12
echo "--- mislukte poging ---"
curl -s -m 15 -X POST http://localhost:3000/admin/login -H "Content-Type: application/x-www-form-urlencoded" --data "email=fout%40example.com&password=fout" -o /dev/null -w "%{http_code}\n"
echo "--- geslaagde poging ---"
node -e "
require('dotenv').config({path:'.env.local'});
console.log('gebruik ADMIN_EMAIL/ADMIN_PASSWORD uit .env.local voor de volgende curl');
"
```

Gebruik de echte `ADMIN_EMAIL`/`ADMIN_PASSWORD`-waarden uit `.env.local` (niet hardcoden in dit script, lees ze uit het bestand) voor een tweede curl met de correcte inloggegevens. Verifieer daarna in de database:

```bash
node -e "
require('dotenv').config({path:'.env.local'});
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
(async () => {
  const rows = await sql\`SELECT email, success, ip_address FROM admin_login_events ORDER BY created_at DESC LIMIT 5\`;
  console.log(rows);
})();
" 2>&1 | grep -v "tip:"
```

Expected: minstens twee rijen — één met `success: false` voor `fout@example.com`, één met `success: true` voor het echte admin-e-mailadres.

Ruim de testrij(en) op:

```bash
node -e "
require('dotenv').config({path:'.env.local'});
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
(async () => {
  const r = await sql\`DELETE FROM admin_login_events WHERE email = 'fout@example.com' RETURNING id\`;
  console.log('opgeruimd:', r.length);
})();
" 2>&1 | grep -v "tip:"
```

(De rij van de geslaagde poging met het echte admin-e-mailadres mag blijven staan — dat is legitieme, correcte logdata, geen testvervuiling.)

Stop de dev-server (`taskkill //F //IM node.exe`).

- [ ] **Step 4: Commit**

```bash
git add "app/(admin)/admin/login/_actions.ts"
git commit -m "Log admin login attempts (success and failure) to admin_login_events"
```

---

### Task 3: Admin "Logins"-pagina

**Files:**
- Create: `app/(admin)/admin/(shell)/logins/page.tsx`

**Interfaces:**
- Consumes: `adminLoginEvents` (`@/drizzle/schema`), `db`, `requireSession`, `AdminPageHeader`.

- [ ] **Step 1: `page.tsx` aanmaken**

```tsx
import { desc } from "drizzle-orm";
import { CheckCircle2, XCircle } from "lucide-react";
import { db } from "@/lib/db";
import { adminLoginEvents } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";
import AdminPageHeader from "@/components/admin/admin-page-header";

export const dynamic = "force-dynamic";

export default async function LoginsPage() {
  await requireSession();

  const rows = await db
    .select()
    .from(adminLoginEvents)
    .orderBy(desc(adminLoginEvents.createdAt))
    .limit(200);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Logins"
        description="Recente inlogpogingen op het admin-dashboard (laatste 200)."
      />

      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        {rows.length === 0 ? (
          <p className="px-5 py-10 text-sm text-gray-400 text-center">Nog geen inlogpogingen gelogd.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                <th className="px-5 py-3">Tijdstip</th>
                <th className="px-5 py-3">E-mail</th>
                <th className="px-5 py-3">IP-adres</th>
                <th className="px-5 py-3">Resultaat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((event) => (
                <tr key={event.id}>
                  <td className="px-5 py-3.5 whitespace-nowrap text-gray-500">
                    {event.createdAt.toLocaleString("nl-NL")}
                  </td>
                  <td className="px-5 py-3.5 text-navy font-medium">{event.email}</td>
                  <td className="px-5 py-3.5 text-gray-500">{event.ipAddress ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    {event.success ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" /> Geslaagd
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-red-600">
                        <XCircle className="w-4 h-4" /> Mislukt
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + build**

Run: `npx tsc --noEmit` — expect clean.
Run: `npm run build` — expect success, `/admin/logins` in de routelijst.

- [ ] **Step 3: Commit**

```bash
git add "app/(admin)/admin/(shell)/logins/page.tsx"
git commit -m "Add /admin/logins page listing recent login attempts"
```

---

### Task 4: Bezoekers-tracking — beacon + API-route

**Files:**
- Create: `components/analytics-beacon.tsx`
- Create: `app/api/track/route.ts`
- Modify: `app/[locale]/layout.tsx`

**Interfaces:**
- Produces: elke publieke paginalading voegt een rij toe aan `page_views` — gebruikt door Task 5.

- [ ] **Step 1: `app/api/track/route.ts` aanmaken**

```ts
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { db } from "@/lib/db";
import { pageViews } from "@/drizzle/schema";
import { rateLimit } from "@/lib/rate-limit";

function parseDeviceType(userAgent: string): "mobile" | "tablet" | "desktop" {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet/.test(ua)) return "tablet";
  if (/mobile|android|iphone/.test(ua)) return "mobile";
  return "desktop";
}

// One-way, daily-rotating visitor identifier. The IP is only ever used as
// hash input here — it is never stored. Because the current date is part
// of the hash, the same visitor gets a different hash every day, which
// still allows counting "unique visitors per day" without persistent
// cross-day tracking or any way to recover the original IP.
function computeVisitorHash(ip: string, userAgent: string): string {
  const day = new Date().toISOString().slice(0, 10);
  const secret = process.env.SESSION_SECRET ?? "";
  return createHash("sha256").update(`${day}:${secret}:${ip}:${userAgent}`).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    // Fail-open and silent: a dropped pageview must never surface an error
    // to a visitor, and must never be rate-limited loudly.
    if (!rateLimit(`track:${ip}`).allowed) {
      return NextResponse.json({ ok: true });
    }

    const body = await request.json().catch(() => ({}));
    const path = typeof body.path === "string" ? body.path.slice(0, 255) : "/";
    const locale = body.locale === "en" ? "en" : "nl";

    const userAgent = request.headers.get("user-agent") || "unknown";
    const country = request.headers.get("x-vercel-ip-country") || "XX";
    const deviceType = parseDeviceType(userAgent);
    const visitorHash = computeVisitorHash(ip, userAgent);

    await db.insert(pageViews).values({ path, country, deviceType, locale, visitorHash });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("track failed:", error);
    return NextResponse.json({ ok: true }); // fail-open — never break the page
  }
}
```

- [ ] **Step 2: `components/analytics-beacon.tsx` aanmaken**

```tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";

export default function AnalyticsBeacon() {
  const pathname = usePathname();
  const locale = useLocale();

  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, locale }),
      keepalive: true,
    }).catch(() => {
      // Silent — a dropped pageview must never surface to the visitor.
    });
  }, [pathname, locale]);

  return null;
}
```

- [ ] **Step 3: `app/[locale]/layout.tsx` bijwerken — beacon toevoegen**

Huidig bestand (ter referentie) importeert al `Analytics` van `@vercel/analytics/next` en rendert 'm als laatste kind van `<body>`. Voeg ernaast toe:

Import toevoegen:
```ts
import AnalyticsBeacon from "@/components/analytics-beacon";
```

In de JSX, direct na `<Analytics />`:
```tsx
        <Analytics />
        <AnalyticsBeacon />
```

- [ ] **Step 4: Typecheck + build**

Run: `npx tsc --noEmit` — expect clean.
Run: `npm run build` — expect success, `/api/track` in de routelijst.

- [ ] **Step 5: Functionele test**

```bash
npm run dev &
sleep 12
curl -s -m 15 -X POST http://localhost:3000/api/track -H "Content-Type: application/json" --data '{"path":"/test-pad","locale":"nl"}'
```
Expected: `{"ok":true}`.

Verifieer in de database:

```bash
node -e "
require('dotenv').config({path:'.env.local'});
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
(async () => {
  const rows = await sql\`SELECT path, country, device_type, locale, length(visitor_hash) as hash_len FROM page_views WHERE path = '/test-pad'\`;
  console.log(rows);
})();
" 2>&1 | grep -v "tip:"
```
Expected: één rij, `path: '/test-pad'`, `hash_len: 64` (sha256 hex-lengte), `country` waarschijnlijk `'XX'` in lokale dev (Vercel's edge-header bestaat lokaal niet — dat is verwacht gedrag, geen bug; in productie op Vercel wordt dit een echte landcode).

Bezoek ook een echte pagina in de browser-achtige flow om te bevestigen dat de beacon zelf vuurt:
```bash
curl -s -m 15 http://localhost:3000/ > /dev/null
sleep 1
node -e "
require('dotenv').config({path:'.env.local'});
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
(async () => {
  const rows = await sql\`SELECT count(*) FROM page_views\`;
  console.log(rows);
})();
" 2>&1 | grep -v "tip:"
```
(Let op: een kale `curl /` haalt alleen de HTML op, voert geen client-side JS uit — de beacon zelf kan hiermee niet end-to-end bewezen worden zonder een browser. Dat is acceptabel voor deze taak; de `/api/track`-route zelf is al direct getest. Vermeld dit in het rapport als bekende beperking, geen falen.)

Ruim de testrij op:

```bash
node -e "
require('dotenv').config({path:'.env.local'});
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
(async () => {
  const r = await sql\`DELETE FROM page_views WHERE path = '/test-pad' RETURNING id\`;
  console.log('opgeruimd:', r.length);
})();
" 2>&1 | grep -v "tip:"
```

Stop de dev-server.

- [ ] **Step 6: Commit**

```bash
git add components/analytics-beacon.tsx app/api/track/route.ts "app/[locale]/layout.tsx"
git commit -m "Add privacy-friendly visitor tracking beacon (no IP storage)"
```

---

### Task 5: Admin "Statistieken"-pagina

**Files:**
- Create: `app/(admin)/admin/(shell)/statistieken/page.tsx`

**Interfaces:**
- Consumes: `pageViews` (`@/drizzle/schema`), `db`, `requireSession`, `AdminPageHeader`.

- [ ] **Step 1: `page.tsx` aanmaken**

```tsx
import { count, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { pageViews } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";
import AdminPageHeader from "@/components/admin/admin-page-header";

export const dynamic = "force-dynamic";

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function getTotals(since: Date) {
  const [row] = await db
    .select({
      total: count(),
      unique: sql<number>`count(distinct ${pageViews.visitorHash})`,
    })
    .from(pageViews)
    .where(gte(pageViews.createdAt, since));
  return { total: row?.total ?? 0, unique: Number(row?.unique ?? 0) };
}

export default async function StatistiekenPage() {
  await requireSession();

  const [today, last7, last30] = await Promise.all([
    getTotals(daysAgo(1)),
    getTotals(daysAgo(7)),
    getTotals(daysAgo(30)),
  ]);

  const countries = await db
    .select({ country: pageViews.country, total: count() })
    .from(pageViews)
    .where(gte(pageViews.createdAt, daysAgo(30)))
    .groupBy(pageViews.country)
    .orderBy(sql`count(*) desc`)
    .limit(8);

  const devices = await db
    .select({ deviceType: pageViews.deviceType, total: count() })
    .from(pageViews)
    .where(gte(pageViews.createdAt, daysAgo(30)))
    .groupBy(pageViews.deviceType)
    .orderBy(sql`count(*) desc`);

  const trend = await db
    .select({
      day: sql<string>`to_char(${pageViews.createdAt}, 'YYYY-MM-DD')`,
      total: count(),
    })
    .from(pageViews)
    .where(gte(pageViews.createdAt, daysAgo(30)))
    .groupBy(sql`to_char(${pageViews.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${pageViews.createdAt}, 'YYYY-MM-DD')`);

  const maxTrend = Math.max(1, ...trend.map((t) => t.total));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Statistieken"
        description="Privacy-vriendelijk bezoekersoverzicht — geen individuele IP-adressen worden opgeslagen."
      />

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Vandaag", data: today },
          { label: "Laatste 7 dagen", data: last7 },
          { label: "Laatste 30 dagen", data: last30 },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">{card.label}</p>
            <p className="text-2xl font-bold text-navy">{card.data.total}</p>
            <p className="text-sm text-gray-500">bezoeken · {card.data.unique} unieke bezoekers</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-navy mb-4">Top landen (30 dagen)</h2>
          {countries.length === 0 ? (
            <p className="text-sm text-gray-400">Nog geen data.</p>
          ) : (
            <ul className="space-y-2">
              {countries.map((c) => (
                <li key={c.country} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{c.country}</span>
                  <span className="text-navy font-medium">{c.total}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-navy mb-4">Apparaten (30 dagen)</h2>
          {devices.length === 0 ? (
            <p className="text-sm text-gray-400">Nog geen data.</p>
          ) : (
            <ul className="space-y-2">
              {devices.map((d) => (
                <li key={d.deviceType} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 capitalize">{d.deviceType}</span>
                  <span className="text-navy font-medium">{d.total}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-navy mb-4">Trend (laatste 30 dagen)</h2>
        {trend.length === 0 ? (
          <p className="text-sm text-gray-400">Nog geen data.</p>
        ) : (
          <div className="flex items-end gap-1 h-32">
            {trend.map((t) => (
              <div
                key={t.day}
                className="flex-1 bg-gold/70 rounded-t hover:bg-gold transition-colors"
                style={{ height: `${Math.max(4, (t.total / maxTrend) * 100)}%` }}
                title={`${t.day}: ${t.total} bezoeken`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + build**

Run: `npx tsc --noEmit` — expect clean.
Run: `npm run build` — expect success, `/admin/statistieken` in de routelijst.

- [ ] **Step 3: Commit**

```bash
git add "app/(admin)/admin/(shell)/statistieken/page.tsx"
git commit -m "Add /admin/statistieken visitor-analytics page"
```

---

### Task 6: Nav-items voor Logins en Statistieken

**Files:**
- Modify: `components/admin/nav-config.ts`

- [ ] **Step 1: Nieuwe sectie of items toevoegen**

Huidige inhoud (ter referentie):

```ts
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarCog,
  Home,
  Briefcase,
  FileText,
  Newspaper,
  Users,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface AdminNavSection {
  title: string;
  items: AdminNavItem[];
}

export const adminNav: AdminNavSection[] = [
  {
    title: "Overzicht",
    items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    title: "Afspraken",
    items: [
      { label: "Afspraken", href: "/admin/afspraken", icon: CalendarCheck },
      { label: "Beschikbaarheid", href: "/admin/beschikbaarheid", icon: CalendarCog },
      { label: "Berichten", href: "/admin/berichten", icon: MessageSquare },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "Homepage", href: "/admin/homepage", icon: Home },
      { label: "Diensten", href: "/admin/diensten", icon: Briefcase },
      { label: "Pagina's", href: "/admin/paginas", icon: FileText },
      { label: "Blog", href: "/admin/blog", icon: Newspaper },
      { label: "Vacatures", href: "/admin/vacatures", icon: Users },
    ],
  },
];
```

Vervang volledig door (toegevoegd: `BarChart3`/`ShieldCheck` import, en een nieuwe `"Inzicht"`-sectie ná `"Content"`):

```ts
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarCog,
  Home,
  Briefcase,
  FileText,
  Newspaper,
  Users,
  MessageSquare,
  BarChart3,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface AdminNavSection {
  title: string;
  items: AdminNavItem[];
}

export const adminNav: AdminNavSection[] = [
  {
    title: "Overzicht",
    items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    title: "Afspraken",
    items: [
      { label: "Afspraken", href: "/admin/afspraken", icon: CalendarCheck },
      { label: "Beschikbaarheid", href: "/admin/beschikbaarheid", icon: CalendarCog },
      { label: "Berichten", href: "/admin/berichten", icon: MessageSquare },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "Homepage", href: "/admin/homepage", icon: Home },
      { label: "Diensten", href: "/admin/diensten", icon: Briefcase },
      { label: "Pagina's", href: "/admin/paginas", icon: FileText },
      { label: "Blog", href: "/admin/blog", icon: Newspaper },
      { label: "Vacatures", href: "/admin/vacatures", icon: Users },
    ],
  },
  {
    title: "Inzicht",
    items: [
      { label: "Statistieken", href: "/admin/statistieken", icon: BarChart3 },
      { label: "Logins", href: "/admin/logins", icon: ShieldCheck },
    ],
  },
];
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: geen output, exit code 0.

- [ ] **Step 3: Commit**

```bash
git add components/admin/nav-config.ts
git commit -m "Add Statistieken and Logins to admin nav"
```

---

### Task 7: Volledige verificatie + afronden

**Files:** geen nieuwe — eindcontrole.

- [ ] **Step 1: Volledige lint + typecheck + build**

```bash
npm run lint
npx tsc --noEmit
rm -rf .next
npm run build
```
Expected: alle drie slagen zonder errors. `/admin/logins`, `/admin/statistieken`, `/api/track` staan in de routelijst.

- [ ] **Step 2: End-to-end check met een geauthenticeerde sessie**

Genereer een geldig admin-sessietoken, matchend met `createSession()` in `lib/auth.ts` (`SignJWT` met `{ email, role: "admin" }`, `HS256`, 7 dagen geldig, ondertekend met `SESSION_SECRET`):

```bash
node -e "
require('dotenv').config({path:'.env.local'});
const { SignJWT } = require('jose');
(async () => {
  const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
  const token = await new SignJWT({ email: process.env.ADMIN_EMAIL, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
  console.log(token);
})();
" > /tmp/vliet-e2e-token.txt 2>&1
```

Gebruik dat token als cookie om beide nieuwe pagina's authenticated te bezoeken:

```bash
npm run dev &
sleep 12
TOKEN=$(tail -1 /tmp/vliet-e2e-token.txt)
curl -s -m 15 -o /dev/null -w "logins: %{http_code}\n" -H "Cookie: admin_session=$TOKEN" "http://localhost:3000/admin/logins"
curl -s -m 15 -o /dev/null -w "statistieken: %{http_code}\n" -H "Cookie: admin_session=$TOKEN" "http://localhost:3000/admin/statistieken"
```

Expected: beide `200` (niet `500`, niet een onverwachte redirect). Stop de dev-server daarna en verwijder `/tmp/vliet-e2e-token.txt`.

- [ ] **Step 3: Opruimen van testdata**

Controleer of er nog test-rijen in `admin_login_events` of `page_views` staan van eerdere taken en verwijder die (behalve echte, legitieme logdata van tijdens deze sessie zelf aangemaakte échte logins — die mag blijven staan).

- [ ] **Step 4: Committen, pushen, PR, mergen naar master**

Zelfde conventie als elke eerdere feature in dit project: push branch → `gh pr create` → `gh pr merge --merge`.
