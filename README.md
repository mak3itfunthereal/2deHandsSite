# 2deHandsSite

The site uses `/api` as its default API base URL. During local development,
Vite proxies requests to `https://eindproject-meld.runasp.net`; on Vercel,
`vercel.json` forwards them to the same backend.

Deploy the latest changes to Vercel to activate the rewrite. If
`VITE_API_BASE_URL` is set in the Vercel project, remove it or set it to
`/api` so the deployed site uses the rewrite, and redeploy after changing it.

## Authentication

Registration and login use the backend account endpoints. A successful login
stores the JWT and expiry in `localStorage`, then verifies the session through
`accounts/me` on reload. JavaScript can read this token, so an XSS vulnerability
could expose it. The API expires tokens after 60 minutes; no refresh or
server-side logout endpoint is documented.

Set the backend's `PasswordReset:FrontendUrl` to the frontend origin followed
by `/reset-password`, for example `http://localhost:5173/reset-password`.
Vite and the Vercel rewrite serve the reset page for that route. The backend
currently logs reset links in development; configure a real email provider to
send them and create its password-reset token table before using this flow.
Profile editing and account deletion are not connected to the account API.

## Project structure

- `public/` - static files served as-is.
- `src/api/` - API client and request helpers.
- `src/assets/` - images, icons, and other imported assets.
- `src/components/` - reusable UI components.
- `src/hooks/` - shared React hooks.
- `src/pages/` - page-level components.
- `src/styles/` - global styles and design tokens.
- `src/types/` - shared TypeScript types.
- `src/utils/` - shared utility functions.
- `tests/` - automated tests.

```sh
pnpm install
pnpm dev
pnpm build
```
