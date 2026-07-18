const fs = require('fs');
const path = require('path');

const outputRoot = path.join(__dirname, '..', 'dist', 'furniture-storefront', 'browser');
const indexPath = path.join(outputRoot, 'index.html');

const pages = [
  {
    path: '/',
    title: "Cohen's Furniture in Elkton, MD",
    description: "Shop Cohen's Furniture in Elkton for discount living room, bedroom, dining room, mattress, office, outdoor, and home decor furniture in Elkton, Maryland.",
    h1: "Cohen's Furniture in Elkton",
    body: [
      "Cohen's Furniture in Elkton helps Maryland shoppers browse living room furniture, bedroom furniture, dining room pieces, mattresses, office furniture, home decor, outdoor furniture, and clearance options through the Elkton showroom.",
      "Visit or contact the local team at 901 E. Pulaski Highway, Elkton, MD 21921 or call (443) 406-3575 for availability, delivery, pickup, financing, and order questions."
    ]
  },
  {
    path: '/living-room-furniture-elkton-md',
    title: "Living Room Furniture in Elkton, MD | Cohen's Furniture",
    description: "Shop sofas, sectionals, recliners, loveseats, tables, and living room furniture through Cohen's Furniture in Elkton, Maryland.",
    h1: 'Living Room Furniture for Elkton and Cecil County Homes',
    body: [
      "Cohen's Furniture in Elkton helps Maryland shoppers compare sofas, sectionals, recliners, loveseats, sofa sets, tables, TV stands, home theater seating, and living room storage.",
      "This local page keeps shoppers connected to the Elkton showroom for product questions, delivery timing, pickup options, and order requests."
    ],
    faqs: [
      ['Can I buy living room furniture through the Elkton store?', 'Yes. Add items to the cart and submit an Elkton order request, or call the showroom for availability.'],
      ['Does the Elkton location handle delivery?', 'Delivery and pickup details are confirmed by the Elkton team after the order request is reviewed.']
    ]
  },
  {
    path: '/bedroom-furniture-elkton-md',
    title: "Bedroom Furniture in Elkton, MD | Cohen's Furniture",
    description: "Find bedroom sets, beds, dressers, mirrors, chests, nightstands, headboards, and storage pieces at Cohen's Furniture in Elkton.",
    h1: 'Bedroom Furniture, Beds, Dressers, and Nightstands in Elkton',
    body: [
      "Shop bedroom sets, beds, dressers, mirrors, chests, nightstands, headboards, vanities, benches, and youth bedroom furniture through Cohen's Furniture in Elkton.",
      "The Elkton showroom can help confirm matching pieces, bed sizes, availability, delivery timing, and local order details for Cecil County customers."
    ],
    faqs: [
      ['Can I request a full bedroom set?', 'Yes. Add the available items to the cart or contact the Elkton showroom to confirm matching pieces.'],
      ['Can the store help with bed sizes?', 'Yes. The Elkton team can help compare twin, full, queen, and king options when available.']
    ]
  },
  {
    path: '/dining-room-furniture-elkton-md',
    title: "Dining Room Furniture in Elkton, MD | Cohen's Furniture",
    description: "Browse dining room sets, tables, chairs, benches, servers, bar stools, and dining storage through Cohen's Furniture in Elkton.",
    h1: 'Dining Room Furniture for Elkton Homes',
    body: [
      "Cohen's Furniture in Elkton gives local shoppers a focused place to compare dining room sets, dining tables, chairs, benches, bar stools, servers, buffets, and dining storage.",
      "The Elkton team can help with table shape, seating count, counter-height options, matching storage, delivery coordination, and pickup questions."
    ],
    faqs: [
      ['Can I order dining sets from the Elkton location?', 'Yes. Submit an order request and the Elkton team will review availability and next steps.'],
      ['Do dining chairs and tables come separately?', 'Some items are sold separately and some are part of sets. The Elkton store can confirm the exact package.']
    ]
  },
  {
    path: '/mattresses-elkton-md',
    title: "Mattresses in Elkton, MD | Cohen's Furniture",
    description: "Shop mattress sets, foundations, bedding, and bedroom comfort products with local help from Cohen's Furniture in Elkton.",
    h1: 'Mattresses and Bedroom Comfort Options in Elkton',
    body: [
      "Cohen's Furniture in Elkton helps Maryland shoppers compare mattress sizes, foundations, bedding options, and bedroom furniture that works with a new mattress.",
      "The local showroom can review availability, delivery timing, financing questions, and whether a foundation or adjustable base is needed."
    ],
    faqs: [
      ['Can I finance a mattress purchase?', 'Financing and leasing options may be available. Review the financing page or call the Elkton showroom.'],
      ['Does Elkton handle mattress delivery?', 'Delivery details are confirmed by the Elkton store after the order request is reviewed.']
    ]
  },
  {
    path: '/sectionals-elkton-md',
    title: "Sectional Sofas in Elkton, MD | Cohen's Furniture",
    description: "Compare sectional sofas, chaise sectionals, sleeper sectionals, and reclining sectionals available through Cohen's Furniture in Elkton.",
    h1: 'Sectional Sofas for Elkton, Maryland Living Rooms',
    body: [
      "Cohen's Furniture in Elkton helps customers compare chaise orientation, reclining features, sleeper options, fabric, color, and room measurements for sectional sofas.",
      "Browse sectionals online and submit an Elkton order request for local follow-up on availability, delivery timing, and matching pieces."
    ],
    faqs: [
      ['Can the store help confirm left-facing or right-facing pieces?', 'Yes. Call the Elkton showroom before ordering if orientation matters for your room.'],
      ['Are sleeper sectionals available?', 'Availability changes, but sleeper and reclining sectionals can be checked through the Elkton catalog.']
    ]
  },
  {
    path: '/furniture-financing-elkton-md',
    title: "Furniture Financing in Elkton, MD | Cohen's Furniture",
    description: "Review furniture financing and leasing options for Cohen's Furniture in Elkton, including Snap Finance and Progressive Leasing information.",
    h1: 'Furniture Financing and Leasing Options in Elkton',
    body: [
      "Cohen's Furniture in Elkton can help local shoppers review financing and leasing options for living room, bedroom, dining room, mattress, office, and home decor purchases.",
      "Available providers may include Snap Finance and Progressive Leasing, depending on approval, purchase amount, and program terms. Approval is not guaranteed, and lease-to-own programs may cost more than the cash price."
    ],
    faqs: [
      ['Can I apply for furniture financing before visiting the Elkton store?', 'Yes. Review the financing page for current provider details or call the Elkton showroom for help.'],
      ['Does financing apply to mattresses and bedroom furniture?', 'Financing and leasing options may apply to eligible purchases, subject to provider approval and terms.']
    ]
  },
  {
    path: '/about',
    title: "About Cohen's Furniture in Elkton, MD",
    description: "Learn about Cohen's Furniture in Elkton, the Maryland showroom serving Elkton and Cecil County furniture shoppers.",
    h1: "About Cohen's Furniture in Elkton, Maryland",
    body: [
      "This website is built for customers shopping through Cohen's Furniture in Elkton. The goal is to keep product browsing, cart requests, delivery questions, and store contact focused on the Elkton showroom.",
      "Customers can browse local catalog pages and submit an Elkton order request for follow-up on availability, pricing, delivery, pickup, and financing questions."
    ]
  },
  {
    path: '/contact',
    title: "Contact Cohen's Furniture in Elkton, MD",
    description: "Contact Cohen's Furniture in Elkton at 901 E. Pulaski Highway, Elkton, MD 21921 or call (443) 406-3575.",
    h1: "Contact Cohen's Furniture in Elkton",
    body: [
      "Call Cohen's Furniture in Elkton at (443) 406-3575 or visit 901 E. Pulaski Highway, Elkton, MD 21921 for product availability, order requests, financing, delivery, and pickup questions."
    ]
  }
];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function localBusinessSchema(page) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FurnitureStore',
    name: "Cohen's Furniture",
    url: 'https://cohensfurnituremaryland.com/',
    telephone: '(443) 406-3575',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '901 E. Pulaski Highway',
      addressLocality: 'Elkton',
      addressRegion: 'MD',
      postalCode: '21921',
      addressCountry: 'US'
    },
    areaServed: ['Elkton MD', 'Cecil County MD', 'North East MD', 'Perryville MD', 'Chesapeake City MD'],
    department: page.path === '/' ? undefined : [{ '@type': 'FurnitureStore', name: page.h1, url: `https://cohensfurnituremaryland.com${page.path}` }]
  };
}

function pageHtml(page, shell) {
  const url = `https://cohensfurnituremaryland.com${page.path === '/' ? '/' : page.path}`;
  const faqHtml = (page.faqs || [])
    .map(([question, answer]) => `<details><summary>${escapeHtml(question)}</summary><p>${escapeHtml(answer)}</p></details>`)
    .join('');
  const content = `
    <section class="pre-rendered-seo" aria-label="Cohen's Furniture Elkton page content">
      <h1>${escapeHtml(page.h1)}</h1>
      ${page.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
      <p><strong>Address:</strong> 901 E. Pulaski Highway, Elkton, MD 21921</p>
      <p><strong>Phone:</strong> <a href="tel:+14434063575">(443) 406-3575</a></p>
      ${faqHtml ? `<h2>Frequently Asked Questions</h2>${faqHtml}` : ''}
    </section>`;

  let html = shell
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(page.title)}</title>`)
    .replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${escapeHtml(page.description)}">`)
    .replace(/<link rel="canonical" href=".*?">/, `<link rel="canonical" href="${url}">`)
    .replace(/<meta property="og:title" content=".*?">/, `<meta property="og:title" content="${escapeHtml(page.title)}">`)
    .replace(/<meta property="og:description" content=".*?">/, `<meta property="og:description" content="${escapeHtml(page.description)}">`)
    .replace(/<meta property="og:url" content=".*?">/, `<meta property="og:url" content="${url}">`);

  html = rootAssetUrls(html);
  html = html.replace('</head>', () => `<script type="application/ld+json">${JSON.stringify(localBusinessSchema(page))}</script>\n</head>`);
  return html.replace('<app-root></app-root>', `<app-root>${content}</app-root>`);
}

function rootAssetUrls(html) {
  return html
    .replace(/(href|src)="(?!https?:|\/|#|mailto:|tel:)([^"]+\.(?:js|css|ico|png|jpg|jpeg|webp|svg))"/g, '$1="/$2"')
    .replace(/href="(chunk-[^"]+\.js)"/g, 'href="/$1"');
}

function writePage(page, shell) {
  const targetDir = page.path === '/' ? outputRoot : path.join(outputRoot, page.path.replace(/^\//, ''));
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, 'index.html'), pageHtml(page, shell));
}

if (!fs.existsSync(indexPath)) {
  throw new Error(`Build output not found: ${indexPath}`);
}

const shell = fs.readFileSync(indexPath, 'utf8');
pages.forEach((page) => writePage(page, shell));
console.log(`Pre-rendered ${pages.length} SEO pages.`);
