const FD_API_KEY = process.env.API_KEY_FOOTBALL_DATA;
const FD_BASE_URL = 'https://api.football-data.org/v4';
const FD_TEAM_CELTA_ID = 558;
// OJO: en v4 LaLiga suele ser "PD", pero si el 400 persiste puede que
// tengas que quitar el filtro de competición.
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

    // Versión conservadora para evitar 400 en free:
    // solo filtramos por estado y dejamos que la API devuelva todo.
    url.searchParams.set('status', 'SCHEDULED'); // solo próximos partidos
    // Si con esto sigue dando 400, comenta la línea:
    // url.searchParams.set('competitions', FD_COMPETITION_LALIGA);
    // Y de momento no uses dateFrom:
    // url.searchParams.set('dateFrom', new Date().toISOString().slice(0, 10));

    const apiRes = await fetch(url.toString(), {
      headers: { 'X-Auth-Token': FD_API_KEY },
    });

    if (!apiRes.ok) {
      // devolvemos el código real para verlo en el front
      const errText = await apiRes.text();
      return new Response(
        JSON.stringify({
          error: 'Upstream error',
          status: apiRes.status,
          body: errText,
        }),
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

    // Mismo postprocesado: ordenamos y devolvemos solo el próximo
    if (!data.matches || data.matches.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No hay próximos partidos para el Celta' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const sorted = data.matches
      .slice()
      .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));

    return new Response(JSON.stringify({ match: sorted[0] }), {
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
