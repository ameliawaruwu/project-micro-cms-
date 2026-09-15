const fs = require("fs");
const file = "src/utils/layoutConstants.ts";
let content = fs.readFileSync(file, "utf8");

const startStr = "export const STORE_TEMPLATES: StoreTemplate[] = [";
const startIdx = content.indexOf(startStr);
if (startIdx === -1) { console.error("Could not find STORE_TEMPLATES start"); process.exit(1); }

const getSectionsEndIdx = content.indexOf("export const getStoreSections =");
if (getSectionsEndIdx === -1) { console.error("Could not find getStoreSections"); process.exit(1); }

let endIdx = content.lastIndexOf("];", getSectionsEndIdx);
if (endIdx === -1) { console.error("Could not find ]; before getStoreSections"); process.exit(1); }

const newTemplates = `export const STORE_TEMPLATES: StoreTemplate[] = [
  {
    id: "minimalist_clean", name: "Minimal Store", category: "Minimalis", primaryAccent: "#1A1A1A",
    bannerUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80",
    tagline: "Kesederhanaan yang Elegan",
    sections: [
      { id: "header", options: { headerStyle: "minimal" } },
      { id: "hero_banner", options: { bannerStyle: "minimal", sectionHeight: "tall", textAlignment: "left", overlayOpacity: 10 } },
      { id: "featured_products", options: { gridColumns: 3 } },
      { id: "product_grid", options: { gridColumns: 3, showCategoryTabs: true } },
      { id: "footer", options: {} }
    ]
  },
  {
    id: "gadget_tech", name: "Nova Commerce", category: "Modern", primaryAccent: "#2563EB",
    bannerUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80",
    tagline: "Teknologi Terkini",
    sections: [
      { id: "announcement", options: { backgroundColor: "brand" } },
      { id: "header", options: { headerStyle: "brand" } },
      { id: "promo_banner", options: { backgroundColor: "dark", textColor: "light", sectionHeight: "normal" } },
      { id: "search_category", options: {} },
      { id: "product_grid", options: { gridColumns: 4, showCategoryTabs: true, showSearchBar: true } },
      { id: "store_benefits", options: { backgroundColor: "neutral" } },
      { id: "footer", options: {} }
    ]
  },
  {
    id: "futuristic_dark", name: "Future Shop", category: "Futuristik", primaryAccent: "#8B5CF6",
    bannerUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80",
    tagline: "Welcome to 2077",
    sections: [
      { id: "header", options: { headerStyle: "brand" } },
      { id: "hero_banner", options: { bannerStyle: "compact", sectionHeight: "compact", textAlignment: "center", overlayOpacity: 60 } },
      { id: "promo_banner", options: { backgroundColor: "dark", textColor: "light" } },
      { id: "product_grid", options: { backgroundColor: "dark", textColor: "light", gridColumns: 4 } },
      { id: "testimonials", options: { backgroundColor: "dark", textColor: "light" } },
      { id: "footer", options: {} }
    ]
  },
  {
    id: "editorial_luxury", name: "Maison", category: "Luxury", primaryAccent: "#92400E",
    bannerUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80",
    tagline: "Elegansi Klasik",
    sections: [
      { id: "header", options: { headerStyle: "minimal", showLogo: true } },
      { id: "hero_banner", options: { bannerStyle: "normal", sectionHeight: "tall", textAlignment: "right", overlayOpacity: 20 } },
      { id: "store_benefits", options: {} },
      { id: "featured_products", options: { gridColumns: 2 } },
      { id: "product_grid", options: { gridColumns: 2 } },
      { id: "footer", options: {} }
    ]
  },
  {
    id: "bold_market", name: "Bold Market", category: "Bold", primaryAccent: "#DC2626",
    bannerUrl: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1600&q=80",
    tagline: "LOUD & CLEAR",
    sections: [
      { id: "announcement", options: { backgroundColor: "dark", textColor: "light" } },
      { id: "header", options: { headerStyle: "minimal" } },
      { id: "promo_banner", options: { backgroundColor: "brand", textColor: "light", sectionHeight: "tall" } },
      { id: "product_grid", options: { gridColumns: 4, showCategoryTabs: false } },
      { id: "footer", options: {} }
    ]
  },
  {
    id: "editorial_commerce", name: "Editorial Commerce", category: "Editorial", primaryAccent: "#66000E",
    bannerUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=80",
    tagline: "The Modern Curated",
    sections: [
      { id: "header", options: { headerStyle: "transparent" } },
      { id: "hero_banner", options: { bannerStyle: "normal", sectionHeight: "tall", textAlignment: "center", overlayOpacity: 30 } },
      { id: "store_benefits", options: { backgroundColor: "neutral" } },
      { id: "featured_products", options: { gridColumns: 3 } },
      { id: "newsletter", options: {} },
      { id: "footer", options: {} }
    ]
  },
  {
    id: "nature_organic", name: "Green Market", category: "Alam", primaryAccent: "#059669",
    bannerUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1600&q=80",
    tagline: "Dari Alam Untukmu",
    sections: [
      { id: "announcement", options: { backgroundColor: "brand", textColor: "light" } },
      { id: "header", options: { headerStyle: "minimal" } },
      { id: "hero_banner", options: { bannerStyle: "normal", sectionHeight: "normal", textAlignment: "center", overlayOpacity: 40 } },
      { id: "testimonials", options: { backgroundColor: "brand", textColor: "light" } },
      { id: "product_grid", options: { gridColumns: 3 } },
      { id: "store_info", options: {} },
      { id: "footer", options: {} }
    ]
  },
  {
    id: "creative_studio", name: "Creative Studio", category: "Kreatif", primaryAccent: "#E11D48",
    bannerUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1600&q=80",
    tagline: "Where Art Meets Commerce",
    sections: [
      { id: "header", options: { headerStyle: "brand" } },
      { id: "hero_banner", options: { bannerStyle: "compact", sectionHeight: "tall", textAlignment: "left", overlayOpacity: 50 } },
      { id: "featured_products", options: { gridColumns: 4 } },
      { id: "product_grid", options: { gridColumns: 3 } },
      { id: "footer", options: {} }
    ]
  },
  {
    id: "pro_corporate", name: "Pro Commerce", category: "Korporat", primaryAccent: "#1E40AF",
    bannerUrl: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1600&q=80",
    tagline: "Solusi B2B Terpercaya",
    sections: [
      { id: "header", options: { headerStyle: "minimal" } },
      { id: "hero_banner", options: { bannerStyle: "compact", sectionHeight: "compact", textAlignment: "left", overlayOpacity: 70 } },
      { id: "store_benefits", options: {} },
      { id: "search_category", options: {} },
      { id: "product_grid", options: { gridColumns: 4 } },
      { id: "store_info", options: { backgroundColor: "neutral" } },
      { id: "footer", options: {} }
    ]
  },
  {
    id: "chic_fashion", name: "Urban Collection", category: "Fashion", primaryAccent: "#18181B",
    bannerUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80",
    tagline: "Chic & Urban",
    sections: [
      { id: "header", options: { headerStyle: "minimal" } },
      { id: "hero_banner", options: { bannerStyle: "normal", sectionHeight: "tall", textAlignment: "center", overlayOpacity: 10 } },
      { id: "promo_banner", options: { backgroundColor: "dark", textColor: "light", sectionHeight: "compact" } },
      { id: "product_grid", options: { gridColumns: 2 } },
      { id: "footer", options: {} }
    ]
  }
];`;

content = content.substring(0, startIdx) + newTemplates + content.substring(endIdx + 2);

fs.writeFileSync(file, content, "utf8");
console.log("Updated templates successfully.");

