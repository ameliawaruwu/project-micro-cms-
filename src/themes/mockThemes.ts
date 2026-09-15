import { ThemeSchema } from './schema';

export interface ThemeLibraryItem extends ThemeSchema {
  thumbnailUrl: string;
}

export const mockThemes: Record<string, ThemeLibraryItem> = {
  // 1. EDITORIAL STORYTELLING
  editorial: {
    themeId: 'editorial-01',
    name: 'Editorial Storytelling',
    thumbnailUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200&auto=format&fit=crop',
    settings: {
      primaryColor: '#66000E',
      backgroundColor: '#FAF7F7',
      textColor: '#241A1A',
      fontFamily: 'Lora, serif',
      containerWidth: 'w-full',
      borderRadius: 'none',
    },
    sectionsOrder: ['header-ed', 'hero-ed', 'story-ed-1', 'grid-ed', 'story-ed-2', 'footer-ed'],
    sections: {
      'header-ed': {
        id: 'header-ed',
        type: 'Header',
        settings: { style: 'sticky', showLogo: true, navLinks: [{ label: 'Home', url: '/' }, { label: 'Collections', url: '/products' }, { label: 'The Journal', url: '/about' }] }
      },
      'hero-ed': {
        id: 'hero-ed',
        type: 'Hero',
        settings: {
          layout: 'split',
          heading: 'Artisan Crafted',
          subheading: 'Behind the scenes of our latest masterpiece.',
          ctaText: 'Read the Story',
          ctaLink: '/about',
          imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&auto=format&fit=crop',
          overlayOpacity: 0
        }
      },
      'story-ed-1': {
        id: 'story-ed-1',
        type: 'StoryBlock',
        settings: {
          layout: 'image-left',
          title: 'The Origin',
          content: 'Every piece starts with a raw, untouched material sourced from the depths of the earth. We believe in preserving the natural beauty and embracing the flaws.',
          imageUrl: 'https://images.unsplash.com/photo-1610444558231-10cbfb2bc8e2?w=800&auto=format&fit=crop'
        }
      },
      'grid-ed': {
        id: 'grid-ed',
        type: 'ProductGrid',
        settings: { title: 'Curated Pieces', columns: 2, maxItems: 4, showPrices: false }
      },
      'story-ed-2': {
        id: 'story-ed-2',
        type: 'StoryBlock',
        settings: {
          layout: 'image-right',
          title: 'Masterful Craft',
          content: 'Hand-woven by artisans with decades of experience. The dedication is woven into every thread.',
          imageUrl: 'https://images.unsplash.com/photo-1459356979461-dae1b8dcb702?w=800&auto=format&fit=crop'
        }
      },
      'footer-ed': {
        id: 'footer-ed',
        type: 'Footer',
        settings: {
          copyrightText: 'Editorial Brand © 2026',
          showSocials: true,
          showNewsletter: true,
          columns: []
        }
      }
    }
  },

  // 2. MINIMAL COMMERCE
  minimalist: {
    themeId: 'minimalist-01',
    name: 'Minimal Commerce',
    thumbnailUrl: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=1200&auto=format&fit=crop',
    settings: {
      primaryColor: '#1A1A1A',
      backgroundColor: '#FFFFFF',
      textColor: '#333333',
      fontFamily: 'Inter, sans-serif',
      containerWidth: 'max-w-5xl',
      borderRadius: 'md',
    },
    sectionsOrder: ['header-min', 'hero-min', 'featured-min', 'footer-min'],
    sections: {
      'header-min': {
        id: 'header-min',
        type: 'Header',
        settings: { style: 'transparent', showLogo: true, navLinks: [{ label: 'Shop', url: '/products' }, { label: 'About', url: '/about' }] }
      },
      'hero-min': {
        id: 'hero-min',
        type: 'Hero',
        settings: {
          layout: 'static',
          heading: 'Less is More',
          subheading: 'Discover our new minimalist collection.',
          ctaText: 'Shop Now',
          ctaLink: '/products',
          imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop',
          overlayOpacity: 10
        }
      },
      'featured-min': {
        id: 'featured-min',
        type: 'ProductGrid',
        settings: { title: 'New Arrivals', columns: 3, maxItems: 3, showPrices: true }
      },
      'footer-min': {
        id: 'footer-min',
        type: 'Footer',
        settings: {
          copyrightText: '© 2026 Minimalist. All rights reserved.',
          showSocials: true,
          showNewsletter: false,
          columns: [{ title: 'Links', links: [{ label: 'Home', url: '/' }, { label: 'Shop', url: '/products' }] }]
        }
      }
    }
  },

  // 3. BOLD BRAND (MENGGUNAKAN BASIS 'compact' SEMENTARA UNTUK PREVIEW, AKAN DIKEMBANGKAN LEBIH LANJUT DI FASE BERIKUTNYA)
  bold: {
    themeId: 'bold-brand-01',
    name: 'Bold Brand',
    thumbnailUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
    settings: {
      primaryColor: '#FF0000',
      backgroundColor: '#000000',
      textColor: '#FFFFFF',
      fontFamily: 'Anton, sans-serif',
      containerWidth: 'max-w-7xl',
      borderRadius: 'none',
    },
    sectionsOrder: ['header-bold', 'hero-bold', 'grid-bold', 'footer-bold'],
    sections: {
      'header-bold': {
        id: 'header-bold',
        type: 'Header',
        settings: { style: 'solid', showLogo: true, navLinks: [{ label: 'Koleksi', url: '/products' }] }
      },
      'hero-bold': {
        id: 'hero-bold',
        type: 'Hero',
        settings: {
          layout: 'static',
          heading: 'BE BOLD',
          subheading: 'Break the rules.',
          ctaText: 'SHOP NOW',
          ctaLink: '/products',
          imageUrl: 'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=1200&auto=format&fit=crop',
          overlayOpacity: 40
        }
      },
      'grid-bold': {
        id: 'grid-bold',
        type: 'ProductGrid',
        settings: { title: 'LATEST DROP', columns: 3, maxItems: 6, showPrices: true }
      },
      'footer-bold': {
        id: 'footer-bold',
        type: 'Footer',
        settings: {
          copyrightText: 'BOLD BRAND © 2026',
          showSocials: true,
          showNewsletter: true,
          columns: []
        }
      }
    }
  },

  // 4. MODERN CATALOG (COMPACT)
  compact: {
    themeId: 'compact-01',
    name: 'Modern Catalog',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555529733-0e670560f4e1?q=80&w=1200&auto=format&fit=crop',
    settings: {
      primaryColor: '#0055FF',
      backgroundColor: '#F3F4F6',
      textColor: '#111827',
      fontFamily: 'Roboto, sans-serif',
      containerWidth: 'max-w-7xl',
      borderRadius: 'sm',
    },
    sectionsOrder: ['header-comp', 'grid-comp-1', 'grid-comp-2', 'footer-comp'],
    sections: {
      'header-comp': {
        id: 'header-comp',
        type: 'Header',
        settings: { style: 'solid', showLogo: true, navLinks: [{ label: 'Home', url: '/' }, { label: 'All Products', url: '/products' }, { label: 'About', url: '/about' }] }
      },
      'grid-comp-1': {
        id: 'grid-comp-1',
        type: 'ProductGrid',
        settings: { title: 'Flash Sale', columns: 4, maxItems: 8, showPrices: true }
      },
      'grid-comp-2': {
        id: 'grid-comp-2',
        type: 'ProductGrid',
        settings: { title: 'Top Rated', columns: 4, maxItems: 4, showPrices: true }
      },
      'footer-comp': {
        id: 'footer-comp',
        type: 'Footer',
        settings: {
          copyrightText: '© 2026 CompactStore. All rights reserved.',
          showSocials: true,
          showNewsletter: true,
          columns: [{ title: 'Support', links: [{ label: 'FAQ', url: '/about' }, { label: 'Contact', url: '/about' }] }]
        }
      }
    }
  },

  // 5. LIFESTYLE STORE
  lifestyle: {
    themeId: 'lifestyle-01',
    name: 'Lifestyle Store',
    thumbnailUrl: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=80&w=1200&auto=format&fit=crop',
    settings: {
      primaryColor: '#D9A05B',
      backgroundColor: '#FDFBF7',
      textColor: '#3E3E3E',
      fontFamily: 'Outfit, sans-serif',
      containerWidth: 'max-w-6xl',
      borderRadius: 'lg',
    },
    sectionsOrder: ['header-life', 'hero-life', 'grid-life', 'story-life', 'footer-life'],
    sections: {
      'header-life': {
        id: 'header-life',
        type: 'Header',
        settings: { style: 'transparent', showLogo: true, navLinks: [{ label: 'Discover', url: '/' }, { label: 'Shop', url: '/products' }, { label: 'Our Story', url: '/about' }] }
      },
      'hero-life': {
        id: 'hero-life',
        type: 'Hero',
        settings: {
          layout: 'split',
          heading: 'Live beautifully',
          subheading: 'Curated essentials for your everyday.',
          ctaText: 'Explore',
          ctaLink: '/products',
          imageUrl: 'https://images.unsplash.com/photo-1515347619152-166299d25fb2?w=1200&auto=format&fit=crop',
          overlayOpacity: 20
        }
      },
      'grid-life': {
        id: 'grid-life',
        type: 'ProductGrid',
        settings: { title: 'Trending', columns: 3, maxItems: 6, showPrices: true }
      },
      'story-life': {
        id: 'story-life',
        type: 'StoryBlock',
        settings: {
          layout: 'image-left',
          title: 'Conscious Living',
          content: 'We believe in products that bring joy and serve a purpose.',
          imageUrl: 'https://images.unsplash.com/photo-1493666438817-866a91353ca9?w=800&auto=format&fit=crop'
        }
      },
      'footer-life': {
        id: 'footer-life',
        type: 'Footer',
        settings: {
          copyrightText: 'Lifestyle Store © 2026',
          showSocials: true,
          showNewsletter: false,
          columns: []
        }
      }
    }
  }
};
