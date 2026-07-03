const ASHLEY_PRODUCTS_URL = 'https://apigw3.ashleyfurniture.com/productinformation/products';

const jsonResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    'content-type': 'application/json',
    'cache-control': statusCode === 200 ? 'public, max-age=900' : 'no-store'
  },
  body: JSON.stringify(body)
});

const requiredEnv = [
  'ASHLEY_CLIENT_ID',
  'ASHLEY_USERNAME',
  'ASHLEY_PASSWORD',
  'ASHLEY_CUSTOMER',
  'ASHLEY_SHIPTO'
];

exports.handler = async (event) => {
  const missing = requiredEnv.filter((name) => !process.env[name]);

  if (missing.length) {
    return jsonResponse(500, {
      error: 'Ashley API is not configured.',
      missing
    });
  }

  const query = event.queryStringParameters || {};
  const upstreamUrl = new URL(ASHLEY_PRODUCTS_URL);

  upstreamUrl.searchParams.set('customer', process.env.ASHLEY_CUSTOMER);
  upstreamUrl.searchParams.set('shipto', process.env.ASHLEY_SHIPTO);
  upstreamUrl.searchParams.set('limit', normalizeLimit(query.limit));

  if (query.page) {
    upstreamUrl.searchParams.set('page', query.page);
  }

  if (query.skus) {
    upstreamUrl.searchParams.set('skus', query.skus);
  }

  const clientIdHeaderName = process.env.ASHLEY_CLIENT_ID_HEADER || 'client_id';
  const authToken = Buffer.from(`${process.env.ASHLEY_USERNAME}:${process.env.ASHLEY_PASSWORD}`).toString('base64');

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'accept-language': 'en-US',
        authorization: `Basic ${authToken}`,
        [clientIdHeaderName]: process.env.ASHLEY_CLIENT_ID
      }
    });

    const rawBody = await upstreamResponse.text();
    let payload;

    try {
      payload = rawBody ? JSON.parse(rawBody) : {};
    } catch {
      payload = { rawBody };
    }

    if (!upstreamResponse.ok) {
      return jsonResponse(upstreamResponse.status, {
        error: 'Ashley API request failed.',
        details: payload
      });
    }

    const products = extractProducts(payload).map(normalizeProduct).filter(Boolean);

    return jsonResponse(200, {
      products,
      meta: extractMeta(payload)
    });
  } catch (error) {
    return jsonResponse(502, {
      error: 'Unable to reach Ashley API.',
      message: error instanceof Error ? error.message : String(error)
    });
  }
};

function normalizeLimit(value) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return '24';
  }

  return String(Math.min(Math.max(parsed, 1), 1000));
}

function extractProducts(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  for (const key of ['products', 'entities', 'items', 'data', 'results']) {
    if (Array.isArray(payload?.[key])) {
      return payload[key];
    }
  }

  return [];
}

function extractMeta(payload) {
  return payload?.metadata || payload?.meta || payload?.pagination || {
    page: payload?.page,
    limit: payload?.limit,
    total: payload?.total
  };
}

function normalizeProduct(product) {
  const sku = firstValue(product, ['sku', 'SKU', 'itemNumber', 'item_number', 'itemNo', 'item', 'seriesId']);
  const name = firstValue(product, [
    'name',
    'productName',
    'product_name',
    'itemName',
    'friendlyDescription',
    'consumerDescription',
    'description',
    'shortDescription'
  ]);

  if (!sku || !name) {
    return null;
  }

  const brand = firstValue(product, ['brand', 'brandName']);
  const price = firstNumber(product, [
    'map',
    'MAP',
    'minimumAdvertisedPrice',
    'msrp',
    'MSRP',
    'retailPrice',
    'price',
    'fobBasePrice'
  ]);
  const image = firstImage(product);

  return {
    sku: String(sku),
    name: String(name),
    brand: brand ? String(brand) : 'Ashley',
    image,
    unitPrice: price || 0,
    href: `https://www.cohensfurnituredirect.com/search?q=${encodeURIComponent(String(sku))}`,
    kicker: brand ? String(brand) : 'Ashley product'
  };
}

function firstValue(source, keys) {
  for (const key of keys) {
    if (source?.[key] !== undefined && source[key] !== null && source[key] !== '') {
      return source[key];
    }
  }

  return undefined;
}

function firstNumber(source, keys) {
  const value = firstValue(source, keys);
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function firstImage(product) {
  const directImage = firstValue(product, [
    'image',
    'imageUrl',
    'imageURL',
    'primaryImage',
    'primaryImageUrl',
    'itemRoomImage',
    'largeImageUrl',
    'mediumImageUrl',
    'knockout',
    'dimensionSketch'
  ]);

  if (directImage) {
    return String(directImage);
  }

  const images = product?.imageSet || product?.images || product?.media || product?.assets;

  if (Array.isArray(images) && images.length) {
    const first = images[0];
    return String(first?.url || first?.imageUrl || first?.href || first);
  }

  return 'https://cdn.rencdn.com/Cohensfurniture/uploads/images/sofas.jpg';
}
