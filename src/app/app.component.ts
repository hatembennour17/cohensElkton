import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = "Cohen's Furniture in Elkton";

  private readonly siteUrl = 'https://www.cohensfurnituredirect.com';
  private readonly currentPath = globalThis.location?.pathname ?? '/';

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
    financing: `${this.siteUrl}/page/financing-leasing-options`,
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

  diningTiles = [
    { name: 'Dining Room Sets', href: `${this.siteUrl}/c/dining-room-sets`, image: 'https://cdn.rencdn.com/Cohensfurniture/uploads/images/dining-room-sets.jpg' },
    { name: 'Dining Tables', href: `${this.siteUrl}/c/dining-tables`, image: 'https://cdn.rencdn.com/Cohensfurniture/uploads/images/dining-table.jpg' },
    { name: 'Dining Chairs', href: `${this.siteUrl}/c/dining-chairs`, image: 'https://cdn.rencdn.com/Cohensfurniture/uploads/images/dining-chairs.jpg' },
    { name: 'Bar Stools', href: `${this.siteUrl}/c/bar-stools`, image: 'https://cdn.rencdn.com/Cohensfurniture/uploads/images/bar-stools-front.jpg' }
  ];

  livingDeals = [
    {
      kicker: 'Room-ready comfort',
      name: 'Sofas',
      href: `${this.siteUrl}/c/sofas`,
      image: 'https://cdn.rencdn.com/Cohensfurniture/uploads/images/sofas.jpg'
    },
    {
      kicker: 'Family-sized seating',
      name: 'Sectionals',
      href: `${this.siteUrl}/c/sectionals`,
      image: 'https://cdn.rencdn.com/Cohensfurniture/uploads/images/sectionals.jpg'
    },
    {
      kicker: 'Small-space pairings',
      name: 'Loveseats',
      href: `${this.siteUrl}/c/loveseats`,
      image: 'https://cdn.rencdn.com/Cohensfurniture/uploads/images/loveseats.jpg'
    },
    {
      kicker: 'Finishing pieces',
      name: 'Coffee Tables',
      href: `${this.siteUrl}/c/coffee-tables`,
      image: 'https://cdn.rencdn.com/Cohensfurniture/uploads/images/coffee-tables.jpg'
    }
  ];

  footerLinks = [
    { label: 'Living Room', href: `${this.siteUrl}/c/living-room` },
    { label: 'Bedroom', href: `${this.siteUrl}/c/bedrooms` },
    { label: 'Dining Room', href: `${this.siteUrl}/c/dining-room` },
    { label: 'Mattresses', href: `${this.siteUrl}/c/mattresses` },
    { label: 'Home Decor', href: `${this.siteUrl}/c/home-decor` }
  ];

  cartItems = [
    {
      name: 'Lawrence 3-piece Upholstered Reclining Sofa Set Charcoal',
      sku: '603504-S3',
      image: 'https://cdn.rencdn.com/Cohensfurniture/uploads/images/sofas.jpg',
      quantity: 1,
      unitPrice: 2579.99
    }
  ];

  get isCartPage() {
    return this.currentPath === '/cart';
  }

  get isCheckoutPage() {
    return this.currentPath === '/checkout';
  }

  get cartSubtotal() {
    return this.cartItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
  }

  formatPrice(value: number) {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }
}
