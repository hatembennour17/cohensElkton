exports.handler = async (event) => {
  const sku = String(event.queryStringParameters?.sku || '').trim();
  const apiKey = process.env.THREE_D_CLOUD_API_KEY;
  const clientId = process.env.THREE_D_CLOUD_CLIENT_ID || '000002';

  if (!sku) {
    return json(400, { message: 'Missing SKU.' });
  }

  if (!apiKey) {
    return json(503, { message: '3D model API is not configured.' });
  }

  const url = new URL(`https://mxt-client-services.3dcloud.io/v1/ar/${encodeURIComponent(sku)}`);
  url.searchParams.set('state', 'active');
  url.searchParams.set('export-type', 'glb');
  url.searchParams.set('lod', '512');
  url.searchParams.set('api_key', apiKey);

  try {
    const response = await fetch(url, {
      headers: {
        'X-Api-Key': apiKey
      }
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok || !payload?.url) {
      return json(404, { message: payload?.message || 'No 3D model is available for this item.' });
    }

    return json(200, {
      sku,
      clientId,
      url: payload.url
    });
  } catch {
    return json(502, { message: 'Unable to load the 3D model right now.' });
  }
};

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': statusCode === 200 ? 'public, max-age=3600' : 'no-store'
    },
    body: JSON.stringify(body)
  };
}
