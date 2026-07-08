# Login-auditlog + privacy-vriendelijke bezoekersstatistieken — Design

## Context

Twee losse wensen: (1) zien wie wanneer inlogt op het admin-dashboard (geslaagd én mislukt, als beveiligingsmaatregel), en (2) een eigen bezoekersrapport in `/admin` (aantal, land, apparaat, trend over tijd) — expliciet **zonder** individuele IP-adressen op te slaan voor gewone websitebezoekers. Vercel Analytics staat al aan maar leeft alleen in Vercel's eigen dashboard; dit bouwt een los, eigen rapport binnen het admin-systeem zelf.

## A — Login-auditlog

**Schema**: nieuwe tabel `admin_login_events` — `id`, `email` (het geprobeerde e-mailadres, ongeacht of het bestaat), `success` (boolean), `ipAddress`, `createdAt`. IP-logging is hier bewust wél toegestaan (bevestigd door gebruiker) — dit is een beveiligingsmaatregel voor een geauthenticeerd systeem, fundamenteel anders dan het volgen van anonieme sitebezoekers.

**Logging**: de bestaande admin-login server-actie (`app/(admin)/admin/login/_actions.ts`) logt na elke poging — zowel bij `validateCredentials()` succes als falen — vóórdat de functie return/redirect doet.

**Rapportage**: nieuwe pagina `/admin/logins` — eenvoudige tabel (tijdstip, e-mail, gelukt/mislukt-badge, IP), meest recente eerst, gepagineerd of gelimiteerd tot bv. de laatste 200 rijen. Zelfde `requireSession()`-patroon als de rest van admin.

## B — Bezoekersstatistieken

**Schema**: nieuwe tabel `page_views` — `id`, `path`, `country` (2-letter code of "XX" onbekend), `deviceType` (`mobile` | `tablet` | `desktop`), `locale`, `visitorHash` (64-char sha256 hex), `createdAt`.

**Geen IP-opslag**: `visitorHash = sha256(YYYY-MM-DD + SESSION_SECRET + ip + userAgent)`. Het IP wordt alleen gebruikt om de hash te berekenen — nooit zelf bewaard. Omdat de datum in de hash zit, verandert de hash van dezelfde bezoeker elke dag automatisch (geen langetermijn-tracking mogelijk), en de hash is niet terug te rekenen naar het IP (one-way, gesalt met `SESSION_SECRET`).

**Verzamelmechanisme**: een klein client-component (`components/analytics-beacon.tsx`) wordt toegevoegd aan `app/[locale]/layout.tsx` (dus alleen publieke pagina's, niet admin). Bij elke paginalading vuurt het één `POST /api/track` af met alleen het huidige pad en de taal — geen extra clientdata, IP/UA worden server-side uit de requestheaders gelezen. `country` komt uit Vercel's edge-header `x-vercel-ip-country` (fallback "XX" — bv. lokaal in dev, waar die header ontbreekt). `deviceType` wordt server-side uit de `user-agent`-header geparsed (simpele regex-classificatie, geen nieuwe dependency).

**Rapportage**: nieuwe pagina `/admin/statistieken` — statcards (bezoeken/unieke bezoekers vandaag, 7 dagen, 30 dagen — "uniek" = `COUNT(DISTINCT visitorHash)`), een top-landenlijst, een apparaat-verdeling, en een dagelijkse trend van de laatste 30 dagen als eenvoudige CSS-staafjesgrafiek (geen nieuwe chart-library — dit project heeft er nog geen en de databehoefte is simpel genoeg voor handgemaakte staafjes).

## Niet in scope

- Geen conversie-trechter/funnel-analyse (bevestigd: "waterfall" = dagelijkse trend, geen funnel).
- Geen individuele bezoekers-IP-opslag of -weergave voor sitebezoekers.
- Geen wijziging aan de bestaande Vercel Analytics-integratie — blijft ernaast bestaan.
- Geen aanpassing aan de cookie-banner/privacyverklaring nodig (geen persoonsgegevens/IP's opgeslagen voor bezoekersstatistieken; de login-IP-logging betreft alleen geauthenticeerde/pogende admin-gebruikers, niet sitebezoekers).
