# Free short URL for Super 100 Mission 2027

**Current working site (DO NOT CHANGE):** https://x500334-arch.github.io/super100-mission-2027/

This directory is a **redirect-only short-link project**. No Supabase, PWA, student tests, PDF, OAuth callback, or Android APK origin is moved. Students visiting a short domain will receive a temporary 302 redirect to the original HTTPS GitHub Pages site, preserving the existing browser origin, Supabase session and installed PWA's scope. The original GitHub Pages URL remains available.

> **Not live yet:** Neither Cloudflare nor Netlify project/subdomain is registered merely by adding these files. The user must connect a hosting-provider account and choose a project name. Availability of `s100mission.pages.dev` or `s100mission.netlify.app` is **not confirmed**.

## Option A (recommended): Cloudflare Pages short URL

1. In [Cloudflare Workers & Pages](https://dash.cloudflare.com/), create a **Pages** project; choose **Connect to Git**, and authorize GitHub.
2. Choose repository `x500334-arch/super100-mission-2027`, production branch `main`.
3. Choose a project name (e.g. `s100mission`, **subject to availability**). Cloudflare normally provides `<project>.pages.dev`.
4. In build settings leave the build command empty (no framework). Set **Root directory** to `shortlink/cloudflare` and **Build output directory** to `.` (or use repository root and build output directory `shortlink/cloudflare`).
5. Deploy and verify that `https://<project>.pages.dev/` redirects to `https://x500334-arch.github.io/super100-mission-2027/`. Check `/register.html` and `/notes.html` too.
6. Share **only the short HTTPS URL** with students. Keep the GitHub Pages origin unchanged.

Cloudflare Pages reference: https://developers.cloudflare.com/pages/get-started/git-integration/
Redirect syntax: https://developers.cloudflare.com/pages/configuration/redirects/

## Option B: Netlify

1. Create a Netlify project, choose **Import from Git**, connect this existing GitHub repository.
2. Branch `main`; publish directory `shortlink/netlify`; no build command.
3. Choose a site name (e.g. `s100mission`, **subject to availability**) to obtain `<site>.netlify.app`.
4. Deploy and verify both the root URL and `/register.html` redirect to GitHub Pages. The `302!` rules override the fallback `index.html`.
5. Keep the original domain unchanged for logins, study sync and PWA installs.

Netlify documentation: https://docs.netlify.com/manage/routing/redirects/overview/

## Why redirect instead of moving the main app?

- Android `android-app/app/src/main/java/io/github/x500334arch/super100mission2027/MainActivity.java` pins the GitHub Pages HTTPS origin and opens other hosts externally.
- The installable PWA uses a path-scoped manifest and service worker: `/super100-mission-2027/`.
- Supabase auth is on the original origin; moving the actual site would need a separate migration plan (config/auth redirects, registered app links, PWA scope/installation behavior and APK updates).
- The short-link provider **does not receive the password, session tokens, saved student data or tests**, because its page redirects users to GitHub Pages; never add user-specific or authentication tokens to public short URLs.
- This redirect is not a URL masking service: the browser address bar changes to the GitHub Pages URL after the redirect. An existing installed PWA remains installed under the original origin.

## Switching to a permanent short-domain app later

After the chosen domain is deployed and tested, a **separate approved** upgrade can move actual hosting to the new origin, then safely update the PWA manifest/service worker, Supabase Auth allowlists and the Android app's hardcoded trusted origin. Do not switch the primary domain or remove GitHub Pages during redirect setup.

## Quick checks

- Short root URL -> `https://x500334-arch.github.io/super100-mission-2027/`.
- `/register.html` -> `https://x500334-arch.github.io/super100-mission-2027/register.html`.
- `/notes.html` -> `https://x500334-arch.github.io/super100-mission-2027/notes.html`.
- Login, student approvals, live tests and PDF access continue to run on GitHub Pages.
- Existing PWA and Android APK continue to open the original host.
