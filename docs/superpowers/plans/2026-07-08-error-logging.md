# Foutregistratie in het admin-dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elke fout — client-side crashes en server-side fouten die nu al met `console.error` worden weggeschreven — ook vastleggen in een nieuwe `error_events`-tabel en tonen op een nieuwe `/admin/fouten`-pagina, zodat productiefouten (zoals de recente `/afspraak`-crash) zichtbaar worden zonder Vercel's eigen logs te doorzoeken.

**Architecture:** Eén gedeelde fail-open `logError()`-helper schrijft naast de bestaande `console.error`-aanroep een rij naar `error_events`. Server-side call-sites krijgen er één `await logError(...)`-regel bij. Client-side crashes (de twee React error-boundaries) sturen een fire-and-forget beacon naar een nieuwe `/api/log-error`-route, die zelf `logError()` aanroept.

**Tech Stack:** Next.js 16 App Router, Drizzle ORM + Neon Postgres, bestaand `lib/rate-limit.ts` (in-memory, fail-open, geen Redis).

## Global Constraints

- Elke bestaande `console.error(...)`-aanroep blijft **ongewijzigd staan** — `logError()` komt er alleen naast, vervangt 'm niet.
- `logError()` is fail-open: nooit gooien, nooit de aanroepende flow blokkeren of breken. Bij een eigen fout: alleen een `console.error` loggen, verder niets.
- Geen enkele bestaande foutboodschap-tekst (`"createAppointment failed:"` etc.) wordt gewijzigd.
- De twee CLI seed-scripts (`scripts/seed.ts`, `scripts/seed-en-translations.ts`) vallen **buiten scope** — die draaien buiten de Next.js-requestcontext en zijn geen onderdeel van het live foutoppervlak.
- Deze plan gaat ervan uit dat Taken 5 en 6 van `docs/superpowers/plans/2026-07-08-login-audit-and-visitor-analytics.md` al zijn uitgevoerd, zodat `components/admin/nav-config.ts` al een `"Inzicht"`-sectie bevat met `Statistieken`- en `Logins`-items. Controleer dit bij aanvang van Taak 8; als de sectie er nog niet is, eerst dat plan afronden.
- Elke `error_events`-migratie via handmatige SQL (kolom-voor-kolom identiek aan de Drizzle-schemadefinitie) — `drizzle-kit push` wordt naar verwachting geblokkeerd door de bekende, losstaande `pages`-tabel-quirk (`UNIQUE NULLS NOT DISTINCT (slug, locale)` kan niet correct worden geïntrospecteerd). Nooit die prompt beantwoorden; via `node -e` + `@neondatabase/serverless` toepassen, zoals bij `admin_login_events`/`page_views`.

---

### Task 1: Schema — `error_events`-tabel

**Files:**
- Modify: `drizzle/schema.ts`

**Interfaces:**
- Produces: `errorEvents` (Drizzle table), `errorSourceEnum` (`pgEnum`), `ErrorEvent` type — allemaal vanuit `@/drizzle/schema`. Gebruikt door Taak 2 (`logError()`) en Taak 7 (admin-pagina).

- [ ] **Step 1: Tabel en enum toevoegen**

Voeg toe aan `drizzle/schema.ts`, direct ná het `pageViews`-blok (vóór het `// ── CMS ──` commentaar):

```ts
export const errorSourceEnum = pgEnum("error_source", ["client", "server"]);

export const errorEvents = pgTable("error_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  source: errorSourceEnum("source").notNull().default("server"),
  context: varchar("context", { length: 100 }),
  message: text("message").notNull(),
  stack: text("stack"),
  digest: varchar("digest", { length: 64 }),
  path: varchar("path", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

- [ ] **Step 2: Type toevoegen**

In het `// ── Types ──` blok, direct ná de regel `export type PageView = typeof pageViews.$inferSelect;`, toevoegen:

```ts
export type ErrorEvent = typeof errorEvents.$inferSelect;
```

- [ ] **Step 3: `drizzle-kit push` proberen (verwacht: geblokkeerd door de `pages`-quirk)**

Run: `npx dotenv -e .env.local -- npx drizzle-kit push`

Verwacht: een prompt/foutmelding over `pages_slug_locale_uq` / "truncate pages table" (niet-interactieve TTY-fout). Beantwoord deze **niet** — dit is de bekende, losstaande quirk. Ga direct door naar Stap 4.

- [ ] **Step 4: Handmatige SQL toepassen**

```bash
node -e "
require('dotenv').config({path:'.env.local'});
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
(async () => {
  await sql\`CREATE TYPE error_source AS ENUM ('client', 'server')\`;
  console.log('error_source enum aangemaakt');
  await sql\`
    CREATE TABLE error_events (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      source error_source NOT NULL DEFAULT 'server',
      context varchar(100),
      message text NOT NULL,
      stack text,
      digest varchar(64),
      path varchar(255),
      created_at timestamp NOT NULL DEFAULT now()
    )
  \`;
  console.log('error_events aangemaakt');
})();
" 2>&1 | grep -v "tip:"
```

- [ ] **Step 5: Verifiëren — kolommen kloppen, `pages` ongemoeid**

```bash
node -e "
require('dotenv').config({path:'.env.local'});
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
(async () => {
  const cols = await sql\`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'error_events' ORDER BY ordinal_position\`;
  console.log('error_events:', cols);
  const pages = await sql\`SELECT slug, locale FROM pages\`;
  console.log('pages (moet nog steeds 2 rijen zijn):', pages);
})();
" 2>&1 | grep -v "tip:"
```
Verwacht: 8 kolommen op `error_events` (`id`, `source`, `context`, `message`, `stack`, `digest`, `path`, `created_at`); `pages` nog steeds exact 2 rijen.

- [ ] **Step 6: Tweede `drizzle-kit push` — sync-bevestiging**

Run: `npx dotenv -e .env.local -- npx drizzle-kit push`
Verwacht: zelfde uitkomst als Stap 3 (alleen de bekende `pages`-quirk), geen voorstel meer over `error_events` — bevestigt dat schema.ts en de live database gesynchroniseerd zijn.

- [ ] **Step 7: Typecheck + commit**

```bash
npx tsc --noEmit
git add drizzle/schema.ts
git commit -m "Add error_events table"
```

---

### Task 2: `lib/error-log/log.ts` — gedeelde `logError()`-helper

**Files:**
- Create: `lib/error-log/log.ts`

**Interfaces:**
- Consumes: `db` (`@/lib/db`), `errorEvents` (`@/drizzle/schema`, van Taak 1).
- Produces: `logError(context: string, error: unknown, options?: { source?: "client" | "server"; path?: string; digest?: string; stack?: string }): Promise<void>` vanuit `@/lib/error-log/log`. Gebruikt door Taak 3 (API-route) en Taken 5-6 (server call-sites).

- [ ] **Step 1: Bestand aanmaken**

```ts
import "server-only";
import { db } from "@/lib/db";
import { errorEvents } from "@/drizzle/schema";

const MAX_MESSAGE_LENGTH = 500;
const MAX_STACK_LENGTH = 3000;

interface LogErrorOptions {
  source?: "client" | "server";
  path?: string;
  digest?: string;
  // Overrides the stack derived from `error` — nodig wanneer de fout hier
  // opnieuw wordt geconstrueerd (bv. in de client-error-route, waar de
  // browser-stack apart wordt meegegeven en niet gelijk is aan de stack
  // van een lokaal aangemaakt Error-object).
  stack?: string;
}

// Fail-open, zelfde idioom als lib/rate-limit.ts en lib/mail/send.ts: nooit
// gooien, nooit de aanroepende flow blokkeren. De bestaande console.error op
// de call-site blijft ongewijzigd staan — dit voegt alleen een DB-rij toe.
export async function logError(
  context: string,
  error: unknown,
  options: LogErrorOptions = {}
): Promise<void> {
  try {
    const message = error instanceof Error ? error.message : String(error);
    const derivedStack = error instanceof Error ? error.stack : undefined;
    const stack = options.stack ?? derivedStack;

    await db.insert(errorEvents).values({
      source: options.source ?? "server",
      context,
      message: message.slice(0, MAX_MESSAGE_LENGTH),
      stack: stack ? stack.slice(0, MAX_STACK_LENGTH) : null,
      digest: options.digest ?? null,
      path: options.path ?? null,
    });
  } catch (loggingError) {
    console.error("logError failed:", loggingError);
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: geen output, exit code 0.

- [ ] **Step 3: Commit**

```bash
git add lib/error-log/log.ts
git commit -m "Add shared logError() helper"
```

---

### Task 3: `/api/log-error`-route

**Files:**
- Create: `app/api/log-error/route.ts`

**Interfaces:**
- Consumes: `rateLimit` (`@/lib/rate-limit`), `logError` (`@/lib/error-log/log`, van Taak 2).
- Produces: `POST /api/log-error` — accepteert `{ message: string; stack?: string; digest?: string; path?: string }`, retourneert altijd `{ ok: true }`. Gebruikt door Taak 4 (client error-boundaries).

- [ ] **Step 1: Route aanmaken**

```ts
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { logError } from "@/lib/error-log/log";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    // Fail-open en stil: een gemiste foutmelding mag nooit zelf een fout
    // tonen aan een bezoeker die al naar een kapotte pagina kijkt.
    if (!rateLimit(`log-error:${ip}`).allowed) {
      return NextResponse.json({ ok: true });
    }

    const body = await request.json().catch(() => ({}));
    const message = typeof body.message === "string" ? body.message : "Unknown client error";
    const stack = typeof body.stack === "string" ? body.stack : undefined;
    const digest = typeof body.digest === "string" ? body.digest : undefined;
    const path = typeof body.path === "string" ? body.path.slice(0, 255) : undefined;

    await logError("client-error-boundary", new Error(message), {
      source: "client",
      path,
      digest,
      stack,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("log-error route failed:", error);
    return NextResponse.json({ ok: true }); // fail-open — nooit de pagina breken
  }
}
```

- [ ] **Step 2: Typecheck + build**

Run: `npx tsc --noEmit` — verwacht: schoon.
Run: `npm run build` — verwacht: succesvol, `/api/log-error` in de routelijst.

- [ ] **Step 3: Functionele test**

```bash
npm run dev &
sleep 12
curl -s -m 15 -X POST http://localhost:3000/api/log-error -H "Content-Type: application/json" --data '{"message":"test-fout","stack":"Error: test-fout\n    at test","digest":"1234567890","path":"/test-pad"}'
```
Expected: `{"ok":true}`.

Verifieer in de database:

```bash
node -e "
require('dotenv').config({path:'.env.local'});
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
(async () => {
  const rows = await sql\`SELECT source, context, message, digest, path FROM error_events WHERE path = '/test-pad'\`;
  console.log(rows);
})();
" 2>&1 | grep -v "tip:"
```
Expected: één rij, `source: 'client'`, `context: 'client-error-boundary'`, `message: 'test-fout'`, `digest: '1234567890'`, `path: '/test-pad'`.

Ruim de testrij op:

```bash
node -e "
require('dotenv').config({path:'.env.local'});
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
(async () => {
  const r = await sql\`DELETE FROM error_events WHERE path = '/test-pad' RETURNING id\`;
  console.log('opgeruimd:', r.length);
})();
" 2>&1 | grep -v "tip:"
```

Stop de dev-server.

- [ ] **Step 4: Commit**

```bash
git add app/api/log-error/route.ts
git commit -m "Add /api/log-error route"
```

---

### Task 4: Client-side error-boundaries — beacon toevoegen

**Files:**
- Modify: `app/[locale]/error.tsx`
- Modify: `app/(admin)/admin/(shell)/error.tsx`

**Interfaces:**
- Consumes: `POST /api/log-error` (van Taak 3).

- [ ] **Step 1: `app/[locale]/error.tsx` bijwerken**

Huidige inhoud:

```tsx
"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
```

Vervang het `useEffect`-blok door:

```tsx
"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    fetch("/api/log-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        digest: error.digest,
        path: window.location.pathname,
      }),
      keepalive: true,
    }).catch(() => {
      // Stil — een gemiste foutmelding mag nooit zichtbaar worden voor de bezoeker.
    });
  }, [error]);
```

(De rest van het bestand — de JSX-return — blijft ongewijzigd.)

- [ ] **Step 2: `app/(admin)/admin/(shell)/error.tsx` bijwerken**

Zelfde wijziging, zelfde `useEffect`-vervanging (dit bestand heeft identieke imports en functiesignatuur, alleen de JSX-tekst eronder verschilt licht — die blijft ongewijzigd):

```tsx
  useEffect(() => {
    console.error(error);
    fetch("/api/log-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        digest: error.digest,
        path: window.location.pathname,
      }),
      keepalive: true,
    }).catch(() => {
      // Stil — een gemiste foutmelding mag nooit zichtbaar worden voor de bezoeker.
    });
  }, [error]);
```

- [ ] **Step 3: Typecheck + build**

Run: `npx tsc --noEmit` — verwacht: schoon.
Run: `npm run build` — verwacht: succesvol.

- [ ] **Step 4: Commit**

```bash
git add "app/[locale]/error.tsx" "app/(admin)/admin/(shell)/error.tsx"
git commit -m "Report client-side crashes to /api/log-error"
```

---

### Task 5: Server-side call-sites naar `logError()` — batch A (7 bestanden)

**Files:**
- Modify: `app/api/upload/route.ts`
- Modify: `app/(admin)/admin/login/_actions.ts`
- Modify: `app/[locale]/afspraak/_actions.ts`
- Modify: `app/(admin)/admin/(shell)/afspraken/nieuw/_actions.ts`
- Modify: `app/(admin)/admin/(shell)/beschikbaarheid/_actions.ts`
- Modify: `app/api/track/route.ts`
- Modify: `lib/mail/send.ts`

**Interfaces:**
- Consumes: `logError` (`@/lib/error-log/log`, van Taak 2).

Voor elk bestand: voeg de import toe (na de bestaande imports) en voeg `await logError("<context>", error);` toe direct ná de bestaande `console.error(...)`-regel. Geen andere wijzigingen.

- [ ] **Step 1: `app/api/upload/route.ts`**

Huidige imports:
```ts
import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getSession } from "@/lib/auth";
```
Wordt:
```ts
import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getSession } from "@/lib/auth";
import { logError } from "@/lib/error-log/log";
```

Huidige catch-blok:
```ts
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
```
Wordt:
```ts
  } catch (error) {
    console.error("Upload failed:", error);
    await logError("upload", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
```

- [ ] **Step 2: `app/(admin)/admin/login/_actions.ts`**

Huidige imports:
```ts
"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSession, validateCredentials } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { adminLoginEvents } from "@/drizzle/schema";
```
Wordt (import toegevoegd):
```ts
"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSession, validateCredentials } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { adminLoginEvents } from "@/drizzle/schema";
import { logError } from "@/lib/error-log/log";
```

Huidige catch-blok (binnen `logAttempt`):
```ts
  } catch (error) {
    // Logging must never break the login flow itself.
    console.error("logAttempt failed:", error);
  }
```
Wordt:
```ts
  } catch (error) {
    // Logging must never break the login flow itself.
    console.error("logAttempt failed:", error);
    await logError("logAttempt", error);
  }
```

- [ ] **Step 3: `app/[locale]/afspraak/_actions.ts`**

Huidige imports:
```ts
"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { appointments } from "@/drizzle/schema";
import { rateLimit } from "@/lib/rate-limit";
import { resolveTopicLabel } from "@/lib/booking/constants";
import { appointmentSchema, type BookingActionState } from "@/lib/booking/schema";
import { checkSlotAvailable } from "@/lib/booking/availability-guard";
import { sendMail } from "@/lib/mail/send";
import { buildBookingConfirmationMail, buildOfficeNotificationMail } from "@/lib/mail/templates";
```
Wordt (import toegevoegd):
```ts
"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { appointments } from "@/drizzle/schema";
import { rateLimit } from "@/lib/rate-limit";
import { resolveTopicLabel } from "@/lib/booking/constants";
import { appointmentSchema, type BookingActionState } from "@/lib/booking/schema";
import { checkSlotAvailable } from "@/lib/booking/availability-guard";
import { sendMail } from "@/lib/mail/send";
import { buildBookingConfirmationMail, buildOfficeNotificationMail } from "@/lib/mail/templates";
import { logError } from "@/lib/error-log/log";
```

Huidige catch-blok:
```ts
  } catch (error) {
    // Unique-violation from the partial index → concurrent booking won the race.
    const message = error instanceof Error ? error.message : "";
    if (message.includes("appointments_date_time_active_uq") || message.includes("duplicate key")) {
      return { status: "error", code: "slotTaken" };
    }
    console.error("createAppointment failed:", error);
    return { status: "error", code: "generic" };
  }
```
Wordt:
```ts
  } catch (error) {
    // Unique-violation from the partial index → concurrent booking won the race.
    const message = error instanceof Error ? error.message : "";
    if (message.includes("appointments_date_time_active_uq") || message.includes("duplicate key")) {
      return { status: "error", code: "slotTaken" };
    }
    console.error("createAppointment failed:", error);
    await logError("createAppointment", error);
    return { status: "error", code: "generic" };
  }
```

- [ ] **Step 4: `app/(admin)/admin/(shell)/afspraken/nieuw/_actions.ts`**

Huidige imports:
```ts
"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { appointments } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";
import { appointmentSchema, type BookingActionState } from "@/lib/booking/schema";
import { checkSlotAvailable } from "@/lib/booking/availability-guard";
import { resolveTopicLabel } from "@/lib/booking/constants";
import { sendMail } from "@/lib/mail/send";
import { buildStatusChangeMail } from "@/lib/mail/templates";
```
Wordt (import toegevoegd):
```ts
"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { appointments } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";
import { appointmentSchema, type BookingActionState } from "@/lib/booking/schema";
import { checkSlotAvailable } from "@/lib/booking/availability-guard";
import { resolveTopicLabel } from "@/lib/booking/constants";
import { sendMail } from "@/lib/mail/send";
import { buildStatusChangeMail } from "@/lib/mail/templates";
import { logError } from "@/lib/error-log/log";
```

Huidige catch-blok:
```ts
    const message = error instanceof Error ? error.message : "";
    if (message.includes("appointments_date_time_active_uq") || message.includes("duplicate key")) {
      return { status: "error", code: "slotTaken" };
    }
    console.error("createAppointmentAdmin failed:", error);
    return { status: "error", code: "generic" };
  }
```
Wordt:
```ts
    const message = error instanceof Error ? error.message : "";
    if (message.includes("appointments_date_time_active_uq") || message.includes("duplicate key")) {
      return { status: "error", code: "slotTaken" };
    }
    console.error("createAppointmentAdmin failed:", error);
    await logError("createAppointmentAdmin", error);
    return { status: "error", code: "generic" };
  }
```

- [ ] **Step 5: `app/(admin)/admin/(shell)/beschikbaarheid/_actions.ts`**

Huidige imports:
```ts
"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { availabilityConfig, availabilityOverrides } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";
```
Wordt (import toegevoegd):
```ts
"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { availabilityConfig, availabilityOverrides } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";
import { logError } from "@/lib/error-log/log";
```

Eerste catch-blok, huidige inhoud:
```ts
    revalidatePath("/admin/beschikbaarheid");
    return { success: true, error: null };
  } catch (error) {
    console.error("saveWeekConfig failed:", error);
    return { success: false, error: "Opslaan mislukt. Probeer het opnieuw." };
  }
```
Wordt:
```ts
    revalidatePath("/admin/beschikbaarheid");
    return { success: true, error: null };
  } catch (error) {
    console.error("saveWeekConfig failed:", error);
    await logError("saveWeekConfig", error);
    return { success: false, error: "Opslaan mislukt. Probeer het opnieuw." };
  }
```

Tweede catch-blok, huidige inhoud:
```ts
    revalidatePath("/admin/beschikbaarheid");
    return { success: true, error: null };
  } catch (error) {
    console.error("addOverride failed:", error);
    return { success: false, error: "Opslaan mislukt. Probeer het opnieuw." };
  }
```
Wordt:
```ts
    revalidatePath("/admin/beschikbaarheid");
    return { success: true, error: null };
  } catch (error) {
    console.error("addOverride failed:", error);
    await logError("addOverride", error);
    return { success: false, error: "Opslaan mislukt. Probeer het opnieuw." };
  }
```

(Deze twee blokken hebben identieke `revalidatePath("/admin/beschikbaarheid"); return { success: true, error: null };`-regels ervoor — onderscheid ze op de foutboodschap-tekst: `"saveWeekConfig failed:"` resp. `"addOverride failed:"`.)

- [ ] **Step 6: `app/api/track/route.ts`**

Huidige imports:
```ts
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { db } from "@/lib/db";
import { pageViews } from "@/drizzle/schema";
import { rateLimit } from "@/lib/rate-limit";
```
Wordt (import toegevoegd):
```ts
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { db } from "@/lib/db";
import { pageViews } from "@/drizzle/schema";
import { rateLimit } from "@/lib/rate-limit";
import { logError } from "@/lib/error-log/log";
```

Huidige catch-blok:
```ts
  } catch (error) {
    console.error("track failed:", error);
    return NextResponse.json({ ok: true }); // fail-open — never break the page
  }
```
Wordt:
```ts
  } catch (error) {
    console.error("track failed:", error);
    await logError("track", error);
    return NextResponse.json({ ok: true }); // fail-open — never break the page
  }
```

- [ ] **Step 7: `lib/mail/send.ts`**

Huidige imports:
```ts
import "server-only";
import type { MailMessage, SendResult } from "./types";
```
Wordt (import toegevoegd):
```ts
import "server-only";
import type { MailMessage, SendResult } from "./types";
import { logError } from "@/lib/error-log/log";
```

Huidige catch-blok:
```ts
  } catch (error) {
    console.error("sendMail failed:", error);
    return { ok: false, reason: "unexpected-error" }; // fail-open by design
  }
```
Wordt:
```ts
  } catch (error) {
    console.error("sendMail failed:", error);
    await logError("sendMail", error);
    return { ok: false, reason: "unexpected-error" }; // fail-open by design
  }
```

- [ ] **Step 8: Typecheck + build**

Run: `npx tsc --noEmit` — verwacht: schoon.
Run: `npm run build` — verwacht: succesvol.

- [ ] **Step 9: Commit**

```bash
git add app/api/upload/route.ts "app/(admin)/admin/login/_actions.ts" "app/[locale]/afspraak/_actions.ts" "app/(admin)/admin/(shell)/afspraken/nieuw/_actions.ts" "app/(admin)/admin/(shell)/beschikbaarheid/_actions.ts" app/api/track/route.ts lib/mail/send.ts
git commit -m "Wire batch A server-side catch blocks to logError()"
```

---

### Task 6: Server-side call-sites naar `logError()` — batch B (7 bestanden)

**Files:**
- Modify: `app/(admin)/admin/(shell)/diensten/_actions.ts`
- Modify: `app/(admin)/admin/(shell)/blog/_actions.ts`
- Modify: `app/[locale]/contact/_actions.ts`
- Modify: `lib/mail/providers/smtp.ts`
- Modify: `app/(admin)/admin/(shell)/vacatures/_actions.ts`
- Modify: `app/(admin)/admin/(shell)/paginas/_actions.ts`
- Modify: `app/(admin)/admin/(shell)/homepage/_actions.ts`

**Interfaces:**
- Consumes: `logError` (`@/lib/error-log/log`, van Taak 2).

Zelfde patroon als Taak 5: import toevoegen, `await logError("<context>", error);` direct ná de bestaande `console.error(...)`.

- [ ] **Step 1: `app/(admin)/admin/(shell)/diensten/_actions.ts`**

Huidige imports:
```ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { servicesContent } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";
import { SERVICE_KEYS } from "@/lib/content/services-defaults";
```
Wordt (import toegevoegd):
```ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { servicesContent } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";
import { SERVICE_KEYS } from "@/lib/content/services-defaults";
import { logError } from "@/lib/error-log/log";
```

Huidige catch-blok:
```ts
  } catch (error) {
    console.error("saveService failed:", error);
    return { success: false, error: "Opslaan mislukt. Probeer het opnieuw." };
  }
```
Wordt:
```ts
  } catch (error) {
    console.error("saveService failed:", error);
    await logError("saveService", error);
    return { success: false, error: "Opslaan mislukt. Probeer het opnieuw." };
  }
```

- [ ] **Step 2: `app/(admin)/admin/(shell)/blog/_actions.ts`**

Huidige imports:
```ts
"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { blogPosts } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";
```
Wordt (import toegevoegd):
```ts
"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { blogPosts } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";
import { logError } from "@/lib/error-log/log";
```

Huidige catch-blok:
```ts
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("blog_posts_slug") || message.includes("duplicate key")) {
      return { success: false, error: "Deze slug is al in gebruik." };
    }
    console.error("saveBlogPost failed:", error);
    return { success: false, error: "Opslaan mislukt. Probeer het opnieuw." };
  }
```
Wordt:
```ts
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("blog_posts_slug") || message.includes("duplicate key")) {
      return { success: false, error: "Deze slug is al in gebruik." };
    }
    console.error("saveBlogPost failed:", error);
    await logError("saveBlogPost", error);
    return { success: false, error: "Opslaan mislukt. Probeer het opnieuw." };
  }
```

- [ ] **Step 3: `app/[locale]/contact/_actions.ts`**

Huidige imports:
```ts
"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { sendMail } from "@/lib/mail/send";
import { buildContactConfirmationMail, buildContactOfficeMail } from "@/lib/mail/templates";
import { BUSINESS } from "@/lib/seo/site-info";
import { db } from "@/lib/db";
import { contactMessages } from "@/drizzle/schema";
```
Wordt (import toegevoegd):
```ts
"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { sendMail } from "@/lib/mail/send";
import { buildContactConfirmationMail, buildContactOfficeMail } from "@/lib/mail/templates";
import { BUSINESS } from "@/lib/seo/site-info";
import { db } from "@/lib/db";
import { contactMessages } from "@/drizzle/schema";
import { logError } from "@/lib/error-log/log";
```

Huidige catch-blok:
```ts
    return { status: "success" };
  } catch (error) {
    console.error("sendContactMessage failed:", error);
    return { status: "error", code: "generic" };
  }
```
Wordt:
```ts
    return { status: "success" };
  } catch (error) {
    console.error("sendContactMessage failed:", error);
    await logError("sendContactMessage", error);
    return { status: "error", code: "generic" };
  }
```

- [ ] **Step 4: `lib/mail/providers/smtp.ts`**

Huidige imports:
```ts
import "server-only";
import nodemailer from "nodemailer";
import type { MailMessage, SendResult } from "../types";
```
Wordt (import toegevoegd):
```ts
import "server-only";
import nodemailer from "nodemailer";
import type { MailMessage, SendResult } from "../types";
import { logError } from "@/lib/error-log/log";
```

Huidige catch-blok:
```ts
  } catch (error) {
    console.error("sendViaSmtp failed:", error);
    return { ok: false, reason: "smtp-error" };
  }
```
Wordt:
```ts
  } catch (error) {
    console.error("sendViaSmtp failed:", error);
    await logError("sendViaSmtp", error);
    return { ok: false, reason: "smtp-error" };
  }
```

- [ ] **Step 5: `app/(admin)/admin/(shell)/vacatures/_actions.ts`**

Huidige imports:
```ts
"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { vacancies } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";
```
Wordt (import toegevoegd):
```ts
"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { vacancies } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";
import { logError } from "@/lib/error-log/log";
```

Eerste catch-blok, huidige inhoud:
```ts
        .update(vacancies)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(vacancies.id, id));
    } catch (error) {
      console.error("saveVacancy (update) failed:", error);
      return { success: false, error: "Opslaan mislukt. Probeer het opnieuw." };
    }
```
Wordt:
```ts
        .update(vacancies)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(vacancies.id, id));
    } catch (error) {
      console.error("saveVacancy (update) failed:", error);
      await logError("saveVacancy-update", error);
      return { success: false, error: "Opslaan mislukt. Probeer het opnieuw." };
    }
```

Tweede catch-blok, huidige inhoud:
```ts
      .values(values)
      .returning({ id: vacancies.id });
    newId = inserted.id;
  } catch (error) {
    console.error("saveVacancy (insert) failed:", error);
    return { success: false, error: "Opslaan mislukt. Probeer het opnieuw." };
  }
```
Wordt:
```ts
      .values(values)
      .returning({ id: vacancies.id });
    newId = inserted.id;
  } catch (error) {
    console.error("saveVacancy (insert) failed:", error);
    await logError("saveVacancy-insert", error);
    return { success: false, error: "Opslaan mislukt. Probeer het opnieuw." };
  }
```

- [ ] **Step 6: `app/(admin)/admin/(shell)/paginas/_actions.ts`**

Huidige imports:
```ts
"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { pages } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";
```
Wordt (import toegevoegd):
```ts
"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { pages } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";
import { logError } from "@/lib/error-log/log";
```

Huidige catch-blok:
```ts
  } catch (error) {
    console.error("savePage failed:", error);
    return { success: false, error: "Opslaan mislukt. Probeer het opnieuw." };
  }
```
Wordt:
```ts
  } catch (error) {
    console.error("savePage failed:", error);
    await logError("savePage", error);
    return { success: false, error: "Opslaan mislukt. Probeer het opnieuw." };
  }
```

- [ ] **Step 7: `app/(admin)/admin/(shell)/homepage/_actions.ts`**

Huidige imports:
```ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { homepageContent } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";
```
Wordt (import toegevoegd):
```ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { homepageContent } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";
import { logError } from "@/lib/error-log/log";
```

Huidige catch-blok:
```ts
  } catch (error) {
    console.error("saveHomepage failed:", error);
    return { success: false, error: "Opslaan mislukt. Probeer het opnieuw." };
  }
```
Wordt:
```ts
  } catch (error) {
    console.error("saveHomepage failed:", error);
    await logError("saveHomepage", error);
    return { success: false, error: "Opslaan mislukt. Probeer het opnieuw." };
  }
```

- [ ] **Step 8: Typecheck + build**

Run: `npx tsc --noEmit` — verwacht: schoon.
Run: `npm run build` — verwacht: succesvol.

- [ ] **Step 9: Commit**

```bash
git add "app/(admin)/admin/(shell)/diensten/_actions.ts" "app/(admin)/admin/(shell)/blog/_actions.ts" "app/[locale]/contact/_actions.ts" lib/mail/providers/smtp.ts "app/(admin)/admin/(shell)/vacatures/_actions.ts" "app/(admin)/admin/(shell)/paginas/_actions.ts" "app/(admin)/admin/(shell)/homepage/_actions.ts"
git commit -m "Wire batch B server-side catch blocks to logError()"
```

---

### Task 7: Admin-pagina `/admin/fouten`

**Files:**
- Create: `app/(admin)/admin/(shell)/fouten/page.tsx`

**Interfaces:**
- Consumes: `errorEvents`, `ErrorEvent` (`@/drizzle/schema`, van Taak 1), `requireSession` (`@/lib/auth`), `AdminPageHeader` (`@/components/admin/admin-page-header`).

- [ ] **Step 1: Pagina aanmaken**

```tsx
import { desc } from "drizzle-orm";
import { AlertTriangle, Monitor, Server } from "lucide-react";
import { db } from "@/lib/db";
import { errorEvents } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";
import AdminPageHeader from "@/components/admin/admin-page-header";

export const dynamic = "force-dynamic";

export default async function FoutenPage() {
  await requireSession();

  const rows = await db
    .select()
    .from(errorEvents)
    .orderBy(desc(errorEvents.createdAt))
    .limit(200);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Foutmeldingen"
        description="Recente client- en server-fouten (laatste 200)."
      />

      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        {rows.length === 0 ? (
          <p className="px-5 py-10 text-sm text-gray-400 text-center">
            <AlertTriangle className="w-5 h-5 mx-auto mb-2 text-gray-300" />
            Nog geen fouten gelogd.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                <th className="px-5 py-3">Tijdstip</th>
                <th className="px-5 py-3">Bron</th>
                <th className="px-5 py-3">Context</th>
                <th className="px-5 py-3">Boodschap</th>
                <th className="px-5 py-3">Pad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((event) => (
                <tr key={event.id}>
                  <td className="px-5 py-3.5 whitespace-nowrap text-gray-500">
                    {event.createdAt.toLocaleString("nl-NL")}
                  </td>
                  <td className="px-5 py-3.5">
                    {event.source === "client" ? (
                      <span className="inline-flex items-center gap-1.5 text-amber-700">
                        <Monitor className="w-4 h-4" /> Client
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-red-600">
                        <Server className="w-4 h-4" /> Server
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-navy font-medium whitespace-nowrap">
                    {event.context ?? "—"}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 max-w-md truncate" title={event.message}>
                    {event.message}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                    {event.path ?? "—"}
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

Run: `npx tsc --noEmit` — verwacht: schoon.
Run: `npm run build` — verwacht: succesvol, `/admin/fouten` in de routelijst.

- [ ] **Step 3: Commit**

```bash
git add "app/(admin)/admin/(shell)/fouten/page.tsx"
git commit -m "Add /admin/fouten page listing recent error events"
```

---

### Task 8: Nav-item voor Fouten

**Files:**
- Modify: `components/admin/nav-config.ts`

**Global constraint:** dit gaat ervan uit dat `nav-config.ts` al de `"Inzicht"`-sectie bevat (uit Taak 6 van `docs/superpowers/plans/2026-07-08-login-audit-and-visitor-analytics.md`). Controleer dit eerst — `cat components/admin/nav-config.ts` — als de sectie ontbreekt, is dat plan nog niet afgerond en moet dat eerst gebeuren.

- [ ] **Step 1: `AlertTriangle`-import en nav-item toevoegen**

Verwachte huidige inhoud (na het login-audit-plan):

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

Vervang volledig door (toegevoegd: `AlertTriangle`-import en `Fouten`-item aan de `"Inzicht"`-sectie):

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
  AlertTriangle,
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
      { label: "Fouten", href: "/admin/fouten", icon: AlertTriangle },
    ],
  },
];
```

Als de daadwerkelijke huidige inhoud van het bestand afwijkt van het "verwachte huidige inhoud"-blok hierboven (bv. andere sectie-volgorde), pas dezelfde wijziging toe op de werkelijke inhoud: `AlertTriangle` importeren, en één `{ label: "Fouten", href: "/admin/fouten", icon: AlertTriangle }`-item toevoegen aan de `"Inzicht"`-sectie's `items`-array.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: geen output, exit code 0.

- [ ] **Step 3: Commit**

```bash
git add components/admin/nav-config.ts
git commit -m "Add Fouten to admin nav"
```

---

### Task 9: Volledige verificatie + afronden

**Files:** geen nieuwe — eindcontrole.

- [ ] **Step 1: Volledige lint + typecheck + build**

```bash
npm run lint
npx tsc --noEmit
rm -rf .next
npm run build
```
Expected: alle drie slagen zonder errors. `/admin/fouten`, `/api/log-error` staan in de routelijst.

- [ ] **Step 2: End-to-end check — server-side fout wordt gelogd**

Start de dev-server en forceer een echte server-side fout via de contactformulier-actie (bv. door tijdelijk `DATABASE_URL` fout te zetten is te ingrijpend — gebruik in plaats daarvan de al gebouwde `/api/log-error`-route direct, zoals in Taak 3 Stap 3, met een tweede unieke test-pad):

```bash
npm run dev &
sleep 12
curl -s -m 15 -X POST http://localhost:3000/api/log-error -H "Content-Type: application/json" --data '{"message":"e2e-server-test","path":"/e2e-server-test"}'
curl -s -m 15 -X POST http://localhost:3000/api/log-error -H "Content-Type: application/json" --data '{"message":"e2e-client-test","stack":"Error: e2e-client-test\n    at Component","digest":"abc123","path":"/e2e-client-test"}'
```
Expected: beide `{"ok":true}`.

- [ ] **Step 3: `/admin/fouten` rendert de nieuwe rijen met een echte sessie**

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
" > /tmp/admin-token.txt
TOKEN=$(cat /tmp/admin-token.txt)
curl -s -m 15 -o /dev/null -w "%{http_code}\n" http://localhost:3000/admin/fouten -H "Cookie: admin_session=$TOKEN"
```
Expected: `200`.

- [ ] **Step 4: Testdata opruimen**

```bash
node -e "
require('dotenv').config({path:'.env.local'});
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
(async () => {
  const r = await sql\`DELETE FROM error_events WHERE path IN ('/e2e-server-test', '/e2e-client-test') RETURNING id\`;
  console.log('opgeruimd:', r.length);
})();
" 2>&1 | grep -v "tip:"
```

Stop de dev-server.

- [ ] **Step 5: Commit (indien nog niet-gecommitte wijzigingen)**

```bash
git status --short
```
Als er geen wijzigingen meer zijn, is er niets te committen — dit is enkel een eindcontrole.
