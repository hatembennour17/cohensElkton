const CATALOG_FILE_PATH = 'data/elkton-catalog.json';

const defaultHero = {
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
};

const jsonResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    'content-type': 'application/json',
    'cache-control': 'no-store'
  },
  body: JSON.stringify(body)
});

exports.handler = async () => {
  try {
    const catalog = await readGitHubCatalog();

    return jsonResponse(200, {
      hero: {
        slides: normalizeHeroSlides(catalog?.hero?.slides)
      }
    });
  } catch (error) {
    return jsonResponse(200, {
      hero: defaultHero,
      warning: error instanceof Error ? error.message : String(error)
    });
  }
};

async function readGitHubCatalog() {
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
}

function gitHubContentsUrl() {
  const owner = process.env.GITHUB_OWNER || 'hatembennour17';
  const repo = process.env.GITHUB_REPO || 'cohensElkton';
  const path = encodeURIComponent(CATALOG_FILE_PATH).replace(/%2F/g, '/');
  return `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${encodeURIComponent(gitHubBranch())}`;
}

function gitHubBranch() {
  return process.env.GITHUB_BRANCH || 'master';
}

function gitHubHeaders() {
  const headers = {
    accept: 'application/vnd.github+json',
    'content-type': 'application/json',
    'user-agent': 'cohens-elkton-storefront'
  };

  if (process.env.GITHUB_TOKEN) {
    headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    headers['x-github-api-version'] = '2022-11-28';
  }

  return headers;
}

function normalizeHeroSlides(slides) {
  if (!Array.isArray(slides)) {
    return defaultHero.slides;
  }

  const normalizedSlides = slides
    .map((slide) => ({
      image: String(slide?.image || '').trim(),
      alt: String(slide?.alt || 'Cohen\'s Furniture landing slide').trim(),
      enabled: slide?.enabled !== false
    }))
    .filter((slide) => slide.image);

  return normalizedSlides.length ? normalizedSlides : defaultHero.slides;
}
