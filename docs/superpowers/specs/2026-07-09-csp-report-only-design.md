# Content-Security-Policy (Report-Only) — Design

## Context

Vervolg op de technische audit van 2026-07-08 (Suritargets N.V.), sectie 5 "Security": ontbrekende `Content-Security-Policy`-header werd aangemerkt als hoogste prioriteit voor dit type onderneming — vertrouwen en professionaliteit hebben direct impact op conversie bij een accountantskantoor. `X-Frame-Options`, `Permissions-Policy`, `X-Content-Type-Options` en `Referrer-Policy` zijn al toegevoegd (aparte, eerder gemergede wijziging).

**Belangrijke beperking:** er is geen browser-automatiseringstool beschikbaar in deze omgeving om CSP-gedrag visueel te verifiëren vóór livegang. Een verkeerd geconfigureerde CSP kan de site volledig laten crashen (blanco pagina door gebrokene React-hydratie). Daarom: eerst uitrollen als `Content-Security-Policy-Report-Only` (blokkeert niets, logt alleen), pas na een observatieperiode zonder onverwachte meldingen omzetten naar de afdwingende `Content-Security-Policy`-header — bevestigd met de gebruiker.

## Architectuur

**Nonce-generatie en header-plaatsing — in `proxy.ts` (middleware), niet in `next.config.ts`.** `next.config.ts`'s `headers()`-functie ondersteunt alleen statische, build-time header-waarden — de nonce moet per request willekeurig zijn, dus de header kan alleen in middleware gezet worden (dit is ook Next.js' eigen officiële patroon).

`proxy.ts` bevat vandaag alleen `export default createMiddleware(routing);` met een matcher die `/admin` en `/api` bewust uitsluit (next-intl-routing is daar niet nodig). CSP moet echter ook op `/admin/*` gelden — dus wordt `proxy.ts` een eigen middleware-functie die:
1. Altijd eerst een nonce genereert (`crypto.randomUUID()`, base64) en in een `x-nonce`-request-header zet.
2. Voor niet-`/admin`-paden: de bestaande next-intl `createMiddleware(routing)` aanroept zoals nu, en op de resulterende `NextResponse` de nonce-request-header + CSP-response-header toevoegt.
3. Voor `/admin`-paden: geen next-intl-routing (zoals nu), maar wél de nonce- en CSP-headers toevoegen op een kale `NextResponse.next()`.
4. De `matcher` wordt verbreed naar `/((?!api|_next|_vercel|.*\\..*).*)` — `/admin` blijft dus wél door de middleware lopen (voor de CSP-header), alleen de next-intl-routinglogica zelf blijft `/admin`/`/api` overslaan zoals nu.

Next.js' eigen App Router hydratie-/RSC-payload-scripts pikken automatisch de nonce op zodra de CSP-header zelf een `'nonce-...'`-waarde bevat in `script-src` (via de `x-nonce`-request-header, die Next.js intern leest) — er hoeft geen enkele `<script>`-tag in de codebase handmatig van een nonce voorzien te worden.

**Policy (Report-Only, ongewijzigd van het eerder gepresenteerde ontwerp):**

```
default-src 'self';
script-src 'self' 'nonce-<random>' 'strict-dynamic';
style-src 'self' 'unsafe-inline';
img-src 'self' https://images.unsplash.com https://*.public.blob.vercel-storage.com data:;
font-src 'self';
connect-src 'self';
frame-src https://www.google.com https://maps.google.com;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
report-uri /api/csp-report;
```

- `style-src 'unsafe-inline'` is een bewuste, geaccepteerde afweging: 7 bestanden gebruiken React inline `style={{}}` (trend-grafiek-balken op `/admin/statistieken`, hero-achtergronden, editor-previews). CSS-injectie is een fundamenteel zwakker aanvalsvector dan script-injectie — vandaar dat `script-src` wél de strikte nonce-behandeling krijgt (waar het echte risico zit) en `style-src` de bekende, in Next.js' eigen documentatie aanbevolen uitzondering.
- `img-src` dekt de twee geconfigureerde remote image hosts (Unsplash, Vercel Blob) plus `self` en `data:`.
- `frame-src` staat uitsluitend de Google Maps-embed-domeinen toe (contactpagina) — verder kan niets geframed worden.
- Beide `<script type="application/ld+json">`-blokken (structured data) zijn standaard vrijgesteld van `script-src` — dat is geen executable script volgens de browser-CSP-implementatie, dus geen speciale behandeling nodig.
- `connect-src 'self'` dekt de bestaande same-origin beacons (`/api/track`, `/api/log-error`) en Vercel Analytics (zelf-gehost via `/_vercel/insights/*`, same-origin).

**Report-collectie:** nieuwe route `app/api/csp-report/route.ts` ontvangt de browser-native CSP-violation-reports (via de `report-uri`-directive, `application/csp-report`-content-type), parsed het rapport, en roept de bestaande `logError("csp-violation", ..., { source: "client", path })` aan (uit `lib/error-log/log.ts`, al fail-open) — verschijnt gewoon tussen de andere meldingen op de al bestaande `/admin/fouten`-pagina. Geen nieuwe tabel, geen nieuwe admin-pagina: dit is een tijdelijke observatiefase, geen permanente feature.

## Rollout

1. Deze wijziging (Report-Only) mergen naar `master`, live op productie.
2. Enkele dagen echte bezoekersverkeer laten lopen.
3. `/admin/fouten` controleren op rijen met `context = "csp-violation"`.
4. Geen (onverwachte) meldingen → losstaande, kleine vervolgwijziging: header-naam wijzigen van `Content-Security-Policy-Report-Only` naar `Content-Security-Policy` (geen andere codewijziging nodig).
5. Wél meldingen → policy bijstellen (bv. een ontbrekende host toevoegen aan `img-src`/`connect-src`), opnieuw Report-Only testen.

Stap 4/5 zijn een bewust losstaand vervolgmoment, geen onderdeel van deze plan/implementatie — vereist eerst echte observatiedata die nu nog niet bestaat.

## Testen

- Lokaal: dev-server starten, curl-check dat de `Content-Security-Policy-Report-Only`-header aanwezig is op `/` en `/admin`, met een nonce-waarde die per request verschilt.
- Functioneel: een synthetische CSP-violation-report rechtstreeks naar `/api/csp-report` posten (zelfde `node -e`-patroon als eerdere taken), verifiëren dat een rij met `context: 'csp-violation'` in `error_events` verschijnt, testrij opruimen.
- **Geëxpliciteerde beperking:** een kale curl-request kan geen echte browser-hydratie, JSON-LD-rendering, Maps-iframe of Vercel Analytics-laadgedrag verifiëren — dat vereist een echte browser. Omdat dit Report-Only is, blokkeert een eventuele fout in de policy niets; onverwacht gedrag zou zichtbaar worden via een violation-report in `/admin/fouten`, niet via een kapotte pagina.
- `npm run lint`, `npx tsc --noEmit`, `npm run build` moeten groen blijven.

### Kritieke bestanden

- `proxy.ts` — herschreven naar een eigen middleware-functie: nonce-generatie, verbrede matcher (incl. `/admin`), next-intl-routing alleen voor niet-`/admin`-paden, en de `Content-Security-Policy-Report-Only`-responseheader (met nonce) op alle gematchte paden
- `app/api/csp-report/route.ts` — nieuw
- `lib/error-log/log.ts` — hergebruikt, geen wijziging nodig
