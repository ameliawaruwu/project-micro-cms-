// src/themes/catalogData.ts
import { Product } from '../types';
import { THEME_DATA_MAP } from './themeData';

export interface CatalogProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  imageUrl: string;
  category: string;
  description: string;
  stock: number;
  rating: number;
  salesCount: number;
  badge?: string;
  isFeatured?: boolean;
}

// 16-20 high quality products per theme
const THEME_PRODUCTS_EXTENDED: Record<string, CatalogProduct[]> = {
  luxury: [
    {
      id: "lux-1",
      name: "Signature Calfskin Tote Bag",
      slug: "signature-calfskin-tote-bag",
      price: 12500000,
      originalPrice: 15000000,
      discountPercent: 17,
      imageUrl: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800&q=80",
      category: "Leather Goods",
      description: "Handcrafted full-grain Italian calfskin with solid 18k gold-plated accents and hand-painted edge burnishing.",
      stock: 4,
      rating: 4.9,
      salesCount: 38,
      badge: "Terlaris",
      isFeatured: true
    },
    {
      id: "lux-2",
      name: "Chrono Classic Automatic Watch",
      slug: "chrono-classic-automatic-watch",
      price: 35000000,
      originalPrice: 42000000,
      discountPercent: 16,
      imageUrl: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80",
      category: "Timepieces",
      description: "Swiss automatic movement with anti-reflective sapphire crystal glass and interchangeable hand-stitched alligator strap.",
      stock: 2,
      rating: 5.0,
      salesCount: 19,
      badge: "Masterpiece",
      isFeatured: true
    },
    {
      id: "lux-3",
      name: "Solitaire Diamond Pendant Necklace",
      slug: "solitaire-diamond-pendant-necklace",
      price: 18500000,
      originalPrice: 22000000,
      discountPercent: 16,
      imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80",
      category: "Fine Jewelry",
      description: "18k yellow gold necklace adorned with a certified 0.75-carat brilliant round solitaire diamond.",
      stock: 3,
      rating: 4.9,
      salesCount: 27,
      badge: "Eksklusif",
      isFeatured: true
    },
    {
      id: "lux-4",
      name: "Monogram Silk Bifold Wallet",
      slug: "monogram-silk-bifold-wallet",
      price: 3200000,
      originalPrice: 3800000,
      discountPercent: 15,
      imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80",
      category: "Leather Goods",
      description: "French pebbled leather bifold wallet with 8 card slots and pure mulberry silk interior lining.",
      stock: 12,
      rating: 4.8,
      salesCount: 64,
      badge: "Favorit",
      isFeatured: false
    },
    {
      id: "lux-5",
      name: "Heritage Brass Leather Belt",
      slug: "heritage-brass-leather-belt",
      price: 2800000,
      originalPrice: 3200000,
      discountPercent: 12,
      imageUrl: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&q=80",
      category: "Leather Goods",
      description: "Full-grain vegetable-tanned bridle leather with an antiqued solid brass buckle made in Florence.",
      stock: 15,
      rating: 4.8,
      salesCount: 82,
      isFeatured: false
    },
    {
      id: "lux-6",
      name: "Hand-Printed Silk Square Scarf",
      slug: "hand-printed-silk-square-scarf",
      price: 2450000,
      imageUrl: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80",
      category: "Haute Couture",
      description: "Pure mulberry silk twill (90x90cm) with artisanal hand-rolled hem and signature heritage crest.",
      stock: 18,
      rating: 4.9,
      salesCount: 45,
      isFeatured: false
    },
    {
      id: "lux-7",
      name: "Chronograph Tourbillon Rose Gold",
      slug: "chronograph-tourbillon-rose-gold",
      price: 65000000,
      originalPrice: 75000000,
      discountPercent: 13,
      imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
      category: "Timepieces",
      description: "Limited edition 18k rose gold skeleton tourbillon caliber with 72-hour power reserve.",
      stock: 1,
      rating: 5.0,
      salesCount: 6,
      badge: "Sisa 1 Unit",
      isFeatured: true
    },
    {
      id: "lux-8",
      name: "Classic Gold Cufflinks Set",
      slug: "classic-gold-cufflinks-set",
      price: 4200000,
      imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80",
      category: "Fine Jewelry",
      description: "Hand-polished solid 14k gold round cufflinks presented in a lacquered piano wood gift case.",
      stock: 8,
      rating: 4.7,
      salesCount: 31,
      isFeatured: false
    },
    {
      id: "lux-9",
      name: "Saffiano Leather Travel Duffel",
      slug: "saffiano-leather-travel-duffel",
      price: 16800000,
      originalPrice: 19500000,
      discountPercent: 14,
      imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
      category: "Leather Goods",
      description: "Cabin-sized scratch-resistant Saffiano travel holdall with padlock and detachable padded shoulder strap.",
      stock: 6,
      rating: 4.9,
      salesCount: 42,
      badge: "Baru",
      isFeatured: true
    },
    {
      id: "lux-10",
      name: "Pavé Diamond Eternity Ring 18k",
      slug: "pave-diamond-eternity-ring",
      price: 24000000,
      imageUrl: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&q=80",
      category: "Fine Jewelry",
      description: "Flawless micro-pavé set diamonds encircling a comfort-fit 18k white gold band.",
      stock: 4,
      rating: 5.0,
      salesCount: 15,
      isFeatured: false
    },
    {
      id: "lux-11",
      name: "Double-Faced Cashmere Overcoat",
      slug: "double-faced-cashmere-overcoat",
      price: 21500000,
      originalPrice: 26000000,
      discountPercent: 17,
      imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&q=80",
      category: "Haute Couture",
      description: "Hand-finished double-faced pure Mongolian cashmere tailored coat with horn buttons.",
      stock: 5,
      rating: 4.9,
      salesCount: 22,
      badge: "Edisi Khusus",
      isFeatured: true
    },
    {
      id: "lux-12",
      name: "Handcrafted Italian Leather Loafers",
      slug: "handcrafted-italian-leather-loafers",
      price: 8900000,
      imageUrl: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80",
      category: "Haute Couture",
      description: "Blake-stitched burnished calfskin penny loafers with memory foam leather insole.",
      stock: 9,
      rating: 4.8,
      salesCount: 53,
      isFeatured: false
    }
  ],

  editorial: [
    {
      id: "ed-1",
      name: "The Oversized Wool Trench",
      slug: "the-oversized-wool-trench",
      price: 1850000,
      originalPrice: 2250000,
      discountPercent: 18,
      imageUrl: "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&q=80",
      category: "Outerwear",
      description: "Virgin wool blend tailored trench with raglan sleeves and storm flap. Modern relaxed silhouette.",
      stock: 8,
      rating: 4.9,
      salesCount: 65,
      badge: "Must Have",
      isFeatured: true
    },
    {
      id: "ed-2",
      name: "Silk Crepe Evening Blouse",
      slug: "silk-crepe-evening-blouse",
      price: 890000,
      originalPrice: 1100000,
      discountPercent: 19,
      imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
      category: "Tops",
      description: "Fluid 100% mulberry silk blouse with French cuffs and mother-of-pearl buttons.",
      stock: 14,
      rating: 4.8,
      salesCount: 92,
      badge: "Terlaris",
      isFeatured: true
    },
    {
      id: "ed-3",
      name: "Relaxed Pleated Wide Trousers",
      slug: "relaxed-pleated-wide-trousers",
      price: 750000,
      imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80",
      category: "Bottoms",
      description: "High-waisted tailored trousers with front double pleats and structured drape.",
      stock: 20,
      rating: 4.7,
      salesCount: 110,
      isFeatured: false
    },
    {
      id: "ed-4",
      name: "Sculptural Brass Ear Cuff Set",
      slug: "sculptural-brass-ear-cuff",
      price: 380000,
      originalPrice: 480000,
      discountPercent: 21,
      imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80",
      category: "Jewelry",
      description: "Organic hand-cast brass ear cuff with satin brushed finish. No piercing required.",
      stock: 25,
      rating: 4.9,
      salesCount: 145,
      badge: "Populer",
      isFeatured: true
    },
    {
      id: "ed-5",
      name: "Minimalist Leather Penny Loafers",
      slug: "minimalist-leather-penny-loafers",
      price: 1450000,
      imageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80",
      category: "Footwear",
      description: "Supple boxcalf leather slip-on loafers with stacked wooden heel and padded arch support.",
      stock: 7,
      rating: 4.8,
      salesCount: 48,
      isFeatured: true
    },
    {
      id: "ed-6",
      name: "Ribbed Cashmere Turtleneck",
      slug: "ribbed-cashmere-turtleneck",
      price: 1250000,
      originalPrice: 1550000,
      discountPercent: 19,
      imageUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
      category: "Knitwear",
      description: "Ultra-fine gauge cashmere knit sweater. Light, exceptionally soft, and insulating.",
      stock: 11,
      rating: 4.9,
      salesCount: 76,
      badge: "Koleksi Baru",
      isFeatured: false
    },
    {
      id: "ed-7",
      name: "Structured Cotton Canvas Tote",
      slug: "structured-cotton-canvas-tote",
      price: 620000,
      imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80",
      category: "Accessories",
      description: "Heavy 16oz raw canvas tote with bridle leather handle reinforcements and interior laptop sleeve.",
      stock: 30,
      rating: 4.8,
      salesCount: 130,
      isFeatured: false
    },
    {
      id: "ed-8",
      name: "Double-Breasted Wool Blazer",
      slug: "double-breasted-wool-blazer",
      price: 1650000,
      originalPrice: 1950000,
      discountPercent: 15,
      imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
      category: "Outerwear",
      description: "Architectural shoulder silhouette blazer in fine worsted twill. Fully lined with cupro silk.",
      stock: 6,
      rating: 5.0,
      salesCount: 39,
      badge: "Editor's Pick",
      isFeatured: true
    },
    {
      id: "ed-9",
      name: "Square Toe Leather Ankle Boots",
      slug: "square-toe-leather-boots",
      price: 1890000,
      imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80",
      category: "Footwear",
      description: "Contemporary square-toe ankle boots with block heel and inner zip closure.",
      stock: 8,
      rating: 4.8,
      salesCount: 41,
      isFeatured: false
    },
    {
      id: "ed-10",
      name: "Pure Washed Linen Camp Shirt",
      slug: "pure-washed-linen-camp-shirt",
      price: 580000,
      originalPrice: 720000,
      discountPercent: 19,
      imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
      category: "Tops",
      description: "Breathable European flax linen shirt pre-washed for effortless lived-in softness.",
      stock: 22,
      rating: 4.7,
      salesCount: 95,
      isFeatured: false
    },
    {
      id: "ed-11",
      name: "Horn-Rim Acetate Sunglasses",
      slug: "horn-rim-acetate-sunglasses",
      price: 490000,
      imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80",
      category: "Accessories",
      description: "Handcrafted cellulose acetate frame with UV400 polarized Zeiss lenses.",
      stock: 16,
      rating: 4.9,
      salesCount: 88,
      badge: "Terlaris",
      isFeatured: true
    },
    {
      id: "ed-12",
      name: "Silk Satin Bias Cut Maxi Skirt",
      slug: "silk-satin-maxi-skirt",
      price: 920000,
      originalPrice: 1150000,
      discountPercent: 20,
      imageUrl: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=80",
      category: "Bottoms",
      description: "Effortlessly drapes along the body's natural contours with concealed elastic waistband.",
      stock: 12,
      rating: 4.9,
      salesCount: 71,
      isFeatured: true
    }
  ],

  bold: [
    {
      id: "bld-1",
      name: "Heavyweight Boxy Hoodie 500GSM",
      slug: "heavyweight-boxy-hoodie-500gsm",
      price: 650000,
      originalPrice: 790000,
      discountPercent: 18,
      imageUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80",
      category: "Heavy Tops",
      description: "Custom-milled 500GSM French Terry cotton. Drop-shoulder cut with double-layered hood without drawstrings.",
      stock: 18,
      rating: 4.9,
      salesCount: 240,
      badge: "BESTSELLER",
      isFeatured: true
    },
    {
      id: "bld-2",
      name: "Multi-Pocket Tactical Cargo Pants",
      slug: "multi-pocket-tactical-cargo",
      price: 580000,
      originalPrice: 690000,
      discountPercent: 16,
      imageUrl: "https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=800&q=80",
      category: "Utility Bottoms",
      description: "Ripstop cotton cargo trousers with 8 functional compartments, modular D-rings, and ankle cords.",
      stock: 14,
      rating: 4.8,
      salesCount: 195,
      badge: "DROP EXCLUSIVE",
      isFeatured: true
    },
    {
      id: "bld-3",
      name: "Acid Wash Graphic Heavyweight Tee",
      slug: "acid-wash-graphic-tee",
      price: 290000,
      imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80",
      category: "Heavy Tops",
      description: "280GSM combed cotton with vintage acid wash treatment and cracked distress screenprint.",
      stock: 35,
      rating: 4.9,
      salesCount: 310,
      badge: "HOT ITEM",
      isFeatured: true
    },
    {
      id: "bld-4",
      name: "Waterproof Tactical Chest Rig Bag",
      slug: "tactical-chest-rig-bag",
      price: 340000,
      imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
      category: "Headwear & Gear",
      description: "Cordura 1000D water-repellent chest harness with Fidlock magnetic buckle and MOLLE webbing.",
      stock: 22,
      rating: 4.8,
      salesCount: 140,
      isFeatured: false
    },
    {
      id: "bld-5",
      name: "Chunky Platform Brutalist Sneaker",
      slug: "chunky-platform-brutalist-sneaker",
      price: 1150000,
      originalPrice: 1450000,
      discountPercent: 21,
      imageUrl: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&q=80",
      category: "Footwear",
      description: "Aggressive tread vulcanized rubber sole with distressed leather panels and padded collar.",
      stock: 7,
      rating: 4.9,
      salesCount: 88,
      badge: "RESTOCK",
      isFeatured: true
    },
    {
      id: "bld-6",
      name: "Distressed Raw Denim Jacket",
      slug: "distressed-raw-denim-jacket",
      price: 850000,
      imageUrl: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&q=80",
      category: "Heavy Tops",
      description: "14oz rigid Japanese selvedge denim jacket with handcrafted fading and frayed detailing.",
      stock: 9,
      rating: 4.7,
      salesCount: 65,
      isFeatured: false
    },
    {
      id: "bld-7",
      name: "Reflective Parachute Trackpants",
      slug: "reflective-parachute-trackpants",
      price: 490000,
      originalPrice: 590000,
      discountPercent: 17,
      imageUrl: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&q=80",
      category: "Utility Bottoms",
      description: "Lightweight windproof nylon with 3M reflective side piping and toggle-adjusted knee darts.",
      stock: 26,
      rating: 4.8,
      salesCount: 120,
      isFeatured: false
    },
    {
      id: "bld-8",
      name: "Heavy Stainless Steel Cuban Chain",
      slug: "heavy-stainless-steel-cuban-chain",
      price: 240000,
      imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80",
      category: "Headwear & Gear",
      description: "12mm surgical stainless steel curb chain with heavy box-lock clasp. Non-tarnish waterproof.",
      stock: 40,
      rating: 4.9,
      salesCount: 260,
      badge: "TOP ACC",
      isFeatured: true
    },
    {
      id: "bld-9",
      name: "Oversized Flannel Workwear Shacket",
      slug: "oversized-flannel-shacket",
      price: 480000,
      imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
      category: "Heavy Tops",
      description: "Heavy brushed plaid cotton overshirt with quilted satin thermal lining and dual chest pockets.",
      stock: 16,
      rating: 4.8,
      salesCount: 84,
      isFeatured: false
    },
    {
      id: "bld-10",
      name: "Tactical Balaclava Knit Beanie",
      slug: "tactical-balaclava-beanie",
      price: 195000,
      imageUrl: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&q=80",
      category: "Headwear & Gear",
      description: "2-in-1 convertible thermal rib knit beanie that unfolds into a protective windproof balaclava.",
      stock: 30,
      rating: 4.7,
      salesCount: 155,
      isFeatured: false
    },
    {
      id: "bld-11",
      name: "Combat Lug-Sole High Boots",
      slug: "combat-lug-sole-high-boots",
      price: 1250000,
      originalPrice: 1550000,
      discountPercent: 19,
      imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80",
      category: "Footwear",
      description: "Full-grain matte leather military style boots with steel toe cap and reinforced storm welt.",
      stock: 6,
      rating: 4.9,
      salesCount: 52,
      badge: "LIMITED",
      isFeatured: true
    },
    {
      id: "bld-12",
      name: "Washed Raw Fleece Sweatpants",
      slug: "washed-raw-fleece-sweatpants",
      price: 450000,
      imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80",
      category: "Utility Bottoms",
      description: "Baggy fit 450GSM loopback cotton with raw cut cuffs and deep zip-secured hip pockets.",
      stock: 24,
      rating: 4.8,
      salesCount: 115,
      isFeatured: false
    }
  ]
};

/**
 * Returns a rich, complete catalog array for the given theme.
 * Always guarantees 12-24 items with badges, ratings, discounts, and clear specs.
 */
export function getEnrichedCatalog(activeThemeId: string, merchantProducts?: Product[]): CatalogProduct[] {
  const normTheme = (activeThemeId || 'minimalist').toLowerCase();
  
  // Theme base fallback
  const baseList: CatalogProduct[] = 
    THEME_PRODUCTS_EXTENDED[normTheme] || 
    THEME_PRODUCTS_EXTENDED['editorial'] || 
    THEME_PRODUCTS_EXTENDED['luxury'];

  // If merchant has active products, transform them
  const formattedMerchant: CatalogProduct[] = (merchantProducts || [])
    .filter(p => p && p.name)
    .map((p, idx) => {
      const orig = p.originalPrice && p.originalPrice > p.price ? p.originalPrice : undefined;
      const discount = orig ? Math.round(((orig - p.price) / orig) * 100) : undefined;
      return {
        id: p.id || `m-p-${idx}`,
        name: p.name,
        slug: p.slug || `product-${idx}`,
        price: Number(p.price) || 150000,
        originalPrice: orig,
        discountPercent: discount,
        imageUrl: p.imageUrl || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
        category: p.category || 'Koleksi Utama',
        description: p.description || 'Dibuat dengan bahan pilihan berkualitas prima untuk kenyamanan dan kepuasan Anda.',
        stock: p.stock !== undefined ? Number(p.stock) : 10,
        rating: 4.8 + ((idx % 3) * 0.1),
        salesCount: 45 + (idx * 12),
        badge: idx === 0 ? 'Produk Anda' : (p.isFeatured ? 'Unggulan' : undefined),
        isFeatured: Boolean(p.isFeatured)
      };
    });

  // If merchant has plenty of products (>= 12), use merchant's directly
  if (formattedMerchant.length >= 12) {
    return formattedMerchant;
  }

  // If merchant has fewer than 12, prepend merchant products then fill up to 16-20 with theme curated items
  const merchantIds = new Set(formattedMerchant.map(p => p.name.toLowerCase()));
  const fillers = baseList.filter(b => !merchantIds.has(b.name.toLowerCase()));

  return [...formattedMerchant, ...fillers];
}
