# SKYHOOK ASCENT

Static GitHub Pages build for SKYHOOK ASCENT.

## Files

- `index.html` - game page
- `leaderboard.html` - ranking page
- `TNT.png` - TNT sprite
- `supabase-config.js` - public Supabase URL and anon key
- `supabase-leaderboard.sql` - full Supabase setup SQL for a fresh project

## GitHub Pages

1. Push this repository to GitHub.
2. Open repository `Settings` > `Pages`.
3. Set `Source` to `Deploy from a branch`.
4. Set branch to `main` and folder to `/ (root)`.
5. Save.

The site entry point is `index.html`.

## Supabase

For a fresh Supabase project, run `supabase-leaderboard.sql` in Supabase SQL Editor.

Then edit `supabase-config.js`:

```js
window.SKYHOOK_SUPABASE = {
  url: 'https://YOUR_PROJECT_ID.supabase.co',
  anonKey: 'YOUR_SUPABASE_ANON_KEY'
};
```

Only use the public anon/publishable key. Do not put a service role key in this static site.
