const FD_API_KEY = process.env.API_KEY_FOOTBALL_DATA;
const FD_BASE_URL = 'https://api.football-data.org/v4';
const FD_TEAM_CELTA_ID = 558;
const FD_COMPETITION_LALIGA = 'PD';

export default async function handler(req) {
  try {
    if (!FD_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'FD_API_KEY not set' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const url = new URL(`${FD_BASE_URL}/teams/${FD_TEAM_CELTA_ID}/matches`);
    url.searchParams.set('status', 'SCHEDULED,IN_PLAY');
    url.searchParams.set('competitions', FD_COMPETITION_LALIGA);
    url.searchParams.set('dateFrom', new Date().toISOString().slice(0, 10));

    // Aquí usamos fetch global que Netlify ya expone
    const apiRes = await fetch(url.toString(), {
      headers: { 'X-Auth-Token': FD_API_KEY },
    });

    if (!apiRes.ok) {
      return new Response(
        JSON.stringify({ error: 'Upstream error', status: apiRes.status }),
        {
          status: apiRes.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const data = await apiRes.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message || 'Server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
