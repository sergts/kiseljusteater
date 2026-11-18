# Kiseljus Teater: overall changes

This document describes how the site, admin and server work now and what changed between the first commit
(11 Nov 2026) and 18 Nov 2026. It does not contain any passwords or tokens.

## 1. At a glance

| Area | Before | Now |
|---|---|---|
| Languages | Estonian, Russian | Estonian, Russian, **English** (`/et/`, `/ru/`, `/en/`) |
| Front page `/` | Astro's "Redirecting to /et/" screen | The Estonian page itself, no redirect |
| Performances | Loaded from a file the server writes | Same file, now fed by the **Sviby API**, with sold-out badge and English titles/links |
| Afisha | Month tabs | All months in one list, filters, month bar |
| Logo | Text | The real logo as SVG, animated reveal in the hero |
| Admin | English | **Russian**; English content fields; new "Инфо для зрителей" editor |
| Red | Several reds | One red everywhere: `#da0c16` (the logo's red) |

## 2. How content gets from the admin to the website

```
Admin (kiseljusteater.ee/admin)        GitHub                               Server
  edit actors / plays / info   ─►  draft:  private/content.json
  press "Опубликовать"         ─►  private/published.json  + starts workflow "Build site"
                                    workflow downloads  admin/export.php?token=…   (published content)
                                    builds the static site → artifact "site"
  press "Выложить" (Deploy)    ◄─  admin downloads the artifact and swaps it into public_html
```

- **Publishing never commits content to git.** An earlier local experiment (admin commits `content.json`, cron auto-deploy)
  was reverted; the live server never ran it. The workflow secrets `SITE_URL` and `EXPORT_TOKEN` must stay set.
- **Deploy replaces the site files** but never touches dotfiles (`.htaccess`) or the folders `admin`, `media`, `data`, `cgi-bin`.
- **Performances are not part of the build.** The browser loads `/data/events.json`, which the server rewrites every few minutes (section 5).
  Until a play is published, its dates cannot be linked to it.

### Content in `content.json` / `published.json`

```
actors[]   slug, name_et/ru/en, role_title_et/ru/en, bio_et/ru/en, photo
plays[]    slug, title_*, genre_*, synopsis_*, duration, age_limit, archived, piletikeskus_ids[] (Sviby series names), poster, cast[] (actor, role_et/ru/en)
info[]     title_*, short_*, body_*, visible, play_page, icon            ← new
contacts   address_et/ru/en, phone, email, instagram, facebook, tickets_url   ← new
```

English fields are optional everywhere; the site shows the Estonian text where English is empty.
If a published file has no `info`/`contacts` yet, the site uses `src/content/site-defaults.json` (the same seed text the admin was given).

## 3. Public site (this repo)

### Languages and routing
- Added the `en` locale: all pages under `/en/`, English interface text (`src/utils/i18n.ts`), a `tr(lang, et, ru, en)` helper,
  `field()` falls back from English to Estonian.
- Language switcher ET / RU / EN keeps the visitor on the same page. `canonical` and `hreflang` links added (`site` is set in `astro.config.mjs`).
- `/` renders the Estonian home page directly (`src/pages/index.astro` → shared `HomePage.astro`); its canonical address is `/et/`.
- Every internal link ends with a slash and `trailingSlash: 'always'` is set. Before, links like `/et/afisha` made the server redirect to
  `/et/afisha/` on every click (including the header logo).

### Events and afisha
- Sold-out performances stay listed with a dark "Välja müüdud / Продано / Sold out" badge (rows and date chips); sold-out rows are dimmed.
- English titles, venues and ticket links (`ticketUrlEn`) come from the Sviby feed; `eventText()` falls back to Estonian.
- The afisha shows **all months in one list** with a heading per month, **filters** by production and "only with tickets"
  (kept in the address: `?play=…&available=1`) and a **month bar** under the header that jumps to a month.
- Event data is refetched after 5 minutes when the visitor navigates without reloading.

### Visual identity
- Logos: black / white, each with or without the red arrow, as SVG in `public/images/logo/`. Header uses black + red arrow;
  footer and banner use white + red arrow. Favicon, Apple icon and 192 px icon come from the square K logo.
- One red: `#da0c16` (tailwind `red-500/600`, selection colour, theme variable, stand-in graphics). Small red text on black uses a lighter tint (`red-400`) to reach 4.5:1 contrast.
- Removed the generated placeholder image from the home page and About page, the `//` decoration from headings, the footer copyright line,
  the red "TALLINN · LOOTSI 8" tag and the admin link in the footer (the admin is reached at `/admin/` directly).
- Actor page portrait is in colour.
- **Default pictures** (`default-actor.svg`, `default-play.svg`) are shown for any actor or play without a picture. The 54 old stand-in files
  (SVG data saved as `.jpg`, which browsers could not display) were deleted; content that still points at them gets the default picture.

### Motion and responsiveness
- **Logo reveal** (`LogoReveal.astro`): letters rise, TEATER wipes in, the red arrow flies in along its diagonal (~1.8 s).
  Plays once per browser-tab session; honours "reduce motion"; arrow leans on hover (mouse only).
- **Next available performance** card in the hero (`NextPerformance.tsx`), skipping sold-out dates.
- **Phone buy bar** (`MobileBuyBar.astro`) appears after scrolling, not on the afisha. Header shrinks when scrolled and hides on scroll-down (phones).
- **Page transitions** (Astro `ClientRouter`) with hover prefetching; the poster morphs into the play page hero. Scripts re-initialise on `astro:page-load`.
- Scroll reveals (`.reveal`, CSS scroll-driven, ignored where unsupported), hover details on rows/buttons.

### Accessibility and performance
- Contrast fixes (axe: no violations on the home and play pages), labels at least 12 px, tap targets about 40–44 px on phones,
  visible keyboard focus ring, skip-to-content link, empty cast section hidden, play titles no longer collide and sit on a dark fade.
- Fonts are **self-hosted** (`@fontsource-variable`: Space Grotesk, JetBrains Mono, Inter as the Cyrillic fallback) instead of Google Fonts.

### Visitor information
- Info blocks (afisha page, under the schedule) and contacts (footer, About) come from the admin.
- The **About page is switched off for now** (`SHOW_ABOUT = false` in `src/utils/site.ts`): no pages, no menu or footer entry, no button on the home page.
  Set it to `true` to bring everything back. Old `/about/` addresses give a 404 until then. The admin's contacts hint still mentions the About page.
- Footer and About link to the theatre's Instagram and Facebook; the footer's Piletikeskus link goes to the theatre's own page
  (`https://piletikeskus.ee/et/c/kiseljusteater`). The three links are contact fields in the admin; a blank value hides the link, a missing one uses the
  default from `src/content/site-defaults.json`. There are no embedded feeds (they would load Meta's scripts and cookies).
- **"Before you buy" panel** (`BeforeYouBuy.astro`) above the dates on every play page: one line each with an icon (late entry, accessibility, refunds),
  linking to the full blocks (`/afisha/#info`). Which blocks appear, their one-line text and icon are set in the admin.

## 4. Admin (server, Russian)

The admin lives in `server/public_html/admin/` and `server/private/` (**not in git**, see section 7).

- Fully translated to Russian, including errors and relative times ("5 мин назад"); build statuses have Russian labels.
- Actors and plays have **ET / RU / EN** columns (English optional). Sections on the Content page: Plays first, then Actors.
- Play field **"Серия в Sviby (Piletikeskus)"**: the exact Sviby series name, one per line. The old field only accepted letters and digits.
- New page **"Инфо для зрителей"**: info blocks (title, one-line text, full text in 3 languages; show/hide; show on play pages; icon; reorder) and contacts.
  Saves are checked for edit conflicts, validated and written to history like any other save.
- "Unpublished changes" now also detects changes to info blocks and contacts; History restore handles them.
- The Publish / Deploy flow and `export.php` are unchanged in behaviour.

## 5. Performances from Sviby (afisha sync)

- `server/private/sync-afisha.php` (cron entry) and `sync-afisha-run.php` (the sync) read
  `https://api.piletikeskus.ee/{et|en}/organizer/events?_pk_token=…` and write `public_html/data/events.json`.
  The token is `sviby_token` in the server's `config.php` and never reaches the browser.
- The feed has **no play-level ID**: every performance has its own hash, and the only shared key is `seriesName`.
  Plays are therefore linked by series name (`piletikeskus_ids`), then by hash, then by title.
  Only **published** plays are matched, so publish new plays before their dates can link.
- Sviby descriptions exist **only in Estonian** (the `ru`/`en` pages return the same text); the API accepts only `et` and `en`.
- **Cron**: the host's default `php` is 7.4. The entry file `sync-afisha.php` is a small launcher that works on any PHP, checks the version,
  finds a newer PHP on the server (currently `/usr/local/php85/bin/php`) and re-runs itself with it.
  It writes `private/sync-afisha.log` itself (the last run, errors included), because the cron setup discards command output.
  Command: `php /home/caftebee/domains/kiseljusteater.ee/private/sync-afisha.php`. It is currently running **every minute**; every 10 minutes is enough.

## 6. Server and operations

- **Caching** (`public_html/.htaccess`, added below the existing password lines): pages and unhashed files use `no-cache` (revalidate, cheap 304),
  `/_astro/` and `/media/` use a one-year `immutable` cache. Browsers that saved a page before this keep it until it expires or is hard-refreshed.
- **Whole site is behind HTTP basic auth** (the `AuthType Basic` lines in `.htaccess`). Remove it when the site goes public.
- **GitHub pushes** from this machine use the token from `.env`, passed for one command only (`http.extraHeader`); it is not stored in git config.
- **FTP** access uses `.env.local` (`FTP_HOST`, `FTP_USER`, `FTP_PASSWORD`, `SVIBY_TOKEN`; gitignored). The host's FTP certificate is valid but
  its server omits the intermediate certificate, so tools could not verify it; connections were made with TLS required and the server's public key pinned.
- Leftover junk in `public_html`, safe to delete: `dist/`, `dist.zip`, `index.html_` (a stale hosting page), `__MACOSX/`, `.DS_Store`.

## 7. Live content changes made by hand

- Plays **Doktor Živago. Episood II** and **III** added (Sviby posters, titles, Estonian description from Sviby, Russian translation, durations 210 and 165 min).
- All four existing plays linked to their Sviby series names; the three Živago episodes are separate plays (the existing "Doktor Živago" is Episode I).
- Info blocks and contacts seeded; the "Before you buy" switches are on for doors/entry, accessibility and refunds.

## 8. Open items and follow-ups

**Security**
- Several secrets were printed in terminal output during this work (the GitHub token and export token in the server `config.php`, the admin password hash, and the Sviby token).
  Rotate the GitHub token and the export token (and update the `EXPORT_TOKEN` secret), and consider a new admin password and Sviby token.
- `server/` is gitignored: the admin, sync and deploy code have no version history. Consider a private repo for it, and take a copy before changing live files.

**Content to review**
- Russian text of the two new Živago synopses and titles was machine-translated by me; please read it. Age limit and cast of Episode II/III are empty.
- The refund / flowers / accessibility / buffet texts were written from short Russian notes. The flowers wording is an interpretation; the buffet block is hidden and empty.
- "Doktor Živago" (Episode I) is not renamed. 10 actors and 3 plays still show the default picture until real photos are uploaded.
- English text is mostly empty (falls back to Estonian).

**Technical**
- Tested in Chromium (Playwright) only; not in Safari or Firefox. No automated tests are in the repo.
- Set the cron job back to every 10 minutes. Remove basic auth at launch.

## 9. Commits (main)

| Commit | Content |
|---|---|
| `83675ff` | English site, `/` without redirect, sold-out badge |
| `94287bc` | Logos, full afisha list, editable info blocks and contacts, copyright removed |
| `d54f703` | SVG logos in the brand red, no placeholder on the front page |
| `afbc5d6` | Fix SVG logos: E, T, E and the base of the A had no fill |
| `bc595d4` | Design pass: default pictures, accessibility, logo reveal, hero card, buy bar, afisha filters, transitions, fonts |
| `22d77a7` | "Before you buy" panel on play pages, edited in the admin |
| `12ed57e` | Trailing slashes on all links; hero location tag removed |
| `018738a` | Changelog; admin link removed from the footer |
| `0312feb` | Footer ticket link, Instagram and Facebook links, editable in the admin |
| next | Home "next performances" only with tickets, clickable play pictures, own venue hidden in the afisha, About page switched off, "Lootsi" is a street |
