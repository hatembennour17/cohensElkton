import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = "Cohen's Furniture Direct";

  private readonly siteUrl = 'https://www.cohensfurnituredirect.com';

  links = {
    home: this.siteUrl,
    search: `${this.siteUrl}/search`,
    login: `${this.siteUrl}/login`,
    wishlist: `${this.siteUrl}/login`,
    cart: `${this.siteUrl}/cart`,
    contact: `${this.siteUrl}/contact`,
    directions: 'https://www.google.com/maps/search/?api=1&query=4014%20N.%20Dupont%20Hwy%2C%20New%20Castle%2C%20DE%2019720',
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
    'https://cdn.rencdn.com/Cohensfurniture/uploads/images/banners/6a2c6477d7bc7.jpg',
    'https://s3.amazonaws.com/cdn.rencdn.com/Cohensfurniture/uploads/images/banners/1718305886.jpg'
  ];

  promos = [
    { title: 'Huge Price Breaks', text: 'Value pricing on home furniture and mattresses.' },
    { title: 'New Castle Showroom', text: 'Local help from a Delaware furniture team.' },
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
}
