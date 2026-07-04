const ASHLEY_PRODUCTS_URL = 'https://apigw3.ashleyfurniture.com/productinformation/products';
const CATALOG_FILE_PATH = 'data/elkton-catalog.json';

const jsonResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    'content-type': 'application/json',
    'cache-control': 'no-store'
  },
  body: JSON.stringify(body)
});

const defaultAdminCatalog = {
  priceRules: {
    defaultMarkupPercent: 55,
    rounding: 'ending-99'
  },
  categories: {
    'living-room': { markupPercent: 55, products: [] },
    bedrooms: { markupPercent: 55, products: [] },
    'dining-room': { markupPercent: 55, products: [] },
    mattresses: { markupPercent: 55, products: [] },
    kids: { markupPercent: 55, products: [] },
    office: { markupPercent: 55, products: [] },
    'home-decor': { markupPercent: 55, products: [] },
    outdoor: { markupPercent: 55, products: [] },
    clearance: { markupPercent: 55, products: [] }
  }
};

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
  const requestedLimit = normalizeLimit(query.limit);
  const category = normalizeCategory(query.category);
  const adminCatalog = normalizeAdminCatalog(await readAdminCatalog());
  const configuredProducts = getConfiguredProducts(adminCatalog, category);

  upstreamUrl.searchParams.set('customer', process.env.ASHLEY_CUSTOMER);
  upstreamUrl.searchParams.set('shipto', process.env.ASHLEY_SHIPTO);
  upstreamUrl.searchParams.set('limit', configuredProducts.length ? String(configuredProducts.length) : category ? '1000' : requestedLimit);

  if (query.page) {
    upstreamUrl.searchParams.set('page', query.page);
  }

  if (configuredProducts.length) {
    upstreamUrl.searchParams.set('skus', configuredProducts.map((product) => product.sku).join(','));
  } else if (query.skus) {
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

    const extractedProducts = extractProducts(payload);
    const rawProducts = configuredProducts.length
      ? orderConfiguredProducts(extractedProducts, configuredProducts)
      : filterByCategory(extractedProducts, category);
    const products = rawProducts
      .map((product) => normalizeProduct(product.item || product, product.config, adminCatalog, category))
      .filter(Boolean)
      .slice(0, Number(requestedLimit));

    return jsonResponse(200, {
      products,
      meta: {
        ...extractMeta(payload),
        category,
        filteredRecords: rawProducts.length
      }
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

function normalizeCategory(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

async function readAdminCatalog() {
  try {
    const response = await fetch(gitHubContentsUrl(), {
      method: 'GET',
      headers: gitHubHeaders()
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`GitHub catalog read failed with ${response.status}`);
    }

    const payload = await response.json();
    const content = Buffer.from(String(payload.content || ''), 'base64').toString('utf8');
    return content ? JSON.parse(content) : null;
  } catch {
    return null;
  }
}

function gitHubContentsUrl() {
  const owner = process.env.GITHUB_OWNER || 'hatembennour17';
  const repo = process.env.GITHUB_REPO || 'cohensElkton';
  const branch = process.env.GITHUB_BRANCH || 'master';
  const path = encodeURIComponent(CATALOG_FILE_PATH).replace(/%2F/g, '/');
  return `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}`;
}

function gitHubHeaders() {
  const headers = {
    accept: 'application/vnd.github+json',
    'user-agent': 'cohens-elkton-catalog'
  };

  if (process.env.GITHUB_TOKEN) {
    headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    headers['x-github-api-version'] = '2022-11-28';
  }

  return headers;
}

function normalizeAdminCatalog(catalog) {
  const source = catalog && typeof catalog === 'object' ? catalog : {};
  const sourceRules = source.priceRules || {};
  const categories = {};

  for (const [slug, defaultCategory] of Object.entries(defaultAdminCatalog.categories)) {
    const sourceCategory = source.categories?.[slug] || {};
    categories[slug] = {
      markupPercent: normalizeOptionalNumber(sourceCategory.markupPercent) ?? defaultCategory.markupPercent,
      products: Array.isArray(sourceCategory.products) ? sourceCategory.products : []
    };
  }

  return {
    priceRules: {
      defaultMarkupPercent: normalizeOptionalNumber(sourceRules.defaultMarkupPercent) ?? defaultAdminCatalog.priceRules.defaultMarkupPercent,
      rounding: sourceRules.rounding === 'none' ? 'none' : 'ending-99'
    },
    categories
  };
}

function getConfiguredProducts(adminCatalog, category) {
  if (!category) {
    return [];
  }

  const products = adminCatalog?.categories?.[category]?.products;

  if (!Array.isArray(products)) {
    return [];
  }

  return products
    .map((product) => ({
      sku: String(product?.sku || '').trim().toUpperCase(),
      enabled: product?.enabled !== false,
      fixedPrice: normalizeOptionalNumber(product?.fixedPrice),
      markupPercent: normalizeOptionalNumber(product?.markupPercent)
    }))
    .filter((product) => product.sku && product.enabled);
}

function orderConfiguredProducts(products, configuredProducts) {
  const productBySku = new Map(products.map((product) => [String(product?.sku || '').toUpperCase(), product]));

  return configuredProducts
    .map((config) => {
      const item = productBySku.get(config.sku);
      return item ? { item, config } : null;
    })
    .filter(Boolean);
}

function filterByCategory(products, category) {
  if (!category) {
    return products;
  }

  const rulesByCategory = {
    'living-room': {
      include: ['sofa', 'sectional', 'loveseat', 'recliner', 'ottoman', 'cocktail table', 'coffee table', 'end table', 'tv stand', 'entertainment', 'upholstery', 'living room'],
      exclude: ['dining', 'bar stool', 'barstool', 'bedroom', 'mattress', 'lamp', 'wall art', 'mirror', 'rug', 'decor', 'storedisplay']
    },
    bedrooms: {
      include: ['bedroom', 'bed', 'dresser', 'nightstand', 'chest', 'mirror', 'vanity'],
      exclude: ['dining', 'sofa', 'sectional', 'outdoor', 'patio', 'storedisplay']
    },
    'dining-room': {
      include: ['dining', 'dining room', 'dining table', 'dining chair', 'barstool', 'bar stool', 'bench', 'server', 'buffet'],
      exclude: ['sofa', 'sectional', 'bedroom', 'mattress', 'lamp', 'wall art', 'storedisplay']
    },
    mattresses: {
      include: ['mattress', 'foundation', 'box spring', 'pillow', 'sleep'],
      exclude: ['dining', 'sofa', 'sectional', 'wall art', 'lamp', 'storedisplay']
    },
    kids: {
      include: ['youth', 'kids', 'kid', 'bunk', 'crib', 'twin bed'],
      exclude: ['dining', 'sofa', 'sectional', 'outdoor', 'storedisplay']
    },
    office: {
      include: ['office', 'desk', 'bookcase', 'file', 'workstation'],
      exclude: ['dining', 'sofa', 'sectional', 'mattress', 'storedisplay']
    },
    'home-decor': {
      include: ['decor', 'rug', 'wall art', 'lamp', 'mirror', 'accessories', 'accent'],
      exclude: ['sofa', 'sectional', 'mattress', 'bedroom set', 'dining set', 'storedisplay']
    },
    outdoor: {
      include: ['outdoor', 'patio', 'fire pit', 'umbrella', 'conversation set'],
      exclude: ['bedroom', 'mattress', 'wall art', 'storedisplay']
    },
    clearance: {
      include: ['clearance', 'closeout', 'sale'],
      exclude: ['storedisplay']
    }
  };

  const rule = rulesByCategory[category];

  if (!rule) {
    return products;
  }

  return products
    .map((product) => {
      const searchableText = productSearchText(product);
      const hasExcludedTerm = rule.exclude.some((keyword) => searchableText.includes(keyword));

      if (hasExcludedTerm) {
        return null;
      }

      const productName = String(product?.itemName || '').toLowerCase();
      const score = rule.include.reduce((total, keyword) => {
        if (!searchableText.includes(keyword)) {
          return total;
        }

        const nameBoost = productName.includes(keyword) ? 2 : 1;
        return total + keywordWeight(category, keyword) * nameBoost;
      }, 0);

      return score > 0 ? { product, score } : null;
    })
    .filter(Boolean)
    .sort((left, right) => right.score - left.score)
    .map((result) => result.product);
}

function keywordWeight(category, keyword) {
  const weightsByCategory = {
    'living-room': {
      sofa: 120,
      sectional: 120,
      loveseat: 110,
      recliner: 105,
      upholstery: 95,
      'tv stand': 70,
      entertainment: 70,
      'coffee table': 45,
      'cocktail table': 45,
      'end table': 35,
      ottoman: 30,
      'living room': 20
    }
  };

  return weightsByCategory[category]?.[keyword] || keyword.length;
}

function productSearchText(product) {
  return [
    product?.itemName,
    product?.friendlyDescription,
    product?.consumerDescription,
    product?.detailedDescription,
    product?.retailType,
    product?.itemClass,
    product?.itemCode,
    product?.itemDefaultGroupingLookupCode,
    product?.itemSeriesName,
    product?.seriesFeatures,
    ...(Array.isArray(product?.intendedRooms) ? product.intendedRooms : []),
    ...(Array.isArray(product?.navigableCategories) ? product.navigableCategories : []),
    ...(Array.isArray(product?.microsites) ? product.microsites : [])
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
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

function normalizeProduct(product, priceConfig, adminCatalog, category) {
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
  const basePrice = firstNumber(product, [
    'map',
    'MAP',
    'minimumAdvertisedPrice',
    'msrp',
    'MSRP',
    'retailPrice',
    'price',
    'fobBasePrice'
  ]);
  const price = applyPriceRule(basePrice, priceConfig, adminCatalog, category);
  const image = firstImage(product);

  return {
    sku: String(sku),
    name: String(name),
    brand: brand ? String(brand) : 'Ashley',
    image,
    ashleyPrice: basePrice || 0,
    unitPrice: price || 0,
    href: `https://www.cohensfurnituredirect.com/search?q=${encodeURIComponent(String(sku))}`,
    kicker: brand ? String(brand) : 'Ashley product'
  };
}

function applyPriceRule(basePrice, priceConfig, adminCatalog, category) {
  if (priceConfig?.fixedPrice !== null && priceConfig?.fixedPrice !== undefined) {
    return priceConfig.fixedPrice;
  }

  const markupPercent =
    priceConfig?.markupPercent ??
    normalizeOptionalNumber(adminCatalog?.categories?.[category]?.markupPercent) ??
    normalizeOptionalNumber(adminCatalog?.priceRules?.defaultMarkupPercent) ??
    0;

  const markedUpPrice = basePrice * (1 + markupPercent / 100);

  if (adminCatalog?.priceRules?.rounding === 'none') {
    return roundMoney(markedUpPrice);
  }

  return ending99(markedUpPrice);
}

function ending99(value) {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  return Math.max(0.99, Math.ceil(value) - 0.01);
}

function roundMoney(value) {
  return Number.isFinite(value) ? Math.round(value * 100) / 100 : 0;
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

function normalizeOptionalNumber(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
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
