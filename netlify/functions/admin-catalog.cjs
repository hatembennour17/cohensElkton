const { getBlob, setJSONBlob } = require('./blob-store.cjs');

const CATALOG_BLOB_KEY = 'catalog';
const CATALOG_FILE_PATH = 'data/elkton-catalog.json';

const defaultCatalog = {
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
        catalog: await readCatalog(event)
      });
    }

    if (event.httpMethod === 'PUT') {
      const payload = event.body ? JSON.parse(event.body) : {};
      const catalog = normalizeCatalog(payload.catalog);
      await writeCatalog(event, catalog);

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

async function readCatalog(event) {
  const savedCatalog = await readBlobCatalog(event) || await readGitHubCatalog();
  return normalizeCatalog(savedCatalog || defaultCatalog);
}

async function writeCatalog(event, catalog) {
  await setJSONBlob(event, getCatalogStoreName(), CATALOG_BLOB_KEY, catalog);
}

async function readBlobCatalog(event) {
  try {
    return await getBlob(event, getCatalogStoreName(), CATALOG_BLOB_KEY, { type: 'json' });
  } catch {
    return null;
  }
}

function getCatalogStoreName() {
  return 'cohens-elkton-admin';
}

async function readGitHubCatalog() {
  const response = await fetch(gitHubContentsUrl({ includeRef: true }), {
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
}

async function writeGitHubCatalog(catalog) {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error('GITHUB_TOKEN is required to save the catalog.');
  }

  const existingFile = await getExistingGitHubFile();
  const body = {
    message: 'Update Elkton catalog config',
    content: Buffer.from(`${JSON.stringify(catalog, null, 2)}\n`, 'utf8').toString('base64'),
    branch: gitHubBranch()
  };

  if (existingFile?.sha) {
    body.sha = existingFile.sha;
  }

  const response = await fetch(gitHubContentsUrl({ includeRef: false }), {
    method: 'PUT',
    headers: gitHubHeaders(token),
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`GitHub catalog save failed with ${response.status}: ${details}`);
  }
}

async function getExistingGitHubFile() {
  const response = await fetch(gitHubContentsUrl({ includeRef: true }), {
    method: 'GET',
    headers: gitHubHeaders(process.env.GITHUB_TOKEN)
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`GitHub catalog lookup failed with ${response.status}`);
  }

  return response.json();
}

function gitHubContentsUrl(options = { includeRef: true }) {
  const owner = process.env.GITHUB_OWNER || 'hatembennour17';
  const repo = process.env.GITHUB_REPO || 'cohensElkton';
  const path = encodeURIComponent(CATALOG_FILE_PATH).replace(/%2F/g, '/');
  const baseUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  return options.includeRef ? `${baseUrl}?ref=${encodeURIComponent(gitHubBranch())}` : baseUrl;
}

function gitHubBranch() {
  return process.env.GITHUB_BRANCH || 'master';
}

function gitHubHeaders(token = process.env.GITHUB_TOKEN) {
  const headers = {
    accept: 'application/vnd.github+json',
    'content-type': 'application/json',
    'user-agent': 'cohens-elkton-admin'
  };

  if (token) {
    headers.authorization = `Bearer ${token}`;
    headers['x-github-api-version'] = '2022-11-28';
  }

  return headers;
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
    hero: {
      slides: normalizeHeroSlides(source.hero?.slides)
    },
    categories
  };
}

function normalizeHeroSlides(slides) {
  if (!Array.isArray(slides)) {
    return defaultCatalog.hero.slides;
  }

  const normalizedSlides = slides
    .map((slide) => ({
      image: String(slide?.image || '').trim(),
      alt: String(slide?.alt || 'Cohen\'s Furniture landing slide').trim(),
      enabled: slide?.enabled !== false
    }))
    .filter((slide) => slide.image);

  return normalizedSlides.length ? normalizedSlides : defaultCatalog.hero.slides;
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
