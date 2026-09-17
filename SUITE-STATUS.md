# GrowthPilot suite status

The active page is `app/suite-workspace.tsx`. It replaces the old sample dashboard at the root route; no sample metrics are used by the active page.

## Implemented

- Reference-inspired category rail and contextual navigation for SEO, AI visibility, traffic, local, content, advertising, PR, social, reports, and data sources.
- Up to 20 private website projects, real HTML audits, page inventory, findings, action statuses, and audit-history CSV reports.
- Server-persisted, editable and deletable research, keyword/rank observations, backlinks, prompt results, brand mentions, analytics observations, business listings, reviews, content drafts, campaign plans, media contacts, outreach drafts, social plans and report commentary.
- Validated CSV imports (100 rows per file), CSV templates and exports. Partial import failures explicitly report the number saved. Reimports are additive and can duplicate records.
- Crawl-informed brief templates and draft word/phrase checks, with content saving and Markdown downloads. These are deterministic tools, not model-generated content.
- Owner checks, origin checks, input validation and a 1,000-record limit per project. The local adapter initializes empty databases without inserting sample data.

## Not yet implemented

This is not a full replacement for the marketing platform shown in the references. Automatic SERP tracking, keyword/backlink databases, competitor traffic estimation, Google Analytics/Search Console synchronization, AI generation and automated visibility sampling, Business Profile sync, ad purchasing, social publishing, email delivery, automated alerts, team access, folders and report scheduling still require implementation and provider access.

The data-source page explicitly displays these gaps. Manual observations and imported data are labeled as user-supplied. Saving an ad, social post or email draft never publishes or sends it.

## Hosting

Railway migration remains incomplete. The existing production app still uses Cloudflare Worker bindings and Sites identity headers. Do not expose the local development sign-in or trust public identity headers on Railway. Production migration needs a Node-compatible storage adapter backed by persistent storage, real application authentication, an appropriate production start command and a verified Railway deployment.

## Validation

TypeScript and production compilation pass. Tests cover crawl behavior, URL restrictions, CSV parsing, field validation and migration preservation. Local API checks cover authentication, origins, project scoping, create/read/update/delete and validation. Browser verification covers navigation, draft save/reload, mobile navigation and a live ten-page audit of thcandpartners.com on 2026-09-16 (diagnostic score 67/100).
