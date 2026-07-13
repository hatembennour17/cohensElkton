const METADATA_HEADER = 'x-amz-meta-user';

function getBlobContext(event) {
  const rawBlobs = event?.blobs;

  if (!rawBlobs) {
    throw new Error('Netlify Blobs context is not available for this function request.');
  }

  const data = JSON.parse(Buffer.from(rawBlobs, 'base64').toString('utf8'));
  const edgeUrl = data.url;
  const token = data.token;
  const siteId = event.headers?.['x-nf-site-id'];

  if (!edgeUrl || !token || !siteId) {
    throw new Error('Netlify Blobs context is missing site, URL, or token data.');
  }

  return { edgeUrl, siteId, token };
}

function blobUrl(event, storeName, key) {
  const context = getBlobContext(event);
  const path = `/${context.siteId}/${storeName}/${key}`;

  return {
    url: new URL(path, context.edgeUrl).toString(),
    token: context.token
  };
}

async function getBlob(event, storeName, key, options = {}) {
  const request = blobUrl(event, storeName, key);
  const response = await fetch(request.url, {
    method: 'GET',
    headers: {
      authorization: `Bearer ${request.token}`
    }
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Blob read failed with ${response.status}`);
  }

  if (options.type === 'json') {
    return response.json();
  }

  if (options.type === 'arrayBuffer') {
    return {
      data: await response.arrayBuffer(),
      metadata: decodeMetadata(response.headers.get(METADATA_HEADER))
    };
  }

  return response.text();
}

async function setBlob(event, storeName, key, data, options = {}) {
  const request = blobUrl(event, storeName, key);
  const headers = {
    authorization: `Bearer ${request.token}`,
    'cache-control': 'max-age=0, stale-while-revalidate=60'
  };

  if (options.contentType) {
    headers['content-type'] = options.contentType;
  }

  if (options.metadata) {
    headers[METADATA_HEADER] = encodeMetadata(options.metadata);
  }

  const response = await fetch(request.url, {
    method: 'PUT',
    headers,
    body: data
  });

  if (!response.ok) {
    throw new Error(`Blob write failed with ${response.status}`);
  }

  return {
    etag: response.headers.get('etag') || '',
    modified: true
  };
}

async function setJSONBlob(event, storeName, key, data) {
  return setBlob(event, storeName, key, JSON.stringify(data), {
    contentType: 'application/json'
  });
}

function encodeMetadata(metadata) {
  return `b64;${Buffer.from(JSON.stringify(metadata), 'utf8').toString('base64')}`;
}

function decodeMetadata(value) {
  if (!value?.startsWith('b64;')) {
    return {};
  }

  try {
    return JSON.parse(Buffer.from(value.slice(4), 'base64').toString('utf8'));
  } catch {
    return {};
  }
}

module.exports = {
  getBlob,
  setBlob,
  setJSONBlob
};
