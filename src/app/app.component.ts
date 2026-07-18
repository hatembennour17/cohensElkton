import { Component, OnInit } from '@angular/core';

type Product = {
  sku: string;
  name: string;
  image: string;
  images?: string[];
  unitPrice: number;
  ashleyPrice?: number;
  href: string;
  kicker?: string;
  brand?: string;
  description?: string;
  details?: ProductDetail[];
};

type ProductDetail = {
  label: string;
  value: string;
};

type CartItem = Product & {
  quantity: number;
};

type CategoryPage = {
  label: string;
  path: string;
  description: string;
};

type CategoryTile = {
  label: string;
  href: string;
  image: string;
};

type HeroSlide = {
  image: string;
  alt: string;
  enabled: boolean;
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
  hero: {
    slides: HeroSlide[];
  };
  categories: Record<string, AdminCatalogCategory>;
};

type AnalyticsCount = {
  label: string;
  count: number;
};

type AnalyticsVisit = {
  id: string;
  path: string;
  referrer: string;
  startedAt: string;
  lastSeenAt: string;
  durationSeconds: number;
  location: string;
  device: string;
  browser: string;
  screen: string;
};

type AnalyticsSummary = {
  totals: {
    visits: number;
    uniqueSessions: number;
    visitsToday: number;
    visitsThisWeek: number;
    averageDurationSeconds: number;
  };
  topPages: AnalyticsCount[];
  topReferrers: AnalyticsCount[];
  topLocations: AnalyticsCount[];
  devices: AnalyticsCount[];
  browsers: AnalyticsCount[];
  recentVisits: AnalyticsVisit[];
};

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = "Cohen's Furniture in Elkton";

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
  private readonly currentSearchParams = new URLSearchParams(globalThis.location?.search || '');
  private readonly cartStorageKey = 'cohens-elkton-cart';
  private readonly adminDraftStorageKey = 'cohens-elkton-admin-draft';
  private readonly analyticsSessionStorageKey = 'cohens-elkton-analytics-session';
  private analyticsVisitId = '';
  private analyticsSessionId = '';
  private analyticsStartedAt = 0;
  private analyticsLastPingAt = 0;

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
    home: '/',
    search: '/search',
    login: '/account',
    wishlist: '/wishlist',
    cart: '/cart',
    checkout: '/checkout',
    contact: '/contact',
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

  defaultHeroSlides: HeroSlide[] = [
    {
      image: 'https://cdn.rencdn.com/Cohensfurniture/uploads/images/living-room-main_1.jpg',
      alt: 'Stylish living room furniture at Cohen\'s Furniture',
      enabled: true
    },
    {
      image: 'https://cdn.rencdn.com/Cohensfurniture/uploads/images/sofas.jpg',
      alt: 'Comfortable sofa selection at Cohen\'s Furniture',
      enabled: true
    }
  ];
  heroSlides: HeroSlide[] = [...this.defaultHeroSlides];
  activeHeroSlideIndex = 0;

  socialLinks = [
    {
      label: 'Facebook',
      href: 'https://www.facebook.com/CohensFurnitureDE/',
      icon: this.socialIcon('f', '#39569c')
    },
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/cohensfurniture/',
      icon: this.socialIcon('ig', '#c13584')
    },
    {
      label: 'YouTube',
      href: 'https://www.youtube.com/channel/UCDBrVOuWoaOhMX_iZch36Xg',
      icon: this.socialIcon('yt', '#d71920')
    },
    {
      label: 'Pinterest',
      href: 'https://www.pinterest.com/CohensFurniture/',
      icon: this.socialIcon('p', '#bd081c')
    },
    {
      label: 'Twitter',
      href: 'https://twitter.com/CohensFurniture',
      icon: this.socialIcon('x', '#1da1f2')
    }
  ];

  promos = [
    { title: 'Huge Price Breaks', text: 'Value pricing on home furniture and mattresses.' },
    { title: 'Elkton Showroom', text: 'Local help from the Cohen\'s Elkton furniture team.' },
    { title: 'Financing Available', text: 'Flexible options for qualified shoppers.' }
  ];

  roomCategories = [
    { name: 'Living Room', href: this.categoryUrls.livingRoom, image: 'https://cdn.rencdn.com/Cohensfurniture/uploads/images/sofas.jpg' },
    { name: 'Bedroom', href: this.categoryUrls.bedrooms, image: 'https://cdn.rencdn.com/Cohensfurniture/uploads/images/bedroom-sets.jpg' },
    { name: 'Dining Room', href: this.categoryUrls.diningRoom, image: 'https://cdn.rencdn.com/Cohensfurniture/uploads/images/dining-room-sets.jpg' },
    { name: 'Mattresses', href: this.categoryUrls.mattresses, image: 'https://cdn.rencdn.com/Cohensfurniture/uploads/images/mattresses.jpg' },
    { name: 'Office', href: this.categoryUrls.office, image: 'https://cdn.rencdn.com/Cohensfurniture/uploads/images/home-office.jpg' },
    { name: 'Home Decor', href: this.categoryUrls.homeDecor, image: 'https://cdn.rencdn.com/Cohensfurniture/uploads/images/home-decor.jpg' }
  ];

  categoryLandingTiles: Record<string, CategoryTile[]> = {
    'living-room': [
      { label: 'Living Room Sets', href: '/c/living-room?sub=living-room-sets', image: 'https://cdn.rencdn.com/category/Living-Category_Living-Set426.png' },
      { label: 'Sofa Sets', href: '/c/living-room?sub=sofa-sets', image: 'https://cdn.rencdn.com/category/Living-Category_Sofa-Set105105.png' },
      { label: 'Sofas', href: '/c/living-room?sub=sofas', image: 'https://cdn.rencdn.com/category/Sofa-1591354408.jpg' },
      { label: 'Loveseats', href: '/c/living-room?sub=loveseats', image: 'https://rebuildassets.s3.amazonaws.com/renpim/uploads/images/Ashley%20Demo%20Store/Group%2082532.jpg' },
      { label: 'Sectionals', href: '/c/living-room?sub=sectionals', image: 'https://rebuildassets.s3.amazonaws.com/renpim/uploads/images/Group%2082533.jpg' },
      { label: 'Recliners', href: '/c/living-room?sub=recliners', image: 'https://rebuildassets.s3.amazonaws.com/renpim/uploads/images/Group%2082538.jpg' },
      { label: 'Power Seating', href: '/c/living-room?sub=power-seating', image: 'https://rebuildassets.s3.amazonaws.com/renpim/uploads/images/Ashley%20Demo%20Store/Group%2082535.jpg' },
      { label: 'Chairs', href: '/c/living-room?sub=chairs', image: 'https://www.cohensfurnituredirect.com/assets/uploads/images/Subcategory%20Images/Group%2082540.jpg' },
      { label: 'Ottomans', href: '/c/living-room?sub=ottomans', image: 'https://rebuildassets.s3.amazonaws.com/renpim/uploads/images/Ashley%20Demo%20Store/Group%2082539(1).jpg' },
      { label: 'Chaises', href: '/c/living-room?sub=chaises', image: 'https://cdn.rencdn.com/category/chaises99.png' },
      { label: 'Sleeper Sofas', href: '/c/living-room?sub=sleeper-sofas', image: 'https://rebuildassets.s3.amazonaws.com/renpim/uploads/images/Ashley%20Demo%20Store/Group%2082534.jpg' },
      { label: 'Futons', href: '/c/living-room?sub=futons', image: 'https://www.cohensfurnituredirect.com/assets/uploads/images/Subcategory%20Images/Futon1.jpg' },
      { label: 'TV Stands & Media Centers', href: '/c/living-room?sub=tv-stands-media-centers', image: 'https://rebuildassets.s3.amazonaws.com/renpim/uploads/images/Ashley%20Demo%20Store/Group%2082543(1).jpg' },
      { label: 'Occasional Tables', href: '/c/living-room?sub=occasional-tables', image: 'https://cdn.rencdn.com/category/Coffee-1568836587103.jpg' },
      { label: 'Coffee & End Table Sets', href: '/c/living-room?sub=coffee-end-table-sets', image: 'https://cdn.rencdn.com/category/coffee-end-tables106.png' },
      { label: 'Coffee Tables', href: '/c/living-room?sub=coffee-tables', image: 'https://rebuildassets.s3.amazonaws.com/renpim/uploads/images/Ashley%20Demo%20Store/Group%2082542(1).jpg' },
      { label: 'End & Side Tables', href: '/c/living-room?sub=end-side-tables', image: 'https://rebuildassets.s3.amazonaws.com/renpim/uploads/images/Ashley%20Demo%20Store/Group%2082541(1).jpg' },
      { label: 'Console Tables', href: '/c/living-room?sub=console-tables', image: 'https://www.cohensfurnituredirect.com/assets/uploads/images/Subcategory%20Images/Group%2082541.jpg' },
      { label: 'Living Room Storage', href: '/c/living-room?sub=living-room-storage', image: 'https://rebuildassets.s3.amazonaws.com/renpim/uploads/images/Ashley%20Demo%20Store/Group%2082545(1).jpg' },
      { label: 'Sleeper Sectionals', href: '/c/living-room?sub=sleeper-sectionals', image: 'https://cdn.rencdn.com/category/Category-Base_Sleeper-Sectional1109.jpg' },
      { label: 'Home Theater', href: '/c/living-room?sub=home-theater', image: 'https://cdn.rencdn.com/category/Home-Theater1104.jpg' }
    ],
    bedrooms: [
      { label: 'Bedroom Sets', href: '/c/bedrooms?sub=bedroom-sets', image: 'https://cdn.rencdn.com/category/Bedroom-Category_Bed-Set92.png' },
      { label: 'Beds', href: '/c/bedrooms?sub=beds', image: 'https://rebuildassets.s3.amazonaws.com/renpim/uploads/images/Bedroom_B1a.jpg' },
      { label: 'Headboards', href: '/c/bedrooms?sub=headboards', image: 'https://rebuildassets.s3.amazonaws.com/renpim/uploads/images/Bedroom_B1b.jpg' },
      { label: 'Dressers', href: '/c/bedrooms?sub=dressers', image: 'https://rebuildassets.s3.amazonaws.com/renpim/uploads/images/Bedroom_B1f.jpg' },
      { label: 'Mirrored Dressers', href: '/c/bedrooms?sub=mirrored-dressers', image: 'https://rebuildassets.s3.amazonaws.com/renpim/uploads/images/Bedroom_B1g.jpg' },
      { label: 'Mirrors', href: '/c/bedrooms?sub=mirrors', image: 'https://www.cohensfurnituredirect.com/assets/uploads/images/Subcategory%20Images/Mirror%20-%20Landing%20Page%20-%20Category.jpg' },
      { label: 'Chests', href: '/c/bedrooms?sub=chests', image: 'https://www.cohensfurnituredirect.com/assets/uploads/images/Subcategory%20Images/chests---Category.jpg' },
      { label: 'Nightstands', href: '/c/bedrooms?sub=nightstands', image: 'https://rebuildassets.s3.amazonaws.com/renpim/uploads/images/Bedroom_B1e.jpg' },
      { label: 'Media Chests', href: '/c/bedrooms?sub=media-chests', image: 'https://cdn.rencdn.com/category/Bedroom-Media-Chest406.jpg' },
      { label: 'Armoires', href: '/c/bedrooms?sub=armoires', image: 'https://cdn.rencdn.com/category/Bedroom-Armoires409.jpg' },
      { label: 'Vanities', href: '/c/bedrooms?sub=vanities', image: 'https://rebuildassets.s3.amazonaws.com/renpim/uploads/images/Bedroom_B1k.jpg' },
      { label: 'Bedroom Benches', href: '/c/bedrooms?sub=bedroom-benches', image: 'https://rebuildassets.s3.amazonaws.com/renpim/uploads/images/Bedroom_B1l.jpg' },
      { label: 'Bedroom Chairs', href: '/c/bedrooms?sub=bedroom-chairs', image: 'https://www.cohensfurnituredirect.com/assets/uploads/images/Subcategory%20Images/Group%2082536.jpg' },
      { label: 'Bedroom Storage', href: '/c/bedrooms?sub=bedroom-storage', image: 'https://www.cohensfurnituredirect.com/assets/uploads/images/Subcategory%20Images/Bedroom_B1j.jpg' },
      { label: 'Lingerie Chests', href: '/c/bedrooms?sub=lingerie-chests', image: 'https://www.cohensfurnituredirect.com/assets/uploads/images/Subcategory%20Images/lingerie-chests.jpg' }
    ],
    'dining-room': [
      { label: 'Dining Room Sets', href: '/c/dining-room?sub=dining-room-sets', image: 'https://rebuildassets.s3.amazonaws.com/renpim/uploads/images/Group%2082533(1).jpg' },
      { label: 'Dining Tables', href: '/c/dining-room?sub=dining-tables', image: 'https://rebuildassets.s3.amazonaws.com/renpim/uploads/images/Furniture-Category-Dining-Table.png' },
      { label: 'Dining Chairs', href: '/c/dining-room?sub=dining-chairs', image: 'https://rebuildassets.s3.amazonaws.com/renpim/uploads/images/Group%2082532(1).jpg' },
      { label: 'Dining Benches', href: '/c/dining-room?sub=dining-benches', image: 'https://www.cohensfurnituredirect.com/assets/uploads/images/Subcategory%20Images/Group%2082535.jpg' },
      { label: 'Bar Stools', href: '/c/dining-room?sub=bar-stools', image: 'https://rebuildassets.s3.amazonaws.com/renpim/uploads/images/Group%2082534(1).jpg' },
      { label: 'Bar Furniture', href: '/c/dining-room?sub=bar-furniture', image: 'https://rebuildassets.s3.amazonaws.com/renpim/uploads/images/Furniture-Category-Dining-BarFurniture.png' },
      { label: 'Dining Room Storage', href: '/c/dining-room?sub=dining-room-storage', image: 'https://rebuildassets.s3.amazonaws.com/renpim/uploads/images/Group%2082541(3).jpg' }
    ],
    mattresses: [
      { label: 'Bedding', href: '/c/mattresses?sub=bedding', image: 'https://cdn.rencdn.com/category/Bedding_B1d10.jpg' },
      { label: 'Mattress Sets', href: '/c/mattresses?sub=mattress-sets', image: 'https://cdn.rencdn.com/category/Category-Image-Base_Mattress-Sets956.png' },
      { label: 'Mattress by Size', href: '/c/mattresses?sub=mattress-by-size', image: 'https://www.cohensfurnituredirect.com/assets/uploads/images/Subcategory%20Images/Mattress-Size-Updated.jpeg' },
      { label: 'Mattress by Type', href: '/c/mattresses?sub=mattress-by-type', image: 'https://www.cohensfurnituredirect.com/assets/uploads/images/Subcategory%20Images/Mattress-Type-Updated.jpeg' }
    ],
    kids: [
      { label: 'Kids Bedroom Sets', href: '/c/kids?sub=kids-bedroom-sets', image: 'https://cdn.rencdn.com/category/Kids-Bedroom-Set123.jpg' },
      { label: 'Kids Beds', href: '/c/kids?sub=kids-beds', image: 'https://rebuildassets.s3.amazonaws.com/renpim/uploads/images/Group%2082606.jpg' },
      { label: 'Bunk & Loft Beds', href: '/c/kids?sub=bunk-loft-beds', image: 'https://www.cohensfurnituredirect.com/assets/uploads/images/Subcategory%20Images/Group%2082605.jpg' },
      { label: 'Daybeds', href: '/c/kids?sub=daybeds', image: 'https://www.cohensfurnituredirect.com/assets/uploads/images/Subcategory%20Images/Day%20Bed%20-%20Landing%20Page%20-%20Category.jpg' },
      { label: 'Kids Headboards', href: '/c/kids?sub=kids-headboards', image: 'https://rebuildassets.s3.amazonaws.com/renpim/uploads/images/Category-Images/Group-82604.jpg' },
      { label: 'Kids Mirrored Dressers', href: '/c/kids?sub=kids-mirrored-dressers', image: 'https://www.cohensfurnituredirect.com/assets/uploads/images/Subcategory%20Images/kids-mirrored-dressers.jpg' },
      { label: 'Kids Chests', href: '/c/kids?sub=kids-chests', image: 'https://rebuildassets.s3.amazonaws.com/renpim/uploads/images/Group%2082603.jpg' },
      { label: 'Kids Nightstands', href: '/c/kids?sub=kids-nightstands', image: 'https://rebuildassets.s3.amazonaws.com/renpim/uploads/images/Group%2082604.jpg' },
      { label: 'Kids Desks', href: '/c/kids?sub=kids-desks', image: 'https://rebuildassets.s3.amazonaws.com/renpim/uploads/images/Category-Images/KidDesk.jpg' },
      { label: 'Kids Storage', href: '/c/kids?sub=kids-storage', image: 'https://www.cohensfurnituredirect.com/assets/uploads/images/Subcategory%20Images/Kids%20Storage%20-%20Landing%20Page%20-%20Category.jpg' }
    ],
    office: [
      { label: 'Gaming', href: '/c/office?sub=gaming', image: 'https://www.cohensfurnituredirect.com/assets/uploads/images/Subcategory%20Images/Gaming%20-%20Landing%20Page%20-%20Category.jpg' },
      { label: 'Desks', href: '/c/office?sub=desks', image: 'https://rebuildassets.s3.amazonaws.com/renpim/uploads/images/Group%2082531(2).jpg' },
      { label: 'Office Chairs', href: '/c/office?sub=office-chairs', image: 'https://rebuildassets.s3.amazonaws.com/renpim/uploads/images/Group%2082533(2).jpg' },
      { label: 'Bookcases', href: '/c/office?sub=bookcases', image: 'https://rebuildassets.s3.amazonaws.com/renpim/uploads/images/Furniture-Category-Office-Bookcase.png' },
      { label: 'Office Storage', href: '/c/office?sub=office-storage', image: 'https://rebuildassets.s3.amazonaws.com/renpim/uploads/images/Group%2082534(2).jpg' },
      { label: 'Office Packages', href: '/c/office?sub=office-packages', image: 'https://cdn.rencdn.com/category/Office-Packages1108.jpg' }
    ],
    'home-decor': [
      { label: 'Storage and Organization', href: '/c/home-decor?sub=storage-and-organization', image: 'https://www.cohensfurnituredirect.com/assets/uploads/images/Subcategory%20Images/Group%2082539.jpg' },
      { label: 'Accent Furniture', href: '/c/home-decor?sub=accent-furniture', image: 'https://cdn.rencdn.com/category/Category-Base_Accent-Furniture538.jpg' },
      { label: 'Rugs', href: '/c/home-decor?sub=rugs', image: 'https://www.cohensfurnituredirect.com/assets/uploads/images/Subcategory%20Images/Rugs_B1a.jpg' },
      { label: 'Lamps', href: '/c/home-decor?sub=lamps', image: 'https://cdn.rencdn.com/category/Lamp89.jpg' },
      { label: 'Bowls & Trays', href: '/c/home-decor?sub=bowls-trays', image: 'https://cdn.rencdn.com/category/Home-Decor-Trays436.jpg' },
      { label: 'Candles & Candle Holders', href: '/c/home-decor?sub=candles-candle-holders', image: 'https://cdn.rencdn.com/category/Home_Decor_Category_Candle_Holders432.jpg' },
      { label: 'Canisters & Jars', href: '/c/home-decor?sub=canisters-jars', image: 'https://cdn.rencdn.com/category/Home-Decor-Canisters437.jpg' },
      { label: 'Vases & Bottles', href: '/c/home-decor?sub=vases-bottles', image: 'https://cdn.rencdn.com/category/Home_Decor_Category_Vases_Bottles433.jpg' },
      { label: 'Sculptures', href: '/c/home-decor?sub=sculptures', image: 'https://cdn.rencdn.com/category/Home-Decor-Sculptures434.jpg' },
      { label: 'Wall Clocks', href: '/c/home-decor?sub=wall-clocks', image: 'https://cdn.rencdn.com/category/Clocks_Category_Img_Updates_202226.jpg' },
      { label: 'Poufs', href: '/c/home-decor?sub=poufs', image: 'https://rebuildassets.s3.amazonaws.com/renpim/uploads/images/Category-Images/Pouf.jpg' },
      { label: 'Throw Pillows', href: '/c/home-decor?sub=throw-pillows', image: 'https://rebuildassets.s3.amazonaws.com/renpim/uploads/images/Category-Images/Throw-Pillow.jpg' },
      { label: 'Blankets and Throws', href: '/c/home-decor?sub=blankets-and-throws', image: 'https://www.cohensfurnituredirect.com/assets/uploads/images/Subcategory%20Images/Group%2082594.jpg' },
      { label: 'Wall Art', href: '/c/home-decor?sub=wall-art', image: 'https://www.cohensfurnituredirect.com/assets/uploads/images/Subcategory%20Images/Group%2082587.jpg' },
      { label: 'Lighting', href: '/c/home-decor?sub=lighting', image: 'https://rebuildassets.s3.amazonaws.com/renpim/uploads/images/Category-Images/Lamp.jpg' },
      { label: 'Rug and Pillow Set', href: '/c/home-decor?sub=rug-and-pillow-set', image: 'https://cdn.rencdn.com/category/Category-Images_Rub-Pillow-Set1240.jpg' }
    ],
    outdoor: [
      { label: 'Patio Furniture', href: '/c/outdoor?sub=patio-furniture', image: 'https://cdn.rencdn.com/category/Patio_Furniture_Category_Img_Updates_202212.jpg' },
      { label: 'Outdoor Seating', href: '/c/outdoor?sub=outdoor-seating', image: 'https://cdn.rencdn.com/category/Outdoor-Seating464.jpg' },
      { label: 'Outdoor Tables', href: '/c/outdoor?sub=outdoor-tables', image: 'https://cdn.rencdn.com/category/Outdoor-Tables465.jpg' },
      { label: 'Outdoor Dining', href: '/c/outdoor?sub=outdoor-dining', image: 'https://www.cohensfurnituredirect.com/assets/uploads/images/Subcategory%20Images/Group%2082553.jpg' },
      { label: 'Outdoor Dining Sets', href: '/c/outdoor?sub=outdoor-dining-sets', image: 'https://cdn.rencdn.com/category/Outdoor-Dining-Sets183.jpg' },
      { label: 'Outdoor Dining Chairs', href: '/c/outdoor?sub=outdoor-dining-chairs', image: 'https://rebuildassets.s3.amazonaws.com/renpim/uploads/images/Category-Images/Outdoor-chair.jpg' },
      { label: 'Outdoor Bar Furniture', href: '/c/outdoor?sub=outdoor-bar-furniture', image: 'https://www.cohensfurnituredirect.com/assets/uploads/images/Subcategory%20Images/outdoor-bar-furniture.jpg' },
      { label: 'Patio Accessories', href: '/c/outdoor?sub=patio-accessories', image: 'https://www.cohensfurnituredirect.com/assets/uploads/images/Subcategory%20Images/Patio%20accessories%20-%20Landing%20Page%20-%20Category1.jpg' },
      { label: 'Firepits', href: '/c/outdoor?sub=firepits', image: 'https://cdn.rencdn.com/category/Fire-Pits728.jpg' }
    ]
  };

  diningTiles: Product[] = [
    { sku: 'DIN-SET-01', name: 'Dining Room Sets', href: '/c/dining-room?sub=dining-room-sets', image: 'https://cdn.rencdn.com/Cohensfurniture/uploads/images/dining-room-sets.jpg', unitPrice: 899.99 },
    { sku: 'DIN-TBL-01', name: 'Dining Tables', href: '/c/dining-room?sub=dining-tables', image: 'https://cdn.rencdn.com/Cohensfurniture/uploads/images/dining-table.jpg', unitPrice: 499.99 },
    { sku: 'DIN-CHR-01', name: 'Dining Chairs', href: '/c/dining-room?sub=dining-chairs', image: 'https://cdn.rencdn.com/Cohensfurniture/uploads/images/dining-chairs.jpg', unitPrice: 149.99 },
    { sku: 'BAR-STL-01', name: 'Bar Stools', href: '/c/dining-room?sub=bar-stools', image: 'https://cdn.rencdn.com/Cohensfurniture/uploads/images/bar-stools-front.jpg', unitPrice: 129.99 }
  ];

  searchFallbackProducts: Product[] = [
    {
      kicker: 'Ashley',
      name: 'Lawrence 3-Piece Upholstered Reclining Sofa Set Charcoal',
      sku: '603504-S3',
      href: '/search?q=603504-S3',
      image: 'https://cdn.rencdn.com/Cohensfurniture/product/603504-S3/large/603504-S3.jpg',
      unitPrice: 2579.99,
      ashleyPrice: 2579.99
    }
  ];

  livingDeals: Product[] = [
    {
      kicker: 'Room-ready comfort',
      name: 'Sofas',
      sku: 'SOFA-ELK-01',
      href: '/c/living-room?sub=sofas',
      image: 'https://cdn.rencdn.com/Cohensfurniture/uploads/images/sofas.jpg',
      unitPrice: 799.99
    },
    {
      kicker: 'Family-sized seating',
      name: 'Sectionals',
      sku: 'SECT-ELK-01',
      href: '/c/living-room?sub=sectionals',
      image: 'https://cdn.rencdn.com/Cohensfurniture/uploads/images/sectionals.jpg',
      unitPrice: 1299.99
    },
    {
      kicker: 'Small-space pairings',
      name: 'Loveseats',
      sku: 'LOVE-ELK-01',
      href: '/c/living-room?sub=loveseats',
      image: 'https://cdn.rencdn.com/Cohensfurniture/uploads/images/loveseats.jpg',
      unitPrice: 599.99
    },
    {
      kicker: 'Finishing pieces',
      name: 'Coffee Tables',
      sku: 'CTBL-ELK-01',
      href: '/c/living-room?sub=coffee-tables',
      image: 'https://cdn.rencdn.com/Cohensfurniture/uploads/images/coffee-tables.jpg',
      unitPrice: 249.99
    }
  ];

  footerCategoryLinks = [
    { label: 'Living Room', href: this.categoryUrls.livingRoom },
    { label: 'Bedrooms', href: this.categoryUrls.bedrooms },
    { label: 'Dining Room', href: this.categoryUrls.diningRoom },
    { label: 'Home Decor', href: this.categoryUrls.homeDecor },
    { label: 'Office', href: this.categoryUrls.office },
    { label: 'Kids', href: this.categoryUrls.kids },
    { label: 'Mattresses', href: this.categoryUrls.mattresses },
    { label: 'Outdoor', href: this.categoryUrls.outdoor }
  ];

  footerCompanyLinks = [
    { label: 'Financing & Leasing Options', href: this.links.financing },
    { label: 'Delivery', href: this.links.delivery },
    { label: 'Contact Us', href: this.links.contact },
    { label: 'Store Policy', href: this.links.delivery }
  ];

  footerShoppingLinks = [
    { label: 'Sign In', href: this.links.login },
    { label: 'Wishlist', href: this.links.wishlist },
    { label: 'Cart', href: this.links.cart }
  ];

  cartItems: CartItem[] = this.loadCart();
  catalogProducts: Product[] = [];
  adminUsername = globalThis.localStorage?.getItem('cohens-elkton-admin-username') || 'admin';
  adminPassword = '';
  adminCatalog: AdminCatalog = this.createDefaultAdminCatalog();
  selectedAdminTab: 'catalog' | 'landing' | 'visitors' = 'catalog';
  selectedAdminCategory = 'living-room';
  newAdminSku = '';
  newHeroImageUrl = '';
  adminAuthenticated = false;
  adminMessage = '';
  adminDragIndex = -1;
  adminHeroDragIndex = -1;
  analyticsLoading = false;
  analyticsMessage = '';
  analyticsSummary: AnalyticsSummary | null = null;
  orderMessage = '';
  orderSubmitting = false;
  financingMessage = '';
  productMessage = '';
  activeProductTab: 'description' | 'related' | 'recent' | 'collection' = 'description';
  productModal: 'none' | '3d' | 'room' = 'none';
  selectedProductImages: Record<string, string> = {};
  catalogLoading = true;
  catalogMessage = 'Loading Ashley catalog products for the Elkton site.';
  catalogSort = this.currentSearchParams.get('sort') || 'relevance';
  searchQuery = (this.currentSearchParams.get('q') || '').trim();

  financeReference = {
    locationId: 'ELKTON-LOCATION-ID',
    referenceCode: 'ELKTON-FINANCE-REF',
    dealerCode: 'ELKTON-STORE-CODE'
  };

  ngOnInit() {
    this.startHeroCarousel();

    if (this.isAdminPage) {
      this.catalogLoading = false;
      return;
    }

    this.startAnalyticsTracking();
    void this.loadStorefrontConfig();

    if (this.isCategoryLandingPage || this.isAccountPage || this.isWishlistPage || this.isContactPage) {
      this.catalogLoading = false;
      return;
    }

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

  get isSearchPage() {
    return this.currentPath === '/search';
  }

  get isAccountPage() {
    return this.currentPath === '/account';
  }

  get isWishlistPage() {
    return this.currentPath === '/wishlist';
  }

  get isContactPage() {
    return this.currentPath === '/contact';
  }

  get isAdminPage() {
    return this.currentPath === '/admin';
  }

  get isProductPage() {
    return this.currentPath.startsWith('/product/');
  }

  get activeProductSku() {
    return this.isProductPage
      ? decodeURIComponent(this.currentPath.replace('/product/', '')).trim().toUpperCase()
      : '';
  }

  get productDetailProduct() {
    if (!this.activeProductSku) {
      return undefined;
    }

    return [...this.catalogProducts, ...this.searchFallbackProducts, ...this.livingDeals, ...this.diningTiles]
      .find((product) => product.sku.toUpperCase() === this.activeProductSku);
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

  get activeSubcategorySlug() {
    return (this.currentSearchParams.get('sub') || '').trim().toLowerCase();
  }

  get activeSubcategoryLabel() {
    if (!this.activeSubcategorySlug) {
      return '';
    }

    return this.activeSubcategorySlug.split('-').map((word) => word[0]?.toUpperCase() + word.slice(1)).join(' ');
  }

  get isCategoryLandingPage() {
    return this.isCategoryPage && Boolean(this.activeCategory) && !this.activeSubcategorySlug && this.currentSearchParams.get('view') !== 'products';
  }

  get categoryLandingTilesForActiveCategory() {
    const tiles = this.categoryLandingTiles[this.activeCategorySlug] || this.categoryPages
      .filter((category) => category.path !== this.activeCategory?.path)
      .map((category) => ({
        label: category.label,
        href: `${category.path}?view=products`,
        image: ''
      }));

    return tiles.map((tile) => ({
      ...tile,
      image: tile.image || this.categoryImage(tile.label)
    }));
  }

  get enabledHeroSlides() {
    const slides = this.heroSlides.filter((slide) => slide.enabled && slide.image);
    return slides.length ? slides : this.defaultHeroSlides;
  }

  get activeHeroSlide() {
    return this.enabledHeroSlides[this.activeHeroSlideIndex] || this.enabledHeroSlides[0];
  }

  get categoryTitle() {
    if (this.isSearchPage) {
      return this.searchQuery ? `Search results for "${this.searchQuery}"` : 'Search Results';
    }

    return this.activeSubcategoryLabel || this.activeCategory?.label || 'Furniture';
  }

  get categoryDescription() {
    if (this.isSearchPage) {
      return this.searchQuery ? 'Showing Elkton catalog matches from the Ashley product feed.' : 'Enter a product, SKU, room, or style in the search box.';
    }

    return this.activeCategory?.description || 'Shop furniture products through Cohen\'s Furniture in Elkton.';
  }

  get categoryProducts() {
    if (this.catalogLoading) {
      return [];
    }

    const products = this.catalogProducts.length
      ? this.catalogProducts
      : [...this.searchFallbackProducts, ...this.livingDeals, ...this.diningTiles];
    const seenSkus = new Set<string>();

    const uniqueProducts = products.filter((product) => {
      if (seenSkus.has(product.sku)) {
        return false;
      }

      seenSkus.add(product.sku);
      return true;
    });

    const searchProducts = this.searchQuery
      ? uniqueProducts.filter((product) => this.productMatchesSearch(product, this.searchQuery))
      : uniqueProducts;
    const productsForSubcategory = this.searchQuery ? searchProducts : uniqueProducts;
    const subcategoryProducts = this.activeSubcategorySlug && !this.catalogProducts.length
      ? productsForSubcategory.filter((product) => this.productMatchesSubcategory(product, this.activeSubcategorySlug))
      : productsForSubcategory;
    return this.sortProducts(subcategoryProducts);
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

  formatVisitDate(value: string) {
    const parsed = Date.parse(value);

    if (!Number.isFinite(parsed)) {
      return 'Unknown';
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date(parsed));
  }

  changeCatalogSort(value: string) {
    this.catalogSort = value;

    const nextUrl = new URL(globalThis.location?.href || '/', globalThis.location?.origin || 'https://cohensfurnituremaryland.com');
    nextUrl.searchParams.set('sort', value);
    globalThis.history?.replaceState(null, '', `${nextUrl.pathname}${nextUrl.search}`);
  }

  useImageFallback(event: Event, label: string) {
    const image = event.target as HTMLImageElement;

    if (image.src.startsWith('data:image/svg+xml')) {
      return;
    }

    image.src = this.categoryImage(label);
  }

  productDetailHref(product: Product) {
    return `/product/${encodeURIComponent(product.sku)}`;
  }

  productDetailImages(product: Product) {
    return [...new Set([product.image, ...(product.images || [])].filter(Boolean))].slice(0, 8);
  }

  selectedProductImage(product: Product) {
    return this.selectedProductImages[product.sku] || product.image;
  }

  selectProductImage(product: Product, image: string) {
    this.selectedProductImages = {
      ...this.selectedProductImages,
      [product.sku]: image
    };
  }

  productDescription(product: Product) {
    return product.description || `${product.name} is available through Cohen's Furniture in Elkton. Contact the showroom for availability, delivery timing, and package details.`;
  }

  productDetails(product: Product) {
    const details = product.details?.filter((detail) => detail.label && detail.value) || [];

    return details.length
      ? details
      : [
          { label: 'SKU', value: product.sku },
          { label: 'Store', value: 'Cohen\'s Furniture in Elkton' }
        ];
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

  addToCartQuantity(product: Product, quantity: number | string) {
    const normalizedQuantity = Math.max(1, Number(quantity) || 1);
    const existing = this.cartItems.find((item) => item.sku === product.sku);

    if (existing) {
      existing.quantity += normalizedQuantity;
    } else {
      this.cartItems = [...this.cartItems, { ...product, quantity: normalizedQuantity }];
    }

    this.saveCart();
    this.productMessage = `${normalizedQuantity} ${product.name} added to cart.`;
  }

  buyNow(product: Product, quantity: number | string) {
    this.addToCartQuantity(product, quantity);
    globalThis.location.href = this.links.checkout;
  }

  showProductUnavailable(feature: string) {
    this.productMessage = `${feature} is not available for this item yet. Please call the Elkton store for help.`;
  }

  addProductToWishlist(product: Product) {
    this.productMessage = `${product.name} was saved to your wishlist for this visit.`;
  }

  scrollToProductInfo() {
    globalThis.document?.querySelector('.product-info-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  setProductTab(tab: 'description' | 'related' | 'recent' | 'collection') {
    this.activeProductTab = tab;
    this.scrollToProductInfo();
  }

  openProductModal(modal: '3d' | 'room') {
    this.productModal = modal;
  }

  closeProductModal() {
    this.productModal = 'none';
  }

  productRoomQrUrl(product: Product) {
    const productUrl = encodeURIComponent(globalThis.location?.href || `https://cohensfurnituremaryland.com${this.productDetailHref(product)}`);
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=16&data=${productUrl}`;
  }

  printProduct() {
    globalThis.print?.();
  }

  emailProduct(product: Product) {
    const subject = encodeURIComponent(`Cohen's Furniture item: ${product.name}`);
    const body = encodeURIComponent(`${product.name}\nSKU: ${product.sku}\nPrice: ${this.formatPrice(product.unitPrice)}\n${globalThis.location?.href || ''}`);
    globalThis.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  shareProduct(label: string, product: Product) {
    const url = encodeURIComponent(globalThis.location?.href || `https://cohensfurnituremaryland.com${this.productDetailHref(product)}`);
    const text = encodeURIComponent(product.name);
    const shareUrls: Record<string, string> = {
      Facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      Pinterest: `https://pinterest.com/pin/create/button/?url=${url}&description=${text}`,
      Twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`
    };

    const shareUrl = shareUrls[label];
    if (shareUrl) {
      globalThis.open?.(shareUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    this.productMessage = `${label} sharing is not available here yet.`;
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

  async submitOrder(event: Event) {
    event.preventDefault();

    if (!this.cartItems.length) {
      this.orderMessage = 'Add an item to your Elkton cart before submitting an order request.';
      return;
    }

    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const submission = new URLSearchParams();

    submission.set('form-name', 'elkton-order-request');
    submission.set('firstName', this.formValue(formData, 'firstName'));
    submission.set('lastName', this.formValue(formData, 'lastName'));
    submission.set('email', this.formValue(formData, 'email'));
    submission.set('phone', this.formValue(formData, 'phone'));
    submission.set('address', this.formValue(formData, 'address'));
    submission.set('city', this.formValue(formData, 'city'));
    submission.set('state', this.formValue(formData, 'state'));
    submission.set('zip', this.formValue(formData, 'zip'));
    submission.set('fulfillment', this.formValue(formData, 'fulfillment'));
    submission.set('storeLocation', `${this.location.name} - ${this.location.street}, ${this.location.cityLine}`);
    submission.set('notificationEmail', 'hatembennour77@gmail.com');
    submission.set('subtotal', this.formatPrice(this.cartSubtotal));
    submission.set(
      'cartItems',
      this.cartItems
        .map((item) => `${item.quantity} x ${item.name} (${item.sku}) at ${this.formatPrice(item.unitPrice)} = ${this.formatPrice(item.unitPrice * item.quantity)}`)
        .join('\n')
    );

    this.orderSubmitting = true;
    this.orderMessage = 'Submitting your Elkton order request...';

    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        body: submission.toString()
      });

      if (!response.ok) {
        throw new Error(`Netlify Forms returned ${response.status}`);
      }

      this.clearCart();
      this.orderMessage = 'Thank you. Your Elkton order request has been received. A team member will contact you shortly to confirm availability, fulfillment, and final payment details.';
    } catch {
      this.orderMessage = `We could not submit your order request online. Please call ${this.location.phone} and our Elkton team will help complete it.`;
    } finally {
      this.orderSubmitting = false;
    }
  }

  private formValue(formData: FormData, field: string) {
    return String(formData.get(field) || '').trim();
  }

  submitFinancingRequest(event: Event) {
    event.preventDefault();
    this.financingMessage = `Financing request ready for ${this.location.name}. The next step is connecting this form to the Elkton financing inbox or provider endpoint.`;
  }

  async adminLogin() {
    if (!this.hasAdminCredentials()) {
      this.adminMessage = 'Enter your admin username and password to continue.';
      return;
    }

    this.adminMessage = 'Signing in...';
    const loaded = await this.loadAdminCatalog();

    if (!loaded) {
      return;
    }

    this.adminAuthenticated = true;
    this.loadAdminDraft();
    void this.loadAnalytics({ silent: true });
    this.adminMessage = 'Signed in. Admin catalog loaded.';
  }

  adminLogout() {
    this.adminAuthenticated = false;
    this.adminPassword = '';
    this.analyticsSummary = null;
    this.analyticsMessage = '';
    this.adminMessage = 'Signed out.';
    globalThis.localStorage?.removeItem('cohens-elkton-admin-password');
    globalThis.localStorage?.removeItem('cohens-elkton-admin-token');
  }

  async loadAdminCatalog(options: { silent?: boolean } = {}) {
    if (!this.hasAdminCredentials()) {
      if (!options.silent) {
        this.adminMessage = 'Enter your admin username and password before loading the catalog.';
      }
      return false;
    }

    try {
      const response = await fetch('/.netlify/functions/admin-catalog', {
        headers: this.adminHeaders()
      });
      const payload = await response.json();

      if (!response.ok) {
        if (!options.silent) {
          this.adminMessage = payload.error || 'Unable to load admin catalog.';
        }
        return false;
      }

      this.adminCatalog = this.normalizeAdminCatalog(payload.catalog);
      this.applyHeroSlides(this.adminCatalog.hero.slides);
      this.rememberAdminLogin();
      globalThis.localStorage?.removeItem(this.adminDraftStorageKey);
      this.adminMessage = options.silent ? 'Loaded the published admin catalog.' : 'Admin catalog loaded.';
      return true;
    } catch {
      if (!options.silent) {
        this.adminMessage = 'Unable to reach the admin catalog service.';
      }
      return false;
    }
  }

  async saveAdminCatalog() {
    if (!this.adminAuthenticated) {
      this.adminMessage = 'Sign in before saving admin changes.';
      return;
    }

    if (!this.hasAdminCredentials()) {
      this.adminMessage = 'Enter your admin username and password before saving.';
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
      this.applyHeroSlides(this.adminCatalog.hero.slides);
      this.rememberAdminLogin();
      globalThis.localStorage?.removeItem(this.adminDraftStorageKey);
      this.adminMessage = 'Admin catalog saved. The storefront will use these SKU lists on the next refresh.';
    } catch {
      this.adminMessage = 'Unable to publish changes. Your draft is saved in this browser, but the public homepage will not update until Save Changes succeeds.';
    }
  }

  async loadAnalytics(options: { silent?: boolean } = {}) {
    if (!this.adminAuthenticated && !options.silent) {
      this.analyticsMessage = 'Sign in before loading visitor data.';
      return;
    }

    if (!this.hasAdminCredentials()) {
      if (!options.silent) {
        this.analyticsMessage = 'Enter your admin username and password before loading visitor data.';
      }
      return;
    }

    this.analyticsLoading = true;

    try {
      const response = await fetch('/.netlify/functions/analytics', {
        headers: this.adminHeaders()
      });
      const payload = await response.json();

      if (!response.ok) {
        this.analyticsMessage = payload.error || 'Unable to load visitor data.';
        return;
      }

      this.analyticsSummary = this.normalizeAnalyticsSummary(payload);
      this.analyticsMessage = options.silent ? '' : 'Visitor data refreshed.';
      this.rememberAdminLogin();
    } catch {
      this.analyticsMessage = 'Unable to reach the visitor analytics service.';
    } finally {
      this.analyticsLoading = false;
    }
  }

  selectAdminTab(tab: 'catalog' | 'landing' | 'visitors') {
    this.selectedAdminTab = tab;

    if (tab === 'visitors') {
      void this.loadAnalytics({ silent: true });
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

  addHeroImageUrl() {
    const image = this.newHeroImageUrl.trim();

    if (!image) {
      return;
    }

    this.adminCatalog.hero.slides.push({
      image,
      alt: 'Cohen\'s Furniture landing slide',
      enabled: true
    });
    this.applyHeroSlides(this.adminCatalog.hero.slides);
    this.saveAdminDraft();
    this.newHeroImageUrl = '';
    this.adminMessage = 'Added landing image URL. Save changes to publish it.';
  }

  async importHeroImages(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);

    if (!files.length) {
      return;
    }

    const slides: HeroSlide[] = [];
    const uploadWarnings: string[] = [];

    for (const file of files) {
      try {
        const upload = await this.uploadHeroImage(file);

        slides.push({
          image: upload.imageUrl,
          alt: file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
          enabled: true
        });
      } catch (error) {
        slides.push({
          image: await this.compressHeroImage(file),
          alt: file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
          enabled: true
        });
        uploadWarnings.push(error instanceof Error ? error.message : String(error));
      }
    }

    if (slides.length) {
      this.adminCatalog.hero.slides.push(...slides);
      this.applyHeroSlides(this.adminCatalog.hero.slides);
      this.saveAdminDraft();
    }

    this.adminMessage = uploadWarnings.length
      ? `Added ${slides.length} image preview${slides.length === 1 ? '' : 's'}, but server upload failed: ${uploadWarnings[0]}`
      : `Added ${slides.length} landing slide image${slides.length === 1 ? '' : 's'}. Save changes to publish.`;
    input.value = '';
  }

  updateHeroSlide(index: number, key: keyof HeroSlide, value: string | boolean) {
    const slide = this.adminCatalog.hero.slides[index];

    if (!slide) {
      return;
    }

    if (key === 'enabled') {
      slide.enabled = Boolean(value);
    } else {
      slide[key] = String(value);
    }

    this.applyHeroSlides(this.adminCatalog.hero.slides);
    this.saveAdminDraft();
  }

  removeHeroSlide(index: number) {
    this.adminCatalog.hero.slides.splice(index, 1);
    this.applyHeroSlides(this.adminCatalog.hero.slides);
    this.saveAdminDraft();
  }

  startHeroDrag(index: number) {
    this.adminHeroDragIndex = index;
  }

  dropHeroSlide(index: number) {
    const slides = this.adminCatalog.hero.slides;

    if (this.adminHeroDragIndex < 0 || index < 0 || this.adminHeroDragIndex >= slides.length || index >= slides.length) {
      return;
    }

    const [slide] = slides.splice(this.adminHeroDragIndex, 1);
    slides.splice(index, 0, slide);
    this.adminHeroDragIndex = -1;
    this.applyHeroSlides(slides);
    this.saveAdminDraft();
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
      'x-admin-username': this.adminUsername.trim(),
      'x-admin-password': this.adminPassword
    };
  }

  private hasAdminCredentials() {
    return Boolean(this.adminUsername.trim() && this.adminPassword);
  }

  private rememberAdminLogin() {
    globalThis.localStorage?.setItem('cohens-elkton-admin-username', this.adminUsername.trim());
    globalThis.localStorage?.removeItem('cohens-elkton-admin-password');
    globalThis.localStorage?.removeItem('cohens-elkton-admin-token');
  }

  private loadAdminDraft() {
    try {
      const storedDraft = globalThis.localStorage?.getItem(this.adminDraftStorageKey);

      if (!storedDraft) {
        return;
      }

      this.adminCatalog = this.normalizeAdminCatalog(JSON.parse(storedDraft));
      this.applyHeroSlides(this.adminCatalog.hero.slides);
      this.adminMessage = 'Restored unsaved admin changes from this browser. Click Save Changes to publish them.';
    } catch {
      globalThis.localStorage?.removeItem(this.adminDraftStorageKey);
    }
  }

  private saveAdminDraft() {
    try {
      globalThis.localStorage?.setItem(this.adminDraftStorageKey, JSON.stringify(this.adminCatalog));
    } catch {
      this.adminMessage = 'Changes are visible now, but this browser could not store the draft locally.';
    }
  }

  private startAnalyticsTracking() {
    if (!globalThis.navigator || this.currentPath === '/admin') {
      return;
    }

    this.analyticsVisitId = this.randomId();
    this.analyticsSessionId = this.getAnalyticsSessionId();
    this.analyticsStartedAt = Date.now();
    this.analyticsLastPingAt = this.analyticsStartedAt;

    void this.sendAnalyticsEvent('pageview');

    globalThis.addEventListener?.('beforeunload', () => {
      this.sendAnalyticsBeacon();
    });

    globalThis.document?.addEventListener?.('visibilitychange', () => {
      if (globalThis.document?.visibilityState === 'hidden') {
        this.sendAnalyticsBeacon();
      }
    });
  }

  private async sendAnalyticsEvent(event: 'pageview' | 'engagement') {
    try {
      await fetch('/.netlify/functions/analytics', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(this.analyticsPayload(event))
      });
    } catch {
      // Analytics should never interrupt shopping.
    }
  }

  private sendAnalyticsBeacon() {
    if (!this.analyticsVisitId || Date.now() - this.analyticsLastPingAt < 2000) {
      return;
    }

    this.analyticsLastPingAt = Date.now();
    const body = JSON.stringify(this.analyticsPayload('engagement'));

    if (!globalThis.navigator?.sendBeacon?.('/.netlify/functions/analytics', new Blob([body], { type: 'application/json' }))) {
      void this.sendAnalyticsEvent('engagement');
    }
  }

  private analyticsPayload(event: 'pageview' | 'engagement') {
    return {
      id: this.analyticsVisitId,
      sessionId: this.analyticsSessionId,
      event,
      path: this.currentPath,
      fullUrl: globalThis.location?.href || '',
      referrer: globalThis.document?.referrer || '',
      title: globalThis.document?.title || this.title,
      startedAt: new Date(this.analyticsStartedAt).toISOString(),
      durationSeconds: Math.round((Date.now() - this.analyticsStartedAt) / 1000),
      language: globalThis.navigator?.language || '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
      screen: globalThis.screen ? `${globalThis.screen.width}x${globalThis.screen.height}` : '',
      userAgent: globalThis.navigator?.userAgent || ''
    };
  }

  private getAnalyticsSessionId() {
    try {
      const existingSession = globalThis.sessionStorage?.getItem(this.analyticsSessionStorageKey);

      if (existingSession) {
        return existingSession;
      }

      const sessionId = this.randomId();
      globalThis.sessionStorage?.setItem(this.analyticsSessionStorageKey, sessionId);
      return sessionId;
    } catch {
      return this.randomId();
    }
  }

  private randomId() {
    return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  private normalizeAnalyticsSummary(payload: AnalyticsSummary): AnalyticsSummary {
    return {
      totals: {
        visits: Number(payload?.totals?.visits || 0),
        uniqueSessions: Number(payload?.totals?.uniqueSessions || 0),
        visitsToday: Number(payload?.totals?.visitsToday || 0),
        visitsThisWeek: Number(payload?.totals?.visitsThisWeek || 0),
        averageDurationSeconds: Number(payload?.totals?.averageDurationSeconds || 0)
      },
      topPages: this.normalizeAnalyticsCounts(payload?.topPages),
      topReferrers: this.normalizeAnalyticsCounts(payload?.topReferrers),
      topLocations: this.normalizeAnalyticsCounts(payload?.topLocations),
      devices: this.normalizeAnalyticsCounts(payload?.devices),
      browsers: this.normalizeAnalyticsCounts(payload?.browsers),
      recentVisits: Array.isArray(payload?.recentVisits) ? payload.recentVisits : []
    };
  }

  private normalizeAnalyticsCounts(counts: AnalyticsCount[] | undefined) {
    return Array.isArray(counts)
      ? counts.map((item) => ({ label: String(item.label || 'Unknown'), count: Number(item.count || 0) }))
      : [];
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
      hero: {
        slides: [...this.defaultHeroSlides]
      },
      categories
    };
  }

  private normalizeAdminCatalog(catalog: AdminCatalog): AdminCatalog {
    const defaultCatalog = this.createDefaultAdminCatalog();

    return {
      ...defaultCatalog,
      ...catalog,
      hero: {
        slides: this.normalizeHeroSlides(catalog?.hero?.slides)
      },
      categories: {
        ...defaultCatalog.categories,
        ...(catalog?.categories || {})
      }
    };
  }

  private normalizeHeroSlides(slides: unknown) {
    if (!Array.isArray(slides)) {
      return [...this.defaultHeroSlides];
    }

    const normalizedSlides = slides
      .map((slide) => ({
        image: String((slide as HeroSlide)?.image || '').trim(),
        alt: String((slide as HeroSlide)?.alt || 'Cohen\'s Furniture landing slide').trim(),
        enabled: (slide as HeroSlide)?.enabled !== false
      }))
      .filter((slide) => slide.image);

    return normalizedSlides.length ? normalizedSlides : [...this.defaultHeroSlides];
  }

  private applyHeroSlides(slides: unknown) {
    this.heroSlides = this.normalizeHeroSlides(slides);
    this.activeHeroSlideIndex = Math.min(this.activeHeroSlideIndex, this.enabledHeroSlides.length - 1);
  }

  private startHeroCarousel() {
    if (typeof window === 'undefined') {
      return;
    }

    window.setInterval(() => {
      const slides = this.enabledHeroSlides;

      if (slides.length > 1) {
        this.activeHeroSlideIndex = (this.activeHeroSlideIndex + 1) % slides.length;
      }
    }, 5500);
  }

  private compressHeroImage(file: File) {
    return new Promise<string>((resolve, reject) => {
      const image = new Image();
      const objectUrl = URL.createObjectURL(file);

      image.onload = () => {
        URL.revokeObjectURL(objectUrl);

        const maxWidth = 1800;
        const maxHeight = 1000;
        const scale = Math.min(1, maxWidth / image.width, maxHeight / image.height);
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');

        if (!context) {
          reject(new Error('Unable to prepare image for upload.'));
          return;
        }

        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Unable to read selected image.'));
      };

      image.src = objectUrl;
    });
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
      const catalogLimit = this.activeProductSku ? '1' : this.activeSubcategorySlug ? '1000' : this.isCategoryPage || this.isSearchPage ? '96' : '12';
      const params = new URLSearchParams({ limit: catalogLimit });

      if (this.activeCategorySlug && !this.isCategoryLandingPage) {
        params.set('category', this.activeCategorySlug);
      }

      if (this.activeSubcategorySlug) {
        params.set('sub', this.activeSubcategorySlug);
      }

      if (this.searchQuery) {
        params.set('q', this.searchQuery);
      }

      if (this.activeProductSku) {
        params.set('skus', this.activeProductSku);
      }

      const response = await fetch(`/.netlify/functions/ashley-products?${params}`);

      if (!response.ok) {
        this.catalogLoading = false;
        this.catalogMessage = this.searchQuery
          ? 'Showing matching starter products while Ashley search is unavailable.'
          : 'Showing starter Elkton products until the Ashley API is configured.';
        return;
      }

      const payload = await response.json();
      this.applyHeroSlides(payload.hero?.slides);
      const products = Array.isArray(payload.products) ? payload.products : [];
      const usableProducts = products.filter((product: Product) => product.sku && product.name);

      if (!usableProducts.length) {
        this.catalogLoading = false;
        this.catalogMessage = this.searchQuery
          ? 'No Ashley matches returned. Showing matching starter products when available.'
          : 'Showing starter Elkton products until the Ashley API is configured.';
        return;
      }

      this.catalogProducts = usableProducts;
      this.livingDeals = usableProducts.slice(0, 4);
      this.diningTiles = usableProducts.slice(4, 8).length ? usableProducts.slice(4, 8) : usableProducts.slice(0, 4);
      this.catalogMessage = 'Showing live Ashley catalog products for the Elkton site.';
    } catch {
      this.catalogMessage = this.searchQuery
        ? 'Showing matching starter products while Ashley search is unavailable.'
        : 'Showing starter Elkton products until the Ashley API is configured.';
    } finally {
      this.catalogLoading = false;
    }
  }

  private async loadStorefrontConfig() {
    try {
      const response = await fetch('/.netlify/functions/storefront-config');

      if (!response.ok) {
        return;
      }

      const payload = await response.json();
      this.applyHeroSlides(payload.hero?.slides);
    } catch {
      // Keep fallback slides when the settings function is unavailable.
    }
  }

  private async uploadHeroImage(file: File) {
    const uploadFileName = /\.[^.]+$/.test(file.name) ? file.name.replace(/\.[^.]+$/, '.jpg') : `${file.name}.jpg`;
    const response = await fetch('/.netlify/functions/landing-image', {
      method: 'POST',
      headers: {
        ...this.adminHeaders(),
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        fileName: uploadFileName,
        dataUrl: await this.compressHeroImage(file)
      })
    });
    const rawPayload = await response.text();
    let payload: { imageUrl?: string; error?: string; message?: string } = {};

    try {
      payload = rawPayload ? JSON.parse(rawPayload) : {};
    } catch {
      payload = { message: rawPayload };
    }

    if (!response.ok) {
      throw new Error(payload.message || payload.error || `Upload failed with ${response.status}.`);
    }

    if (!payload.imageUrl) {
      throw new Error('Upload completed without an image URL.');
    }

    return payload as { imageUrl: string };
  }

  private productMatchesSubcategory(product: Product, subcategory: string) {
    const searchableText = `${product.name} ${product.sku} ${product.kicker || ''}`.toLowerCase();

    // "-sets" subcategories are genuine multi-piece combo products (e.g. "Kanwyn Queen Panel
    // Bed, Dresser and Mirror"), not standalone pieces. A product only counts as a "set" if its
    // name mentions a primary piece AND at least one distinct companion piece.
    const multiPieceRules: Record<string, { primary: string[]; secondary: string[]; setTerms?: string[] }> = {
      'bedroom-sets': { primary: ['bed'], secondary: ['dresser', 'mirror', 'chest', 'nightstand', 'storage bench'], setTerms: ['set', 'package', 'piece'] },
      'dining-room-sets': { primary: ['table'], secondary: ['chair', 'bench', 'server', 'buffet'], setTerms: ['set', 'package', 'piece'] },
      'living-room-sets': { primary: ['sofa', 'sectional', 'reclining sofa'], secondary: ['loveseat', 'chair', 'recliner', 'ottoman'], setTerms: ['set', 'package', 'piece'] },
      'sofa-sets': { primary: ['sofa'], secondary: ['loveseat', 'chair', 'recliner'], setTerms: ['set', 'package', 'piece'] }
    };

    const multiPieceRule = multiPieceRules[subcategory];
    if (multiPieceRule) {
      const hasPrimaryPiece = multiPieceRule.primary.some((term) => this.textContainsTerm(searchableText, term));
      const hasCompanionPiece = multiPieceRule.secondary.some((term) => this.textContainsTerm(searchableText, term));
      const hasSetLanguage = (multiPieceRule.setTerms || []).some((term) => this.textContainsTerm(searchableText, term));
      return hasPrimaryPiece && (hasCompanionPiece || hasSetLanguage);
    }

    const keywordsBySubcategory: Record<string, string[]> = {
      sofas: ['sofa'],
      loveseats: ['loveseat'],
      sectionals: ['sectional'],
      recliners: ['recliner'],
      chairs: ['chair'],
      ottomans: ['ottoman'],
      'coffee-tables': ['coffee table', 'cocktail table'],
      'tv-stands': ['tv stand', 'media', 'entertainment'],
      'living-room-storage': ['storage', 'cabinet', 'console'],
      'home-theater': ['home theater', 'power seating'],
      beds: ['bed'],
      dressers: ['dresser'],
      nightstands: ['nightstand'],
      'dining-tables': ['dining table', 'table'],
      'dining-chairs': ['dining chair', 'chair'],
      'bar-stools': ['bar stool', 'barstool'],
      'mattress-sets': ['mattress'],
      foundations: ['foundation', 'box spring'],
      queen: ['queen'],
      king: ['king']
    };

    const exclusionsBySubcategory: Record<string, string[]> = {
      beds: ['mirror', 'dresser', 'chest', 'nightstand', 'vanity', 'bench', 'foundation', 'mattress'],
      dressers: ['mirror only', 'mirror'],
      chests: ['mirror', 'dresser'],
      nightstands: ['mirror', 'dresser', 'chest'],
      sofas: ['loveseat', 'sectional', 'recliner', 'sleeper'],
      loveseats: ['sofa', 'sectional'],
      recliners: ['sofa', 'loveseat', 'sectional'],
      'dining-tables': ['chair', 'bench', 'stool'],
      'dining-chairs': ['table', 'bench', 'stool'],
      'bar-stools': ['table', 'chair set']
    };

    const exclusions = exclusionsBySubcategory[subcategory] || [];
    if (exclusions.some((keyword) => this.textContainsTerm(searchableText, keyword))) {
      return false;
    }

    const keywords = keywordsBySubcategory[subcategory] || subcategory.split('-');
    return keywords.some((keyword) => this.textContainsTerm(searchableText, keyword));
  }

  private textContainsTerm(text: string, term: string) {
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escapedTerm}\\b`).test(text);
  }

  private productMatchesSearch(product: Product, searchQuery: string) {
    const words = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
    const searchableText = `${product.name} ${product.sku} ${product.kicker || ''}`.toLowerCase();
    return words.every((word) => searchableText.includes(word));
  }

  private sortProducts(products: Product[]) {
    const sortedProducts = [...products];

    if (this.catalogSort === 'price-low') {
      return sortedProducts.sort((left, right) => left.unitPrice - right.unitPrice);
    }

    if (this.catalogSort === 'price-high') {
      return sortedProducts.sort((left, right) => right.unitPrice - left.unitPrice);
    }

    if (this.catalogSort === 'name') {
      return sortedProducts.sort((left, right) => left.name.localeCompare(right.name));
    }

    return sortedProducts;
  }

  private socialIcon(text: string, color: string) {
    const label = encodeURIComponent(text.toUpperCase());
    const background = encodeURIComponent(color);
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='30' fill='${background}'/%3E%3Ctext x='32' y='39' text-anchor='middle' font-size='22' font-family='Arial,sans-serif' font-weight='700' fill='white'%3E${label}%3C/text%3E%3C/svg%3E`;
  }

  private categoryImage(label: string) {
    const cleanLabel = label.replace(/&/g, 'and');
    const encodedLabel = encodeURIComponent(cleanLabel.toUpperCase());
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 420 320'%3E%3Crect width='420' height='320' rx='160' fill='%23f1f1f1'/%3E%3Cg fill='none' stroke='%23666' stroke-width='14' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M98 180h224v64H98z' fill='%23d8d8d8'/%3E%3Cpath d='M122 130h176c24 0 44 20 44 44v6H78v-6c0-24 20-44 44-44z' fill='%23eeeeee'/%3E%3Cpath d='M98 244v28M322 244v28M146 180v64M274 180v64'/%3E%3C/g%3E%3Ctext x='210' y='62' text-anchor='middle' font-family='Arial,sans-serif' font-size='24' font-weight='700' fill='%23333'%3E${encodedLabel}%3C/text%3E%3C/svg%3E`;
  }
}
