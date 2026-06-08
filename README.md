# Skyhook

## Cloudflare Pages + Supabase

Static files deploy from Cloudflare Pages.
Leaderboard reads go straight to Supabase REST.
Score submit now goes through a Cloudflare Pages Function at /api/submit-score.

## Frontend config

Edit `supabase-config.js`:

```js
window.SKYHOOK_SUPABASE = {
  url: 'https://YOUR_PROJECT.supabase.co',
  anonKey: 'sb_publishable_xxx',
  submitUrl: '/api/submit-score'
};
```

- `anonKey`: use your publishable key or legacy anon key
- `submitUrl`: keep this as `/api/submit-score`

## Database setup

Run `supabase-leaderboard.sql` in Supabase SQL Editor.

## Cloudflare Pages Function setup

Function source:
- `functions/api/submit-score.js`

Cloudflare Pages env vars:
- `SUPABASE_URL` = your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` = your Supabase service role key

Do not put the service role key in the frontend.

## Routing

`_routes.json` is included so only `/api/*` runs through Pages Functions.
All other files stay static.
