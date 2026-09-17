import { CmsStoreInfo, CmsProduct, CmsCategory, CmsNavigationItem } from '../cms/mockCmsData';

export interface ThemeData {
  storeInfo: CmsStoreInfo;
  products: CmsProduct[];
  categories: CmsCategory[];
  navigation: CmsNavigationItem[];
}

export const THEME_DATA_MAP: Record<string, ThemeData> = {
  // 1. MINIMALIST (MONO OBJECT)
  minimalist: {
    storeInfo: {
      name: "MONO OBJECT",
      description: "Objects Made for Everyday Living. Simple, calm, and clean.",
      address: "123 Serenity Ave, Minimal City",
      email: "hello@monoobject.com",
      phone: "+62 811 1111 1111",
      socials: { instagram: "@mono.object" }
    },
    categories: [
      { id: "mc1", name: "Ceramics", slug: "ceramics", image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80" },
      { id: "mc2", name: "Textiles", slug: "textiles", image: "https://images.unsplash.com/photo-1584346535787-83d47d4e5f7f?w=800&q=80" },
      { id: "mc3", name: "Lighting", slug: "lighting", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80" }
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
        id: "mp2", name: "Woven Linen Cushion", slug: "linen-cushion", price: 250000,
        image: "https://images.unsplash.com/photo-1584346535787-83d47d4e5f7f?w=800&q=80",
        categoryId: "mc2", categoryName: "Textiles",
        description: "Pure organic linen cushion cover with concealed metal zipper.",
        status: "active", isFeatured: true, isNew: false, stock: 30
      },
      {
        id: "mp3", name: "Solid Oak Serving Tray", slug: "oak-tray", price: 320000,
        image: "https://images.unsplash.com/photo-1618684992925-508544e31fb0?w=800&q=80",
        categoryId: "mc1", categoryName: "Woodwork",
        description: "Minimalist solid oak serving tray finished with natural beeswax.",
        status: "active", isFeatured: false, isNew: true, stock: 15
      },
      {
        id: "mp4", name: "Sculptural Desk Lamp", slug: "minimal-lamp", price: 850000,
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80",
        categoryId: "mc3", categoryName: "Lighting",
        description: "Sleek aluminum table lamp with warm dimmable LED lighting.",
        status: "active", isFeatured: true, isNew: false, stock: 10
      }
    ],
    navigation: [
      { id: "n1", label: "Shop", route: "/katalog", order: 1, isActive: true },
      { id: "n2", label: "Philosophy", route: "/tentang", order: 2, isActive: true },
      { id: "n3", label: "Journal", route: "/berita", order: 3, isActive: true }
    ]
  },

  // 2. MODERN (NOVA COMMERCE)
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
      }
    ],
    navigation: [
      { id: "mod_n1", label: "Gadgets", route: "/katalog", order: 1, isActive: true },
      { id: "mod_n2", label: "Promo", route: "/promo", order: 2, isActive: true },
      { id: "mod_n3", label: "Support", route: "/kontak", order: 3, isActive: true }
    ]
  },

  // 3. FUTURISTIC (NEON//LAB)
  futuristic: {
    storeInfo: {
      name: "NEON//LAB",
      description: "Designed for the Next Move. Futuristic, technological, bold cyber gear.",
      address: "Sector 7, Neo Tokyo Cyber District",
      email: "sys@neonlab.io",
      phone: "+81 90 1234 5678",
      socials: { instagram: "@neon_lab", twitter: "@neon_lab" }
    },
    categories: [
      { id: "fc1", name: "Peripherals", slug: "peripherals", image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&q=80" },
      { id: "fc2", name: "Power Grid", slug: "power", image: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800&q=80" },
      { id: "fc3", name: "Cyber Hardware", slug: "cyber", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80" }
    ],
    products: [
      {
        id: "fp1", name: "Smart Charging Hub 100W", slug: "charging-hub", price: 850000,
        image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80",
        categoryId: "fc2", categoryName: "Power Grid",
        description: "100W GaN charging hub featuring interactive real-time OLED power display.",
        status: "active", isFeatured: true, isNew: true, stock: 50
      },
      {
        id: "fp2", name: "Cyber Matrix Mech Keyboard", slug: "modular-keyboard", price: 2100000,
        image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80",
        categoryId: "fc1", categoryName: "Peripherals",
        description: "Hot-swappable mechanical keyboard with translucent shell & RGB illumination matrix.",
        status: "active", isFeatured: true, isNew: false, stock: 15
      },
      {
        id: "fp3", name: "Quantum Mag Dock", slug: "wireless-dock", price: 1200000,
        image: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800&q=80",
        categoryId: "fc2", categoryName: "Power Grid",
        description: "3-in-1 magnetic wireless charging dock with neon LED underglow.",
        status: "active", isFeatured: false, isNew: true, stock: 30
      },
      {
        id: "fp4", name: "HUD Smart Light Bar", slug: "desk-light", price: 950000,
        image: "https://images.unsplash.com/photo-1518773553398-650c184e0bb3?w=800&q=80",
        categoryId: "fc1", categoryName: "Peripherals",
        description: "Monitor light bar with app-controlled reactive RGB ambient backlighting.",
        status: "active", isFeatured: true, isNew: false, stock: 25
      }
    ],
    navigation: [
      { id: "fn1", label: "Devices", route: "/katalog", order: 1, isActive: true },
      { id: "fn2", label: "Specs", route: "/tentang", order: 2, isActive: true },
      { id: "fn3", label: "Innovation", route: "/berita", order: 3, isActive: true }
    ]
  },

  // 4. LUXURY (MAISON ÉLAN)
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
      { id: "lc2", name: "Timepieces", slug: "timepieces", image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80" }
    ],
    products: [
      {
        id: "lp1", name: "Signature Calfskin Tote", slug: "leather-bag", price: 12500000,
        image: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800&q=80",
        categoryId: "lc1", categoryName: "Leather Goods",
        description: "Hand-stitched full-grain Italian calfskin tote with brushed gold hardware.",
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
        id: "lp3", name: "Monogram Bifold Wallet", slug: "silk-wallet", price: 3200000,
        image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80",
        categoryId: "lc1", categoryName: "Leather Goods",
        description: "Textured French leather bifold wallet with custom silk lining.",
        status: "active", isFeatured: false, isNew: true, stock: 12
      },
      {
        id: "lp4", name: "Heritage Brass Belt", slug: "heritage-belt", price: 2800000,
        image: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&q=80",
        categoryId: "lc1", categoryName: "Leather Goods",
        description: "Full-grain vegetable tanned belt featuring solid antique brass buckle.",
        status: "active", isFeatured: true, isNew: false, stock: 15
      }
    ],
    navigation: [
      { id: "ln1", label: "Boutique", route: "/katalog", order: 1, isActive: true },
      { id: "ln2", label: "Heritage", route: "/tentang", order: 2, isActive: true },
      { id: "ln3", label: "Concierge", route: "/kontak", order: 3, isActive: true }
    ]
  },

  // 5. BOLD (RAWSTATE)
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
      { id: "bc1", name: "Apparel", slug: "apparel", image: "https://images.unsplash.com/photo-1523398002811-999aa8e9f5b9?w=800&q=80" },
      { id: "bc2", name: "Accessories", slug: "accessories", image: "https://images.unsplash.com/photo-1520975954732-57dd22299614?w=800&q=80" }
    ],
    products: [
      {
        id: "bp1", name: "Oversized Puff Graphic Tee", slug: "graphic-tee", price: 450000,
        image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80",
        categoryId: "bc1", categoryName: "Apparel",
        description: "280gsm heavyweight organic cotton tee with high-density puff print.",
        status: "active", isFeatured: true, isNew: true, stock: 100
      },
      {
        id: "bp2", name: "Tactical Utility Cargo Pants", slug: "utility-cargo", price: 850000,
        image: "https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=800&q=80",
        categoryId: "bc1", categoryName: "Apparel",
        description: "Heavy ripstop cargo pants with 8 multi-purpose pockets & adjustable ankles.",
        status: "active", isFeatured: true, isNew: false, stock: 45
      },
      {
        id: "bp3", name: "Raw State Varsity Jacket", slug: "varsity-jacket", price: 1500000,
        image: "https://images.unsplash.com/photo-1559551409-dadc959f76b8?w=800&q=80",
        categoryId: "bc1", categoryName: "Apparel",
        description: "Melton wool body varsity jacket with genuine leather sleeves & felt patches.",
        status: "active", isFeatured: false, isNew: true, stock: 20
      },
      {
        id: "bp4", name: "Core Embroidered Cap", slug: "core-cap", price: 350000,
        image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80",
        categoryId: "bc2", categoryName: "Accessories",
        description: "Distressed vintage dad hat with bold 3D logo embroidery.",
        status: "active", isFeatured: true, isNew: false, stock: 60
      }
    ],
    navigation: [
      { id: "bn1", label: "Latest Drop", route: "/katalog", order: 1, isActive: true },
      { id: "bn2", label: "Lookbook", route: "/berita", order: 2, isActive: true },
      { id: "bn3", label: "Archive", route: "/tentang", order: 3, isActive: true }
    ]
  },

  // 6. EDITORIAL (NOIRÉ)
  editorial: {
    storeInfo: {
      name: "NOIRÉ",
      description: "Autumn / Winter 2026. High fashion editorial, tailoring & sophisticated wear.",
      address: "45 Rue de la Mode, Paris",
      email: "contact@noire.com",
      phone: "+33 1 23 45 67 89",
      socials: { instagram: "@noire.archive" }
    },
    categories: [
      { id: "ec1", name: "Ready to Wear", slug: "ready-to-wear", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80" },
      { id: "ec2", name: "Accessories", slug: "accessories", image: "https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=800&q=80" }
    ],
    products: [
      {
        id: "ep1", name: "Double-Breasted Wool Coat", slug: "wool-coat", price: 2500000,
        image: "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=800&q=80",
        categoryId: "ec1", categoryName: "Ready to Wear",
        description: "Architectural double-breasted wool blend coat with sharp tailored lapels.",
        status: "active", isFeatured: true, isNew: true, stock: 12
      },
      {
        id: "ep2", name: "Wide-Leg Pleated Trousers", slug: "pleated-trousers", price: 950000,
        image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80",
        categoryId: "ec1", categoryName: "Ready to Wear",
        description: "Fluid high-waisted pleated trousers crafted from fine wool suiting.",
        status: "active", isFeatured: true, isNew: false, stock: 20
      },
      {
        id: "ep3", name: "Structured Leather Shoulder Bag", slug: "leather-bag", price: 1800000,
        image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80",
        categoryId: "ec2", categoryName: "Accessories",
        description: "Minimalist box-shaped shoulder bag made of smooth Italian leather.",
        status: "active", isFeatured: true, isNew: true, stock: 8
      },
      {
        id: "ep4", name: "Printed Silk Scarf", slug: "silk-scarf", price: 450000,
        image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80",
        categoryId: "ec2", categoryName: "Accessories",
        description: "100% mulberry silk square scarf with custom editorial graphic print.",
        status: "active", isFeatured: false, isNew: false, stock: 35
      }
    ],
    navigation: [
      { id: "en1", label: "Collection", route: "/katalog", order: 1, isActive: true },
      { id: "en2", label: "Editorial", route: "/berita", order: 2, isActive: true },
      { id: "en3", label: "Behind the Scenes", route: "/tentang", order: 3, isActive: true }
    ]
  },

  // 7. NATURE (RIMBA BOTANICALS)
  nature: {
    storeInfo: {
      name: "RIMBA BOTANICALS",
      description: "Raw Ingredients. Simple Rituals. Natural, warm, organic skincare & bodycare.",
      address: "Jalan Hanoman, Ubud, Bali",
      email: "hello@rimbabotanicals.com",
      phone: "+62 813 9999 8888",
      socials: { instagram: "@rimba.botanicals" }
    },
    categories: [
      { id: "nc1", name: "Skincare", slug: "skincare", image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80" },
      { id: "nc2", name: "Bodycare", slug: "bodycare", image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80" }
    ],
    products: [
      {
        id: "np1", name: "Botanical Elixir Face Oil", slug: "face-oil", price: 280000,
        image: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=800&q=80",
        categoryId: "nc1", categoryName: "Skincare",
        description: "Nourishing blend of 7 organic cold-pressed botanical seeds & wild rosehip.",
        status: "active", isFeatured: true, isNew: true, stock: 40
      },
      {
        id: "np2", name: "Volcanic Forest Clay Mask", slug: "clay-mask", price: 185000,
        image: "https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=800&q=80",
        categoryId: "nc1", categoryName: "Skincare",
        description: "Purifying volcanic ash clay enriched with organic matcha green tea.",
        status: "active", isFeatured: true, isNew: false, stock: 50
      },
      {
        id: "np3", name: "Lemongrass & Ginger Body Wash", slug: "body-wash", price: 150000,
        image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80",
        categoryId: "nc2", categoryName: "Bodycare",
        description: "Sulfate-free hydrating body wash infused with essential oils.",
        status: "active", isFeatured: false, isNew: true, stock: 35
      },
      {
        id: "np4", name: "Gentle Green Tea Cleanser", slug: "cleanser", price: 195000,
        image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80",
        categoryId: "nc1", categoryName: "Skincare",
        description: "Low-pH soothing facial gel cleanser for sensitive skin.",
        status: "active", isFeatured: true, isNew: false, stock: 60
      }
    ],
    navigation: [
      { id: "nn1", label: "Apothecary", route: "/katalog", order: 1, isActive: true },
      { id: "nn2", label: "Ingredients", route: "/tentang", order: 2, isActive: true },
      { id: "nn3", label: "Rituals", route: "/berita", order: 3, isActive: true }
    ]
  },

  // 8. CREATIVE (KREATIV STUDIO)
  creative: {
    storeInfo: {
      name: "ARTISAN & CO.",
      description: "Where Art Meets Commerce. Experimental design, ceramic arts & handcrafted goods.",
      address: "Art District Bldg 12, Yogyakarta",
      email: "hello@artisanstudio.id",
      phone: "+62 811 2222 3333",
      socials: { instagram: "@artisan.co.id" }
    },
    categories: [
      { id: "crt_c1", name: "Art & Ceramics", slug: "ceramics", image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&q=80" },
      { id: "crt_c2", name: "Home Accents", slug: "home", image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&q=80" }
    ],
    products: [
      {
        id: "crt_p1", name: "Hand-Thrown Terracotta Vase", slug: "terracotta-vase", price: 380000,
        image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&q=80",
        categoryId: "crt_c1", categoryName: "Art & Ceramics",
        description: "Unique hand-thrown pottery vase with raw clay finish and organic texture.",
        status: "active", isFeatured: true, isNew: true, stock: 10
      },
      {
        id: "crt_p2", name: "Abstract Risograph Art Print", slug: "art-print", price: 220000,
        image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&q=80",
        categoryId: "crt_c1", categoryName: "Art & Ceramics",
        description: "Limited edition 3-color risograph print on archival recycled paper.",
        status: "active", isFeatured: true, isNew: false, stock: 25
      },
      {
        id: "crt_p3", name: "Sculptural Soy Wax Candle", slug: "sculptural-candle", price: 175000,
        image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&q=80",
        categoryId: "crt_c2", categoryName: "Home Accents",
        description: "Hand-poured pillar candle shaped in wave geometry, unscented soy blend.",
        status: "active", isFeatured: false, isNew: true, stock: 40
      },
      {
        id: "crt_p4", name: "Woven Cotton Wall Tapestry", slug: "wall-tapestry", price: 490000,
        image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&q=80",
        categoryId: "crt_c2", categoryName: "Home Accents",
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

  // 9. PROFESSIONAL (PRO COMMERCE)
  professional: {
    storeInfo: {
      name: "PRO COMMERCE B2B",
      description: "Structured corporate gear, executive workspace tools & high-grade business essentials.",
      address: "Financial Tower Lt 25, Sudirman Jakarta",
      email: "corporate@procommerce.co.id",
      phone: "+62 21 555 7777",
      socials: { twitter: "@procommerce_b2b" }
    },
    categories: [
      { id: "pro_c1", name: "Executive Gear", slug: "executive", image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80" },
      { id: "pro_c2", name: "Workspace Audio", slug: "audio", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80" }
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
        id: "pro_p2", name: "Business Conference Headset", slug: "conference-headset", price: 1450000,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
        categoryId: "pro_c2", categoryName: "Workspace Audio",
        description: "Clear-mic noise canceling wireless headset engineered for Zoom & Teams.",
        status: "active", isFeatured: true, isNew: false, stock: 20
      },
      {
        id: "pro_p3", name: "Ergonomic Aluminium Laptop Stand", slug: "laptop-stand", price: 390000,
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80",
        categoryId: "pro_c1", categoryName: "Executive Gear",
        description: "Adjustable height aluminium desk stand with silicone anti-slip pads.",
        status: "active", isFeatured: false, isNew: true, stock: 50
      },
      {
        id: "pro_p4", name: "Smart Keypad Door Lock", slug: "smart-lock", price: 1850000,
        image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80",
        categoryId: "pro_c1", categoryName: "Executive Gear",
        description: "Biometric fingerprint & passcode smart lock for modern office spaces.",
        status: "active", isFeatured: true, isNew: false, stock: 15
      }
    ],
    navigation: [
      { id: "pro_n1", label: "Catalog B2B", route: "/katalog", order: 1, isActive: true },
      { id: "pro_n2", label: "Solutions", route: "/tentang", order: 2, isActive: true },
      { id: "pro_n3", label: "Inquiries", route: "/kontak", order: 3, isActive: true }
    ]
  },

  // 10. FASHION (ATELIER CHIC)
  fashion: {
    storeInfo: {
      name: "ATELIER CHIC",
      description: "Chic & Urban silhouettes. Contemporary fashion for modern city life.",
      address: "14 Fashion Alley, Seminyak, Bali",
      email: "hello@atelierchic.com",
      phone: "+62 819 0000 1111",
      socials: { instagram: "@atelier.chic" }
    },
    categories: [
      { id: "fas_c1", name: "Outerwear", slug: "outerwear", image: "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=800&q=80" },
      { id: "fas_c2", name: "Tailored Tops", slug: "tops", image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&q=80" }
    ],
    products: [
      {
        id: "fas_p1", name: "Oversized Beige Trench Coat", slug: "trench-coat", price: 1750000,
        image: "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=800&q=80",
        categoryId: "fas_c1", categoryName: "Outerwear",
        description: "Water-resistant cotton blend trench coat with waist tie and storm flap.",
        status: "active", isFeatured: true, isNew: true, stock: 18
      },
      {
        id: "fas_p2", name: "Tailored Single-Breasted Blazer", slug: "tailored-blazer", price: 1200000,
        image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&q=80",
        categoryId: "fas_c2", categoryName: "Tailored Tops",
        description: "Structured oversized blazer featuring notched lapels & horn buttons.",
        status: "active", isFeatured: true, isNew: false, stock: 22
      },
      {
        id: "fas_p3", name: "Pure Silk Satin Blouse", slug: "silk-blouse", price: 790000,
        image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=80",
        categoryId: "fas_c2", categoryName: "Tailored Tops",
        description: "Lustrous mulberry silk blouse with buttoned cuffs and relaxed fit.",
        status: "active", isFeatured: false, isNew: true, stock: 30
      },
      {
        id: "fas_p4", name: "Cat-Eye Acetate Sunglasses", slug: "cat-eye-sunglasses", price: 420000,
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80",
        categoryId: "fas_c1", categoryName: "Outerwear",
        description: "UV400 protection tortoiseshell acetate frame sunglasses.",
        status: "active", isFeatured: true, isNew: false, stock: 40
      }
    ],
    navigation: [
      { id: "fas_n1", label: "New Arrivals", route: "/katalog", order: 1, isActive: true },
      { id: "fas_n2", label: "Collections", route: "/berita", order: 2, isActive: true },
      { id: "fas_n3", label: "Store Locator", route: "/kontak", order: 3, isActive: true }
    ]
  },

  // 11. CUTE (SWEETIE KAWAII)
  cute: {
    storeInfo: {
      name: "SWEETIE KAWAII",
      description: "Adorable plushies, pastel stationery & cute things to make your desk smile!",
      address: "77 Rainbow Street, Bandung",
      email: "hello@sweetiekawaii.com",
      phone: "+62 878 1234 5678",
      socials: { instagram: "@sweetie.kawaii" }
    },
    categories: [
      { id: "cute_c1", name: "Plushies", slug: "plushies", image: "https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=800&q=80" },
      { id: "cute_c2", name: "Desk Goods", slug: "desk-goods", image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80" }
    ],
    products: [
      {
        id: "cute_p1", name: "Boba Bear Huggable Plushie", slug: "boba-plushie", price: 185000,
        image: "https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=800&q=80",
        categoryId: "cute_c1", categoryName: "Plushies",
        description: "Super soft squishy boba tea bear plushie pillow, 35cm tall.",
        status: "active", isFeatured: true, isNew: true, stock: 60
      },
      {
        id: "cute_p2", name: "Pastel Sakura Extended Desk Mat", slug: "sakura-deskmat", price: 210000,
        image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80",
        categoryId: "cute_c2", categoryName: "Desk Goods",
        description: "Non-slip rubber base mousepad with cute cherry blossom print.",
        status: "active", isFeatured: true, isNew: false, stock: 40
      },
      {
        id: "cute_p3", name: "Kawaii Bear Straw Bottle 750ml", slug: "bear-bottle", price: 135000,
        image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80",
        categoryId: "cute_c2", categoryName: "Desk Goods",
        description: "BPA-free cute bear water bottle with shoulder strap & pop-up straw.",
        status: "active", isFeatured: false, isNew: true, stock: 75
      },
      {
        id: "cute_p4", name: "Fluffy Bunny Pencil Case", slug: "bunny-pencil-case", price: 95000,
        image: "https://images.unsplash.com/photo-1584346535787-83d47d4e5f7f?w=800&q=80",
        categoryId: "cute_c1", categoryName: "Plushies",
        description: "Soft plush zip pouch for pens, makeup brush or trinkets.",
        status: "active", isFeatured: true, isNew: false, stock: 100
      }
    ],
    navigation: [
      { id: "cute_n1", label: "Shop All", route: "/katalog", order: 1, isActive: true },
      { id: "cute_n2", label: "New Cuties", route: "/berita", order: 2, isActive: true },
      { id: "cute_n3", label: "Gift Guide", route: "/tentang", order: 3, isActive: true }
    ]
  },

  // 12. ELEGANT (L'ÉLÉGANCE JEWELRY)
  elegant: {
    storeInfo: {
      name: "L'ÉLÉGANCE",
      description: "Fine Jewelry & Timeless Gems. Sparkle with grace, beauty, and refinement.",
      address: "Place Vendôme 18, Paris",
      email: "contact@lelegance.fr",
      phone: "+33 1 99 88 77 66",
      socials: { instagram: "@lelegance.paris" }
    },
    categories: [
      { id: "elg_c1", name: "Fine Necklaces", slug: "necklaces", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80" },
      { id: "elg_c2", name: "Earrings & Rings", slug: "earrings", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80" }
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
        categoryId: "elg_c2", categoryName: "Earrings & Rings",
        description: "Baroque natural freshwater pearls suspended from 14k gold hoops.",
        status: "active", isFeatured: true, isNew: false, stock: 12
      },
      {
        id: "elg_p3", name: "Rose Gold Pave Band Ring", slug: "pave-ring", price: 4200000,
        image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80",
        categoryId: "elg_c2", categoryName: "Earrings & Rings",
        description: "14k rose gold slim band set with micro-pave cubic zirconia stones.",
        status: "active", isFeatured: false, isNew: true, stock: 15
      },
      {
        id: "elg_p4", name: "Crystal Velvet Evening Clutch", slug: "crystal-clutch", price: 2950000,
        image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&q=80",
        categoryId: "elg_c1", categoryName: "Fine Necklaces",
        description: "Hand-embroidered velvet clutch with detachable chain shoulder strap.",
        status: "active", isFeatured: true, isNew: false, stock: 8
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
THEME_DATA_MAP["brand"] = THEME_DATA_MAP["minimalist"];
THEME_DATA_MAP["classic"] = THEME_DATA_MAP["elegant"];
