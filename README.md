# 2deHandsSite

The site uses `/api` as its default API base URL. During local development,
Vite proxies requests to `https://eindproject-meld.runasp.net`; on Vercel,
`vercel.json` forwards them to the same backend.

Deploy the latest changes to Vercel to activate the rewrite. If
`VITE_API_BASE_URL` is set in the Vercel project, remove it or set it to
`/api` so the deployed site uses the rewrite, and redeploy after changing it.

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
