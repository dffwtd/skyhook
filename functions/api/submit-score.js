const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function cleanName(value) {
  return String(value || '').replace(/[\r\n\t]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 16);
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function onRequestPost(context) {
  try {
    const env = context.env || {};
    const supabaseUrl = String(env.SUPABASE_URL || '').replace(/\/+$/, '');
    const serviceRoleKey = String(env.SUPABASE_SERVICE_ROLE_KEY || '');
    if (!supabaseUrl || !serviceRoleKey) return json({ error: 'missing_server_env' }, 500);

    const body = await context.request.json().catch(() => null);
    const player_name = cleanName(body?.player_name);
    const altitude = Math.max(0, Math.floor(Number(body?.altitude || 0)));
    const mode = body?.mode === 'extreme' ? 'extreme' : 'normal';

    if (!player_name) return json({ error: 'missing_name' }, 400);
    if (!Number.isFinite(altitude) || altitude <= 0) return json({ error: 'invalid_altitude' }, 400);

    const ip_address = String(context.request.headers.get('CF-Connecting-IP') || 'unknown').trim().slice(0, 64) || 'unknown';
    const country = String(context.request.cf?.country || 'unknown').trim().slice(0, 64) || 'unknown';

    const res = await fetch(supabaseUrl + '/rest/v1/leaderboard_scores', {
      method: 'POST',
      headers: {
        apikey: serviceRoleKey,
        Authorization: 'Bearer ' + serviceRoleKey,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ player_name, altitude, mode, ip_address, country }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      return json({ error: detail || res.statusText || 'submit_failed' }, res.status || 500);
    }

    return json({ ok: true });
  } catch (error) {
    return json({ error: String(error?.message || error || 'unknown_error') }, 500);
  }
}
