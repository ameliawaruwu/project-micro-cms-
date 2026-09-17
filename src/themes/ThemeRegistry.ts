import { MinimalistNavbar, MinimalistHero, MinimalistFeaturedProducts, MinimalistFooter, MinimalistBrandPhilosophy, MinimalistCollectionGrid } from './minimalist';
import { FuturisticNavbar, FuturisticHero, FuturisticFeaturedProducts, FuturisticFooter, FuturisticTechFeatures, FuturisticProductComparison, FuturisticFloatingShowcase, FuturisticInnovationCta } from './futuristic';
import { EditorialNavbar, EditorialHero, EditorialLookbook, EditorialCampaign, EditorialAsymmetricShowcase, EditorialBrandStory, EditorialJournal, EditorialFooter } from './editorial';
import { NatureNavbar, NatureHero, NatureIngredientStory, NatureSustainability, NatureFooter } from './nature';
import { LuxuryNavbar, LuxuryHero, LuxurySignatureCollection, LuxuryCraftsmanship, LuxuryPrivateCollection, LuxuryFooter } from './luxury';
import { BoldNavbar, BoldHero, BoldLatestDrop, BoldCategoryTiles, BoldLookbook, BoldLimitedRelease, BoldCommunityBoard, BoldFooter } from './bold';
import { CuteNavbar, CuteHero, CuteFeaturedProducts, CuteFooter } from './cute';
import { ElegantNavbar, ElegantHero, ElegantFeaturedProducts, ElegantFooter } from './elegant';
import { CreativeNavbar, CreativeHero, CreativeLookbook, CreativeFloatingShowcase, CreativeFooter } from './creative';
import { ProfessionalNavbar, ProfessionalHero, ProfessionalStoreBenefits, ProfessionalProductGrid, ProfessionalTestimonials, ProfessionalFooter } from './professional';
import { FashionNavbar, FashionHero, FashionLookbook, FashionFeaturedProducts, FashionPromoBanner, FashionFooter } from './fashion';

export type ThemeId = 'minimalist' | 'futuristic' | 'editorial' | 'nature' | 'luxury' | 'bold' | 'cute' | 'elegant' | 'modern' | 'creative' | 'professional' | 'fashion';

export interface ThemeComponents {
  Navbar: React.FC;
  Hero: React.FC;
  Footer: React.FC;
  ProductCard?: React.FC<any>; // Allow custom product cards per theme
  [key: string]: React.FC<any> | undefined; // Generic mapping for other sections
}

export const ThemeRegistry: Record<ThemeId, ThemeComponents> = {
  minimalist: {
    Navbar: MinimalistNavbar,
    Hero: MinimalistHero,
    Footer: MinimalistFooter,
    FeaturedProducts: MinimalistFeaturedProducts,
    BrandPhilosophy: MinimalistBrandPhilosophy,
    CollectionGrid: MinimalistCollectionGrid,
    ProductGrid: MinimalistCollectionGrid,
  },
  editorial: {
    Navbar: EditorialNavbar,
    Hero: EditorialHero,
    Footer: EditorialFooter,
    Lookbook: EditorialLookbook,
    EditorialCampaign: EditorialCampaign,
    AsymmetricShowcase: EditorialAsymmetricShowcase,
    BrandStory: EditorialBrandStory,
    Journal: EditorialJournal,
  },
  futuristic: {
    Navbar: FuturisticNavbar,
    Hero: FuturisticHero,
    Footer: FuturisticFooter,
    FeaturedProducts: FuturisticFeaturedProducts,
    TechFeatures: FuturisticTechFeatures,
    ProductComparison: FuturisticProductComparison,
    FloatingShowcase: FuturisticFloatingShowcase,
    InnovationCta: FuturisticInnovationCta,
  },
  nature: {
    Navbar: NatureNavbar,
    Hero: NatureHero,
    Footer: NatureFooter,
    IngredientStory: NatureIngredientStory,
    Sustainability: NatureSustainability,
  },
  luxury: {
    Navbar: LuxuryNavbar,
    Hero: LuxuryHero,
    Footer: LuxuryFooter,
    SignatureCollection: LuxurySignatureCollection,
    CraftsmanshipStory: LuxuryCraftsmanship,
    PrivateCollection: LuxuryPrivateCollection,
  },
  bold: {
    Navbar: BoldNavbar,
    Hero: BoldHero,
    Footer: BoldFooter,
    LatestDrop: BoldLatestDrop,
    CategoryTiles: BoldCategoryTiles,
    Lookbook: BoldLookbook,
    LimitedRelease: BoldLimitedRelease,
    CommunityBoard: BoldCommunityBoard,
  },
  
  // Maps for the existing ones
  cute: { Navbar: CuteNavbar, Hero: CuteHero, Footer: CuteFooter, FeaturedProducts: CuteFeaturedProducts },
  elegant: { Navbar: ElegantNavbar, Hero: ElegantHero, Footer: ElegantFooter, FeaturedProducts: ElegantFeaturedProducts },
  modern: { 
    Navbar: FuturisticNavbar, 
    Hero: FuturisticHero, 
    Footer: FuturisticFooter,
    FeaturedProducts: FuturisticFeaturedProducts,
    PromoBanner: FuturisticInnovationCta
  },
  creative: { 
    Navbar: CreativeNavbar, 
    Hero: CreativeHero, 
    Footer: CreativeFooter,
    Lookbook: CreativeLookbook,
    FloatingShowcase: CreativeFloatingShowcase
  },
  professional: { 
    Navbar: ProfessionalNavbar, 
    Hero: ProfessionalHero, 
    Footer: ProfessionalFooter,
    StoreBenefits: ProfessionalStoreBenefits,
    ProductGrid: ProfessionalProductGrid,
    Testimonials: ProfessionalTestimonials
  },
  fashion: { 
    Navbar: FashionNavbar, 
    Hero: FashionHero, 
    Footer: FashionFooter,
    Lookbook: FashionLookbook,
    FeaturedProducts: FashionFeaturedProducts,
    PromoBanner: FashionPromoBanner
  },
};

export const normalizeThemeId = (id?: string): ThemeId => {
  if (!id) return 'minimalist';
  const cleanId = id.toLowerCase().trim();

  if (cleanId === 'bold' || cleanId === 'bold_market' || cleanId.includes('bold')) return 'bold';
  if (cleanId === 'minimalist' || cleanId === 'minimalist_clean' || cleanId === 'minimal_store' || cleanId.includes('minimal')) return 'minimalist';
  if (cleanId === 'modern' || cleanId === 'gadget_tech' || cleanId === 'nova_commerce' || cleanId.includes('modern')) return 'modern';
  if (cleanId === 'futuristic' || cleanId === 'futuristic_dark' || cleanId === 'future_shop' || cleanId.includes('futur')) return 'futuristic';
  if (cleanId === 'luxury' || cleanId === 'editorial_luxury' || cleanId === 'maison' || cleanId.includes('luxury')) return 'luxury';
  if (cleanId === 'editorial' || cleanId === 'editorial_commerce' || cleanId.includes('editorial')) return 'editorial';
  if (cleanId === 'nature' || cleanId === 'nature_organic' || cleanId === 'green_market' || cleanId.includes('nature')) return 'nature';
  if (cleanId === 'creative' || cleanId === 'creative_studio' || cleanId.includes('creative')) return 'creative';
  if (cleanId === 'professional' || cleanId === 'pro_corporate' || cleanId === 'pro_commerce' || cleanId.includes('pro')) return 'professional';
  if (cleanId === 'cute' || cleanId === 'cute_store' || cleanId.includes('cute')) return 'cute';
  if (cleanId === 'fashion' || cleanId === 'fashion_store' || cleanId.includes('fashion')) return 'fashion';
  if (cleanId === 'elegant' || cleanId === 'elegant_store' || cleanId.includes('elegant')) return 'elegant';

  return 'minimalist';
};

// Register preset ID aliases on ThemeRegistry
(ThemeRegistry as any)['bold_market'] = ThemeRegistry['bold'];
(ThemeRegistry as any)['minimalist_clean'] = ThemeRegistry['minimalist'];
(ThemeRegistry as any)['gadget_tech'] = ThemeRegistry['modern'];
(ThemeRegistry as any)['futuristic_dark'] = ThemeRegistry['futuristic'];
(ThemeRegistry as any)['editorial_luxury'] = ThemeRegistry['luxury'];
(ThemeRegistry as any)['editorial_commerce'] = ThemeRegistry['editorial'];
(ThemeRegistry as any)['nature_organic'] = ThemeRegistry['nature'];
(ThemeRegistry as any)['creative_studio'] = ThemeRegistry['creative'];
(ThemeRegistry as any)['pro_corporate'] = ThemeRegistry['professional'];
(ThemeRegistry as any)['chic_fashion'] = ThemeRegistry['fashion'];
(ThemeRegistry as any)['cute_store'] = ThemeRegistry['cute'];
(ThemeRegistry as any)['fashion_store'] = ThemeRegistry['fashion'];
(ThemeRegistry as any)['elegant_store'] = ThemeRegistry['elegant'];

