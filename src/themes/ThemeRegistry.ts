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
