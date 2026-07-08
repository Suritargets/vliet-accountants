# Foutregistratie in het admin-dashboard — Design

## Context

Op 2026-07-08 crashte de boekingspagina (`/afspraak`) voor elke bezoeker in productie door een bug in een server-actionbestand (`ReferenceError: BookingActionState is not defined`, veroorzaakt door een `export type {...}` in een `"use server"`-bestand). Dit bleef onopgemerkt tot de klant het zelf meldde — er was geen enkele plek waar zo'n fout zichtbaar werd zonder handmatig Vercel's runtime-logs te doorzoeken.

Deze fix is al losstaand gepusht (PR #13, direct naar `master`). Dit design betreft een structurele oplossing: fouten — zowel client-side crashes als server-side fouten die nu al stil met `console.error` worden weggeschreven — voortaan ook vastleggen in een eigen `/admin`-pagina, consistent met de eerder gebouwde eigen rapportages (`/admin/logins`, `/admin/statistieken`) in plaats van te leunen op Vercel's eigen dashboard.

**Scope, bevestigd met de gebruiker:**
- Zowel client-side crashes (React error-boundaries) als server-side fouten worden gelogd.
- Alle bestaande `console.error`-plekken worden meegenomen, inclusief de bewust fail-open plekken (mail versturen, tracking-beacon, login-logging) — geen filtering op "kritiek vs. verwacht". Elke fout is één rij; geen groepering/deduplicatie (consistent met `admin_login_events`/`page_views`, en het huidige foutvolume is laag).

## Architectuur

Eén gedeelde, fail-open `logError()`-helper (zelfde idioom als `lib/mail/send.ts` en `lib/rate-limit.ts`: try/catch rondom alles, nooit gooien, altijd ook de bestaande `console.error` behouden zodat Vercel's eigen logs niets verliezen) schrijft een rij naar een nieuwe `error_events`-tabel.

- **Server-side:** elke bestaande `console.error(...)`-aanroep in een runtime-pad (server actions, API-routes, mail-provider) krijgt er een `logError(...)`-aanroep naast — de bestaande try/catch-structuur en foutboodschap-teksten blijven ongewijzigd.
- **Client-side:** de twee React error-boundaries (`app/[locale]/error.tsx`, `app/(admin)/admin/(shell)/error.tsx`) krijgen naast hun bestaande `console.error(error)` een fire-and-forget `fetch("/api/log-error", { keepalive: true }).catch(() => {})` — exact hetzelfde patroon als de net gebouwde `components/analytics-beacon.tsx`. Een nieuwe `/api/log-error`-route ontvangt dit en roept zelf `logError()` aan.
- **Buiten scope:** de twee `console.error`-aanroepen in `scripts/seed.ts` en `scripts/seed-en-translations.ts` — dit zijn losstaande CLI-scripts die buiten de Next.js-requestcontext draaien (handmatig gestart door een developer, nooit in productie actief), geen onderdeel van het live foutoppervlak.

## Datamodel

Nieuwe tabel `error_events` in `drizzle/schema.ts`, zelfde stijl als `admin_login_events`/`page_views`:

| Kolom | Type | Opmerking |
|---|---|---|
| `id` | uuid, PK, `defaultRandom()` | |
| `source` | `pgEnum("error_source", ["client", "server"])`, notNull | |
| `message` | text, notNull | Foutboodschap, afgekapt op een redelijke lengte (zie plan) |
| `stack` | text, nullable | Stack trace indien beschikbaar |
| `digest` | varchar(64), nullable | Next.js' `error.digest` — koppelt een dashboardrij aan de bijbehorende regel in Vercel's eigen serverlogs |
| `path` | varchar(255), nullable | Route waar de fout optrad |
| `context` | varchar(100), nullable | Korte herkomst-tag, bv. `"createAppointment"`, `"sendMail"`, `"client-error-boundary"` — hergebruikt de bestaande foutboodschap-prefixes (`"createAppointment failed:"` → context `"createAppointment"`) |
| `createdAt` | timestamp, notNull, `defaultNow()` | |

Zelfde migratie-aanpak als eerder dit traject: `drizzle-kit push` verwacht geblokkeerd te worden door de bekende `pages`-tabel-quirk (`UNIQUE NULLS NOT DISTINCT`) — nieuwe tabel wordt via handmatige SQL toegevoegd, kolom-voor-kolom geverifieerd tegen een bestaande vergelijkbare tabel, `pages` blijft ongemoeid.

## `lib/error-log/log.ts`

Eén publieke functie: `logError(context: string, error: unknown, extra?: { path?: string; digest?: string; source?: "client" | "server" })`. Fail-open (eigen try/catch, nooit gooien), extraheert `message`/`stack` uit `error` (met een `String(error)`-fallback voor non-Error-throws), kapt `message` en `stack` af op een vaste lengte voor opslag, `source` default `"server"`. Behoudt de bestaande `console.error(...)`-aanroep op de call-site — `logError()` komt ernaast, vervangt 'm niet.

## `/api/log-error`-route

Zelfde vorm als `app/api/track/route.ts`: rate-limited (`rateLimit('log-error:${ip}')`), fail-open, leest `{ message, stack, digest, path }` uit de request-body, roept `logError("client-error-boundary", ..., { source: "client", path, digest })` aan, retourneert altijd `{ ok: true }`.

## Admin-pagina `/admin/fouten`

Alleen-lezen lijst, zelfde stijl als `/admin/logins` (`AdminPageHeader`, tabel, `requireSession()` eerst): tijdstip, bron-badge (client/server), context, boodschap (met stack als uitklapbare detail of `<pre>`-blok), pad. Meest recente 200, geen verwijder/afhandelen-actie in v1. Toegevoegd als derde item onder de bestaande "Inzicht"-sectie in de nav (naast Statistieken en Logins uit het lopende plan), icoon `AlertTriangle` (lucide-react).

## Testen

- Lokaal: bewust een test-fout forceren in een server action (of direct de API-route aanroepen) → rij verschijnt in `error_events` met correcte `context`/`source`/`message`.
- Client-boundary: een testpagina/tijdelijke route die bewust gooit tijdens render → `/admin/fouten` toont een rij met `source: "client"` en een `digest`.
- `npm run lint`, `npx tsc --noEmit`, `npm run build` moeten groen blijven.
- Testrijen opruimen na verificatie.

### Kritieke bestanden

- `drizzle/schema.ts` — nieuwe `error_events`-tabel + `errorSourceEnum`
- `lib/error-log/log.ts` — nieuw, `logError()`
- `app/api/log-error/route.ts` — nieuw
- `app/[locale]/error.tsx`, `app/(admin)/admin/(shell)/error.tsx` — beacon-fetch toevoegen
- 18 bestaande server-side call-sites (zie hierboven, exclusief de 2 seed-scripts) — `logError(...)` toevoegen naast bestaande `console.error`
- `app/(admin)/admin/(shell)/fouten/page.tsx` — nieuw
- `components/admin/nav-config.ts` — nav-item toevoegen aan "Inzicht"-sectie
