# Backoffice-afspraken + contactformulier-inbox — Design

## Context

Het admin-dashboard kan nu alleen afspraken *bevestigen/annuleren* die klanten zelf via `/afspraak` aanmaken — er is geen manier om als backoffice (bijv. na een telefoontje) zelf een afspraak in te plannen. Daarnaast worden contactformulier-berichten (`/contact`) alleen als (nu nog inactieve) e-mail verstuurd en nergens opgeslagen — er is geen enkel overzicht van binnengekomen vragen totdat M365 SMTP werkt, en zelfs dan alleen in een mailbox, niet in het dashboard.

Twee kleine, onafhankelijke uitbreidingen die allebei het bestaande `admin/afspraken`-patroon (lijst + statusfilter + rij-acties, `requireSession()`, `AdminPageHeader`, `StatusBadge`) hergebruiken.

## A — Handmatige afspraak vanuit admin

- **Route**: `/admin/afspraken/nieuw`, bereikbaar via een "Nieuwe afspraak"-knop op `/admin/afspraken`.
- **UI**: hergebruikt `components/booking/booking-widget.tsx` (kalender → tijdslot → onderwerp → gegevens), dezelfde beleefde/geteste flow als de publieke site.
- **`BookingWidget` krijgt een optionele `action`-prop** (server action), default = de bestaande publieke `createAppointment`. Admin geeft zijn eigen actie mee — geen duplicatie van de widget zelf.
- **`createAppointmentAdmin`** (nieuwe server action in `app/(admin)/admin/(shell)/afspraken/nieuw/_actions.ts`):
  - `requireSession()` in plaats van rate limiting (ingelogde staff, geen publieke abuse-vector).
  - Zelfde zod-schema en server-side beschikbaarheidscheck als `createAppointment` (geïmporteerd/hergebruikt, niet gedupliceerd) — voorkomt dubbele boekingen.
  - Insert met `status: "confirmed"` en `confirmedAt` meteen gezet (geen tussenstap "pending").
  - Verstuurt de bestaande **"uw afspraak is bevestigd"**-mail naar de klant (`buildStatusChangeMail(status:"confirmed")`, dezelfde die ook bij handmatig bevestigen van een bestaande afspraak wordt gebruikt) — best-effort, zoals overal.
  - Redirect naar `/admin/afspraken` na succes.
- **i18n binnen admin**: admin heeft geen `NextIntlClientProvider` (bewust NL-only). De `nieuw`-pagina wrapt `<BookingWidget>` lokaal in een `NextIntlClientProvider` met alleen de `booking`-namespace uit `messages/nl.json` (statisch geïmporteerd, geen fetch) — widget blijft ongewijzigd, admin blijft consistent Nederlands.

## B — Contactformulier-berichten in admin

- **Schema**: nieuwe tabel `contact_messages` — `id`, `name`, `email`, `phone`, `organization`, `message`, `locale`, `status` (enum: `new` | `read` | `handled`, default `new`), `createdAt`.
- **`sendContactMessage`** (bestaand, `app/[locale]/contact/_actions.ts`) krijgt er een insert bij ná de rate-limit/validatie-stap, náást de bestaande best-effort e-mails (die blijven ongewijzigd — mail en opslag zijn onafhankelijk van elkaar, één mag falen zonder de ander te raken).
- **Route**: `/admin/berichten` — zelfde opzet als `/admin/afspraken`: filterpills (Alle / Nieuw / Gelezen / Afgehandeld), tabel met naam/contact/bericht(preview)/status/acties.
- **Acties**: "Markeer gelezen" en "Markeer afgehandeld" (form-per-rij, zelfde patroon als bevestigen/annuleren) — geen aparte detailpagina, bericht wordt inline getoond (net als `notes` bij afspraken: preview + volledige tekst via `title`-attribuut).
- **Nav**: nieuw item "Berichten" in het admin-menu (`components/admin/nav-config.ts`).

## Niet in scope

- Geen reply-vanuit-admin (afhandelen = status wijzigen, niet direct antwoorden — dat blijft via e-mail/telefoon).
- Geen wijziging aan de publieke `/contact`-flow zelf (formulier, rate limit, e-mailtemplates blijven ongewijzigd).
- Geen aparte "backoffice"-rol — zelfde `requireSession()` als de rest van het admin.
