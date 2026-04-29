const ALLOWED_ORIGINS = [
  'https://adityapoudel.live',
  'http://localhost',
  'http://127.0.0.1',
];

const SYSTEM_PROMPT = `You are a friendly assistant on Aditya Raj Poudel's personal portfolio website. Answer questions about Aditya concisely and warmly. Here's everything you know:

PERSONAL:
- Full name: Aditya Raj Poudel
- Currently living in Baltimore, MD
- Born and raised in the hills of Nepal, moved to the USA in fall 2023
- CS student at CCBC (Community College of Baltimore County)
- Passionate about technology, mathematics, and problem-solving

WORK EXPERIENCE:
- Tutor at Student Success Center, CCBC Essex (May 2024 – Dec 2025)
- Helped students with Mathematics and CSIT
- Earned CLRA Level 2 certification

PROJECTS:
- Automated Homicide Data Scraper & Visualizer: live dashboard at baltimore-crime-analysis-dashboard.onrender.com
- FINAD: Financial Analysis Dashboard (GitHub: inctheflow/FINAD)
- Let's Football: a game on itch.io
- Arkanoid: game on GitHub (inctheflow/ARKANOIDgame)
- Tic Tac Toe: on GitHub (inctheflow/tic-tac-toe)

CONTACT:
- Email: adityarajpoudel@gmail.com
- GitHub: github.com/inctheflow
- LinkedIn: linkedin.com/in/aditya-poudel-526a66277/
- Website: adityapoudel.live

Keep answers short (2-4 sentences max). If asked something you don't know about Aditya, say you're not sure but they can email him directly.`;

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.some(o => origin && origin.startsWith(o));
  const allowOrigin = allowed ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: cors });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response('Invalid JSON', { status: 400, headers: cors });
    }

    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return new Response('Missing messages', { status: 400, headers: cors });
    }

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages: body.messages,
      }),
    });

    const data = await anthropicRes.json();

    return new Response(JSON.stringify(data), {
      status: anthropicRes.status,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  },
};
