# Backoffice-afspraken + contactformulier-inbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Laat admin-staff (a) zelf handmatig een afspraak inplannen (bevestigd, geen rate limit) en (b) contactformulier-berichten zien/beheren in een nieuwe "Berichten"-sectie, in plaats van alleen als (nu nog inactieve) e-mail.

**Architecture:** Beide features hergebruiken het bestaande `admin/afspraken`-patroon (`requireSession()`, `AdminPageHeader`, `StatusBadge`, tabel + filterpills + form-per-rij-acties). Feature A hergebruikt de publieke `BookingWidget` door 'm een optionele `action`-prop te geven; de gedeelde zod-schema en beschikbaarheidscheck worden uit `afspraak/_actions.ts` getrokken naar `lib/booking/` zodat de nieuwe admin-actie ze hergebruikt in plaats van dupliceert. Feature B voegt één nieuwe tabel + admin-CRUD-module toe, los van de bestaande (inactieve) e-mailflow.

**Tech Stack:** Next.js 16 App Router, TypeScript strict, Drizzle ORM + Neon Postgres, next-intl, Tailwind v4, zod, `useActionState`.

## Global Constraints

- Geen testframework in deze repo (geen vitest/jest) — "test"-stappen in dit plan zijn: `npx tsc --noEmit`, `npm run lint`, `npm run build`, en functionele live-checks via `npm run dev` + `curl` (en directe DB-checks via een klein node-script), consistent met hoe elke eerdere feature in dit project geverifieerd is.
- Server actions kunnen niet direct met `curl` getest worden (Next.js encodeert ze intern). Waar een server action getest moet worden: maak een **tijdelijke** testroute (bv. `app/api/test-tmp/route.ts` — **geen underscore-prefix**, Next.js beschouwt `_`-mappen als privé en negeert ze voor routing) die de actie rechtstreeks aanroept, curl 'm, verwijder de testroute daarna weer. Nooit een underscore-geprefixte testmap gebruiken (geleerde les eerder in dit project).
- Admin blijft NL-only (geen next-intl-provider in `app/(admin)/`, behalve lokaal in Task 5 waar we bewust alleen de `booking`-namespace injecteren).
- `npm run dev` en de Vercel-preflight starten node-processen op poort 3000 — sluit ze af (`taskkill //F //IM node.exe` op Windows) vóór je een nieuwe `npm run dev` start, anders EADDRINUSE.
- Elke commit: `git add <exacte bestanden>`, nooit `git add -A`. Nooit pushen/mergen zonder dat expliciet gevraagd is (behalve als de sessie-conventie al is dat elke afgeronde taak gepusht+gemerged wordt — check de laatste paar commits in `git log` voor de huidige conventie voordat je dat besluit neemt).

---

### Task 1: Gedeelde boekings-schema + type uit `afspraak/_actions.ts` trekken

**Files:**
- Create: `lib/booking/schema.ts`
- Modify: `app/[locale]/afspraak/_actions.ts`

**Interfaces:**
- Produces: `appointmentSchema` (zod object), `BookingActionState` (type) — beide vanuit `lib/booking/schema.ts`, herbruikt door Task 4.

- [ ] **Step 1: `lib/booking/schema.ts` aanmaken**

```ts
import { z } from "zod";
import { BOOKING_TOPIC_KEYS } from "./constants";

export const appointmentSchema = z.object({
  date: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  topic: z.string().refine((t) => BOOKING_TOPIC_KEYS.includes(t)),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  locale: z.enum(["nl", "en"]),
});

export type BookingActionState =
  | { status: "idle" }
  | { status: "success"; date: string; time: string; topic: string }
  | {
      status: "error";
      code: "rateLimited" | "invalid" | "dateUnavailable" | "slotTaken" | "generic";
    };
```

- [ ] **Step 2: `app/[locale]/afspraak/_actions.ts` bijwerken — importeer i.p.v. lokaal definiëren**

Vervang de huidige lokale `appointmentSchema`/`BookingActionState`-definities (bovenaan het bestand) door:

```ts
"use server";

import { and, eq, ne } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { appointments } from "@/drizzle/schema";
import { getDayData } from "@/lib/booking/queries";
import { rateLimit } from "@/lib/rate-limit";
import { resolveTopicLabel } from "@/lib/booking/constants";
import { appointmentSchema, type BookingActionState } from "@/lib/booking/schema";
import { sendMail } from "@/lib/mail/send";
import { buildBookingConfirmationMail, buildOfficeNotificationMail } from "@/lib/mail/templates";

export type { BookingActionState };
```

(De rest van het bestand — de `createAppointment`-functie zelf — blijft ongewijzigd; alleen de imports bovenaan en het verwijderen van de lokale `appointmentSchema`/`BookingActionState`-blokken. `BOOKING_TOPIC_KEYS` en `z` zijn niet meer nodig als directe import in dit bestand, verwijder die imports.)

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: geen output, exit code 0.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: build slaagt, geen nieuwe routes/errors.

- [ ] **Step 5: Commit**

```bash
git add lib/booking/schema.ts "app/[locale]/afspraak/_actions.ts"
git commit -m "Extract booking schema/type into lib/booking/schema.ts for reuse"
```

---

### Task 2: Beschikbaarheidscheck extraheren naar een gedeelde helper

**Files:**
- Create: `lib/booking/availability-guard.ts`
- Modify: `app/[locale]/afspraak/_actions.ts`

**Interfaces:**
- Consumes: `getDayData` van `lib/booking/queries.ts` (bestaat al).
- Produces: `checkSlotAvailable(date: string, time: string): Promise<{ ok: true } | { ok: false; code: "dateUnavailable" | "slotTaken" }>` — herbruikt door Task 4.

- [ ] **Step 1: `lib/booking/availability-guard.ts` aanmaken**

```ts
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { appointments } from "@/drizzle/schema";
import { getDayData } from "./queries";

export type SlotCheckResult = { ok: true } | { ok: false; code: "dateUnavailable" | "slotTaken" };

// Server-side re-check of a requested slot — never trust client state.
// Used by both the public and the admin booking-creation actions.
export async function checkSlotAvailable(date: string, time: string): Promise<SlotCheckResult> {
  const day = await getDayData(date);
  const slot = day.slots.find((s) => s.time === time);
  if (!day.open || !slot) {
    return { ok: false, code: "dateUnavailable" };
  }
  if (!slot.available) {
    return { ok: false, code: "slotTaken" };
  }

  const existing = await db
    .select({ id: appointments.id })
    .from(appointments)
    .where(and(eq(appointments.date, date), eq(appointments.time, time), ne(appointments.status, "cancelled")))
    .limit(1);
  if (existing.length > 0) {
    return { ok: false, code: "slotTaken" };
  }

  return { ok: true };
}
```

- [ ] **Step 2: `app/[locale]/afspraak/_actions.ts` bijwerken — stap 3+4 van `createAppointment` vervangen**

Vervang in de `try`-block van `createAppointment` de bestaande "3. Recompute availability..." en "4. Direct duplicate check..." blokken (die nu los `getDayData` + de handmatige duplicate-select doen) door:

```ts
    // 3. Recompute availability server-side — never trust client state.
    // Also narrows the race window; the partial unique index (step 5) is
    // the final, airtight guard against a concurrent insert.
    const check = await checkSlotAvailable(data.date, data.time);
    if (!check.ok) {
      return { status: "error", code: check.code };
    }
```

Update de imports: verwijder `and, eq, ne` (niet meer nodig in dit bestand) en `getDayData`; voeg toe:

```ts
import { checkSlotAvailable } from "@/lib/booking/availability-guard";
```

De rest van de functie (insert, mail, catch-block) blijft ongewijzigd.

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: geen output, exit code 0.

- [ ] **Step 4: Live smoke-test — publieke boekingsflow nog intact**

```bash
npm run dev &
sleep 12
curl -s -m 15 "http://localhost:3000/api/appointments/month?month=2026-09" | head -c 200
```
Expected: JSON met `{"month":"2026-09","days":[...]}` (zelfde als vóór de refactor — bewijst dat `getDayData`/de query-laag nog intact is). Stop de dev-server daarna (`taskkill //F //IM node.exe`).

- [ ] **Step 5: Commit**

```bash
git add lib/booking/availability-guard.ts "app/[locale]/afspraak/_actions.ts"
git commit -m "Extract slot-availability check into lib/booking/availability-guard.ts"
```

---

### Task 3: `BookingWidget` accepteert een optionele `action`-prop

**Files:**
- Modify: `components/booking/booking-widget.tsx`

**Interfaces:**
- Consumes: `BookingActionState` van `@/lib/booking/schema` (i.p.v. van `afspraak/_actions`).
- Produces: `<BookingWidget action={customAction} />` — optioneel, default = de publieke `createAppointment`. Herbruikt door Task 5.

- [ ] **Step 1: Imports en functiesignatuur aanpassen**

Bovenaan het bestand, vervang:

```ts
import {
  createAppointment,
  type BookingActionState,
} from "@/app/[locale]/afspraak/_actions";
```

door:

```ts
import { createAppointment } from "@/app/[locale]/afspraak/_actions";
import type { BookingActionState } from "@/lib/booking/schema";

type BookingAction = (
  prevState: BookingActionState,
  formData: FormData
) => Promise<BookingActionState>;
```

Zoek de functiedeclaratie:

```ts
export default function BookingWidget() {
```

Vervang door:

```ts
export default function BookingWidget({
  action = createAppointment,
}: {
  action?: BookingAction;
} = {}) {
```

Zoek de regel `const [state, formAction, pending] = useActionState(createAppointment, initialState);` en vervang `createAppointment` door `action`:

```ts
  const [state, formAction, pending] = useActionState(action, initialState);
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: geen output, exit code 0.

- [ ] **Step 3: Live smoke-test — publieke `/afspraak` ongewijzigd**

```bash
npm run dev &
sleep 12
curl -s -m 15 http://localhost:3000/afspraak | grep -o "Plan een" | head -1
```
Expected: `Plan een` (bewijst dat de pagina nog rendert zonder crash). Stop de dev-server.

- [ ] **Step 4: Commit**

```bash
git add components/booking/booking-widget.tsx
git commit -m "BookingWidget: accept optional action prop for reuse in admin"
```

---

### Task 4: Admin server action `createAppointmentAdmin`

**Files:**
- Create: `app/(admin)/admin/(shell)/afspraken/nieuw/_actions.ts`

**Interfaces:**
- Consumes: `appointmentSchema`, `BookingActionState` (`@/lib/booking/schema`), `checkSlotAvailable` (`@/lib/booking/availability-guard`), `requireSession` (`@/lib/auth`), `resolveTopicLabel` (`@/lib/booking/constants`), `sendMail` (`@/lib/mail/send`), `buildStatusChangeMail` (`@/lib/mail/templates`).
- Produces: `createAppointmentAdmin(prevState, formData): Promise<BookingActionState>` — gebruikt door Task 5 als `action`-prop op `<BookingWidget>`.

- [ ] **Step 1: Bestand aanmaken**

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

export async function createAppointmentAdmin(
  _prevState: BookingActionState,
  formData: FormData
): Promise<BookingActionState> {
  await requireSession();

  const parsed = appointmentSchema.safeParse({
    date: formData.get("date"),
    time: formData.get("time"),
    topic: formData.get("topic"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    notes: formData.get("notes"),
    locale: formData.get("locale"),
  });
  if (!parsed.success) {
    return { status: "error", code: "invalid" };
  }
  const data = parsed.data;

  try {
    const check = await checkSlotAvailable(data.date, data.time);
    if (!check.ok) {
      return { status: "error", code: check.code };
    }

    await db.insert(appointments).values({
      date: data.date,
      time: data.time,
      topic: data.topic,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      notes: data.notes || null,
      locale: data.locale,
      status: "confirmed",
      confirmedAt: new Date(),
    });

    const topicLabel = resolveTopicLabel(data.topic, data.locale);
    await sendMail({
      to: data.email,
      ...buildStatusChangeMail({
        locale: data.locale,
        name: data.name,
        date: data.date,
        time: data.time,
        topicLabel,
        status: "confirmed",
      }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("appointments_date_time_active_uq") || message.includes("duplicate key")) {
      return { status: "error", code: "slotTaken" };
    }
    console.error("createAppointmentAdmin failed:", error);
    return { status: "error", code: "generic" };
  }

  redirect("/admin/afspraken");
}
```

Let op: `redirect()` gooit intern een `NEXT_REDIRECT`-signaal — dat gebeurt hier bewust *buiten* de try/catch (na een succesvolle insert), zodat de catch-block 'm niet per ongeluk opvangt als een gewone fout.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: geen output, exit code 0.

- [ ] **Step 3: Functionele test via tijdelijke testroute**

Maak `app/api/test-tmp/route.ts` (LET OP: geen underscore-prefix):

```ts
import { NextResponse } from "next/server";
import { createAppointmentAdmin } from "@/app/(admin)/admin/(shell)/afspraken/nieuw/_actions";

export async function GET() {
  const formData = new FormData();
  formData.set("date", "2026-09-03"); // kies een donderdag die volgens de geseede beschikbaarheid (ma-vr) open is
  formData.set("time", "09:00");
  formData.set("topic", "algemene-kennismaking");
  formData.set("name", "Test Backoffice");
  formData.set("email", "test-backoffice@example.com");
  formData.set("phone", "");
  formData.set("notes", "");
  formData.set("locale", "nl");
  try {
    const result = await createAppointmentAdmin({ status: "idle" }, formData);
    return NextResponse.json({ result });
  } catch (error) {
    // redirect() gooit een NEXT_REDIRECT-fout bij succes — dat IS het bewijs dat het gelukt is.
    const digest = (error as { digest?: string })?.digest ?? String(error);
    return NextResponse.json({ redirected: digest });
  }
}
```

```bash
npm run dev &
sleep 12
curl -s -m 15 http://localhost:3000/api/test-tmp
```
Expected: `{"redirected":"NEXT_REDIRECT;..."}` — bewijst dat de insert + redirect zijn gelukt (geen `{"result":{"status":"error",...}}`).

Controleer daarna in de database dat de rij er staat met `status = 'confirmed'`:

```bash
node -e "
require('dotenv').config({path:'.env.local'});
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
(async () => {
  const rows = await sql\`SELECT date, time, name, status FROM appointments WHERE email = 'test-backoffice@example.com'\`;
  console.log(rows);
})();
"
```
Expected: één rij, `status: 'confirmed'`.

Ruim daarna de testdata én de testroute op:

```bash
node -e "
require('dotenv').config({path:'.env.local'});
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
(async () => {
  await sql\`DELETE FROM appointments WHERE email = 'test-backoffice@example.com'\`;
  console.log('opgeruimd');
})();
"
rm -rf app/api/test-tmp
```

Stop de dev-server (`taskkill //F //IM node.exe`).

- [ ] **Step 4: Commit**

```bash
git add "app/(admin)/admin/(shell)/afspraken/nieuw/_actions.ts"
git commit -m "Add createAppointmentAdmin server action (confirmed status, no rate limit)"
```

---

### Task 5: Admin "nieuwe afspraak"-pagina

**Files:**
- Create: `app/(admin)/admin/(shell)/afspraken/nieuw/page.tsx`

**Interfaces:**
- Consumes: `BookingWidget` (`@/components/booking/booking-widget`), `createAppointmentAdmin` (Task 4), `requireSession` (`@/lib/auth`), `messages/nl.json`.

- [ ] **Step 1: Bestand aanmaken**

```tsx
import { NextIntlClientProvider } from "next-intl";
import { requireSession } from "@/lib/auth";
import BookingWidget from "@/components/booking/booking-widget";
import { createAppointmentAdmin } from "./_actions";
import nlMessages from "@/messages/nl.json";

export default async function NieuweAfspraakPage() {
  await requireSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Nieuwe afspraak</h1>
        <p className="text-sm text-gray-500 mt-1">
          Plan een afspraak namens een klant — deze wordt direct als bevestigd geregistreerd.
        </p>
      </div>

      <NextIntlClientProvider locale="nl" messages={{ booking: nlMessages.booking }}>
        <BookingWidget action={createAppointmentAdmin} />
      </NextIntlClientProvider>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: geen output, exit code 0.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: build slaagt; `/admin/afspraken/nieuw` verschijnt in de routelijst.

- [ ] **Step 4: Live check — pagina rendert met Nederlandse widget-teksten**

```bash
npm run dev &
sleep 12
curl -s -m 15 http://localhost:3000/admin/afspraken/nieuw -L | grep -o "Datum &amp; tijd\|Kies een tijd"
```
Expected: minstens één van de twee teksten komt voor (bewijst dat de `booking`-messages correct geladen worden). Let op: zonder ingelogde sessie redirect dit naar `/admin/login` — log eerst in via de browser of test met een geldige sessie-cookie als je een striktere check wil; voor deze stap volstaat het dat de pagina geen 500-crash geeft (`-w "%{http_code}"` toevoegen en een 2xx/3xx verwachten is voldoende als de grep niks oplevert door de login-redirect).

Stop de dev-server.

- [ ] **Step 5: Commit**

```bash
git add "app/(admin)/admin/(shell)/afspraken/nieuw/page.tsx"
git commit -m "Add /admin/afspraken/nieuw page reusing BookingWidget"
```

---

### Task 6: "Nieuwe afspraak"-knop op de afsprakenlijst

**Files:**
- Modify: `app/(admin)/admin/(shell)/afspraken/page.tsx`

- [ ] **Step 1: `AdminPageHeader`-aanroep uitbreiden**

Zoek:

```tsx
      <AdminPageHeader
        title="Afspraken"
        description="Bevestig of annuleer binnengekomen afspraakverzoeken."
      />
```

Vervang door:

```tsx
      <AdminPageHeader
        title="Afspraken"
        description="Bevestig of annuleer binnengekomen afspraakverzoeken."
        createHref="/admin/afspraken/nieuw"
        createLabel="Nieuwe afspraak"
      />
```

(`AdminPageHeader` ondersteunt `createHref`/`createLabel` al — geen wijziging aan dat component nodig.)

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: geen output, exit code 0.

- [ ] **Step 3: Commit**

```bash
git add "app/(admin)/admin/(shell)/afspraken/page.tsx"
git commit -m "Add 'Nieuwe afspraak' button to the afspraken list"
```

---

### Task 7: `contact_messages`-tabel in het schema

**Files:**
- Modify: `drizzle/schema.ts`

- [ ] **Step 1: Enum + tabel toevoegen**

Voeg toe na het `appointments`-blok (vóór de `// ── CMS ──` sectie-comment), zelfde stijl als de rest van het bestand:

```ts
export const contactMessageStatusEnum = pgEnum("contact_message_status", [
  "new",
  "read",
  "handled",
]);

export const contactMessages = pgTable("contact_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  organization: varchar("organization", { length: 160 }),
  message: text("message").notNull(),
  locale: varchar("locale", { length: 2 }).notNull().default("nl"),
  status: contactMessageStatusEnum("status").notNull().default("new"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type ContactMessage = typeof contactMessages.$inferSelect;
```

- [ ] **Step 2: Schema naar Neon pushen**

```bash
npx dotenv -e .env.local -- npx drizzle-kit push
```
Expected: prompt bevestigt het aanmaken van `contact_message_status`-enum + `contact_messages`-tabel; accepteer (`y`/enter, geen destructieve wijzigingen aan bestaande tabellen).

- [ ] **Step 3: Verifiëren in Neon**

```bash
node -e "
require('dotenv').config({path:'.env.local'});
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
(async () => {
  const cols = await sql\`SELECT column_name, data_type FROM information_schema.columns WHERE table_name='contact_messages' ORDER BY ordinal_position\`;
  console.log(cols);
})();
"
```
Expected: kolommen `id, name, email, phone, organization, message, locale, status, created_at`.

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: geen output, exit code 0.

- [ ] **Step 5: Commit**

```bash
git add drizzle/schema.ts
git commit -m "Add contact_messages table"
```

---

### Task 8: `sendContactMessage` slaat het bericht op

**Files:**
- Modify: `app/[locale]/contact/_actions.ts`

**Interfaces:**
- Produces: elke geslaagde contactformulier-inzending staat voortaan ook in `contact_messages` — gebruikt door Task 10 (admin-lijst).

- [ ] **Step 1: Imports toevoegen**

Bovenaan het bestand, voeg toe:

```ts
import { db } from "@/lib/db";
import { contactMessages } from "@/drizzle/schema";
```

- [ ] **Step 2: Insert toevoegen vóór de e-mails**

Zoek in de `try`-block:

```ts
  try {
    await sendMail({
      to: data.email,
      ...buildContactConfirmationMail({ locale: data.locale, name: fullName }),
    });
```

Vervang door (insert toegevoegd vóór de mails; als de insert faalt, faalt de hele actie ook — dat IS gewenst hier, want dit is de enige permanente opslag; de mails blijven zelf best-effort via `sendMail`'s eigen fail-open gedrag):

```ts
  try {
    await db.insert(contactMessages).values({
      name: fullName,
      email: data.email,
      phone: data.phone || null,
      organization: data.organization || null,
      message: data.message,
      locale: data.locale,
    });

    await sendMail({
      to: data.email,
      ...buildContactConfirmationMail({ locale: data.locale, name: fullName }),
    });
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: geen output, exit code 0.

- [ ] **Step 4: Functionele test via tijdelijke testroute**

Maak `app/api/test-tmp/route.ts` (geen underscore-prefix):

```ts
import { NextResponse } from "next/server";
import { sendContactMessage } from "@/app/[locale]/contact/_actions";

export async function GET() {
  const formData = new FormData();
  formData.set("firstName", "Test");
  formData.set("lastName", "Bericht");
  formData.set("email", "test-bericht@example.com");
  formData.set("phone", "");
  formData.set("organization", "");
  formData.set("message", "Dit is een testbericht.");
  formData.set("locale", "nl");
  const result = await sendContactMessage({ status: "idle" }, formData);
  return NextResponse.json(result);
}
```

```bash
npm run dev &
sleep 12
curl -s -m 15 http://localhost:3000/api/test-tmp
```
Expected: `{"status":"success"}`.

Controleer de database:

```bash
node -e "
require('dotenv').config({path:'.env.local'});
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
(async () => {
  const rows = await sql\`SELECT name, email, status FROM contact_messages WHERE email = 'test-bericht@example.com'\`;
  console.log(rows);
})();
"
```
Expected: één rij, `status: 'new'`.

Ruim op:

```bash
node -e "
require('dotenv').config({path:'.env.local'});
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
(async () => {
  await sql\`DELETE FROM contact_messages WHERE email = 'test-bericht@example.com'\`;
  console.log('opgeruimd');
})();
"
rm -rf app/api/test-tmp
```

Stop de dev-server.

- [ ] **Step 5: Commit**

```bash
git add "app/[locale]/contact/_actions.ts"
git commit -m "Store contact form submissions in contact_messages"
```

---

### Task 9: `StatusBadge` + nav-item voor Berichten

**Files:**
- Modify: `components/admin/status-badge.tsx`
- Modify: `components/admin/nav-config.ts`

- [ ] **Step 1: Statussen toevoegen aan `StatusBadge`**

In `components/admin/status-badge.tsx`, voeg toe aan `STYLES`:

```ts
  new: "bg-amber-50 text-amber-700 border-amber-200",
  read: "bg-sky-50 text-sky-700 border-sky-200",
  handled: "bg-emerald-50 text-emerald-700 border-emerald-200",
```

en aan `LABELS`:

```ts
  new: "Nieuw",
  read: "Gelezen",
  handled: "Afgehandeld",
```

(Direct na de bestaande `pending`/`confirmed`/`cancelled`-regels, zelfde structuur.)

- [ ] **Step 2: Nav-item toevoegen**

In `components/admin/nav-config.ts`, voeg `MessageSquare` toe aan de lucide-react import:

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
```

Voeg een item toe aan de `"Afspraken"`-sectie (na `Beschikbaarheid`):

```ts
  {
    title: "Afspraken",
    items: [
      { label: "Afspraken", href: "/admin/afspraken", icon: CalendarCheck },
      { label: "Beschikbaarheid", href: "/admin/beschikbaarheid", icon: CalendarCog },
      { label: "Berichten", href: "/admin/berichten", icon: MessageSquare },
    ],
  },
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: geen output, exit code 0.

- [ ] **Step 4: Commit**

```bash
git add components/admin/status-badge.tsx components/admin/nav-config.ts
git commit -m "Add new/read/handled status styling and Berichten nav item"
```

---

### Task 10: Admin "Berichten"-lijst + acties

**Files:**
- Create: `app/(admin)/admin/(shell)/berichten/page.tsx`
- Create: `app/(admin)/admin/(shell)/berichten/_actions.ts`
- Create: `app/(admin)/admin/(shell)/berichten/loading.tsx`

**Interfaces:**
- Consumes: `contactMessages`, `ContactMessage` (`@/drizzle/schema`), `requireSession`, `AdminPageHeader`, `StatusBadge`.

- [ ] **Step 1: `_actions.ts` aanmaken**

```ts
"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { contactMessages } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";

export async function markMessageRead(id: string) {
  await requireSession();
  await db.update(contactMessages).set({ status: "read" }).where(eq(contactMessages.id, id));
  revalidatePath("/admin/berichten");
}

export async function markMessageHandled(id: string) {
  await requireSession();
  await db.update(contactMessages).set({ status: "handled" }).where(eq(contactMessages.id, id));
  revalidatePath("/admin/berichten");
}
```

- [ ] **Step 2: `loading.tsx` aanmaken**

Exact hetzelfde skeleton-patroon als `app/(admin)/admin/(shell)/afspraken/loading.tsx` (al geverifieerd, dit is de letterlijke inhoud van dat bestand — 4 filterpill-placeholders, 6 rij-placeholders):

```tsx
export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-7 w-40 rounded bg-gray-100 animate-pulse mb-2" />
        <div className="h-4 w-72 max-w-full rounded bg-gray-100 animate-pulse" />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-24 rounded-full bg-gray-100 animate-pulse" />
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-100 rounded h-12" />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: `page.tsx` aanmaken**

```tsx
import { desc, eq } from "drizzle-orm";
import { Check, Mail } from "lucide-react";
import { db } from "@/lib/db";
import { contactMessages } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";
import AdminPageHeader from "@/components/admin/admin-page-header";
import StatusBadge from "@/components/admin/status-badge";
import { markMessageRead, markMessageHandled } from "./_actions";

export const dynamic = "force-dynamic";

const FILTERS = [
  { key: "all", label: "Alle" },
  { key: "new", label: "Nieuw" },
  { key: "read", label: "Gelezen" },
  { key: "handled", label: "Afgehandeld" },
] as const;

export default async function BerichtenPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireSession();
  const { status } = await searchParams;
  const filter = FILTERS.some((f) => f.key === status) ? status! : "all";

  const rows = await db
    .select()
    .from(contactMessages)
    .where(filter === "all" ? undefined : eq(contactMessages.status, filter as "new" | "read" | "handled"))
    .orderBy(desc(contactMessages.createdAt));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Berichten"
        description="Contactformulier-inzendingen vanaf de website."
      />

      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <a
            key={f.key}
            href={f.key === "all" ? "/admin/berichten" : `/admin/berichten?status=${f.key}`}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
              filter === f.key
                ? "border-navy bg-navy text-white font-medium"
                : "border-gray-200 bg-white text-gray-600 hover:border-navy/30"
            }`}
          >
            {f.label}
          </a>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        {rows.length === 0 ? (
          <p className="px-5 py-10 text-sm text-gray-400 text-center">Geen berichten gevonden.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                <th className="px-5 py-3">Datum</th>
                <th className="px-5 py-3">Naam</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Bericht</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((msg) => (
                <tr key={msg.id} className="align-top">
                  <td className="px-5 py-3.5 whitespace-nowrap text-gray-500">
                    {msg.createdAt.toLocaleDateString("nl-NL")}
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-navy">{msg.name}</p>
                    {msg.organization && <p className="text-xs text-gray-400">{msg.organization}</p>}
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-gray-600">{msg.email}</p>
                    {msg.phone && <p className="text-gray-400 text-xs">{msg.phone}</p>}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 max-w-xs">
                    <p className="truncate" title={msg.message}>
                      {msg.message}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={msg.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      {msg.status !== "read" && msg.status !== "handled" && (
                        <form action={markMessageRead.bind(null, msg.id)}>
                          <button
                            type="submit"
                            title="Markeer gelezen"
                            className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-100 transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5" /> Gelezen
                          </button>
                        </form>
                      )}
                      {msg.status !== "handled" && (
                        <form action={markMessageHandled.bind(null, msg.id)}>
                          <button
                            type="submit"
                            title="Markeer afgehandeld"
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" /> Afgehandeld
                          </button>
                        </form>
                      )}
                    </div>
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

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: geen output, exit code 0.

- [ ] **Step 5: Build**

Run: `npm run build`
Expected: build slaagt; `/admin/berichten` verschijnt in de routelijst.

- [ ] **Step 6: Commit**

```bash
git add "app/(admin)/admin/(shell)/berichten/"
git commit -m "Add /admin/berichten list page with read/handled actions"
```

---

### Task 11: Volledige verificatie + afronden

**Files:** geen nieuwe — dit is de eindcontrole.

- [ ] **Step 1: Volledige lint + typecheck + build**

```bash
npm run lint
npx tsc --noEmit
rm -rf .next
npm run build
```
Expected: alle drie slagen zonder errors/warnings (behalve reeds bekende, niet aan dit werk gerelateerde warnings).

- [ ] **Step 2: End-to-end check — handmatige afspraak via de browser**

Log in op `/admin/login`, ga naar Afspraken → "Nieuwe afspraak", doorloop de widget (datum → tijd → onderwerp → gegevens), controleer dat de afspraak na opslaan meteen als "Bevestigd" in de lijst staat.

- [ ] **Step 3: End-to-end check — contactformulier + Berichten**

Vul `/contact` in op de site, controleer dat het bericht verschijnt onder `/admin/berichten` met status "Nieuw", en dat "Gelezen"/"Afgehandeld" de status correct bijwerken.

- [ ] **Step 4: Opruimen van testdata**

Verwijder eventuele test-afspraken/testberichten die tijdens Stap 2/3 zijn aangemaakt, via de admin-UI of een kort node-scriptje zoals in Task 4/8.

- [ ] **Step 5: Committen, pushen, PR, mergen naar master**

Volg de conventie die in dit project tot nu toe is gebruikt (elke afgeronde feature: push branch → `gh pr create` → `gh pr merge --merge`) — check `git log --oneline -15` voor het exacte patroon van commit-berichten en PR-titels voordat je dit uitvoert.
