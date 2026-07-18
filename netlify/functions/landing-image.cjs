const { getBlob, setBlob } = require('./blob-store.cjs');
const { jsonResponse, validateAdmin } = require('./admin-auth.cjs');

const IMAGE_PREFIX = 'landing/';

exports.handler = async (event) => {
  if (event.httpMethod === 'GET') {
    return serveImage(event);
  }

  const authError = validateAdmin(event);

  if (authError) {
    return authError;
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, {
      error: 'Method not allowed.'
    });
  }

  try {
    const payload = event.body ? JSON.parse(event.body) : {};
    const fileName = safeFileName(payload.fileName);
    const contentBase64 = dataUrlToBase64(payload.dataUrl);

    if (!fileName || !contentBase64) {
      return jsonResponse(400, {
        error: 'Upload requires fileName and dataUrl.'
      });
    }

    const contentType = dataUrlContentType(payload.dataUrl);
    const imageBuffer = Buffer.from(contentBase64, 'base64');
    const imageKey = `${IMAGE_PREFIX}${Date.now()}-${fileName}`;
    await setBlob(event, getImageStoreName(), imageKey, imageBuffer, {
      contentType,
      metadata: {
        contentType,
        fileName
      }
    });

    return jsonResponse(200, {
      imageUrl: `/.netlify/functions/landing-image?key=${encodeURIComponent(imageKey)}`,
      path: imageKey
    });
  } catch (error) {
    return jsonResponse(500, {
      error: 'Unable to upload landing image.',
      message: error instanceof Error ? error.message : String(error)
    });
  }
};

function safeFileName(fileName) {
  const cleaned = String(fileName || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!cleaned || !/\.(jpg|jpeg|png|webp|gif)$/i.test(cleaned)) {
    return '';
  }

  return cleaned;
}

function dataUrlToBase64(dataUrl) {
  const value = String(dataUrl || '');
  const match = value.match(/^data:image\/(?:jpeg|jpg|png|webp|gif);base64,(.+)$/i);
  return match?.[1] || '';
}

function dataUrlContentType(dataUrl) {
  const match = String(dataUrl || '').match(/^data:(image\/(?:jpeg|jpg|png|webp|gif));base64,/i);
  return match?.[1]?.toLowerCase().replace('image/jpg', 'image/jpeg') || 'image/jpeg';
}

async function serveImage(event) {
  const key = String(event.queryStringParameters?.key || '');

  if (!key.startsWith(IMAGE_PREFIX)) {
    return {
      statusCode: 404,
      body: 'Image not found.'
    };
  }

  try {
    const entry = await getBlob(event, getImageStoreName(), key, { type: 'arrayBuffer' });

    if (!entry?.data) {
      return {
        statusCode: 404,
        body: 'Image not found.'
      };
    }

    return {
      statusCode: 200,
      headers: {
        'content-type': String(entry.metadata?.contentType || 'image/jpeg'),
        'cache-control': 'public, max-age=31536000, immutable'
      },
      isBase64Encoded: true,
      body: Buffer.from(entry.data).toString('base64')
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store'
      },
      body: JSON.stringify({
        error: 'Unable to load landing image.',
        message: error instanceof Error ? error.message : String(error)
      })
    };
  }
}

function getImageStoreName() {
  return 'cohens-elkton-images';
}
