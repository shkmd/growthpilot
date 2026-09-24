# GrowthPilot

A private, single-account Phase 1 SEO workspace built with React, TypeScript, Vinext/Next.js conventions, Tailwind, shadcn/ui, Lucide, Recharts, Cheerio, and Cloudflare D1.

## Implemented

- Platform-managed sign-in with server-side ownership checks on every project, audit, and task operation.
- One live project per account, country/language configuration, and a clearly labeled read-only sample workspace.
- Bounded HTML crawling: at most 10 same-origin pages, robots policies, request deadlines, response-size limits, public-host validation, and redirect limits.
- Metadata, heading, canonical, indexation, image alternative, duplicate-title, content-length, viewport, JSON-LD-presence, Open Graph, HTTP-status, and sitemap-presence checks.
- Evidence-based deterministic recommendations, estimated effort, confidence labels, affected URLs, and a task workflow.
- Historical audits and scores, CSV exports, and a print layout for browser “Save as PDF”.
- PageSpeed adapter for mobile and desktop with explicit quota/timeout/unavailable states.
- Atomic per-account audit quotas (10 attempts/day, 2-minute cooldown) and durable task deduplication.
- Responsive dashboard and a validated WebMCP navigation tool.

## Deliberate limitations

This is an initial MVP, not a completed production SaaS launch. Generative AI is not configured: recommendations are rules, and the co-pilot is an audit explanation interface. A provider interface is included. External-data modules are labeled unavailable rather than filled with invented live metrics.

Google OAuth/GSC/GA4, keyword/SERP vendors, backlinks, competitor intelligence, AI-search measurement, team organizations/roles, billing, scheduled jobs, full-site crawling, and agency features remain later phases. The current tenant boundary is the signed-in account; organization-level collaboration is not implemented.

The crawler does not execute JavaScript, validate all structured data, test every outbound link/image, or discover every sitemap. Cross-origin redirects require adding the final origin. Parameterized links are not followed. Public DNS validation does not constitute a DNS-pinning proxy; use a dedicated controlled-egress crawler service before opening this to untrusted public tenants.

Scores average documented available checks and exclude missing sources. They are diagnostic rather than predictions of ranking or traffic. Lab and field performance measurements are distinguished. Sample figures are illustrative only.

## Validation

`node --experimental-strip-types --test tests/crawler.test.mjs` verifies target validation, robots rules, metadata extraction, observed error reporting, and DNS rejection. TypeScript checking passes. A local HTTP integration run exercised authentication, origin enforcement, project quota and persistence, unknown-project isolation, a real example.com crawl, audit persistence, task creation/completion, and rate limits. Both PageSpeed requests returned HTTP 429 and were presented as unavailable.

## Development and deployment

Run the package's install, dev, and build scripts with its lockfile. Production uses the declared D1 binding and generated Drizzle migration. Windows preview uses a project-local SQLite adapter because the local Workers runtime failed on this host; production never includes that adapter. Sign in through the local sign-in link to exercise persistent preview features.

Before a public launch, complete the remaining Phase 1 capabilities, production infrastructure and security review, controlled crawler egress, background job processing, monitoring, accessibility review, and operational recovery testing. Do not market this release as the entire 55-section platform.

## Email recovery

Recovery emails use Resend when `RESEND_API_KEY` and `EMAIL_FROM` are configured. Add both variables to the Railway service; `EMAIL_FROM` must use a verified Resend domain. If they are absent or delivery fails, the one-time recovery code remains available on-screen after registration.

## Full-site crawler
SEO → Site Audit → Full-site crawler discovers same-origin URLs through HTML links and XML sitemaps. Choose 100, 500, 1,000 or 2,000 pages. One active crawl per account, paced at one URL per request with a one-second client delay. Existing audit-start limits apply. The crawler respects robots.txt and excludes query-string links, non-HTML assets and JavaScript-only links. Sitemap discovery is bounded to 50 sitemaps / 20,000 URLs; reports explicitly mark capped discovery as partial.

Progress lives in `crawl_jobs` in the existing database. Keep the website's GrowthPilot workspace open while crawling; switching tools is supported. Closing the tab or switching websites stops after the current batch. Reopening that website continues; paused crawls require Resume. A short database lease prevents concurrent tabs from writing the same batch; interrupted requests can be retried after the two-minute lease expires. Completed results are saved as ordinary audits. Deleting a project also deletes its saved crawl.

The page-by-page action report supports URL/issue filtering, direct evidence inspection and CSV export. Full crawls do not invoke PageSpeed for each page. Use the separate Run audit action for fresh Google entry-page measurements. HTML content checks are deterministic diagnostics, not a search-ranking prediction or a full Screaming Frog replacement.
