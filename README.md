# 2deHandsSite

The site uses `/api` as its default API base URL. During local development,
Vite proxies requests to `https://eindproject-meld.runasp.net`; on Vercel,
`vercel.json` forwards them to the same backend.

Deploy the latest changes to Vercel to activate the rewrite. If
`VITE_API_BASE_URL` is set in the Vercel project, remove it or set it to
`/api` so the deployed site uses the rewrite, and redeploy after changing it.

```sh
pnpm install
pnpm dev
pnpm build
```
