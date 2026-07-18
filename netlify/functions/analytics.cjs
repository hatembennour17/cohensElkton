const { getBlob, setJSONBlob } = require('./blob-store.cjs');
const { randomUUID } = require('node:crypto');
const { jsonResponse, validateAdmin } = require('./admin-auth.cjs');

const ANALYTICS_STORE = 'cohens-elkton-analytics';
const VISITS_KEY = 'visits';
const MAX_VISITS = 1500;

exports.handler = async (event) => {
  try {
    if (event.httpMethod === 'GET') {
      const authError = validateAdmin(event);

      if (authError) {
        return authError;
      }

      const visits = await readVisits(event);
      return jsonResponse(200, buildSummary(visits));
    }

    if (event.httpMethod === 'POST') {
      const payload = parseBody(event);

      if (!payload || payload.path === '/admin') {
        return jsonResponse(200, { recorded: false });
      }

      const visits = await readVisits(event);
      const nextVisits = upsertVisit(visits, normalizeVisit(payload, event));
      await setJSONBlob(event, ANALYTICS_STORE, VISITS_KEY, nextVisits.slice(-MAX_VISITS));

      return jsonResponse(200, { recorded: true });
    }

    return jsonResponse(405, { error: 'Method not allowed.' });
  } catch (error) {
    return jsonResponse(500, {
      error: 'Unable to process analytics.',
      message: error instanceof Error ? error.message : String(error)
    });
  }
};

async function readVisits(event) {
  try {
    const visits = await getBlob(event, ANALYTICS_STORE, VISITS_KEY, { type: 'json' });
    return Array.isArray(visits) ? visits : [];
  } catch {
    return [];
  }
}

function parseBody(event) {
  if (!event.body) {
    return null;
  }

  try {
    return JSON.parse(event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body);
  } catch {
    return null;
  }
}

function normalizeVisit(payload, event) {
  const headers = event.headers || {};
  const geo = parseGeo(headers['x-nf-geo'] || headers['X-Nf-Geo']);
  const now = new Date().toISOString();
  const userAgent = String(headers['user-agent'] || payload.userAgent || '').slice(0, 300);

  return {
    id: String(payload.id || randomUUID()),
    sessionId: String(payload.sessionId || randomUUID()),
    event: payload.event === 'engagement' ? 'engagement' : 'pageview',
    path: normalizePath(payload.path),
    fullUrl: String(payload.fullUrl || '').slice(0, 500),
    referrer: normalizeReferrer(payload.referrer || headers.referer || headers.referrer),
    startedAt: normalizeDate(payload.startedAt) || now,
    lastSeenAt: now,
    durationSeconds: normalizeDuration(payload.durationSeconds),
    title: String(payload.title || '').slice(0, 160),
    language: String(payload.language || headers['accept-language'] || '').slice(0, 120),
    timezone: String(payload.timezone || '').slice(0, 80),
    screen: String(payload.screen || '').slice(0, 60),
    userAgent,
    device: inferDevice(userAgent),
    browser: inferBrowser(userAgent),
    location: {
      city: String(geo.city || headers['x-nf-client-connection-city'] || '').slice(0, 80),
      region: String(geo.subdivision?.name || geo.region || headers['x-nf-client-connection-region'] || '').slice(0, 80),
      country: String(geo.country?.name || geo.country || headers['x-nf-client-connection-country'] || headers['cf-ipcountry'] || '').slice(0, 80),
      timezone: String(geo.timezone || '').slice(0, 80)
    },
    ipPrefix: maskIp(headers['x-nf-client-connection-ip'] || headers['client-ip'] || headers['x-forwarded-for'])
  };
}

function upsertVisit(visits, visit) {
  if (visit.event !== 'engagement') {
    return [...visits, visit];
  }

  const index = visits.findIndex((item) => item.id === visit.id);

  if (index < 0) {
    return [...visits, visit];
  }

  const nextVisits = [...visits];
  nextVisits[index] = {
    ...nextVisits[index],
    lastSeenAt: visit.lastSeenAt,
    durationSeconds: Math.max(Number(nextVisits[index].durationSeconds || 0), visit.durationSeconds)
  };
  return nextVisits;
}

function buildSummary(visits) {
  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const sessions = new Set(visits.map((visit) => visit.sessionId).filter(Boolean));
  const visitsToday = visits.filter((visit) => Date.parse(visit.startedAt) >= dayAgo);
  const visitsThisWeek = visits.filter((visit) => Date.parse(visit.startedAt) >= weekAgo);
  const durations = visits.map((visit) => Number(visit.durationSeconds || 0)).filter((value) => value > 0);

  return {
    totals: {
      visits: visits.length,
      uniqueSessions: sessions.size,
      visitsToday: visitsToday.length,
      visitsThisWeek: visitsThisWeek.length,
      averageDurationSeconds: durations.length ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length) : 0
    },
    topPages: topCounts(visits.map((visit) => visit.path), 8),
    topReferrers: topCounts(visits.map((visit) => visit.referrer || 'Direct / typed'), 8),
    topLocations: topCounts(visits.map(locationLabel), 8),
    devices: topCounts(visits.map((visit) => visit.device || 'Unknown'), 6),
    browsers: topCounts(visits.map((visit) => visit.browser || 'Unknown'), 6),
    recentVisits: visits
      .slice(-60)
      .reverse()
      .map((visit) => ({
        id: visit.id,
        path: visit.path,
        referrer: visit.referrer || 'Direct / typed',
        startedAt: visit.startedAt,
        lastSeenAt: visit.lastSeenAt,
        durationSeconds: Number(visit.durationSeconds || 0),
        location: locationLabel(visit),
        device: visit.device,
        browser: visit.browser,
        screen: visit.screen
      }))
  };
}

function topCounts(values, limit) {
  const counts = new Map();

  for (const value of values) {
    const key = value || 'Unknown';
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label))
    .slice(0, limit);
}

function locationLabel(visit) {
  const location = visit.location || {};
  return [location.city, location.region, location.country].filter(Boolean).join(', ') || 'Unknown';
}

function normalizePath(path) {
  const value = String(path || '/').trim();
  return value.startsWith('/') ? value.slice(0, 160) : `/${value.slice(0, 159)}`;
}

function normalizeReferrer(referrer) {
  const value = String(referrer || '').trim();

  if (!value) {
    return '';
  }

  try {
    const url = new URL(value);
    return `${url.hostname}${url.pathname === '/' ? '' : url.pathname}`.slice(0, 180);
  } catch {
    return value.slice(0, 180);
  }
}

function normalizeDate(value) {
  const parsed = Date.parse(String(value || ''));
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : '';
}

function normalizeDuration(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(Math.max(Math.round(parsed), 0), 24 * 60 * 60) : 0;
}

function parseGeo(value) {
  try {
    return value ? JSON.parse(value) : {};
  } catch {
    return {};
  }
}

function maskIp(value) {
  const ip = String(value || '').split(',')[0].trim();

  if (!ip) {
    return '';
  }

  if (ip.includes(':')) {
    return `${ip.split(':').slice(0, 3).join(':')}::`;
  }

  return ip.split('.').slice(0, 3).join('.') + '.0';
}

function inferDevice(userAgent) {
  const value = userAgent.toLowerCase();

  if (/ipad|tablet/.test(value)) {
    return 'Tablet';
  }

  if (/mobi|iphone|android/.test(value)) {
    return 'Mobile';
  }

  return 'Desktop';
}

function inferBrowser(userAgent) {
  if (/edg\//i.test(userAgent)) {
    return 'Edge';
  }

  if (/chrome|crios/i.test(userAgent)) {
    return 'Chrome';
  }

  if (/safari/i.test(userAgent) && !/chrome|crios/i.test(userAgent)) {
    return 'Safari';
  }

  if (/firefox/i.test(userAgent)) {
    return 'Firefox';
  }

  return 'Other';
}
