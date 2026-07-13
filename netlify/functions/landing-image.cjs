const ASSET_DIRECTORY = 'src/assets/landing';

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

    const assetPath = `${ASSET_DIRECTORY}/${Date.now()}-${fileName}`;
    await writeGitHubFile(assetPath, contentBase64);

    return jsonResponse(200, {
      imageUrl: `/assets/landing/${assetPath.split('/').pop()}`,
      path: assetPath
    });
  } catch (error) {
    return jsonResponse(500, {
      error: 'Unable to upload landing image.',
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

  if (!process.env.GITHUB_TOKEN) {
    return jsonResponse(500, {
      error: 'GITHUB_TOKEN is required to upload landing images.'
    });
  }

  return null;
}

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

async function writeGitHubFile(path, contentBase64) {
  const body = {
    message: `Upload Elkton landing image ${path.split('/').pop()}`,
    content: contentBase64,
    branch: gitHubBranch()
  };

  const response = await fetch(gitHubContentsUrl(path), {
    method: 'PUT',
    headers: gitHubHeaders(),
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`GitHub image upload failed with ${response.status}: ${details}`);
  }
}

function gitHubContentsUrl(path) {
  const owner = process.env.GITHUB_OWNER || 'hatembennour17';
  const repo = process.env.GITHUB_REPO || 'cohensElkton';
  const encodedPath = encodeURIComponent(path).replace(/%2F/g, '/');
  return `https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}`;
}

function gitHubBranch() {
  return process.env.GITHUB_BRANCH || 'master';
}

function gitHubHeaders() {
  return {
    accept: 'application/vnd.github+json',
    authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    'content-type': 'application/json',
    'user-agent': 'cohens-elkton-admin',
    'x-github-api-version': '2022-11-28'
  };
}
