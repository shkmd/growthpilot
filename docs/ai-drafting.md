# AI description drafting

Set server-only OPENAI_API_KEY and OPENAI_MODEL to a Responses API model available to your account. Never use a public frontend environment variable for the key.

After deployment, open SEO → Brand Profile and save the website's approved context. Under SEO Toolkit → Description editor, select a successfully crawled page and choose Generate AI draft.

The server retrieves the latest audit and most recently updated brand profile belonging to the signed-in user's selected project. Only metadata, headings and bounded brand context are sent to OpenAI. Drafts are editable and downloadable; they are not automatically published or saved.

Requests use the Responses API with store:false, a 45-second timeout and bounded output. Generation attempts are limited to 20 per account per UTC day and 15 seconds apart, including failed provider requests. Missing configuration and provider failures appear in the editor. The daily limit table is initialized automatically.

Validation: production build; live generation requires configured credentials, billing and model access.
Reference: https://developers.openai.com/api/reference/responses/create
