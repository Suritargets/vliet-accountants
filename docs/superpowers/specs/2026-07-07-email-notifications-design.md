# E-mailnotificaties voor het boekingssysteem — Design

## Context

Het boekingssysteem (`/afspraak`) stuurt momenteel geen e-mail — dit was een bewuste keuze bij de eerste bouw ("géén e-mail, boekingen alleen in admin"). Mnr. Vliet wil dit alsnog, gekoppeld aan `info@vlietaccountants.com` (Microsoft 365 Business). Gebruiker heeft al gekozen voor **Nodemailer**.

## Scope

Drie triggers:
1. Bevestigingsmail naar de klant zodra een boeking wordt geplaatst.
2. Notificatiemail naar `info@vlietaccountants.com` bij elke nieuwe boeking.
3. Statuswijzigingsmail naar de klant zodra het kantoor een afspraak bevestigt of annuleert in `/admin/afspraken`.

## Architectuur

Nieuwe map `lib/mail/`:
- `client.ts` — nodemailer-transporter naar `smtp.office365.com:587` (STARTTLS), lazy geïnitialiseerd via een Proxy-patroon zoals `lib/db.ts`, zodat `next build` niet crasht als de SMTP-env-vars nog ontbreken.
- `templates.ts` — HTML-mailtemplates in de huisstijl van de site (navy `#1a2e5a`, gold `#c3b19d`, logo, systeem-sans-serif stack — custom webfonts zijn onbetrouwbaar in e-mailclients). Drie templates: bevestiging (klant), notificatie (kantoor), statuswijziging (klant). Eigen kleine NL/EN-tekst-dictionary (los van `messages/*.json`, want next-intl werkt niet buiten een React-render-context).
- `send.ts` — één `sendMail({to, subject, html, text})`-wrapper die alle fouten zelf opvangt en logt, nooit gooit (zelfde fail-open filosofie als `lib/rate-limit.ts`).

## Integratiepunten

- `app/[locale]/afspraak/_actions.ts` (`createAppointment`): na succesvolle insert, best-effort verzenden van bevestiging (taal = boekingslocale) + kantoornotificatie.
- `app/(admin)/admin/(shell)/afspraken/_actions.ts` (`confirmAppointment`/`cancelAppointment`): na statuswijziging, best-effort statusmail naar de klant (taal = `appointments.locale`).

## Env vars (nieuw)

`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM`. Zolang deze leeg zijn, doet `sendMail()` stilletjes niets — lokaal ontwikkelen blijft dus veilig zonder per ongeluk echte mails te versturen.

## Foutafhandeling

Mail-verzending is overal best-effort: een falende of trage SMTP-verbinding mag nooit een geldige boeking of admin-actie blokkeren. Fouten worden gelogd (zichtbaar in Vercel-logs), niet aan de gebruiker getoond.

## Externe afhankelijkheid (buiten deze codebase)

Microsoft 365 heeft Basic/SMTP AUTH sinds 2022 standaard uitgeschakeld voor nieuwe tenants. Vereist vóór dit werkt:
1. In het Exchange admin center → Recipients → Mailboxes → `info@vlietaccountants.com` → "Manage email apps" → **Authenticated SMTP** inschakelen.
2. Als er MFA op dat account staat: een **app-wachtwoord** aanmaken (alleen mogelijk bij per-user MFA; bij Conditional Access is OAuth2 verplicht — grotere opzet via Azure app-registratie, niet in scope van dit ontwerp).
3. Het (app-)wachtwoord aanleveren, dat rechtstreeks in `.env.local` en Vercel-env-vars gaat — niet in de chat.

## Niet in scope

- OAuth2/Graph API-koppeling (fallback als SMTP AUTH tenant-breed geblokkeerd blijft).
- Een apart `noreply@`-adres in plaats van de echte `info@`-inbox (optie die is voorgelegd, gebruiker is akkoord gegaan met direct via `info@` versturen).
