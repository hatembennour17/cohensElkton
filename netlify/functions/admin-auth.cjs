const jsonResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    'content-type': 'application/json',
    'cache-control': 'no-store'
  },
  body: JSON.stringify(body)
});

function validateAdmin(event) {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  const expectedToken = process.env.ADMIN_TOKEN;
  const suppliedUsername = header(event, 'x-admin-username');
  const suppliedPassword = header(event, 'x-admin-password');
  const suppliedToken = header(event, 'x-admin-token');

  if (expectedUsername && expectedPassword) {
    if (suppliedUsername === expectedUsername && suppliedPassword === expectedPassword) {
      return null;
    }

    return jsonResponse(401, {
      error: 'Unauthorized.'
    });
  }

  if (expectedToken) {
    if ((suppliedUsername === 'admin' && suppliedPassword === expectedToken) || suppliedToken === expectedToken) {
      return null;
    }

    return jsonResponse(401, {
      error: 'Unauthorized.'
    });
  }

  return jsonResponse(500, {
    error: 'Admin API is not configured.',
    missing: ['ADMIN_USERNAME', 'ADMIN_PASSWORD']
  });
}

function header(event, name) {
  const headers = event.headers || {};
  return headers[name] || headers[name.toLowerCase()] || headers[name.toUpperCase()] || '';
}

module.exports = {
  jsonResponse,
  validateAdmin
};
