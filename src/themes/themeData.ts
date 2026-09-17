import { CmsStoreInfo, CmsProduct, CmsCategory, CmsNavigationItem } from '../cms/mockCmsData';

export interface ThemeData {
  storeInfo: CmsStoreInfo;
  products: CmsProduct[];
  categories: CmsCategory[];
  navigation: CmsNavigationItem[];
}

export const THEME_DATA_MAP: Record<string, ThemeData> = {
  // 1. MINIMALIST (MONO OBJECT - Home & Lifestyle / Furniture)
  minimalist: {
    storeInfo: {
      name: "MONO OBJECT",
      description: "Objects Made for Everyday Living. Simple, calm, functional design.",
      address: "123 Serenity Ave, Minimal City",
      email: "hello@monoobject.com",
      phone: "+62 811 1111 1111",
      socials: { instagram: "@mono.object" }
    },
    categories: [
      { id: "mc1", name: "Ceramics", slug: "ceramics", image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80" },
      { id: "mc2", name: "Textiles", slug: "textiles", image: "https://images.unsplash.com/photo-1584346535787-83d47d4e5f7f?w=800&q=80" },
      { id: "mc3", name: "Lighting", slug: "lighting", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80" },
      { id: "mc4", name: "Woodwork", slug: "woodwork", image: "https://images.unsplash.com/photo-1618684992925-508544e31fb0?w=800&q=80" }
    ],
    products: [
      {
        id: "mp1", name: "Artisan Ceramic Mug", slug: "ceramic-mug", price: 150000,
        image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80",
        categoryId: "mc1", categoryName: "Ceramics",
        description: "Matte finish ceramic mug handcrafted for your morning coffee ritual.",
        status: "active", isFeatured: true, isNew: true, stock: 50
      },
      {
        id: "mp2", name: "Woven Organic Linen Cushion", slug: "linen-cushion", price: 250000,
        image: "https://images.unsplash.com/photo-1584346535787-83d47d4e5f7f?w=800&q=80",
        categoryId: "mc2", categoryName: "Textiles",
        description: "Pure organic linen cushion cover with concealed metal zipper.",
        status: "active", isFeatured: true, isNew: false, stock: 30
      },
      {
        id: "mp3", name: "Solid Oak Serving Tray", slug: "oak-tray", price: 320000,
        image: "https://images.unsplash.com/photo-1618684992925-508544e31fb0?w=800&q=80",
        categoryId: "mc4", categoryName: "Woodwork",
        description: "Minimalist solid oak serving tray finished with natural beeswax.",
        status: "active", isFeatured: false, isNew: true, stock: 15
      },
      {
        id: "mp4", name: "Sculptural Desk Lamp", slug: "minimal-lamp", price: 850000,
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80",
        categoryId: "mc3", categoryName: "Lighting",
        description: "Sleek aluminum table lamp with warm dimmable LED lighting.",
        status: "active", isFeatured: true, isNew: false, stock: 10
      },
      {
        id: "mp5", name: "Minimalist Storage Box", slug: "storage-box", price: 195000,
        image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&q=80",
        categoryId: "mc4", categoryName: "Woodwork",
        description: "Stackable wooden desk organizer for stationery and daily accessories.",
        status: "active", isFeatured: false, isNew: true, stock: 25
      },
      {
        id: "mp6", name: "Handmade Ceramic Pitcher", slug: "ceramic-pitcher", price: 280000,
        image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80",
        categoryId: "mc1", categoryName: "Ceramics",
        description: "Speckled stoneware water pitcher with ergonomic pouring handle.",
        status: "active", isFeatured: true, isNew: false, stock: 20
      },
      {
        id: "mp7", name: "Natural Slate Coaster Set", slug: "slate-coasters", price: 120000,
        image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&q=80",
        categoryId: "mc1", categoryName: "Ceramics",
        description: "Set of 4 raw edge slate coasters with padded felt bottoms.",
        status: "active", isFeatured: false, isNew: false, stock: 40
      },
      {
        id: "mp8", name: "Architectural Floor Lamp", slug: "floor-lamp", price: 1450000,
        image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80",
        categoryId: "mc3", categoryName: "Lighting",
        description: "Slender matte black metal floor lamp for ambient room illumination.",
        status: "active", isFeatured: true, isNew: true, stock: 8
      }
    ],
    navigation: [
      { id: "n1", label: "Shop", route: "/katalog", order: 1, isActive: true },
      { id: "n2", label: "Philosophy", route: "/tentang", order: 2, isActive: true },
      { id: "n3", label: "Journal", route: "/berita", order: 3, isActive: true }
    ]
  },

  // 2. MODERN (NOVA COMMERCE - Contemporary Gadgets & Everyday Gear)
  modern: {
    storeInfo: {
      name: "NOVA COMMERCE",
      description: "Cutting-edge tech, smart lifestyle gadgets & minimalist everyday gear.",
      address: "88 Silicon Highway, Jakarta",
      email: "hello@novacommerce.io",
      phone: "+62 812 8888 9999",
      socials: { instagram: "@nova.commerce", twitter: "@novacommerce" }
    },
    categories: [
      { id: "mod_c1", name: "Audio", slug: "audio", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80" },
      { id: "mod_c2", name: "Wearables", slug: "wearables", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80" },
      { id: "mod_c3", name: "Workspace", slug: "workspace", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80" }
    ],
    products: [
      {
        id: "mod_p1", name: "Pro ANC Wireless Headphones", slug: "anc-headphones", price: 1890000,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
        categoryId: "mod_c1", categoryName: "Audio",
        description: "Active noise canceling Bluetooth headphones with 40-hour battery life.",
        status: "active", isFeatured: true, isNew: true, stock: 45
      },
      {
        id: "mod_p2", name: "Nova Smartwatch Ultra", slug: "smartwatch-ultra", price: 2490000,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
        categoryId: "mod_c2", categoryName: "Wearables",
        description: "AMOLED fitness smartwatch with blood oxygen monitor and GPS tracking.",
        status: "active", isFeatured: true, isNew: true, stock: 25
      },
      {
        id: "mod_p3", name: "Ergonomic Wireless Mouse", slug: "ergo-mouse", price: 650000,
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80",
        categoryId: "mod_c3", categoryName: "Workspace",
        description: "Precision wireless mouse with customizable thumb buttons & dual Bluetooth.",
        status: "active", isFeatured: false, isNew: false, stock: 60
      },
      {
        id: "mod_p4", name: "MagSafe 10000mAh Powerbank", slug: "magsafe-powerbank", price: 490000,
        image: "https://images.unsplash.com/photo-1609592424074-12ec313e648f?w=800&q=80",
        categoryId: "mod_c3", categoryName: "Workspace",
        description: "Fast wireless magnetic charging power bank with aluminum body.",
        status: "active", isFeatured: true, isNew: false, stock: 80
      },
      {
        id: "mod_p5", name: "Sonic Earbuds ANC", slug: "sonic-earbuds", price: 890000,
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80",
        categoryId: "mod_c1", categoryName: "Audio",
        description: "Low-latency wireless earbuds with active noise cancellation & transparency mode.",
        status: "active", isFeatured: true, isNew: true, stock: 35
      },
      {
        id: "mod_p6", name: "Ultra-Thin Portable Monitor 15.6\"", slug: "portable-monitor", price: 2150000,
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
        categoryId: "mod_c3", categoryName: "Workspace",
        description: "FHD IPS Type-C external monitor for laptop dual-screen productivity.",
        status: "active", isFeatured: false, isNew: true, stock: 15
      },
      {
        id: "mod_p7", name: "Smart Bluetooth Speaker 20W", slug: "smart-speaker", price: 750000,
        image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80",
        categoryId: "mod_c1", categoryName: "Audio",
        description: "Waterproof 360-degree bass Bluetooth speaker with voice assistant.",
        status: "active", isFeatured: true, isNew: false, stock: 40
      },
      {
        id: "mod_p8", name: "Mechanical Wireless Keyboard", slug: "mech-keyboard-mod", price: 1350000,
        image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80",
        categoryId: "mod_c3", categoryName: "Workspace",
        description: "Compact 75% hot-swappable wireless mechanical keyboard with RGB backlighting.",
        status: "active", isFeatured: false, isNew: false, stock: 30
      }
    ],
    navigation: [
      { id: "mod_n1", label: "Gadgets", route: "/katalog", order: 1, isActive: true },
      { id: "mod_n2", label: "Promo", route: "/promo", order: 2, isActive: true },
      { id: "mod_n3", label: "Support", route: "/kontak", order: 3, isActive: true }
    ]
  },

  // 3. FUTURISTIC (NEON//LAB - Smart Technology & Cyber Hardware)
  futuristic: {
    storeInfo: {
      name: "NEON//LAB",
      description: "Designed for Tomorrow. Smart devices, neural tech & cyber peripherals.",
      address: "Sector 7, Neo Tokyo Cyber District",
      email: "sys@neonlab.io",
      phone: "+81 90 1234 5678",
      socials: { instagram: "@neon_lab", twitter: "@neon_lab" }
    },
    categories: [
      { id: "fc1", name: "Smart Devices", slug: "smart-devices", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80" },
      { id: "fc2", name: "Cyber Peripherals", slug: "peripherals", image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80" },
      { id: "fc3", name: "Power Grid", slug: "power", image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80" }
    ],
    products: [
      {
        id: "fp1", name: "Smart Watch Ultra Cyber-X", slug: "smart-watch-cyber", price: 2950000,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
        categoryId: "fc1", categoryName: "Smart Devices",
        description: "Titanium alloy smartwatch with holographic UI, biometrics & satellite connectivity.",
        status: "active", isFeatured: true, isNew: true, stock: 30
      },
      {
        id: "fp2", name: "Cyber Matrix Mech Keyboard", slug: "modular-keyboard", price: 2100000,
        image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80",
        categoryId: "fc2", categoryName: "Cyber Peripherals",
        description: "Translucent hot-swappable mechanical keyboard with programmable LED matrix.",
        status: "active", isFeatured: true, isNew: false, stock: 15
      },
      {
        id: "fp3", name: "GaN Fast Charging Hub 120W", slug: "charging-hub-120w", price: 980000,
        image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80",
        categoryId: "fc3", categoryName: "Power Grid",
        description: "Interactive OLED GaN charging station capable of powering 4 high-draw devices simultaneously.",
        status: "active", isFeatured: true, isNew: true, stock: 50
      },
      {
        id: "fp4", name: "Neural Wireless Cyberpods", slug: "cyberpods", price: 1450000,
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80",
        categoryId: "fc1", categoryName: "Smart Devices",
        description: "Zero-latency active noise canceling earbuds with glowing cyberpunk charging case.",
        status: "active", isFeatured: true, isNew: false, stock: 40
      },
      {
        id: "fp5", name: "AR Smart Glass Display", slug: "ar-glasses", price: 4850000,
        image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80",
        categoryId: "fc1", categoryName: "Smart Devices",
        description: "Micro-OLED augmented reality glasses featuring real-time HUD navigation.",
        status: "active", isFeatured: true, isNew: true, stock: 10
      },
      {
        id: "fp6", name: "Portable Hologram Monitor 16\"", slug: "hologram-monitor", price: 3450000,
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
        categoryId: "fc2", categoryName: "Cyber Peripherals",
        description: "Ultra-slim 4K portable touchscreen display with magnetic Cyberstand.",
        status: "active", isFeatured: false, isNew: true, stock: 12
      },
      {
        id: "fp7", name: "Precision Gaming Cyber-Mouse", slug: "cyber-mouse", price: 890000,
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80",
        categoryId: "fc2", categoryName: "Cyber Peripherals",
        description: "26,000 DPI optical sensor lightweight gaming mouse with ceramic feet.",
        status: "active", isFeatured: false, isNew: false, stock: 25
      },
      {
        id: "fp8", name: "Quantum Mag Charging Dock", slug: "quantum-dock", price: 1250000,
        image: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800&q=80",
        categoryId: "fc3", categoryName: "Power Grid",
        description: "3-in-1 magnetic wireless charging dock with reactive RGB underglow.",
        status: "active", isFeatured: true, isNew: false, stock: 30
      }
    ],
    navigation: [
      { id: "fn1", label: "Devices", route: "/katalog", order: 1, isActive: true },
      { id: "fn2", label: "Specs", route: "/tentang", order: 2, isActive: true },
      { id: "fn3", label: "Innovation", route: "/berita", order: 3, isActive: true }
    ]
  },

  // 4. LUXURY (MAISON ÉLAN - Fine Jewelry, Luxury Timepieces & Leatherwork)
  luxury: {
    storeInfo: {
      name: "MAISON ÉLAN",
      description: "The Art of Quiet Luxury. Timeless elegance, exquisite leatherwork & fine watches.",
      address: "128 Fifth Ave, New York, NY",
      email: "concierge@maisonelan.com",
      phone: "+1 212 555 0199",
      socials: { instagram: "@maison.elan" }
    },
    categories: [
      { id: "lc1", name: "Leather Goods", slug: "leather-goods", image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80" },
      { id: "lc2", name: "Timepieces", slug: "timepieces", image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80" },
      { id: "lc3", name: "Fine Jewelry", slug: "jewelry", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80" }
    ],
    products: [
      {
        id: "lp1", name: "Signature Calfskin Tote Bag", slug: "leather-bag", price: 12500000,
        image: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800&q=80",
        categoryId: "lc1", categoryName: "Leather Goods",
        description: "Hand-stitched full-grain Italian calfskin tote with brushed 18k gold hardware.",
        status: "active", isFeatured: true, isNew: true, stock: 5
      },
      {
        id: "lp2", name: "Chrono Classic Automatic Watch", slug: "classic-watch", price: 35000000,
        image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80",
        categoryId: "lc2", categoryName: "Timepieces",
        description: "Swiss automatic movement watch with anti-reflective sapphire crystal glass.",
        status: "active", isFeatured: true, isNew: false, stock: 2
      },
      {
        id: "lp3", name: "Monogram Silk Bifold Wallet", slug: "silk-wallet", price: 3200000,
        image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80",
        categoryId: "lc1", categoryName: "Leather Goods",
        description: "Textured French leather bifold wallet lined with hand-printed mulberry silk.",
        status: "active", isFeatured: false, isNew: true, stock: 12
      },
      {
        id: "lp4", name: "Heritage Brass Leather Belt", slug: "heritage-belt", price: 2800000,
        image: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&q=80",
        categoryId: "lc1", categoryName: "Leather Goods",
        description: "Full-grain vegetable tanned belt featuring solid antique brass buckle.",
        status: "active", isFeatured: true, isNew: false, stock: 15
      },
      {
        id: "lp5", name: "Solitaire Diamond Pendant Necklace", slug: "lux-diamond-pendant", price: 18500000,
        image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80",
        categoryId: "lc3", categoryName: "Fine Jewelry",
        description: "18k yellow gold pendant featuring a certified 0.75-carat solitaire diamond.",
        status: "active", isFeatured: true, isNew: true, stock: 3
      },
      {
        id: "lp6", name: "Hand-Printed Silk Square Scarf", slug: "silk-scarf-lux", price: 2450000,
        image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80",
        categoryId: "lc1", categoryName: "Leather Goods",
        description: "Pure mulberry silk twill scarf with hand-rolled edges and heritage crest print.",
        status: "active", isFeatured: false, isNew: false, stock: 20
      },
      {
        id: "lp7", name: "Chronograph Tourbillon Rose Gold", slug: "tourbillon-watch", price: 65000000,
        image: "https://images.unsplash.com/photo-1547996160-012745cc5836?w=800&q=80",
        categoryId: "lc2", categoryName: "Timepieces",
        description: "Limited-edition rose gold skeleton tourbillon timepiece with alligator strap.",
        status: "active", isFeatured: true, isNew: true, stock: 1
      },
      {
        id: "lp8", name: "Classic Gold Cufflinks Set", slug: "gold-cufflinks", price: 4200000,
        image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80",
        categoryId: "lc3", categoryName: "Fine Jewelry",
        description: "Solid 14k gold polished round cufflinks presented in a cedar wooden box.",
        status: "active", isFeatured: false, isNew: false, stock: 8
      }
    ],
    navigation: [
      { id: "ln1", label: "Boutique", route: "/katalog", order: 1, isActive: true },
      { id: "ln2", label: "Heritage", route: "/tentang", order: 2, isActive: true },
      { id: "ln3", label: "Concierge", route: "/kontak", order: 3, isActive: true }
    ]
  },

  // 5. BOLD (RAWSTATE - Streetwear & Urban Culture)
  bold: {
    storeInfo: {
      name: "RAWSTATE",
      description: "NO RULES. JUST MOVEMENT. Heavyweight streetwear & underground culture.",
      address: "Underground St 404, Berlin",
      email: "drop@rawstate.co",
      phone: "+49 30 1234567",
      socials: { instagram: "@rawstate" }
    },
    categories: [
      { id: "bc1", name: "Heavy Tops", slug: "tops", image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80" },
      { id: "bc2", name: "Utility Bottoms", slug: "bottoms", image: "https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=800&q=80" },
      { id: "bc3", name: "Headwear & Gear", slug: "gear", image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80" }
    ],
    products: [
      {
        id: "bp1", name: "Heavyweight Oversized Hoodie 500GSM", slug: "oversized-hoodie", price: 650000,
        image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80",
        categoryId: "bc1", categoryName: "Heavy Tops",
        description: "500GSM French Terry cotton oversized hoodie with acid wash finish and boxy fit.",
        status: "active", isFeatured: true, isNew: true, stock: 50
      },
      {
        id: "bp2", name: "Oversized Puff Graphic Tee", slug: "graphic-tee", price: 450000,
        image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80",
        categoryId: "bc1", categoryName: "Heavy Tops",
        description: "280GSM heavyweight organic cotton tee with high-density puff print.",
        status: "active", isFeatured: true, isNew: true, stock: 100
      },
      {
        id: "bp3", name: "Tactical Utility Cargo Pants", slug: "utility-cargo", price: 850000,
        image: "https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=800&q=80",
        categoryId: "bc2", categoryName: "Utility Bottoms",
        description: "Heavy ripstop cargo pants with 8 multi-purpose pockets & adjustable ankle cinches.",
        status: "active", isFeatured: true, isNew: false, stock: 45
      },
      {
        id: "bp4", name: "Raw State Wool Varsity Jacket", slug: "varsity-jacket", price: 1500000,
        image: "https://images.unsplash.com/photo-1559551409-dadc959f76b8?w=800&q=80",
        categoryId: "bc1", categoryName: "Heavy Tops",
        description: "Melton wool body varsity jacket with genuine leather sleeves & felt patches.",
        status: "active", isFeatured: false, isNew: true, stock: 20
      },
      {
        id: "bp5", name: "High-Top Retro Street Sneakers", slug: "street-sneakers", price: 1250000,
        image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&q=80",
        categoryId: "bc3", categoryName: "Headwear & Gear",
        description: "Premium tumbled leather high-top sneakers with chunky vulcanized rubber sole.",
        status: "active", isFeatured: true, isNew: true, stock: 30
      },
      {
        id: "bp6", name: "Core 3D Embroidered Cap", slug: "core-cap", price: 350000,
        image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80",
        categoryId: "bc3", categoryName: "Headwear & Gear",
        description: "Distressed vintage dad hat with bold 3D RAWSTATE logo embroidery.",
        status: "active", isFeatured: false, isNew: false, stock: 60
      },
      {
        id: "bp7", name: "Tactical Crossbody Utility Bag", slug: "utility-bag", price: 480000,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
        categoryId: "bc3", categoryName: "Headwear & Gear",
        description: "CORDURA nylon chest pack with MOLLE webbing and waterproof YKK zippers.",
        status: "active", isFeatured: true, isNew: false, stock: 40
      },
      {
        id: "bp8", name: "Relaxed Fit Corduroy Trousers", slug: "corduroy-pants", price: 720000,
        image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80",
        categoryId: "bc2", categoryName: "Utility Bottoms",
        description: "Wide-wale cotton corduroy trousers with elastic waistband and deep side pockets.",
        status: "active", isFeatured: false, isNew: false, stock: 25
      }
    ],
    navigation: [
      { id: "bn1", label: "Latest Drop", route: "/katalog", order: 1, isActive: true },
      { id: "bn2", label: "Lookbook", route: "/berita", order: 2, isActive: true },
      { id: "bn3", label: "Archive", route: "/tentang", order: 3, isActive: true }
    ]
  },

  // 6. EDITORIAL (NOIRÉ - High Fashion, Art & Editorial Photography)
  editorial: {
    storeInfo: {
      name: "NOIRÉ ARCHIVE",
      description: "Autumn / Winter Collection. High fashion editorial, tailoring & sophisticated silhouettes.",
      address: "45 Rue de la Mode, Paris",
      email: "contact@noire.com",
      phone: "+33 1 23 45 67 89",
      socials: { instagram: "@noire.archive" }
    },
    categories: [
      { id: "ec1", name: "Tailored Outerwear", slug: "outerwear", image: "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=800&q=80" },
      { id: "ec2", name: "Structured Bags", slug: "bags", image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80" },
      { id: "ec3", name: "Statement Shoes", slug: "shoes", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80" }
    ],
    products: [
      {
        id: "ep1", name: "Double-Breasted Wool Coat", slug: "wool-coat", price: 2500000,
        image: "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=800&q=80",
        categoryId: "ec1", categoryName: "Tailored Outerwear",
        description: "Architectural double-breasted wool blend coat with sharp tailored lapels.",
        status: "active", isFeatured: true, isNew: true, stock: 12
      },
      {
        id: "ep2", name: "Wide-Leg Pleated Trousers", slug: "pleated-trousers", price: 950000,
        image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80",
        categoryId: "ec1", categoryName: "Tailored Outerwear",
        description: "Fluid high-waisted pleated trousers crafted from fine wool suiting.",
        status: "active", isFeatured: true, isNew: false, stock: 20
      },
      {
        id: "ep3", name: "Structured Leather Shoulder Bag", slug: "leather-bag-editorial", price: 1800000,
        image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80",
        categoryId: "ec2", categoryName: "Structured Bags",
        description: "Minimalist box-shaped shoulder bag made of smooth Italian box calfskin.",
        status: "active", isFeatured: true, isNew: true, stock: 8
      },
      {
        id: "ep4", name: "Printed Silk Square Scarf", slug: "silk-scarf", price: 450000,
        image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80",
        categoryId: "ec2", categoryName: "Structured Bags",
        description: "100% mulberry silk square scarf with custom editorial graphic print.",
        status: "active", isFeatured: false, isNew: false, stock: 35
      },
      {
        id: "ep5", name: "Sculptural Ankle Leather Boots", slug: "leather-boots", price: 2100000,
        image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80",
        categoryId: "ec3", categoryName: "Statement Shoes",
        description: "Square-toe leather boots featuring architectural angled heel and side zipper.",
        status: "active", isFeatured: true, isNew: true, stock: 15
      },
      {
        id: "ep6", name: "Asymmetric Tailored Blazer", slug: "asymmetric-blazer", price: 1650000,
        image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&q=80",
        categoryId: "ec1", categoryName: "Tailored Outerwear",
        description: "Single-button blazer with unique crossover front closure and structured shoulders.",
        status: "active", isFeatured: false, isNew: true, stock: 10
      },
      {
        id: "ep7", name: "Minimalist Leather Tote", slug: "minimal-tote", price: 1450000,
        image: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800&q=80",
        categoryId: "ec2", categoryName: "Structured Bags",
        description: "Unlined open-top tote bag with magnetic clasp and inner zip pouch.",
        status: "active", isFeatured: true, isNew: false, stock: 18
      },
      {
        id: "ep8", name: "Monochrome Editorial Hardcover Journal", slug: "editorial-journal", price: 280000,
        image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80",
        categoryId: "ec2", categoryName: "Structured Bags",
        description: "Cloth-bound hardcover photography journal featuring 200 GSM matte pages.",
        status: "active", isFeatured: false, isNew: false, stock: 50
      }
    ],
    navigation: [
      { id: "en1", label: "Collection", route: "/katalog", order: 1, isActive: true },
      { id: "en2", label: "Editorial", route: "/berita", order: 2, isActive: true },
      { id: "en3", label: "Behind the Scenes", route: "/tentang", order: 3, isActive: true }
    ]
  },

  // 7. NATURE (RIMBA BOTANICALS - Natural Skincare & Organic Wellness)
  nature: {
    storeInfo: {
      name: "RIMBA BOTANICALS",
      description: "Botanical Skincare. Pure ingredients, eco-friendly rituals & organic wellness.",
      address: "Jalan Hanoman, Ubud, Bali",
      email: "hello@rimbabotanicals.com",
      phone: "+62 813 9999 8888",
      socials: { instagram: "@rimba.botanicals" }
    },
    categories: [
      { id: "nc1", name: "Face Rituals", slug: "face", image: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=800&q=80" },
      { id: "nc2", name: "Body & Bath", slug: "body", image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80" },
      { id: "nc3", name: "Elixirs & Oils", slug: "elixirs", image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80" }
    ],
    products: [
      {
        id: "np1", name: "Botanical Elixir Face Oil 30ml", slug: "face-oil", price: 280000,
        image: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=800&q=80",
        categoryId: "nc3", categoryName: "Elixirs & Oils",
        description: "Nourishing blend of 7 organic cold-pressed botanical seed oils & wild rosehip.",
        status: "active", isFeatured: true, isNew: true, stock: 40
      },
      {
        id: "np2", name: "Volcanic Forest Clay Mask", slug: "clay-mask", price: 185000,
        image: "https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=800&q=80",
        categoryId: "nc1", categoryName: "Face Rituals",
        description: "Purifying volcanic ash clay enriched with organic matcha green tea & kaolin.",
        status: "active", isFeatured: true, isNew: false, stock: 50
      },
      {
        id: "np3", name: "Lemongrass & Ginger Body Wash", slug: "body-wash", price: 150000,
        image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80",
        categoryId: "nc2", categoryName: "Body & Bath",
        description: "Sulfate-free hydrating body wash infused with essential Bali lemongrass oils.",
        status: "active", isFeatured: false, isNew: true, stock: 35
      },
      {
        id: "np4", name: "Gentle Green Tea Facial Cleanser", slug: "cleanser", price: 195000,
        image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80",
        categoryId: "nc1", categoryName: "Face Rituals",
        description: "Low-pH soothing facial gel cleanser formulated for sensitive organic skin.",
        status: "active", isFeatured: true, isNew: false, stock: 60
      },
      {
        id: "np5", name: "Herbal Hydrating Body Lotion", slug: "body-lotion", price: 210000,
        image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80",
        categoryId: "nc2", categoryName: "Body & Bath",
        description: "Rich shea butter body cream scented with natural lavender and eucalyptus.",
        status: "active", isFeatured: true, isNew: true, stock: 45
      },
      {
        id: "np6", name: "Natural Botanical Soap Bar", slug: "soap-bar", price: 65000,
        image: "https://images.unsplash.com/photo-1607006482172-464817a0225d?w=800&q=80",
        categoryId: "nc2", categoryName: "Body & Bath",
        description: "Cold-processed handmade soap bar with exfoliating coconut husk.",
        status: "active", isFeatured: false, isNew: false, stock: 80
      },
      {
        id: "np7", name: "Brightening Vitamin C Serum", slug: "vit-c-serum", price: 320000,
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80",
        categoryId: "nc3", categoryName: "Elixirs & Oils",
        description: "15% L-Ascorbic Acid Serum enriched with ferulic acid & aloe vera juice.",
        status: "active", isFeatured: true, isNew: true, stock: 25
      },
      {
        id: "np8", name: "Rose Water Facial Hydrosol Mist", slug: "rose-mist", price: 145000,
        image: "https://images.unsplash.com/photo-1512290900673-700230217039?w=800&q=80",
        categoryId: "nc1", categoryName: "Face Rituals",
        description: "Pure steam-distilled Damask rose water mist to refresh and hydrate skin.",
        status: "active", isFeatured: false, isNew: false, stock: 50
      }
    ],
    navigation: [
      { id: "nn1", label: "Apothecary", route: "/katalog", order: 1, isActive: true },
      { id: "nn2", label: "Ingredients", route: "/tentang", order: 2, isActive: true },
      { id: "nn3", label: "Rituals", route: "/berita", order: 3, isActive: true }
    ]
  },

  // 8. CREATIVE (KREATIV LAB - Art Prints, Stationery & Creative Goods)
  creative: {
    storeInfo: {
      name: "KREATIV LAB",
      description: "Art Prints, Creative Stationery & Design Objects for Curious Minds.",
      address: "Art District Bldg 12, Yogyakarta",
      email: "hello@kreativlab.id",
      phone: "+62 811 2222 3333",
      socials: { instagram: "@kreativ.lab" }
    },
    categories: [
      { id: "crt_c1", name: "Art Prints", slug: "art-prints", image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&q=80" },
      { id: "crt_c2", name: "Stationery", slug: "stationery", image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80" },
      { id: "crt_c3", name: "Creative Objects", slug: "objects", image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&q=80" }
    ],
    products: [
      {
        id: "crt_p1", name: "Abstract Geometry Risograph Print A3", slug: "art-print-riso", price: 240000,
        image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&q=80",
        categoryId: "crt_c1", categoryName: "Art Prints",
        description: "Limited edition 3-color risograph print on 250gsm archival cotton paper.",
        status: "active", isFeatured: true, isNew: true, stock: 25
      },
      {
        id: "crt_p2", name: "Clothbound Designer Grid Journal", slug: "grid-journal", price: 185000,
        image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80",
        categoryId: "crt_c2", categoryName: "Stationery",
        description: "Hardcover 160-page bullet grid journal with fountain pen friendly paper.",
        status: "active", isFeatured: true, isNew: false, stock: 40
      },
      {
        id: "crt_p3", name: "Hand-Thrown Clay Terracotta Vase", slug: "terracotta-vase", price: 380000,
        image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&q=80",
        categoryId: "crt_c3", categoryName: "Creative Objects",
        description: "Unique hand-thrown pottery vase with raw clay finish and organic texture.",
        status: "active", isFeatured: true, isNew: true, stock: 10
      },
      {
        id: "crt_p4", name: "Sculptural Wave Soy Wax Candle", slug: "wave-candle", price: 175000,
        image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&q=80",
        categoryId: "crt_c3", categoryName: "Creative Objects",
        description: "Hand-poured pillar candle shaped in wave geometry, unscented soy blend.",
        status: "active", isFeatured: false, isNew: true, stock: 40
      },
      {
        id: "fp5_crt", name: "Brass Geometric Desk Ruler Set", slug: "brass-ruler", price: 150000,
        image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80",
        categoryId: "crt_c2", categoryName: "Stationery",
        description: "Solid raw brass 15cm ruler and triangle set that develops a unique patina.",
        status: "active", isFeatured: false, isNew: false, stock: 35
      },
      {
        id: "fp6_crt", name: "Enamel Pins Illustration Set (3x)", slug: "enamel-pins", price: 120000,
        image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80",
        categoryId: "crt_c3", categoryName: "Creative Objects",
        description: "Set of 3 custom hard enamel lapel pins featuring original illustrations.",
        status: "active", isFeatured: true, isNew: false, stock: 50
      },
      {
        id: "fp7_crt", name: "Botanical Illustration Postcard Box", slug: "postcard-box", price: 165000,
        image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80",
        categoryId: "crt_c2", categoryName: "Stationery",
        description: "Box of 20 unique botanical postcards printed on textured watercolor paper.",
        status: "active", isFeatured: false, isNew: true, stock: 30
      },
      {
        id: "fp8_crt", name: "Hand-Woven Tapestry Wall Art", slug: "tapestry-art", price: 490000,
        image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&q=80",
        categoryId: "crt_c3", categoryName: "Creative Objects",
        description: "Hand-woven cotton fringe hanging banner with wooden dowel support.",
        status: "active", isFeatured: true, isNew: false, stock: 8
      }
    ],
    navigation: [
      { id: "crt_n1", label: "Gallery", route: "/katalog", order: 1, isActive: true },
      { id: "crt_n2", label: "Workshops", route: "/berita", order: 2, isActive: true },
      { id: "crt_n3", label: "About Studio", route: "/tentang", order: 3, isActive: true }
    ]
  },

  // 9. PROFESSIONAL (PROWORKSPACE - Business, Office & Productivity Equipment)
  professional: {
    storeInfo: {
      name: "PROWORKSPACE",
      description: "Work Better. Executive office gear, ergonomic tools & productivity solutions.",
      address: "Financial Tower Lt 25, Sudirman Jakarta",
      email: "corporate@proworkspace.co.id",
      phone: "+62 21 555 7777",
      socials: { twitter: "@proworkspace" }
    },
    categories: [
      { id: "pro_c1", name: "Executive Gear", slug: "executive", image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80" },
      { id: "pro_c2", name: "Ergonomics", slug: "ergonomics", image: "https://images.unsplash.com/photo-1580481072645-022f9a6d8310?w=800&q=80" },
      { id: "pro_c3", name: "Desk Accessories", slug: "desk-acc", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80" }
    ],
    products: [
      {
        id: "pro_p1", name: "Executive Leather Padfolio", slug: "leather-padfolio", price: 680000,
        image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80",
        categoryId: "pro_c1", categoryName: "Executive Gear",
        description: "Premium leather folder with tablet slot, pen loop & A4 notepad refill.",
        status: "active", isFeatured: true, isNew: true, stock: 35
      },
      {
        id: "pro_p2", name: "Ergonomic Executive Mesh Chair", slug: "ergo-chair", price: 3450000,
        image: "https://images.unsplash.com/photo-1580481072645-022f9a6d8310?w=800&q=80",
        categoryId: "pro_c2", categoryName: "Ergonomics",
        description: "High-back breathable mesh office chair with 4D lumbar support & headrest.",
        status: "active", isFeatured: true, isNew: true, stock: 15
      },
      {
        id: "pro_p3", name: "Aluminium Dual Monitor Arm", slug: "monitor-arm", price: 890000,
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80",
        categoryId: "pro_c2", categoryName: "Ergonomics",
        description: "Heavy-duty gas spring dual monitor desk mount supporting up to 32\" displays.",
        status: "active", isFeatured: true, isNew: false, stock: 25
      },
      {
        id: "pro_p4", name: "Business Conference Wireless Headset", slug: "conference-headset", price: 1450000,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
        categoryId: "pro_c1", categoryName: "Executive Gear",
        description: "Clear-mic noise canceling wireless headset engineered for Zoom & Teams meetings.",
        status: "active", isFeatured: true, isNew: false, stock: 20
      },
      {
        id: "pro_p5", name: "Adjustable Aluminium Laptop Stand", slug: "laptop-stand-pro", price: 390000,
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80",
        categoryId: "pro_c3", categoryName: "Desk Accessories",
        description: "Ergonomic foldable aluminium laptop desk riser with heat dissipation vents.",
        status: "active", isFeatured: false, isNew: true, stock: 50
      },
      {
        id: "pro_p6", name: "Felt & Vegan Leather Desk Pad", slug: "desk-pad", price: 260000,
        image: "https://images.unsplash.com/photo-1609592424074-12ec313e648f?w=800&q=80",
        categoryId: "pro_c3", categoryName: "Desk Accessories",
        description: "Waterproof dual-sided desk blotter mat 90cm x 45cm for keyboard & mouse.",
        status: "active", isFeatured: false, isNew: false, stock: 60
      },
      {
        id: "pro_p7", name: "Modular Desk Cable Organizer Hub", slug: "cable-organizer", price: 145000,
        image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80",
        categoryId: "pro_c3", categoryName: "Desk Accessories",
        description: "Magnetic silicon cable management clips to keep workstation cords tidy.",
        status: "active", isFeatured: false, isNew: false, stock: 100
      },
      {
        id: "pro_p8", name: "Biometric Smart Keypad Door Lock", slug: "smart-lock-pro", price: 1850000,
        image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80",
        categoryId: "pro_c1", categoryName: "Executive Gear",
        description: "Biometric fingerprint & passcode smart lock for modern office privacy.",
        status: "active", isFeatured: true, isNew: false, stock: 12
      }
    ],
    navigation: [
      { id: "pro_n1", label: "Catalog B2B", route: "/katalog", order: 1, isActive: true },
      { id: "pro_n2", label: "Solutions", route: "/tentang", order: 2, isActive: true },
      { id: "pro_n3", label: "Inquiries", route: "/kontak", order: 3, isActive: true }
    ]
  },

  // 10. FASHION (STUDIO MODE - Contemporary Ready-to-Wear Fashion)
  fashion: {
    storeInfo: {
      name: "STUDIO MODE",
      description: "Contemporary Style, Effortless Comfort. Modern silhouettes & urban essentials.",
      address: "14 Fashion Alley, Seminyak, Bali",
      email: "hello@studiomode.com",
      phone: "+62 819 0000 1111",
      socials: { instagram: "@studio.mode" }
    },
    categories: [
      { id: "fas_c1", name: "Outerwear", slug: "outerwear", image: "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=800&q=80" },
      { id: "fas_c2", name: "Tops & Shirts", slug: "tops", image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&q=80" },
      { id: "fas_c3", name: "Trousers & Bags", slug: "bottoms-bags", image: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800&q=80" }
    ],
    products: [
      {
        id: "fas_p1", name: "Oversized Beige Trench Coat", slug: "trench-coat-fashion", price: 1750000,
        image: "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=800&q=80",
        categoryId: "fas_c1", categoryName: "Outerwear",
        description: "Water-resistant cotton blend trench coat with waist tie and storm flap.",
        status: "active", isFeatured: true, isNew: true, stock: 18
      },
      {
        id: "fas_p2", name: "Tailored Single-Breasted Blazer", slug: "tailored-blazer", price: 1200000,
        image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&q=80",
        categoryId: "fas_c2", categoryName: "Tops & Shirts",
        description: "Structured oversized blazer featuring notched lapels & horn buttons.",
        status: "active", isFeatured: true, isNew: false, stock: 22
      },
      {
        id: "fas_p3", name: "Pure Silk Satin Relaxed Blouse", slug: "silk-blouse", price: 790000,
        image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=80",
        categoryId: "fas_c2", categoryName: "Tops & Shirts",
        description: "Lustrous mulberry silk blouse with buttoned cuffs and relaxed drape.",
        status: "active", isFeatured: false, isNew: true, stock: 30
      },
      {
        id: "fas_p4", name: "Wide-Leg Denim Trousers", slug: "wide-denim", price: 680000,
        image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80",
        categoryId: "fas_c3", categoryName: "Trousers & Bags",
        description: "High-waisted 100% cotton denim trousers with vintage wash finish.",
        status: "active", isFeatured: true, isNew: true, stock: 25
      },
      {
        id: "fas_p5", name: "Oversized Knit Sweater", slug: "knit-sweater", price: 850000,
        image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
        categoryId: "fas_c1", categoryName: "Outerwear",
        description: "Chunky ribbed wool blend crewneck sweater in warm beige tone.",
        status: "active", isFeatured: true, isNew: false, stock: 15
      },
      {
        id: "fas_p6", name: "Structured Leather Shoulder Tote", slug: "fashion-tote", price: 1450000,
        image: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800&q=80",
        categoryId: "fas_c3", categoryName: "Trousers & Bags",
        description: "Minimalist leather tote bag featuring comfortable double shoulder straps.",
        status: "active", isFeatured: false, isNew: true, stock: 20
      },
      {
        id: "fas_p7", name: "Pointed Toe Leather Mules", slug: "leather-mules", price: 890000,
        image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80",
        categoryId: "fas_c3", categoryName: "Trousers & Bags",
        description: "Slip-on kitten heel leather mules for day-to-night versatility.",
        status: "active", isFeatured: true, isNew: false, stock: 18
      },
      {
        id: "fas_p8", name: "Cat-Eye Acetate Sunglasses", slug: "cat-eye-sunglasses", price: 420000,
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80",
        categoryId: "fas_c3", categoryName: "Trousers & Bags",
        description: "UV400 protection tortoiseshell acetate frame sunglasses.",
        status: "active", isFeatured: false, isNew: false, stock: 40
      }
    ],
    navigation: [
      { id: "fas_n1", label: "New Arrivals", route: "/katalog", order: 1, isActive: true },
      { id: "fas_n2", label: "Collections", route: "/berita", order: 2, isActive: true },
      { id: "fas_n3", label: "Store Locator", route: "/kontak", order: 3, isActive: true }
    ]
  },

  // 11. CUTE (FUZZY CUTE - Kawaii Goods & Soft Lifestyle)
  cute: {
    storeInfo: {
      name: "FUZZY CUTE",
      description: "Spreading Joy & Soft Vibes! Adorable plushies, pastel stationery & cute gifts 💖",
      address: "77 Rainbow Street, Bandung",
      email: "hello@fuzzycute.com",
      phone: "+62 878 1234 5678",
      socials: { instagram: "@fuzzy.cute" }
    },
    categories: [
      { id: "cute_c1", name: "Plushies & Toys", slug: "plushies", image: "https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=800&q=80" },
      { id: "cute_c2", name: "Desk & Gifts", slug: "desk-goods", image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80" }
    ],
    products: [
      {
        id: "cute_p1", name: "Boba Bear Huggable Plushie", slug: "boba-plushie", price: 185000,
        image: "https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=800&q=80",
        categoryId: "cute_c1", categoryName: "Plushies & Toys",
        description: "Super soft squishy boba tea bear plushie pillow, 35cm tall.",
        status: "active", isFeatured: true, isNew: true, stock: 60
      },
      {
        id: "cute_p2", name: "Pastel Sakura Extended Desk Mat", slug: "sakura-deskmat", price: 210000,
        image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80",
        categoryId: "cute_c2", categoryName: "Desk & Gifts",
        description: "Non-slip rubber base mousepad with cute cherry blossom print.",
        status: "active", isFeatured: true, isNew: false, stock: 40
      },
      {
        id: "cute_p3", name: "Kawaii Bear Straw Bottle 750ml", slug: "bear-bottle", price: 135000,
        image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80",
        categoryId: "cute_c2", categoryName: "Desk & Gifts",
        description: "BPA-free cute bear water bottle with shoulder strap & pop-up straw.",
        status: "active", isFeatured: false, isNew: true, stock: 75
      },
      {
        id: "cute_p4", name: "Fluffy Bunny Zip Pencil Case", slug: "bunny-pencil-case", price: 95000,
        image: "https://images.unsplash.com/photo-1584346535787-83d47d4e5f7f?w=800&q=80",
        categoryId: "cute_c1", categoryName: "Plushies & Toys",
        description: "Soft plush zip pouch for pens, makeup brushes or trinkets.",
        status: "active", isFeatured: true, isNew: false, stock: 100
      },
      {
        id: "cute_p5", name: "Pastel Bunny Plush Keychain", slug: "bunny-keychain", price: 65000,
        image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80",
        categoryId: "cute_c2", categoryName: "Desk & Gifts",
        description: "Fluffy pastel bunny bag charm with gold lobster clasp.",
        status: "active", isFeatured: true, isNew: true, stock: 80
      },
      {
        id: "cute_p6", name: "Strawberry Fluffy Bed Socks", slug: "strawberry-socks", price: 55000,
        image: "https://images.unsplash.com/photo-1584346535787-83d47d4e5f7f?w=800&q=80",
        categoryId: "cute_c2", categoryName: "Desk & Gifts",
        description: "Ultra cozy micro-fleece sleeping socks with embroidery details.",
        status: "active", isFeatured: false, isNew: true, stock: 120
      },
      {
        id: "cute_p7", name: "Kawaii Animals Vinyl Sticker Pack", slug: "sticker-pack", price: 45000,
        image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&q=80",
        categoryId: "cute_c2", categoryName: "Desk & Gifts",
        description: "Pack of 50 waterproof vinyl stickers for laptops, bottles & journals.",
        status: "active", isFeatured: false, isNew: false, stock: 150
      },
      {
        id: "cute_p8", name: "Soft Cloud Reading Floor Pillow", slug: "cloud-pillow", price: 245000,
        image: "https://images.unsplash.com/photo-1584346535787-83d47d4e5f7f?w=800&q=80",
        categoryId: "cute_c1", categoryName: "Plushies & Toys",
        description: "Large cloud-shaped floor cushion in pastel lavender plush fabric.",
        status: "active", isFeatured: true, isNew: false, stock: 25
      }
    ],
    navigation: [
      { id: "cute_n1", label: "Shop All", route: "/katalog", order: 1, isActive: true },
      { id: "cute_n2", label: "New Cuties", route: "/berita", order: 2, isActive: true },
      { id: "cute_n3", label: "Gift Guide", route: "/tentang", order: 3, isActive: true }
    ]
  },

  // 12. ELEGANT (ATELIER ELEGANCE - Fine Jewelry & Timeless Gems)
  elegant: {
    storeInfo: {
      name: "ATELIER ELEGANCE",
      description: "Timeless Grace & Fine Gems. Sparkle with beauty, heritage and luxury.",
      address: "Place Vendôme 18, Paris",
      email: "contact@atelierelegance.com",
      phone: "+33 1 99 88 77 66",
      socials: { instagram: "@atelier.elegance" }
    },
    categories: [
      { id: "elg_c1", name: "Fine Necklaces", slug: "necklaces", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80" },
      { id: "elg_c2", name: "Rings & Earrings", slug: "earrings-rings", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80" }
    ],
    products: [
      {
        id: "elg_p1", name: "Solitaire Diamond Pendant Necklace", slug: "diamond-pendant", price: 8900000,
        image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80",
        categoryId: "elg_c1", categoryName: "Fine Necklaces",
        description: "18k white gold chain featuring a 0.5 carat brilliant cut lab diamond.",
        status: "active", isFeatured: true, isNew: true, stock: 6
      },
      {
        id: "elg_p2", name: "Freshwater Pearl Drop Earrings", slug: "pearl-earrings", price: 3400000,
        image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80",
        categoryId: "elg_c2", categoryName: "Rings & Earrings",
        description: "Baroque natural freshwater pearls suspended from 14k gold hoops.",
        status: "active", isFeatured: true, isNew: false, stock: 12
      },
      {
        id: "elg_p3", name: "Rose Gold Pave Band Ring", slug: "pave-ring", price: 4200000,
        image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80",
        categoryId: "elg_c2", categoryName: "Rings & Earrings",
        description: "14k rose gold slim band set with micro-pave cubic zirconia stones.",
        status: "active", isFeatured: false, isNew: true, stock: 15
      },
      {
        id: "elg_p4", name: "Crystal Velvet Evening Clutch", slug: "crystal-clutch", price: 2950000,
        image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&q=80",
        categoryId: "elg_c1", categoryName: "Fine Necklaces",
        description: "Hand-embroidered velvet clutch with detachable chain shoulder strap.",
        status: "active", isFeatured: true, isNew: false, stock: 8
      },
      {
        id: "elg_p5", name: "Sapphire Gemstone Tennis Bracelet", slug: "sapphire-bracelet", price: 7800000,
        image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80",
        categoryId: "elg_c2", categoryName: "Rings & Earrings",
        description: "18k white gold line bracelet featuring lab-grown blue sapphires.",
        status: "active", isFeatured: true, isNew: true, stock: 4
      },
      {
        id: "elg_p6", name: "14k Gold Textured Huggie Hoops", slug: "huggie-hoops", price: 1850000,
        image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80",
        categoryId: "elg_c2", categoryName: "Rings & Earrings",
        description: "Everyday solid 14k yellow gold huggie hoop earrings.",
        status: "active", isFeatured: false, isNew: false, stock: 20
      },
      {
        id: "elg_p7", name: "Vintage Emerald Cut Crystal Ring", slug: "emerald-ring", price: 5400000,
        image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80",
        categoryId: "elg_c2", categoryName: "Rings & Earrings",
        description: "Emerald-cut deep green crystal ring encircled by tapered baguette side stones.",
        status: "active", isFeatured: true, isNew: true, stock: 5
      },
      {
        id: "elg_p8", name: "Pure Silk Printed Evening Wrap", slug: "silk-wrap", price: 1950000,
        image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80",
        categoryId: "elg_c1", categoryName: "Fine Necklaces",
        description: "Generously sized silk shawl featuring intricate gold filigree pattern.",
        status: "active", isFeatured: false, isNew: false, stock: 15
      }
    ],
    navigation: [
      { id: "elg_n1", label: "Jewelry", route: "/katalog", order: 1, isActive: true },
      { id: "elg_n2", label: "Bridal", route: "/berita", order: 2, isActive: true },
      { id: "elg_n3", label: "Private Fitting", route: "/kontak", order: 3, isActive: true }
    ]
  }
};

// Map store template ID aliases to their primary theme keys
THEME_DATA_MAP["minimalist_clean"] = THEME_DATA_MAP["minimalist"];
THEME_DATA_MAP["gadget_tech"] = THEME_DATA_MAP["modern"];
THEME_DATA_MAP["futuristic_dark"] = THEME_DATA_MAP["futuristic"];
THEME_DATA_MAP["editorial_luxury"] = THEME_DATA_MAP["luxury"];
THEME_DATA_MAP["bold_market"] = THEME_DATA_MAP["bold"];
THEME_DATA_MAP["editorial_commerce"] = THEME_DATA_MAP["editorial"];
THEME_DATA_MAP["nature_organic"] = THEME_DATA_MAP["nature"];
THEME_DATA_MAP["creative_studio"] = THEME_DATA_MAP["creative"];
THEME_DATA_MAP["pro_corporate"] = THEME_DATA_MAP["professional"];
THEME_DATA_MAP["chic_fashion"] = THEME_DATA_MAP["fashion"];
THEME_DATA_MAP["cute_store"] = THEME_DATA_MAP["cute"];
THEME_DATA_MAP["fashion_store"] = THEME_DATA_MAP["fashion"];
THEME_DATA_MAP["elegant_store"] = THEME_DATA_MAP["elegant"];
THEME_DATA_MAP["brand"] = THEME_DATA_MAP["minimalist"];
THEME_DATA_MAP["classic"] = THEME_DATA_MAP["elegant"];
