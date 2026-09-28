# AI description drafting

## Article writer

Content → AI Writer uses a saved My Content record as a source brief and the latest brand profile for that website. Generate, review and edit, then save as a new My Content draft. The original record is preserved. Technical briefs produce implementation guides. This does not publish to a CMS.

Article and description generation share the 20-attempt daily limit. Articles use a 60-second timeout, 2,500 output-token cap and 8,000-character storage limit. Incomplete or oversized outputs are rejected. No additional environment variables are required.

Content → AI Post Writer uses the same saved brief and brand context to create editable LinkedIn (up to 2,000 characters) or X (up to 250 characters) drafts. Choose a channel and planned date, review the result, then save it to Social → Social Calendar. Drafts are never published automatically.

Set server-only OPENAI_API_KEY and OPENAI_MODEL to a Responses API model available to your account. Never use a public frontend environment variable for the key.

After deployment, open SEO → Brand Profile and save the website's approved context. Under SEO Toolkit → Description editor, select a successfully crawled page and choose Generate AI draft.

The server retrieves the latest audit and most recently updated brand profile belonging to the signed-in user's selected project. Only metadata, headings and bounded brand context are sent to OpenAI. Drafts are editable and downloadable; they are not automatically published or saved.

Requests use the Responses API with store:false, a 45-second timeout and bounded output. Generation attempts are limited to 20 per account per UTC day and 15 seconds apart, including failed provider requests. Missing configuration and provider failures appear in the editor. The daily limit table is initialized automatically.

Validation: production build; live generation requires configured credentials, billing and model access.
Reference: https://developers.openai.com/api/reference/responses/create
