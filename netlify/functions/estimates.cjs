const { randomUUID } = require('node:crypto');
const { getBlob, setJSONBlob } = require('./blob-store.cjs');
const { jsonResponse, validateAdmin } = require('./admin-auth.cjs');

const ESTIMATE_STORE = 'cohens-elkton-estimates';
const ESTIMATES_KEY = 'requests';
const MAX_ESTIMATES = 1000;
const VALID_STATUSES = new Set(['new', 'contacted', 'quoted', 'closed']);

exports.handler = async (event) => {
  try {
    if (event.httpMethod === 'GET') {
      const authError = validateAdmin(event);
      if (authError) return authError;

      const estimates = await readEstimates(event);
      return jsonResponse(200, { estimates: estimates.slice().reverse() });
    }

    if (event.httpMethod === 'POST') {
      const estimate = normalizeEstimate(parseBody(event));
      if (!estimate.customer.email || !estimate.customer.phone || !estimate.items.length) {
        return jsonResponse(400, { error: 'Customer email, phone, and at least one item are required.' });
      }

      const estimates = await readEstimates(event);
      const existingIndex = estimates.findIndex((item) => item.id === estimate.id);
      if (existingIndex >= 0) estimates[existingIndex] = estimate;
      else estimates.push(estimate);

      await setJSONBlob(event, ESTIMATE_STORE, ESTIMATES_KEY, estimates.slice(-MAX_ESTIMATES));
      return jsonResponse(201, { estimate });
    }

    if (event.httpMethod === 'PATCH') {
      const authError = validateAdmin(event);
      if (authError) return authError;

      const payload = parseBody(event);
      const id = String(payload?.id || '').trim();
      const status = String(payload?.status || '').trim().toLowerCase();
      if (!id || !VALID_STATUSES.has(status)) {
        return jsonResponse(400, { error: 'A valid estimate ID and status are required.' });
      }

      const estimates = await readEstimates(event);
      const index = estimates.findIndex((item) => item.id === id);
      if (index < 0) return jsonResponse(404, { error: 'Estimate not found.' });

      estimates[index] = { ...estimates[index], status, updatedAt: new Date().toISOString() };
      await setJSONBlob(event, ESTIMATE_STORE, ESTIMATES_KEY, estimates);
      return jsonResponse(200, { estimate: estimates[index] });
    }

    return jsonResponse(405, { error: 'Method not allowed.' });
  } catch (error) {
    return jsonResponse(500, {
      error: 'Unable to process estimates.',
      message: error instanceof Error ? error.message : String(error)
    });
  }
};

async function readEstimates(event) {
  try {
    const estimates = await getBlob(event, ESTIMATE_STORE, ESTIMATES_KEY, { type: 'json' });
    return Array.isArray(estimates) ? estimates : [];
  } catch {
    return [];
  }
}

function parseBody(event) {
  if (!event.body) return {};
  try {
    return JSON.parse(event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body);
  } catch {
    return {};
  }
}

function normalizeEstimate(payload = {}) {
  const now = new Date().toISOString();
  const customer = payload.customer || {};
  const address = payload.address || {};
  const items = Array.isArray(payload.items) ? payload.items : [];

  return {
    id: String(payload.id || randomUUID()).slice(0, 80),
    createdAt: normalizeDate(payload.createdAt) || now,
    updatedAt: now,
    status: VALID_STATUSES.has(payload.status) ? payload.status : 'new',
    fulfillment: payload.fulfillment === 'pickup' ? 'pickup' : 'delivery',
    storeLocation: String(payload.storeLocation || '').slice(0, 240),
    customer: {
      firstName: String(customer.firstName || '').trim().slice(0, 100),
      lastName: String(customer.lastName || '').trim().slice(0, 100),
      email: String(customer.email || '').trim().toLowerCase().slice(0, 200),
      phone: String(customer.phone || '').trim().slice(0, 50)
    },
    address: {
      street: String(address.street || '').trim().slice(0, 200),
      city: String(address.city || '').trim().slice(0, 100),
      state: String(address.state || '').trim().toUpperCase().slice(0, 20),
      zip: String(address.zip || '').trim().slice(0, 20)
    },
    subtotal: normalizeMoney(payload.subtotal),
    items: items.slice(0, 100).map((item) => ({
      sku: String(item.sku || '').trim().slice(0, 80),
      name: String(item.name || '').trim().slice(0, 240),
      quantity: Math.max(1, Math.round(Number(item.quantity) || 1)),
      unitPrice: normalizeMoney(item.unitPrice),
      image: String(item.image || '').slice(0, 1000)
    }))
  };
}

function normalizeMoney(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed * 100) / 100) : 0;
}

function normalizeDate(value) {
  const parsed = Date.parse(String(value || ''));
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : '';
}
