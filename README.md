# 1-1 Session Guide

A browser app that a clinician and patient use together on a shared screen to guide 1-1 time on an acute inpatient ward (Ash Villa pilot).

## Privacy

- No login, no accounts.
- Nothing is saved: no cookies, no local storage, no server. Typed text lives only in the open browser tab.
- Pressing "End and clear session", closing the tab, or 15 minutes without use clears everything.
- The page's Content Security Policy blocks it from sending data anywhere (`connect-src 'none'`).
- The summary has no name or identifying details. Clinicians document in Rio as usual.

## Editing the wording

All text shown on screen is in `js/content.js`. Each pathway is a block with a tile label, a title, and steps (or topics containing steps). Change the words there; `js/app.js` does not need to change.

## Running it

Open `index.html` through any static web host (for example GitHub Pages). For local testing: `python3 -m http.server` in this folder, then visit http://localhost:8000.

## Sources

- Care Formulation Paper v2.1 (March 2025): 72-hour assessment topics
- Ash Villa Stabilisation Guide and CNWL Stabilisation Manual v3 (linked, not copied)
- ReQoL-10: completed in Rio under the Trust licence; the app only supports discussion of the results
- Goal based outcomes: Dr Duncan Law, CC BY-NC-SA 4.0
- Staying Safe safety plan headings: © 4 Mental Health 2024, stayingsafe.net
- Royal College of Psychiatrists, Mind and How Are You Lincolnshire (linked)
