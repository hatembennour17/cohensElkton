const { getStore } = require('@netlify/blobs');

const CATALOG_KEY = 'elkton-catalog-config';

const defaultCatalog = {
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

const jsonResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    'content-type': 'application/json',
    'cache-control': 'no-store'
  },
  body: JSON.stringify(body)
});

exports.handler = async (event) => {
  const authError = validateAdmin(event);

  if (authError) {
    return authError;
  }

  try {
    if (event.httpMethod === 'GET') {
      return jsonResponse(200, {
        catalog: await readCatalog()
      });
    }

    if (event.httpMethod === 'PUT') {
      const payload = event.body ? JSON.parse(event.body) : {};
      const catalog = normalizeCatalog(payload.catalog);
      await writeCatalog(catalog);

      return jsonResponse(200, {
        catalog,
        saved: true
      });
    }

    return jsonResponse(405, {
      error: 'Method not allowed.'
    });
  } catch (error) {
    return jsonResponse(500, {
      error: 'Unable to process admin catalog.',
      message: error instanceof Error ? error.message : String(error)
    });
  }
};

function validateAdmin(event) {
  const expectedToken = process.env.ADMIN_TOKEN;

  if (!expectedToken) {
    return jsonResponse(500, {
      error: 'Admin API is not configured.',
      missing: ['ADMIN_TOKEN']
    });
  }

  const suppliedToken = event.headers?.['x-admin-token'] || event.headers?.['X-Admin-Token'];

  if (suppliedToken !== expectedToken) {
    return jsonResponse(401, {
      error: 'Unauthorized.'
    });
  }

  return null;
}

async function readCatalog() {
  const store = getStore('cohens-elkton-admin');
  const savedCatalog = await store.get(CATALOG_KEY, { type: 'json' });
  return normalizeCatalog(savedCatalog || defaultCatalog);
}

async function writeCatalog(catalog) {
  const store = getStore('cohens-elkton-admin');
  await store.setJSON(CATALOG_KEY, catalog);
}

function normalizeCatalog(catalog) {
  const source = catalog && typeof catalog === 'object' ? catalog : defaultCatalog;
  const sourceRules = source.priceRules || {};
  const categories = {};

  for (const [slug, defaultCategory] of Object.entries(defaultCatalog.categories)) {
    const sourceCategory = source.categories?.[slug] || {};
    categories[slug] = {
      markupPercent: normalizeNumber(sourceCategory.markupPercent, defaultCategory.markupPercent),
      products: Array.isArray(sourceCategory.products)
        ? sourceCategory.products.map(normalizeCatalogProduct).filter((product) => product.sku)
        : []
    };
  }

  return {
    priceRules: {
      defaultMarkupPercent: normalizeNumber(sourceRules.defaultMarkupPercent, 55),
      rounding: sourceRules.rounding === 'none' ? 'none' : 'ending-99'
    },
    categories
  };
}

function normalizeCatalogProduct(product) {
  return {
    sku: String(product?.sku || '').trim().toUpperCase(),
    enabled: product?.enabled !== false,
    fixedPrice: normalizeOptionalNumber(product?.fixedPrice),
    markupPercent: normalizeOptionalNumber(product?.markupPercent)
  };
}

function normalizeNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeOptionalNumber(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
