exports.handler = async (event) => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    return json(500, { error: 'Supabase environment variables are missing.' });
  }

  const mode = normalizeMode(event.queryStringParameters && event.queryStringParameters.mode);
  const endpoint = `${url}/rest/v1/leaderboard_scores?select=player_name,altitude,created_at,mode&mode=eq.${mode}&order=altitude.desc,created_at.asc&limit=50`;
  const res = await fetch(endpoint, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: 'application/json'
    }
  });

  if (!res.ok) return json(res.status, { error: 'Failed to load leaderboard.' });
  return json(200, await res.json());
};

function normalizeMode(mode) {
  return String(mode || '').toLowerCase() === 'extreme' ? 'extreme' : 'normal';
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body)
  };
}
