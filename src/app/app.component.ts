import { Component, OnInit } from '@angular/core';

type Product = {
  sku: string;
  name: string;
  image: string;
  unitPrice: number;
  href: string;
  kicker?: string;
};

type CartItem = Product & {
  quantity: number;
};

type CategoryPage = {
  label: string;
  path: string;
  description: string;
};

type AdminCatalogProduct = {
  sku: string;
  enabled: boolean;
  fixedPrice: number | null;
  markupPercent: number | null;
};

type AdminCatalogCategory = {
  markupPercent: number;
  products: AdminCatalogProduct[];
};

type AdminCatalog = {
  priceRules: {
    defaultMarkupPercent: number;
    rounding: 'ending-99' | 'none';
  };
  categories: Record<string, AdminCatalogCategory>;
};

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = "Cohen's Furniture in Elkton";

  private readonly siteUrl = 'https://www.cohensfurnituredirect.com';
  private readonly categoryUrls = {
    livingRoom: '/c/living-room',
    bedrooms: '/c/bedrooms',
    diningRoom: '/c/dining-room',
    mattresses: '/c/mattresses',
    kids: '/c/kids',
    office: '/c/office',
    homeDecor: '/c/home-decor',
    outdoor: '/c/outdoor',
    clearance: '/c/clearance'
  };
  private readonly currentPath = globalThis.location?.pathname ?? '/';
  private readonly cartStorageKey = 'cohens-elkton-cart';

  location = {
    name: 'Cohen\'s Furniture in Elkton',
    shortName: 'Elkton',
    cityState: 'Elkton, MD',
    street: '901 E. Pulaski Highway',
    cityLine: 'Elkton, MD 21921',
    phone: '(443) 406-3575',
    phoneHref: 'tel:+14434063575',
    mapsQuery: '901 E. Pulaski Highway, Elkton, MD 21921'
  };

  links = {
    home: this.siteUrl,
    search: `${this.siteUrl}/search`,
    login: `${this.siteUrl}/login`,
    wishlist: `${this.siteUrl}/login`,
    cart: '/cart',
    checkout: '/checkout',
    contact: `${this.siteUrl}/contact`,
    directions: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.location.mapsQuery)}`,
    financing: '/financing',
    delivery: '/delivery',
    livingRoom: this.categoryUrls.livingRoom,
    diningRoom: this.categoryUrls.diningRoom,
    clearance: this.categoryUrls.clearance
  };

  logoUrl = 'https://s3.amazonaws.com/cdn.rencdn.com/Cohensfurniture/uploads/storelogo/store-logo-1692973990.jpeg';
  creditImage = 'https://cdn.rencdn.com/Cohensfurniture/uploads/images/credit-card.png';

  categoryPages: CategoryPage[] = [
    { label: 'Living Room', path: this.categoryUrls.livingRoom, description: 'Shop sofas, sectionals, loveseats, tables, and living room accents through the Elkton showroom.' },
    { label: 'Bedroom', path: this.categoryUrls.bedrooms, description: 'Browse beds, dressers, nightstands, chests, and complete bedroom pieces for Elkton shoppers.' },
    { label: 'Dining Room', path: this.categoryUrls.diningRoom, description: 'Find dining tables, chairs, benches, servers, and gathering-room furniture for your home.' },
    { label: 'Mattresses', path: this.categoryUrls.mattresses, description: 'Compare mattress options and bedroom comfort pieces with local Elkton store help.' },
    { label: 'Kids', path: this.categoryUrls.kids, description: 'Shop kids furniture, youth bedroom pieces, storage, and practical room solutions.' },
    { label: 'Office', path: this.categoryUrls.office, description: 'Bring home desks, office chairs, bookcases, and work-from-home furniture.' },
    { label: 'Home Decor', path: this.categoryUrls.homeDecor, description: 'Finish the room with decor, wall art, rugs, lamps, and accent pieces.' },
    { label: 'Outdoor', path: this.categoryUrls.outdoor, description: 'Browse patio and outdoor furniture options available through Cohen\'s Furniture in Elkton.' },
    { label: 'Clearance', path: this.categoryUrls.clearance, description: 'Check value-priced furniture selections and showroom deals from the Elkton location.' }
  ];

  navItems = this.categoryPages.map((category) => ({
    label: category.label,
    href: category.path
  }));

  heroImages = [
    'https://cdn.rencdn.com/Cohensfurniture/uploads/images/living-room-main_1.jpg',
    'https://cdn.rencdn.com/Cohensfurniture/uploads/images/sofas.jpg'
  ];

  socialLinks = [
    {
      label: 'Facebook',
      href: 'https://www.facebook.com/CohensFurnitureDE/',
      icon: 'https://www.cohensfurnituredirect.com/assets/uploads/images/Real%20FB2.png'
    },
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/cohensfurniture/',
      icon: 'https://www.cohensfurnituredirect.com/assets/uploads/images/Real%20Insta2.png'
    },
    {
      label: 'YouTube',
      href: 'https://www.youtube.com/channel/UCDBrVOuWoaOhMX_iZch36Xg',
      icon: 'https://www.cohensfurnituredirect.com/assets/uploads/images/youtube-icon.png'
    },
    {
      label: 'Pinterest',
      href: 'https://www.pinterest.com/CohensFurniture/',
      icon: 'https://www.cohensfurnituredirect.com/assets/uploads/images/pinterest-icon.png'
    },
    {
      label: 'Twitter',
      href: 'https://twitter.com/CohensFurniture',
      icon: 'https://www.cohensfurnituredirect.com/assets/uploads/images/twitter-icon.png'
    }
  ];

  promos = [
    { title: 'Huge Price Breaks', text: 'Value pricing on home furniture and mattresses.' },
    { title: 'Elkton Showroom', text: 'Local help from the Cohen\'s Elkton furniture team.' },
    { title: 'Financing Available', text: 'Flexible options for qualified shoppers.' }
  ];

  roomCategories = [
    { name: 'Living Room', href: this.categoryUrls.livingRoom, image: '/assets/uploads/images/Menu%20Images/living-room-drop-down.jpg' },
    { name: 'Bedroom', href: this.categoryUrls.bedrooms, image: '/assets/uploads/images/Menu%20Images/bedroom-drop-down.jpg' },
    { name: 'Dining Room', href: this.categoryUrls.diningRoom, image: '/assets/uploads/images/Menu%20Images/dining-room-drop-down.jpg' },
    { name: 'Mattresses', href: this.categoryUrls.mattresses, image: '/assets/uploads/images/Menu%20Images/mattresses-drop-down.jpg' },
    { name: 'Office', href: this.categoryUrls.office, image: '/assets/uploads/images/Menu%20Images/office-drop-down.jpg' },
    { name: 'Home Decor', href: this.categoryUrls.homeDecor, image: '/assets/uploads/images/Menu%20Images/home-decor-drop-down.jpg' }
  ].map((item) => ({
    ...item,
    image: `https://www.cohensfurnituredirect.com${item.image}`
  }));

  diningTiles: Product[] = [
    { sku: 'DIN-SET-01', name: 'Dining Room Sets', href: `${this.siteUrl}/c/dining-room-sets`, image: 'https://cdn.rencdn.com/Cohensfurniture/uploads/images/dining-room-sets.jpg', unitPrice: 899.99 },
    { sku: 'DIN-TBL-01', name: 'Dining Tables', href: `${this.siteUrl}/c/dining-tables`, image: 'https://cdn.rencdn.com/Cohensfurniture/uploads/images/dining-table.jpg', unitPrice: 499.99 },
    { sku: 'DIN-CHR-01', name: 'Dining Chairs', href: `${this.siteUrl}/c/dining-chairs`, image: 'https://cdn.rencdn.com/Cohensfurniture/uploads/images/dining-chairs.jpg', unitPrice: 149.99 },
    { sku: 'BAR-STL-01', name: 'Bar Stools', href: `${this.siteUrl}/c/bar-stools`, image: 'https://cdn.rencdn.com/Cohensfurniture/uploads/images/bar-stools-front.jpg', unitPrice: 129.99 }
  ];

  livingDeals: Product[] = [
    {
      kicker: 'Room-ready comfort',
      name: 'Sofas',
      sku: 'SOFA-ELK-01',
      href: `${this.siteUrl}/c/sofas`,
      image: 'https://cdn.rencdn.com/Cohensfurniture/uploads/images/sofas.jpg',
      unitPrice: 799.99
    },
    {
      kicker: 'Family-sized seating',
      name: 'Sectionals',
      sku: 'SECT-ELK-01',
      href: `${this.siteUrl}/c/sectionals`,
      image: 'https://cdn.rencdn.com/Cohensfurniture/uploads/images/sectionals.jpg',
      unitPrice: 1299.99
    },
    {
      kicker: 'Small-space pairings',
      name: 'Loveseats',
      sku: 'LOVE-ELK-01',
      href: `${this.siteUrl}/c/loveseats`,
      image: 'https://cdn.rencdn.com/Cohensfurniture/uploads/images/loveseats.jpg',
      unitPrice: 599.99
    },
    {
      kicker: 'Finishing pieces',
      name: 'Coffee Tables',
      sku: 'CTBL-ELK-01',
      href: `${this.siteUrl}/c/coffee-tables`,
      image: 'https://cdn.rencdn.com/Cohensfurniture/uploads/images/coffee-tables.jpg',
      unitPrice: 249.99
    }
  ];

  footerLinks = [
    { label: 'Living Room', href: this.categoryUrls.livingRoom },
    { label: 'Bedroom', href: this.categoryUrls.bedrooms },
    { label: 'Dining Room', href: this.categoryUrls.diningRoom },
    { label: 'Mattresses', href: this.categoryUrls.mattresses },
    { label: 'Home Decor', href: this.categoryUrls.homeDecor }
  ];

  cartItems: CartItem[] = this.loadCart();
  catalogProducts: Product[] = [];
  adminToken = globalThis.localStorage?.getItem('cohens-elkton-admin-token') || '';
  adminCatalog: AdminCatalog = this.createDefaultAdminCatalog();
  selectedAdminCategory = 'living-room';
  newAdminSku = '';
  adminMessage = '';
  adminDragIndex = -1;
  orderMessage = '';
  financingMessage = '';
  catalogLoading = true;
  catalogMessage = 'Loading Ashley catalog products for the Elkton site.';

  financeReference = {
    locationId: 'ELKTON-LOCATION-ID',
    referenceCode: 'ELKTON-FINANCE-REF',
    dealerCode: 'ELKTON-STORE-CODE'
  };

  ngOnInit() {
    void this.loadAshleyProducts();
  }

  get isCartPage() {
    return this.currentPath === '/cart';
  }

  get isCheckoutPage() {
    return this.currentPath === '/checkout';
  }

  get isFinancingPage() {
    return this.currentPath === '/financing';
  }

  get isDeliveryPage() {
    return this.currentPath === '/delivery';
  }

  get isAdminPage() {
    return this.currentPath === '/admin';
  }

  get isCategoryPage() {
    return this.currentPath.startsWith('/c/');
  }

  get activeCategory() {
    return this.categoryPages.find((category) => category.path === this.currentPath);
  }

  get activeCategorySlug() {
    return this.activeCategory?.path.replace('/c/', '') || '';
  }

  get categoryTitle() {
    return this.activeCategory?.label || 'Furniture';
  }

  get categoryDescription() {
    return this.activeCategory?.description || 'Shop furniture products through Cohen\'s Furniture in Elkton.';
  }

  get categoryProducts() {
    if (this.catalogLoading) {
      return [];
    }

    const products = this.catalogProducts.length ? this.catalogProducts : [...this.livingDeals, ...this.diningTiles];
    const seenSkus = new Set<string>();

    return products.filter((product) => {
      if (seenSkus.has(product.sku)) {
        return false;
      }

      seenSkus.add(product.sku);
      return true;
    });
  }

  get selectedAdminProducts() {
    return this.adminCatalog.categories[this.selectedAdminCategory]?.products || [];
  }

  get selectedAdminCategoryConfig() {
    return this.adminCatalog.categories[this.selectedAdminCategory];
  }

  get cartSubtotal() {
    return this.cartItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
  }

  get cartCount() {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  formatPrice(value: number) {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }

  addToCart(product: Product) {
    const existing = this.cartItems.find((item) => item.sku === product.sku);

    if (existing) {
      existing.quantity += 1;
    } else {
      this.cartItems = [...this.cartItems, { ...product, quantity: 1 }];
    }

    this.saveCart();
  }

  updateQuantity(sku: string, quantity: number) {
    const normalizedQuantity = Math.max(1, Number(quantity) || 1);

    this.cartItems = this.cartItems.map((item) =>
      item.sku === sku ? { ...item, quantity: normalizedQuantity } : item
    );
    this.saveCart();
  }

  removeFromCart(sku: string) {
    this.cartItems = this.cartItems.filter((item) => item.sku !== sku);
    this.saveCart();
  }

  clearCart() {
    this.cartItems = [];
    this.saveCart();
  }

  submitOrder(event: Event) {
    event.preventDefault();

    if (!this.cartItems.length) {
      this.orderMessage = 'Add an item to your Elkton cart before submitting an order request.';
      return;
    }

    this.orderMessage = `Order request ready for ${this.location.name}. The next step is connecting this form to email, SMS, or a backend order inbox.`;
  }

  submitFinancingRequest(event: Event) {
    event.preventDefault();
    this.financingMessage = `Financing request ready for ${this.location.name}. The next step is connecting this form to the Elkton financing inbox or provider endpoint.`;
  }

  async loadAdminCatalog() {
    if (!this.adminToken) {
      this.adminMessage = 'Enter the admin token before loading the catalog.';
      return;
    }

    try {
      const response = await fetch('/.netlify/functions/admin-catalog', {
        headers: this.adminHeaders()
      });
      const payload = await response.json();

      if (!response.ok) {
        this.adminMessage = payload.error || 'Unable to load admin catalog.';
        return;
      }

      this.adminCatalog = this.normalizeAdminCatalog(payload.catalog);
      globalThis.localStorage?.setItem('cohens-elkton-admin-token', this.adminToken);
      this.adminMessage = 'Admin catalog loaded.';
    } catch {
      this.adminMessage = 'Unable to reach the admin catalog service.';
    }
  }

  async saveAdminCatalog() {
    if (!this.adminToken) {
      this.adminMessage = 'Enter the admin token before saving.';
      return;
    }

    try {
      const response = await fetch('/.netlify/functions/admin-catalog', {
        method: 'PUT',
        headers: {
          ...this.adminHeaders(),
          'content-type': 'application/json'
        },
        body: JSON.stringify({ catalog: this.adminCatalog })
      });
      const payload = await response.json();

      if (!response.ok) {
        this.adminMessage = payload.error || 'Unable to save admin catalog.';
        return;
      }

      this.adminCatalog = this.normalizeAdminCatalog(payload.catalog);
      globalThis.localStorage?.setItem('cohens-elkton-admin-token', this.adminToken);
      this.adminMessage = 'Admin catalog saved. The storefront will use these SKU lists on the next refresh.';
    } catch {
      this.adminMessage = 'Unable to save the admin catalog.';
    }
  }

  addAdminSku() {
    const sku = this.newAdminSku.trim().toUpperCase();

    if (!sku) {
      return;
    }

    const products = this.selectedAdminProducts;

    if (!products.some((product) => product.sku === sku)) {
      products.push({ sku, enabled: true, fixedPrice: null, markupPercent: null });
    }

    this.newAdminSku = '';
  }

  removeAdminProduct(index: number) {
    this.selectedAdminProducts.splice(index, 1);
  }

  moveAdminProduct(fromIndex: number, toIndex: number) {
    const products = this.selectedAdminProducts;

    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= products.length || toIndex >= products.length) {
      return;
    }

    const [item] = products.splice(fromIndex, 1);
    products.splice(toIndex, 0, item);
  }

  startAdminDrag(index: number) {
    this.adminDragIndex = index;
  }

  dropAdminProduct(index: number) {
    this.moveAdminProduct(this.adminDragIndex, index);
    this.adminDragIndex = -1;
  }

  updateDefaultMarkup(value: string) {
    this.adminCatalog.priceRules.defaultMarkupPercent = this.numberOrDefault(value, 55);
  }

  updateDefaultRounding(value: string) {
    this.adminCatalog.priceRules.rounding = value === 'none' ? 'none' : 'ending-99';
  }

  updateCategoryMarkup(value: string) {
    this.selectedAdminCategoryConfig.markupPercent = this.numberOrDefault(value, this.adminCatalog.priceRules.defaultMarkupPercent);
  }

  updateAdminProduct(index: number, key: keyof AdminCatalogProduct, value: string | boolean) {
    const product = this.selectedAdminProducts[index];

    if (!product) {
      return;
    }

    if (key === 'enabled') {
      product.enabled = Boolean(value);
      return;
    }

    if (key === 'sku') {
      product.sku = String(value).trim().toUpperCase();
      return;
    }

    product[key] = value === '' ? null : this.numberOrDefault(String(value), 0);
  }

  async importAdminSkuFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    try {
      const rows = file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')
        ? await this.readExcelRows(file)
        : this.parseDelimitedRows(await file.text());

      let importedCount = 0;

      for (const row of rows) {
        const sku = String(row['sku'] || row['SKU'] || row['Sku'] || row['0'] || '').trim().toUpperCase();

        if (!sku) {
          continue;
        }

        const category = String(row['category'] || row['Category'] || this.selectedAdminCategory).trim().toLowerCase() || this.selectedAdminCategory;
        const categoryConfig = this.adminCatalog.categories[category] || this.selectedAdminCategoryConfig;
        const fixedPrice = this.optionalNumber(row['fixedPrice'] || row['price'] || row['Price']);
        const markupPercent = this.optionalNumber(row['markupPercent'] || row['markup'] || row['Markup']);

        categoryConfig.products.push({
          sku,
          enabled: String(row['enabled'] || row['Enabled'] || 'true').toLowerCase() !== 'false',
          fixedPrice,
          markupPercent
        });
        importedCount += 1;
      }

      this.adminMessage = `Imported ${importedCount} SKU rows. Review and save when ready.`;
      input.value = '';
    } catch {
      this.adminMessage = 'Unable to import that file. Use columns named sku, category, price, markupPercent, enabled.';
    }
  }

  private loadCart(): CartItem[] {
    try {
      const storedCart = globalThis.localStorage?.getItem(this.cartStorageKey);
      return storedCart ? JSON.parse(storedCart) : [];
    } catch {
      return [];
    }
  }

  private adminHeaders() {
    return {
      'x-admin-token': this.adminToken
    };
  }

  private createDefaultAdminCatalog(): AdminCatalog {
    const categories = Object.fromEntries(
      Object.values(this.categoryUrls).map((path) => [
        path.replace('/c/', ''),
        { markupPercent: 55, products: [] }
      ])
    );

    return {
      priceRules: {
        defaultMarkupPercent: 55,
        rounding: 'ending-99'
      },
      categories
    };
  }

  private normalizeAdminCatalog(catalog: AdminCatalog): AdminCatalog {
    return {
      ...this.createDefaultAdminCatalog(),
      ...catalog,
      categories: {
        ...this.createDefaultAdminCatalog().categories,
        ...(catalog?.categories || {})
      }
    };
  }

  private numberOrDefault(value: string, fallback: number) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  private optionalNumber(value: unknown) {
    if (value === undefined || value === null || value === '') {
      return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private parseDelimitedRows(text: string): Record<string, string>[] {
    const lines = text.split(/\r?\n/).filter((line) => line.trim());

    if (!lines.length) {
      return [];
    }

    const delimiter = lines[0].includes('\t') ? '\t' : ',';
    const headers = this.parseDelimitedLine(lines[0], delimiter);

    return lines.slice(1).map((line) => {
      const values = this.parseDelimitedLine(line, delimiter);
      return Object.fromEntries(headers.map((header, index) => [header.trim(), values[index] || '']));
    });
  }

  private parseDelimitedLine(line: string, delimiter: string) {
    const pattern = new RegExp(`(?:^|${delimiter})(?:"([^"]*(?:""[^"]*)*)"|([^"${delimiter}]*))`, 'g');
    const values: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(line))) {
      values.push((match[1] || match[2] || '').replace(/""/g, '"').trim());
    }

    return values;
  }

  private async readExcelRows(file: File): Promise<Record<string, string>[]> {
    const XLSX = await import('xlsx');
    const workbook = XLSX.read(await file.arrayBuffer());
    const firstSheetName = workbook.SheetNames[0];
    return XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], { defval: '' }) as Record<string, string>[];
  }

  private saveCart() {
    try {
      globalThis.localStorage?.setItem(this.cartStorageKey, JSON.stringify(this.cartItems));
    } catch {
      // Cart still works for the current page view if storage is unavailable.
    }
  }

  private async loadAshleyProducts() {
    this.catalogLoading = true;
    this.catalogMessage = 'Loading Ashley catalog products for the Elkton site.';

    try {
      const params = new URLSearchParams({ limit: this.isCategoryPage ? '24' : '12' });

      if (this.activeCategorySlug) {
        params.set('category', this.activeCategorySlug);
      }

      const response = await fetch(`/.netlify/functions/ashley-products?${params}`);

      if (!response.ok) {
        this.catalogLoading = false;
        this.catalogMessage = 'Showing starter Elkton products until the Ashley API is configured.';
        return;
      }

      const payload = await response.json();
      const products = Array.isArray(payload.products) ? payload.products : [];
      const usableProducts = products.filter((product: Product) => product.sku && product.name);

      if (!usableProducts.length) {
        this.catalogLoading = false;
        this.catalogMessage = 'Showing starter Elkton products until the Ashley API is configured.';
        return;
      }

      this.catalogProducts = usableProducts;
      this.livingDeals = usableProducts.slice(0, 4);
      this.diningTiles = usableProducts.slice(4, 8).length ? usableProducts.slice(4, 8) : usableProducts.slice(0, 4);
      this.catalogMessage = 'Showing live Ashley catalog products for the Elkton site.';
    } catch {
      this.catalogMessage = 'Showing starter Elkton products until the Ashley API is configured.';
    } finally {
      this.catalogLoading = false;
    }
  }
}
