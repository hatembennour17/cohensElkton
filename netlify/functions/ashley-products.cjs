const { getBlob } = require('./blob-store.cjs');

const ASHLEY_PRODUCTS_URL = 'https://apigw3.ashleyfurniture.com/productinformation/products';
const CATALOG_BLOB_KEY = 'catalog';
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
  hero: {
    slides: [
      {
        image: 'https://cdn.rencdn.com/Cohensfurniture/uploads/images/living-room-main_1.jpg',
        alt: 'Stylish living room furniture at Cohen\'s Furniture',
        enabled: true
      },
      {
        image: 'https://cdn.rencdn.com/Cohensfurniture/uploads/images/sofas.jpg',
        alt: 'Comfortable sofa selection at Cohen\'s Furniture',
        enabled: true
      }
    ]
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
  const requestedLimit = normalizeLimit(query.limit);
  const category = normalizeCategory(query.category);
  const subcategory = normalizeCategory(query.subcategory || query.sub);
  const searchTerm = normalizeSearchTerm(query.q);
  const adminCatalog = normalizeAdminCatalog(await readAdminCatalog(event));
  const configuredProducts = getConfiguredProducts(adminCatalog, category);

  const clientIdHeaderName = process.env.ASHLEY_CLIENT_ID_HEADER || 'client_id';
  const authToken = Buffer.from(`${process.env.ASHLEY_USERNAME}:${process.env.ASHLEY_PASSWORD}`).toString('base64');
  const headers = {
    accept: 'application/json',
    'accept-language': 'en-US',
    authorization: `Basic ${authToken}`,
    [clientIdHeaderName]: process.env.ASHLEY_CLIENT_ID
  };

  try {
    const requestLimit = configuredProducts.length ? String(configuredProducts.length) : category || searchTerm ? '1000' : requestedLimit;
    const baseSearchParams = {
      customer: process.env.ASHLEY_CUSTOMER,
      shipto: process.env.ASHLEY_SHIPTO,
      limit: requestLimit
    };

    if (query.page) {
      baseSearchParams.page = query.page;
    }

    if (configuredProducts.length) {
      baseSearchParams.skus = configuredProducts.map((product) => product.sku).join(',');
    } else if (query.skus) {
      baseSearchParams.skus = query.skus;
    } else if (looksLikeSku(searchTerm)) {
      baseSearchParams.skus = searchTerm.toUpperCase();
    }

    const payloads = await fetchAshleyPayloads(baseSearchParams, headers, {
      paginate: Boolean(category && !configuredProducts.length && !baseSearchParams.skus && !query.page),
      pageSize: Number(requestLimit)
    });

    const extractedProducts = payloads.flatMap((payload) => extractProducts(payload));
    const categoryProducts = configuredProducts.length
      ? orderConfiguredProducts(extractedProducts, configuredProducts)
      : filterByCategory(extractedProducts, category);
    const subcategoryProducts = subcategory
      ? categoryProducts.filter((product) => productMatchesSubcategory(product.item || product, subcategory))
      : categoryProducts;
    const rawProducts = filterBySearch(subcategoryProducts, looksLikeSku(searchTerm) ? '' : searchTerm);
    const products = rawProducts
      .map((product) => normalizeProduct(product.item || product, product.config, adminCatalog, category))
      .filter(Boolean)
      .slice(0, Number(requestedLimit));

    return jsonResponse(200, {
      products,
      hero: adminCatalog.hero,
      meta: {
        ...extractMeta(payloads[0] || {}),
        category,
        subcategory,
        searchTerm,
        fetchedRecords: extractedProducts.length,
        filteredRecords: rawProducts.length
      }
    });
  } catch (error) {
    if (error?.statusCode) {
      return jsonResponse(error.statusCode, {
        error: error.message || 'Ashley API request failed.',
        details: error.details
      });
    }

    return jsonResponse(502, {
      error: 'Unable to reach Ashley API.',
      message: error instanceof Error ? error.message : String(error)
    });
  }
};

async function fetchAshleyPayloads(baseSearchParams, headers, options = {}) {
  const pageSize = Number(options.pageSize) || 1000;
  const maxPages = options.paginate ? 5 : 1;
  const payloads = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const upstreamUrl = new URL(ASHLEY_PRODUCTS_URL);

    for (const [key, value] of Object.entries(baseSearchParams)) {
      if (value !== undefined && value !== null && value !== '') {
        upstreamUrl.searchParams.set(key, String(value));
      }
    }

    if (options.paginate) {
      upstreamUrl.searchParams.set('page', String(page));
    }

    const upstreamResponse = await fetch(upstreamUrl, {
      method: 'GET',
      headers
    });

    const rawBody = await upstreamResponse.text();
    let payload;

    try {
      payload = rawBody ? JSON.parse(rawBody) : {};
    } catch {
      payload = { rawBody };
    }

    if (!upstreamResponse.ok) {
      const error = new Error('Ashley API request failed.');
      error.statusCode = upstreamResponse.status;
      error.details = payload;
      throw error;
    }

    payloads.push(payload);

    if (!options.paginate || extractProducts(payload).length < pageSize) {
      break;
    }
  }

  return payloads;
}

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

function normalizeSearchTerm(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function looksLikeSku(searchTerm) {
  return /^[a-z0-9-]{4,}$/i.test(searchTerm) && /\d/.test(searchTerm);
}

async function readAdminCatalog(event) {
  const blobCatalog = await readBlobCatalog(event);

  if (blobCatalog) {
    return blobCatalog;
  }

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

async function readBlobCatalog(event) {
  try {
    return await getBlob(event, 'cohens-elkton-admin', CATALOG_BLOB_KEY, { type: 'json' });
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
    hero: {
      slides: normalizeHeroSlides(source.hero?.slides)
    },
    categories
  };
}

function normalizeHeroSlides(slides) {
  if (!Array.isArray(slides)) {
    return defaultAdminCatalog.hero.slides;
  }

  const normalizedSlides = slides
    .map((slide) => ({
      image: String(slide?.image || '').trim(),
      alt: String(slide?.alt || 'Cohen\'s Furniture landing slide').trim(),
      enabled: slide?.enabled !== false
    }))
    .filter((slide) => slide.image);

  return normalizedSlides.length ? normalizedSlides : defaultAdminCatalog.hero.slides;
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

function filterBySearch(products, searchTerm) {
  if (!searchTerm) {
    return products;
  }

  const searchWords = searchTerm.split(/\s+/).filter(Boolean);

  return products.filter((product) => {
    const searchableText = productSearchText(product);
    return searchWords.every((word) => searchableText.includes(word));
  });
}

function productMatchesSubcategory(product, subcategory) {
  const searchableText = productSearchText(product);
  const multiPieceRules = {
    'bedroom-sets': { primary: ['bed'], secondary: ['dresser', 'mirror', 'chest', 'nightstand', 'storage bench'], setTerms: ['set', 'package', 'piece'] },
    'kids-bedroom-sets': { primary: ['bed'], secondary: ['dresser', 'mirror', 'chest', 'nightstand'], setTerms: ['set', 'package', 'piece'] },
    'dining-room-sets': { primary: ['table'], secondary: ['chair', 'bench', 'server', 'buffet'], setTerms: ['set', 'package', 'piece'] },
    'living-room-sets': { primary: ['sofa', 'sectional', 'loveseat', 'recliner'], secondary: ['loveseat', 'chair', 'recliner', 'ottoman'], setTerms: ['set', 'package', 'piece'] },
    'sofa-sets': { primary: ['sofa'], secondary: ['loveseat', 'chair', 'recliner'], setTerms: ['set', 'package', 'piece'] },
    'office-packages': { primary: ['desk', 'office'], secondary: ['chair', 'bookcase', 'file'], setTerms: ['set', 'package', 'piece'] }
  };

  const multiPieceRule = multiPieceRules[subcategory];
  if (multiPieceRule) {
    const hasPrimaryPiece = multiPieceRule.primary.some((term) => textIncludesTerm(searchableText, term));
    const hasCompanionPiece = multiPieceRule.secondary.some((term) => textIncludesTerm(searchableText, term));
    const hasSetLanguage = multiPieceRule.setTerms.some((term) => textIncludesTerm(searchableText, term));
    return hasPrimaryPiece && (hasCompanionPiece || hasSetLanguage);
  }

  const keywordsBySubcategory = {
    sofas: ['sofa'],
    loveseats: ['loveseat'],
    sectionals: ['sectional'],
    recliners: ['recliner'],
    'power-seating': ['power recliner', 'power reclining', 'power seating'],
    chairs: ['chair'],
    ottomans: ['ottoman'],
    chaises: ['chaise'],
    'sleeper-sofas': ['sleeper sofa', 'sofa sleeper'],
    futons: ['futon'],
    'tv-stands-media-centers': ['tv stand', 'media center', 'entertainment center'],
    'occasional-tables': ['coffee table', 'cocktail table', 'end table', 'side table', 'console table'],
    'coffee-end-table-sets': ['table set', 'coffee table set', 'cocktail table set', 'end table set'],
    'coffee-tables': ['coffee table', 'cocktail table'],
    'end-side-tables': ['end table', 'side table'],
    'console-tables': ['console table'],
    'living-room-storage': ['storage', 'cabinet', 'console'],
    'sleeper-sectionals': ['sleeper sectional'],
    'home-theater': ['home theater'],
    beds: ['bed'],
    headboards: ['headboard'],
    dressers: ['dresser'],
    'mirrored-dressers': ['dresser and mirror', 'dresser/mirror', 'mirrored dresser'],
    mirrors: ['mirror'],
    chests: ['chest'],
    nightstands: ['nightstand'],
    'media-chests': ['media chest'],
    armoires: ['armoire'],
    vanities: ['vanity'],
    'bedroom-benches': ['bedroom bench', 'bench'],
    'bedroom-chairs': ['bedroom chair', 'chair'],
    'bedroom-storage': ['bedroom storage', 'storage'],
    'lingerie-chests': ['lingerie chest'],
    'dining-tables': ['dining table', 'table'],
    'dining-chairs': ['dining chair', 'chair'],
    'dining-benches': ['dining bench', 'bench'],
    'bar-stools': ['bar stool', 'barstool'],
    'bar-furniture': ['bar furniture', 'bar table', 'bar cabinet'],
    'dining-room-storage': ['server', 'buffet', 'china cabinet', 'dining storage'],
    gaming: ['gaming'],
    desks: ['desk'],
    'office-chairs': ['office chair', 'desk chair'],
    bookcases: ['bookcase'],
    'office-storage': ['file cabinet', 'office storage', 'bookcase'],
    bedding: ['bedding', 'comforter', 'quilt', 'pillow'],
    'mattress-sets': ['mattress'],
    'mattress-by-size': ['mattress'],
    'mattress-by-type': ['mattress'],
    foundations: ['foundation', 'box spring'],
    'power-bases': ['power base', 'adjustable base'],
    'storage-and-organization': ['storage', 'basket', 'box', 'organizer'],
    'accent-furniture': ['accent'],
    rugs: ['rug'],
    lamps: ['lamp'],
    'bowls-trays': ['bowl', 'tray'],
    'candles-candle-holders': ['candle'],
    'canisters-jars': ['canister', 'jar'],
    'vases-bottles': ['vase', 'bottle'],
    sculptures: ['sculpture'],
    'wall-clocks': ['clock'],
    poufs: ['pouf'],
    'throw-pillows': ['throw pillow', 'pillow'],
    'blankets-and-throws': ['blanket', 'throw'],
    'wall-art': ['wall art'],
    lighting: ['lighting', 'lamp', 'pendant', 'chandelier'],
    'rug-and-pillow-set': ['rug and pillow', 'rug pillow'],
    'outdoor-seating': ['outdoor seating', 'patio seating', 'chair', 'sofa', 'sectional'],
    'outdoor-tables': ['outdoor table', 'patio table'],
    'outdoor-dining-sets': ['outdoor dining set', 'patio dining set'],
    'outdoor-dining-chairs': ['outdoor dining chair', 'patio chair'],
    'outdoor-dining-tables': ['outdoor dining table', 'patio table'],
    'outdoor-bar-furniture': ['outdoor bar', 'patio bar'],
    firepits: ['fire pit', 'firepit'],
    'kids-beds': ['bed'],
    'bunk-loft-beds': ['bunk bed', 'loft bed'],
    daybeds: ['daybed'],
    'kids-headboards': ['headboard'],
    'kids-mirrored-dressers': ['dresser and mirror', 'mirrored dresser'],
    'kids-chests': ['chest'],
    'kids-nightstands': ['nightstand'],
    'kids-desks': ['desk'],
    'kids-storage': ['storage']
  };

  const exclusionsBySubcategory = {
    beds: ['mirror', 'dresser', 'chest', 'nightstand', 'vanity', 'bench', 'foundation', 'mattress'],
    'kids-beds': ['mirror', 'dresser', 'chest', 'nightstand', 'vanity', 'bench', 'foundation', 'mattress'],
    headboards: ['bed with storage', 'dresser', 'mirror'],
    dressers: ['mirror only'],
    mirrors: ['dresser and mirror', 'mirrored dresser'],
    chests: ['mirror', 'dresser'],
    nightstands: ['mirror', 'dresser', 'chest'],
    sofas: ['loveseat', 'sectional', 'recliner', 'sleeper'],
    loveseats: ['sofa', 'sectional'],
    recliners: ['sofa', 'loveseat', 'sectional'],
    chairs: ['dining chair', 'office chair'],
    'dining-tables': ['chair', 'bench', 'stool'],
    'dining-chairs': ['table', 'bench', 'stool'],
    'bar-stools': ['table', 'chair set'],
    lamps: ['lamp table'],
    rugs: ['rug and pillow']
  };

  const exclusions = exclusionsBySubcategory[subcategory] || [];
  if (exclusions.some((keyword) => textIncludesTerm(searchableText, keyword))) {
    return false;
  }

  const keywords = keywordsBySubcategory[subcategory] || subcategory.split('-');
  return keywords.some((keyword) => textIncludesTerm(searchableText, keyword));
}

function textIncludesTerm(text, term) {
  return text.includes(String(term).toLowerCase());
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
    href: `/search?q=${encodeURIComponent(String(sku))}`,
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
