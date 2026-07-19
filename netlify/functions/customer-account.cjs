const crypto = require('crypto');
const { getBlob, setJSONBlob } = require('./blob-store.cjs');

const ACCOUNT_STORE = 'cohens-elkton-customers';
const SESSION_STORE = 'cohens-elkton-customer-sessions';
const SESSION_DAYS = 30;

const jsonResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    'content-type': 'application/json',
    'cache-control': 'no-store'
  },
  body: JSON.stringify(body)
});

exports.handler = async (event) => {
  try {
    if (event.httpMethod === 'GET') {
      const session = await readSessionAccount(event);

      if (!session) {
        return jsonResponse(401, { error: 'Please sign in to view your account wishlist.' });
      }

      return jsonResponse(200, publicAccountPayload(session.account, session.token));
    }

    if (event.httpMethod === 'POST') {
      const payload = parseBody(event);
      const action = String(payload.action || '').toLowerCase();

      if (action === 'register') {
        return registerCustomer(event, payload);
      }

      if (action === 'login') {
        return loginCustomer(event, payload);
      }

      if (action === 'logout') {
        return jsonResponse(200, { signedOut: true });
      }

      return jsonResponse(400, { error: 'Unknown account action.' });
    }

    if (event.httpMethod === 'PUT') {
      const session = await readSessionAccount(event);

      if (!session) {
        return jsonResponse(401, { error: 'Please sign in before saving wishlist changes.' });
      }

      const payload = parseBody(event);
      session.account.wishlist = normalizeWishlist(payload.wishlist);
      session.account.updatedAt = new Date().toISOString();
      await writeAccount(event, session.account);

      return jsonResponse(200, publicAccountPayload(session.account, session.token));
    }

    return jsonResponse(405, { error: 'Method not allowed.' });
  } catch (error) {
    return jsonResponse(500, {
      error: 'Unable to process customer account.',
      message: error instanceof Error ? error.message : String(error)
    });
  }
};

async function registerCustomer(event, payload) {
  const email = normalizeEmail(payload.email);
  const password = String(payload.password || '');
  const name = String(payload.name || '').trim();

  if (!email || !isValidEmail(email)) {
    return jsonResponse(400, { error: 'Enter a valid email address.' });
  }

  if (password.length < 8) {
    return jsonResponse(400, { error: 'Password must be at least 8 characters.' });
  }

  const existingAccount = await readAccount(event, email);

  if (existingAccount) {
    return jsonResponse(409, { error: 'An account already exists for this email. Please sign in.' });
  }

  const now = new Date().toISOString();
  const account = {
    id: accountKey(email),
    email,
    name,
    password: hashPassword(password),
    wishlist: normalizeWishlist(payload.wishlist),
    createdAt: now,
    updatedAt: now
  };

  await writeAccount(event, account);
  const token = await createSession(event, account);

  return jsonResponse(200, publicAccountPayload(account, token));
}

async function loginCustomer(event, payload) {
  const email = normalizeEmail(payload.email);
  const password = String(payload.password || '');
  const account = await readAccount(event, email);

  if (!account || !verifyPassword(password, account.password)) {
    return jsonResponse(401, { error: 'Email or password is incorrect.' });
  }

  account.wishlist = mergeWishlists(account.wishlist, payload.wishlist);
  account.updatedAt = new Date().toISOString();
  await writeAccount(event, account);
  const token = await createSession(event, account);

  return jsonResponse(200, publicAccountPayload(account, token));
}

async function readSessionAccount(event) {
  const token = bearerToken(event);

  if (!token) {
    return null;
  }

  const session = await getBlob(event, SESSION_STORE, sessionKey(token), { type: 'json' });

  if (!session || Date.parse(session.expiresAt) <= Date.now()) {
    return null;
  }

  const account = await readAccount(event, session.email);
  return account ? { account, token } : null;
}

async function createSession(event, account) {
  const token = crypto.randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  await setJSONBlob(event, SESSION_STORE, sessionKey(token), {
    email: account.email,
    expiresAt,
    createdAt: new Date().toISOString()
  });
  return token;
}

async function readAccount(event, email) {
  if (!email) {
    return null;
  }

  return getBlob(event, ACCOUNT_STORE, accountKey(email), { type: 'json' });
}

async function writeAccount(event, account) {
  await setJSONBlob(event, ACCOUNT_STORE, account.id, account);
}

function publicAccountPayload(account, token) {
  return {
    token,
    account: {
      email: account.email,
      name: account.name || '',
      wishlist: normalizeWishlist(account.wishlist)
    }
  };
}

function parseBody(event) {
  return event.body ? JSON.parse(event.body) : {};
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function accountKey(email) {
  return `account-${crypto.createHash('sha256').update(email).digest('hex')}`;
}

function sessionKey(token) {
  return `session-${crypto.createHash('sha256').update(token).digest('hex')}`;
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('base64url');
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 32, 'sha256').toString('base64url');
  return `pbkdf2_sha256$120000$${salt}$${hash}`;
}

function verifyPassword(password, storedPassword) {
  const parts = String(storedPassword || '').split('$');

  if (parts.length !== 4 || parts[0] !== 'pbkdf2_sha256') {
    return false;
  }

  const iterations = Number(parts[1]);
  const salt = parts[2];
  const expected = parts[3];
  const actual = crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256').toString('base64url');

  return crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

function bearerToken(event) {
  const header = event.headers?.authorization || event.headers?.Authorization || '';
  const match = String(header).match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
}

function normalizeWishlist(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set();
  const products = [];

  for (const item of value) {
    const product = normalizeProduct(item);

    if (!product || seen.has(product.sku)) {
      continue;
    }

    seen.add(product.sku);
    products.push(product);
  }

  return products.slice(0, 200);
}

function mergeWishlists(accountWishlist, incomingWishlist) {
  return normalizeWishlist([...(accountWishlist || []), ...(incomingWishlist || [])]);
}

function normalizeProduct(item) {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const sku = String(item.sku || '').trim();
  const name = String(item.name || '').trim();

  if (!sku || !name) {
    return null;
  }

  return {
    sku,
    name,
    image: String(item.image || ''),
    images: Array.isArray(item.images) ? item.images.slice(0, 8).map(String) : undefined,
    spinImages: Array.isArray(item.spinImages) ? item.spinImages.slice(0, 16).map(String) : undefined,
    modelId: item.modelId ? String(item.modelId) : undefined,
    unitPrice: Number(item.unitPrice) || 0,
    href: String(item.href || `/product/${encodeURIComponent(sku)}`),
    kicker: item.kicker ? String(item.kicker) : undefined,
    brand: item.brand ? String(item.brand) : undefined,
    description: item.description ? String(item.description) : undefined,
    details: Array.isArray(item.details)
      ? item.details.slice(0, 20).map((detail) => ({
          label: String(detail.label || ''),
          value: String(detail.value || '')
        }))
      : undefined
  };
}
