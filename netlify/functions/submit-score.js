exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed.' });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return json(500, { error: 'Supabase environment variables are missing.' });

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (_) {
    return json(400, { error: 'Invalid JSON.' });
  }

  const player_name = cleanName(payload.player_name);
  const altitude = Math.floor(Number(payload.altitude));
  const mode = normalizeMode(payload.mode);
  const ip_address = getClientIp(event);
  const country = getCountry(event);
  if (!player_name || player_name.length > 16 || !Number.isFinite(altitude) || altitude < 0 || altitude > 100000) {
    return json(400, { error: 'Invalid score.' });
  }

  const res = await fetch(`${url}/rest/v1/leaderboard_scores`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'content-type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify({ player_name, altitude, mode, ip_address, country })
  });

  if (!res.ok) return json(res.status, { error: 'Failed to submit score.' });
  return json(200, { ok: true });
};

function cleanName(value) {
  return String(value || '').replace(/[\r\n\t]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 16);
}

function normalizeMode(mode) {
  return String(mode || '').toLowerCase() === 'extreme' ? 'extreme' : 'normal';
}

function getHeader(headers, name) {
  if (!headers) return '';
  const direct = headers[name];
  if (direct != null && direct !== '') return String(direct);
  const lower = String(name).toLowerCase();
  for (const [k, v] of Object.entries(headers)) {
    if (String(k).toLowerCase() === lower) return String(v || '');
  }
  return '';
}

function getClientIp(event) {
  const headers = event && event.headers || {};
  const candidates = [
    getHeader(headers, 'x-nf-client-connection-ip'),
    getHeader(headers, 'x-forwarded-for'),
    getHeader(headers, 'cf-connecting-ip'),
    getHeader(headers, 'x-real-ip')
  ].map(v => String(v || '').split(',')[0].trim()).filter(Boolean);
  return candidates[0] || 'unknown';
}

function getCountry(event) {
  const headers = event && event.headers || {};
  const candidates = [
    getHeader(headers, 'x-nf-country'),
    getHeader(headers, 'x-country'),
    getHeader(headers, 'x-geo-country'),
    getHeader(headers, 'x-nf-geo-country')
  ].map(v => String(v || '').trim()).filter(Boolean);
  return candidates[0] || 'unknown';
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body)
  };
}
