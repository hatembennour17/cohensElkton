# Cohen's Furniture Elkton

Angular storefront for the Elkton Cohen's Furniture location.

## Local Development

```powershell
npm install
npm start
```

## Ashley Product Syndication API

Ashley API credentials must stay server-side. Configure these as Netlify environment variables:

```text
ASHLEY_CLIENT_ID
ASHLEY_CLIENT_ID_HEADER
ASHLEY_USERNAME
ASHLEY_PASSWORD
ASHLEY_CUSTOMER
ASHLEY_SHIPTO
```

`ASHLEY_CLIENT_ID_HEADER` defaults to `client_id` if omitted. If Ashley's portal documentation shows a different header name for the client ID, set that exact header name in Netlify.

The site calls `/.netlify/functions/ashley-products`, which privately calls Ashley's Product Syndication API and returns normalized product data to the browser.
