# Skyhook

## Static deploy + Supabase

Static files can be deployed on GitHub Pages or Cloudflare Pages.
Leaderboard read and score submit both go directly from the browser to Supabase REST.

## Frontend config

Edit `supabase-config.js`:

```js
window.SKYHOOK_SUPABASE = {
  url: 'https://YOUR_PROJECT.supabase.co',
  anonKey: 'sb_publishable_xxx'
};
```

- `anonKey`: use your publishable key or legacy anon key
- do not use service role in the frontend

## Database setup

Run `supabase-leaderboard.sql` in Supabase SQL Editor.
