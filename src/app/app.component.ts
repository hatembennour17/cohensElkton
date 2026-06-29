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

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = "Cohen's Furniture in Elkton";

  private readonly siteUrl = 'https://www.cohensfurnituredirect.com';
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
    storePolicy: `${this.siteUrl}/page/store-policy`,
    livingRoom: `${this.siteUrl}/c/living-room`,
    diningRoom: `${this.siteUrl}/c/dining-room`,
    clearance: `${this.siteUrl}/c/clearance`
  };

  logoUrl = 'https://s3.amazonaws.com/cdn.rencdn.com/Cohensfurniture/uploads/storelogo/store-logo-1692973990.jpeg';
  creditImage = 'https://cdn.rencdn.com/Cohensfurniture/uploads/images/credit-card.png';

  navItems = [
    { label: 'Living Room', href: `${this.siteUrl}/c/living-room` },
    { label: 'Bedroom', href: `${this.siteUrl}/c/bedrooms` },
    { label: 'Dining Room', href: `${this.siteUrl}/c/dining-room` },
    { label: 'Mattresses', href: `${this.siteUrl}/c/mattresses` },
    { label: 'Kids', href: `${this.siteUrl}/c/kids` },
    { label: 'Office', href: `${this.siteUrl}/c/office` },
    { label: 'Home Decor', href: `${this.siteUrl}/c/home-decor` },
    { label: 'Outdoor', href: `${this.siteUrl}/c/outdoor` },
    { label: 'Clearance', href: `${this.siteUrl}/c/clearance` }
  ];

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
    { name: 'Living Room', href: `${this.siteUrl}/c/living-room`, image: '/assets/uploads/images/Menu%20Images/living-room-drop-down.jpg' },
    { name: 'Bedroom', href: `${this.siteUrl}/c/bedrooms`, image: '/assets/uploads/images/Menu%20Images/bedroom-drop-down.jpg' },
    { name: 'Dining Room', href: `${this.siteUrl}/c/dining-room`, image: '/assets/uploads/images/Menu%20Images/dining-room-drop-down.jpg' },
    { name: 'Mattresses', href: `${this.siteUrl}/c/mattresses`, image: '/assets/uploads/images/Menu%20Images/mattresses-drop-down.jpg' },
    { name: 'Office', href: `${this.siteUrl}/c/office`, image: '/assets/uploads/images/Menu%20Images/office-drop-down.jpg' },
    { name: 'Home Decor', href: `${this.siteUrl}/c/home-decor`, image: '/assets/uploads/images/Menu%20Images/home-decor-drop-down.jpg' }
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
    { label: 'Living Room', href: `${this.siteUrl}/c/living-room` },
    { label: 'Bedroom', href: `${this.siteUrl}/c/bedrooms` },
    { label: 'Dining Room', href: `${this.siteUrl}/c/dining-room` },
    { label: 'Mattresses', href: `${this.siteUrl}/c/mattresses` },
    { label: 'Home Decor', href: `${this.siteUrl}/c/home-decor` }
  ];

  cartItems: CartItem[] = this.loadCart();
  orderMessage = '';
  financingMessage = '';
  catalogMessage = 'Showing starter Elkton products until the Ashley API is configured.';

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

  private loadCart(): CartItem[] {
    try {
      const storedCart = globalThis.localStorage?.getItem(this.cartStorageKey);
      return storedCart ? JSON.parse(storedCart) : [];
    } catch {
      return [];
    }
  }

  private saveCart() {
    try {
      globalThis.localStorage?.setItem(this.cartStorageKey, JSON.stringify(this.cartItems));
    } catch {
      // Cart still works for the current page view if storage is unavailable.
    }
  }

  private async loadAshleyProducts() {
    try {
      const response = await fetch('/.netlify/functions/ashley-products?limit=12');

      if (!response.ok) {
        return;
      }

      const payload = await response.json();
      const products = Array.isArray(payload.products) ? payload.products : [];
      const usableProducts = products.filter((product: Product) => product.sku && product.name);

      if (!usableProducts.length) {
        return;
      }

      this.livingDeals = usableProducts.slice(0, 4);
      this.diningTiles = usableProducts.slice(4, 8).length ? usableProducts.slice(4, 8) : usableProducts.slice(0, 4);
      this.catalogMessage = 'Showing live Ashley catalog products for the Elkton site.';
    } catch {
      this.catalogMessage = 'Showing starter Elkton products until the Ashley API is configured.';
    }
  }
}
