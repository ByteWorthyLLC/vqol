function badRequest(message) {
  return new Response(JSON.stringify({ error: message }), {
    status: 400,
    headers: { 'content-type': 'application/json' },
  });
}

function isScore(n) {
  return typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 100;
}

function validatePayload(payload) {
  if (!payload || typeof payload !== 'object') return 'payload must be an object';
  if (payload.schemaVersion !== 1) return 'schemaVersion must be 1';
  if (typeof payload.practiceId !== 'string' || !payload.practiceId) return 'practiceId is required';
  if (typeof payload.sessionId !== 'string' || !payload.sessionId) return 'sessionId is required';
  if (typeof payload.calculatedAt !== 'number') return 'calculatedAt must be a timestamp';
  if (!payload.scores || typeof payload.scores !== 'object') return 'scores object is required';
  if (!isScore(payload.scores.qolTscore)) return 'scores.qolTscore must be 0-100';
  if (!isScore(payload.scores.symTscore)) return 'scores.symTscore must be 0-100';
  return null;
}

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', {
        status: 405,
        headers: { allow: 'POST' },
      });
    }

    const contentType = request.headers.get('content-type') ?? '';
    if (!contentType.toLowerCase().includes('application/json')) {
      return badRequest('content-type must be application/json');
    }

    const length = Number(request.headers.get('content-length') ?? '0');
    if (length > 8192) {
      return new Response('Payload too large', { status: 413 });
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return badRequest('invalid JSON');
    }

    const error = validatePayload(payload);
    if (error) return badRequest(error);

    const key = `${payload.practiceId}:${payload.sessionId}:${payload.calculatedAt}`;
    const record = {
      ...payload,
      receivedAt: new Date().toISOString(),
    };

    if (env.VQOL_AGGREGATE_KV) {
      await env.VQOL_AGGREGATE_KV.put(key, JSON.stringify(record));
    }

    return new Response(null, { status: 204 });
  },
};
