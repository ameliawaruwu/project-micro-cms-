import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Store,
  StoreLayoutSettings,
  StoreSectionConfig,
  Product,
  StoreSectionOptions,
} from '../../types';
import {
  DEFAULT_STORE_LAYOUT,
  LAYOUT_PRESETS,
  getStoreSections,
  SectionTemplateDef,
  STORE_TEMPLATES,
} from '../../utils/layoutConstants';
import { EditorTopBar } from '../../components/layout-editor/EditorTopBar';
import { LeftPanelSections } from '../../components/layout-editor/LeftPanelSections';
import { CenterPreviewCanvas } from '../../components/layout-editor/CenterPreviewCanvas';
import { RightPanelSettings } from '../../components/layout-editor/RightPanelSettings';
import { AddSectionModal } from '../../components/layout-editor/AddSectionModal';
import { StoreLayoutSetupWizard } from '../../components/layout-editor/StoreLayoutSetupWizard';
import { ThemeLibraryView, TemplateGalleryItem, SavedThemeItem, TEMPLATE_GALLERY_ITEMS } from '../../components/layout-editor/ThemeLibraryView';
import { PublishStoreModal } from '../../components/layout-editor/PublishStoreModal';
import { ArrowLeft, ArrowRight, Monitor, Tablet, Smartphone, Palette, Loader2, EyeOff, Eye } from 'lucide-react';
import { useCmsStore } from '../../cms/useCmsStore';
import { normalizeThemeId } from '../../themes/ThemeRegistry';
import { storeService } from '../../services/storeService';
import { useAuth } from '../../contexts/AuthContext';

interface LayoutPageProps {
  store: Store;
  products: Product[];
  onSaveLayout: (layoutSettings: StoreLayoutSettings) => void;
  onPublishStore?: () => void;
  onUnpublishStore?: () => void;
  onOpenStorefront: () => void;
  onOpenPhoneSimulator: () => void;
  onShowNotification: (msg: string) => void;
  onBack?: () => void;
  onNavigateDashboard?: () => void;
  onNavigateBilling?: () => void;
  onNavigateDomain?: () => void;
}

export const LayoutPage: React.FC<LayoutPageProps> = ({
  store,
  products,
  onSaveLayout,
  onPublishStore,
  onUnpublishStore,
  onOpenStorefront,
  onOpenPhoneSimulator,
  onShowNotification,
  onBack,
  onNavigateDashboard,
  onNavigateBilling,
  onNavigateDomain,
}) => {
  const [currentStore, setCurrentStore] = useState<Store>(store);
  const { user } = useAuth();
  const cmsProducts = useCmsStore(state => state.products);

  const initialSections = useMemo(
    () => getStoreSections(store.layoutSettings),
    [store.layoutSettings]
  );

  const [sections, setSections] = useState<StoreSectionConfig[]>(initialSections);
  const [selectedSectionKey, setSelectedSectionKey] = useState<string | null>(
    initialSections.length > 0 ? (initialSections[0].key || `${initialSections[0].id}-0`) : null
  );
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activePreset, setActivePreset] = useState<string>('standard');
  const [hasChanges, setHasChanges] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalCategoryFilter, setAddModalCategoryFilter] = useState<string | undefined>(undefined);
  const [primaryAccent, setPrimaryAccent] = useState<string>(
    store.layoutSettings?.primaryAccent || '#66000E'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [activeLeftPane, setActiveLeftPane] = useState<'sections' | 'settings'>('sections');
  const [editorMobileTab, setEditorMobileTab] = useState<'canvas' | 'sections' | 'settings'>('canvas');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  
  // Theme Library vs Editor Mode
  const [pageMode, setPageMode] = useState<'library' | 'preview' | 'loading' | 'editor'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'editor' || params.get('editTheme')) {
        return 'editor';
      }
    }
    return 'library';
  });

  const [previewTemplate, setPreviewTemplate] = useState<TemplateGalleryItem | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingTemplateName, setLoadingTemplateName] = useState('');
  const [activePage, setActivePage] = useState('homepage');

  const [activeThemeId, setActiveThemeId] = useState<any>(() => {
    const raw = (store.layoutSettings as any)?.activeThemeId || store.layoutSettings?.themeStyle || 'minimalist';
    return normalizeThemeId(raw);
  });

  // Sync template from URL parameter if opened via new tab (?mode=editor&editTheme=...)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const editTheme = params.get('editTheme');
      if (editTheme) {
        const found = TEMPLATE_GALLERY_ITEMS.find(
          (t) => t.id === editTheme || t.storeTemplate.id === editTheme
        );
        if (found) {
          const storeTemplate = found.storeTemplate;
          const newSections = storeTemplate.sections.map((s, idx) => ({
            ...s,
            key: s.key || `${s.id}-${idx}`,
            order: s.order !== undefined ? s.order : idx,
          }));
          setSections(newSections);
          setSelectedSectionKey(newSections[0]?.key || null);
          setPrimaryAccent(found.primaryAccent);
          const mappedThemeId = normalizeThemeId(found.storeTemplate.id);
          setActiveThemeId(mappedThemeId);
          useCmsStore.getState().loadThemeData(mappedThemeId);
          setPageMode('editor');
        }
      }
    }
  }, []);
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);
  const [globalSettings, setGlobalSettings] = useState<any>(
    store.layoutSettings?.globalThemeSettings || {
      colors: { primary: '#2C6ECB', secondary: '#1E40AF', background: '#FFFFFF', surface: '#F6F6F7', text: '#202223', mutedText: '#6D7175', border: '#E1E3E5' },
      typography: { headingFont: 'Inter', bodyFont: 'Inter', headingSize: 'md', bodySize: 'md' },
      buttons: { radius: 'md', style: 'solid' },
      cards: { radius: 'lg', shadow: 'sm', border: true },
      layout: { contentWidth: 'normal', sectionSpacing: 'normal' }
    }
  );

  // Keep useCmsStore synchronized when merchant products are updated
  useEffect(() => {
    if (products && products.length > 0) {
      useCmsStore.getState().setProductsFromMerchant(products);
    }
  }, [products]);

  const displayProducts = cmsProducts.length > 0 ? cmsProducts : (products || []);

  // Multi-page sections map state
  const [pageSectionsMap, setPageSectionsMap] = useState<Record<string, StoreSectionConfig[]>>(() => {
    const defaultMap: Record<string, StoreSectionConfig[]> = {
      homepage: initialSections,
      catalog: [
        { key: 'header-0', id: 'header', title: 'Header & Navbar Toko', isVisible: true },
        { key: 'search_category-0', id: 'search_category', title: 'Bilah Pencarian & Kategori', isVisible: true },
        {
          key: 'product_grid-0',
          id: 'product_grid',
          title: 'Katalog Produk Lengkap',
          isVisible: true,
          options: {
            heading: 'Katalog Produk Lengkap',
            subheading: 'Temukan produk pilihan Anda dengan kualitas terbaik',
            gridColumns: 4,
            productCount: 12,
            showPrice: true,
            showCategory: true,
            showRating: true,
            showAddToCart: true,
            showStockBadge: true,
            showCategoryTabs: true,
            showSearchBar: true,
          }
        },
        { key: 'store_benefits-0', id: 'store_benefits', title: 'Keunggulan Toko', isVisible: true },
        { key: 'footer-0', id: 'footer', title: 'Footer Toko', isVisible: true }
      ],
      product: [
        { key: 'header-0', id: 'header', title: 'Header & Navbar Toko', isVisible: true },
        { key: 'featured_products-0', id: 'featured_products', title: 'Produk Terkait & Rekomendasi', isVisible: true, options: { featuredTitle: 'Produk Terkait & Rekomendasi', productCount: 4 } },
        { key: 'store_benefits-0', id: 'store_benefits', title: 'Keunggulan Toko', isVisible: true },
        { key: 'footer-0', id: 'footer', title: 'Footer Toko', isVisible: true }
      ],
      about: [
        { key: 'header-0', id: 'header', title: 'Header & Navbar Toko', isVisible: true },
        { key: 'brand_story-0', id: 'brand_story', title: 'Kisah & Filosofi Toko', isVisible: true, options: { heading: 'Tentang Toko Kami', description: store.description || store.tagline || 'Produsen & Pengrajin lokal tepercaya dengan standar mutu tertinggi.' } },
        { key: 'store_benefits-0', id: 'store_benefits', title: 'Keunggulan Layanan', isVisible: true },
        { key: 'testimonials-0', id: 'testimonials', title: 'Ulasan Pelanggan', isVisible: true },
        { key: 'footer-0', id: 'footer', title: 'Footer Toko', isVisible: true }
      ],
      promo: [
        { key: 'header-0', id: 'header', title: 'Header & Navbar Toko', isVisible: true },
        { key: 'promo_banner-0', id: 'promo_banner', title: 'Banner Promo Spesial', isVisible: true, options: { heading: 'Promo Spesial Hari Ini', description: 'Nikmati potongan harga eksklusif untuk produk UMKM pilihan', discountBadge: 'DISKON HINGGA 50%' } },
        { key: 'featured_products-0', id: 'featured_products', title: 'Produk Diskon Spesial', isVisible: true, options: { featuredTitle: 'Produk Diskon Terlaris', productCount: 8 } },
        { key: 'newsletter-0', id: 'newsletter', title: 'Newsletter Voucher', isVisible: true },
        { key: 'footer-0', id: 'footer', title: 'Footer Toko', isVisible: true }
      ],
      contact: [
        { key: 'header-0', id: 'header', title: 'Header & Navbar Toko', isVisible: true },
        { key: 'store_info-0', id: 'store_info', title: 'Info & Kontak Toko', isVisible: true, options: { heading: 'Hubungi Kami', description: `Alamat: ${store.address || store.city || 'Indonesia'}. WhatsApp: ${store.phoneWhatsApp || ''}` } },
        { key: 'store_benefits-0', id: 'store_benefits', title: 'Layanan Pelanggan', isVisible: true },
        { key: 'footer-0', id: 'footer', title: 'Footer Toko', isVisible: true }
      ],
      login: [
        { key: 'header-0', id: 'header', title: 'Header & Navbar Toko', isVisible: true },
        { key: 'footer-0', id: 'footer', title: 'Footer Toko', isVisible: true }
      ],
      register: [
        { key: 'header-0', id: 'header', title: 'Header & Navbar Toko', isVisible: true },
        { key: 'footer-0', id: 'footer', title: 'Footer Toko', isVisible: true }
      ],
      forgot_password: [
        { key: 'header-0', id: 'header', title: 'Header & Navbar Toko', isVisible: true },
        { key: 'footer-0', id: 'footer', title: 'Footer Toko', isVisible: true }
      ],
      cart: [
        { key: 'header-0', id: 'header', title: 'Header & Navbar Toko', isVisible: true },
        { key: 'footer-0', id: 'footer', title: 'Footer Toko', isVisible: true }
      ],
      checkout: [
        { key: 'header-0', id: 'header', title: 'Header & Navbar Toko', isVisible: true },
        { key: 'footer-0', id: 'footer', title: 'Footer Toko', isVisible: true }
      ],
      thank_you: [
        { key: 'header-0', id: 'header', title: 'Header & Navbar Toko', isVisible: true },
        { key: 'footer-0', id: 'footer', title: 'Footer Toko', isVisible: true }
      ],
      orders: [
        { key: 'header-0', id: 'header', title: 'Header & Navbar Toko', isVisible: true },
        { key: 'footer-0', id: 'footer', title: 'Footer Toko', isVisible: true }
      ],
      order_detail: [
        { key: 'header-0', id: 'header', title: 'Header & Navbar Toko', isVisible: true },
        { key: 'footer-0', id: 'footer', title: 'Footer Toko', isVisible: true }
      ],
      profile: [
        { key: 'header-0', id: 'header', title: 'Header & Navbar Toko', isVisible: true },
        { key: 'footer-0', id: 'footer', title: 'Footer Toko', isVisible: true }
      ]
    };

    if (store.layoutSettings?.pages && Array.isArray(store.layoutSettings.pages)) {
      store.layoutSettings.pages.forEach((p) => {
        if (p.slug && p.sections && p.sections.length > 0) {
          defaultMap[p.slug] = p.sections.map((s, idx) => ({ ...s, key: s.key || `${s.id}-${idx}` }));
        }
      });
    }

    return defaultMap;
  });

  useEffect(() => {
    setCurrentStore(store);
  }, [store]);

  // Check URL for previewTheme to automatically open preview overlay (like Canva)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const themeId = params.get('previewTheme');
    if (themeId) {
      const template = TEMPLATE_GALLERY_ITEMS.find((t) => t.storeTemplate.id === themeId || t.id === themeId);
      if (template) {
        setPreviewTemplate(template);
        const mappedThemeId = normalizeThemeId(template.storeTemplate?.id || template.id);
        useCmsStore.getState().loadThemeData(mappedThemeId);
        setActiveThemeId(mappedThemeId);
        
        setPreviewDevice('desktop');
        setPageMode('preview');
        // Clean up URL so it doesn't get stuck in preview mode on reload
        const newUrl = window.location.pathname + (currentStore.slug ? `?toko=${currentStore.slug}` : '');
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [currentStore.slug]);

  const handlePageChange = (newPageId: string) => {
    if (newPageId === activePage) return;
    setPageSectionsMap((prevMap) => {
      const updatedMap = { ...prevMap, [activePage]: sections };
      const aliasKey = newPageId === 'catalog' ? 'catalog' : newPageId === 'katalog' ? 'catalog' : newPageId;
      const targetSections = updatedMap[aliasKey] || updatedMap[newPageId] || [
        { key: 'header-0', id: 'header', title: 'Header & Navbar Toko', isVisible: true },
        { key: 'product_grid-0', id: 'product_grid', title: 'Katalog Produk', isVisible: true, options: { gridColumns: 4, productCount: 8, showPrice: true, showAddToCart: true } },
        { key: 'footer-0', id: 'footer', title: 'Footer Toko', isVisible: true }
      ];
      setSections(targetSections);
      setSelectedSectionKey(targetSections.length > 0 ? (targetSections[0].key || `${targetSections[0].id}-0`) : null);
      return updatedMap;
    });
    setActivePage(newPageId);
  };

  // Auto-sync current editor draft state to sessionStorage & localStorage for preview tab
  useEffect(() => {
    // If merchant does not have a store yet, NEVER auto-save any draft
    if (!currentStore.id) {
      try {
        sessionStorage.removeItem('microcms_preview_draft');
        localStorage.removeItem('microcms_preview_draft');
      } catch (e) {}
      return;
    }

    const updatedMap = { ...pageSectionsMap, [activePage]: sections };
    const pagesConfig = Object.entries(updatedMap).map(([slug, secs]) => ({
      id: slug,
      title: slug === 'homepage' ? 'Halaman Utama' : slug.charAt(0).toUpperCase() + slug.slice(1),
      slug,
      sections: secs,
    }));

    const cmsProducts = useCmsStore.getState().products;

    const draftStore = {
      ...currentStore,
      layoutSettings: {
        ...currentStore.layoutSettings,
        sections: updatedMap['homepage'] || sections,
        primaryAccent,
        globalThemeSettings: globalSettings,
        activeThemeId,
        themeStyle: activeThemeId,
        pages: pagesConfig,
        activePage,
      },
      products: cmsProducts,
    };

    try {
      sessionStorage.setItem('microcms_preview_draft', JSON.stringify(draftStore));
      localStorage.setItem('microcms_preview_draft', JSON.stringify(draftStore));
      if (cmsProducts && cmsProducts.length > 0) {
        sessionStorage.setItem('microcms_cms_products', JSON.stringify(cmsProducts));
        localStorage.setItem('microcms_cms_products', JSON.stringify(cmsProducts));
      }
      window.dispatchEvent(new Event('cms_draft_updated'));
    } catch (e) {
      console.error('Failed to sync preview draft:', e);
    }
  }, [sections, pageSectionsMap, activePage, primaryAccent, globalSettings, activeThemeId, currentStore]);

  const handleOpenPreviewTab = () => {
    const updatedMap = { ...pageSectionsMap, [activePage]: sections };
    const pagesConfig = Object.entries(updatedMap).map(([slug, secs]) => ({
      id: slug,
      title: slug === 'homepage' ? 'Halaman Utama' : slug.charAt(0).toUpperCase() + slug.slice(1),
      slug,
      sections: secs,
    }));

    const cmsProducts = useCmsStore.getState().products;

    const previewSlug = currentStore.slug || (user ? `toko-${user.id.replace(/[^a-z0-9]/g, '').slice(0, 10)}` : 'toko-preview');

    const draftStore = {
      ...currentStore,
      slug: previewSlug,
      layoutSettings: {
        ...currentStore.layoutSettings,
        sections: updatedMap['homepage'] || sections,
        primaryAccent,
        globalThemeSettings: globalSettings,
        activeThemeId,
        themeStyle: activeThemeId,
        pages: pagesConfig,
        activePage,
      },
      products: (cmsProducts && cmsProducts.length > 0) ? cmsProducts : products,
    };

    try {
      sessionStorage.setItem('microcms_preview_draft', JSON.stringify(draftStore));
      localStorage.setItem('microcms_preview_draft', JSON.stringify(draftStore));
      const finalProds = draftStore.products;
      if (finalProds && finalProds.length > 0) {
        sessionStorage.setItem('microcms_cms_products', JSON.stringify(finalProds));
        localStorage.setItem('microcms_cms_products', JSON.stringify(finalProds));
      }
      window.dispatchEvent(new Event('cms_draft_updated'));
    } catch (e) {
      console.error('Failed to sync preview draft:', e);
    }

    const pageParam = activePage && activePage !== 'homepage' ? `&page=${encodeURIComponent(activePage)}` : '';
    window.open(`/?toko=${encodeURIComponent(previewSlug)}&preview=true${pageParam}`, '_blank');
  };

  // Saved draft themes persistence in localStorage - strictly isolated per user and store
  const savedThemesStorageKey = user?.id && currentStore.id
    ? `microcms_saved_themes_${user.id}_${currentStore.id}`
    : '';
  const userSelectedThemeKey = user?.id && currentStore.id
    ? `microcms_user_chose_theme_${user.id}_${currentStore.id}`
    : '';

  // Clean up any legacy shared default keys immediately so old drafts never leak
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('microcms_saved_themes_default');
      localStorage.removeItem('microcms_user_chose_theme_default');
      localStorage.removeItem('microcms_saved_themes_none');
      localStorage.removeItem('microcms_user_chose_theme_none');
      if (!currentStore.id) {
        localStorage.removeItem('microcms_preview_draft');
        sessionStorage.removeItem('microcms_preview_draft');
      }
    }
  }, [currentStore.id]);

  const [savedThemes, setSavedThemes] = useState<SavedThemeItem[]>(() => {
    // 1. If merchant does not have a store yet, or user not logged in: MUST return empty state []
    if (!currentStore.id || !user) {
      return [];
    }

    try {
      const hasPublishedTemplate = Boolean(currentStore.layoutSettings?.activeTemplateId);
      const userExplicitlySelected =
        typeof window !== 'undefined' && savedThemesStorageKey && localStorage.getItem(userSelectedThemeKey) === 'true';

      // If user has not chosen or published a template yet:
      // Must start with 0 drafts/templates!
      if (!hasPublishedTemplate && !userExplicitlySelected) {
        return [];
      }

      const stored = typeof window !== 'undefined' && savedThemesStorageKey ? localStorage.getItem(savedThemesStorageKey) : null;
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter(
            (t: any) => t && t.id && t.storeTemplate && t.storeTemplate.id
          );
          if (valid.length > 0) return valid;
        }
      }

      // If user had a published template in cloud/settings, restore that template
      if (hasPublishedTemplate) {
        const publishedTmpl = TEMPLATE_GALLERY_ITEMS.find(
          (t) =>
            t.id === currentStore.layoutSettings?.activeTemplateId ||
            t.storeTemplate.id === currentStore.layoutSettings?.activeTemplateId
        );
        if (publishedTmpl) {
          return [
            {
              ...publishedTmpl,
              updatedAt: new Date().toISOString(),
            },
          ];
        }
      }
    } catch (e) {
      console.error('Failed to load saved themes from storage:', e);
    }

    return [];
  });

  const [editingDraftId, setEditingDraftId] = useState<string>(() => {
    return savedThemes[0]?.id || '';
  });

  // Re-sync savedThemes whenever currentStore or user changes
  useEffect(() => {
    if (!currentStore.id || !user) {
      setSavedThemes([]);
      return;
    }

    const hasPublishedTemplate = Boolean(currentStore.layoutSettings?.activeTemplateId);
    const userSelectedThemeKey = user?.id && currentStore.id
      ? `microcms_user_chose_theme_${user.id}_${currentStore.id}`
      : '';
    const userExplicitlySelected =
      typeof window !== 'undefined' && savedThemesStorageKey && localStorage.getItem(userSelectedThemeKey) === 'true';

    if (!hasPublishedTemplate && !userExplicitlySelected) {
      setSavedThemes([]);
      return;
    }

    try {
      const stored = typeof window !== 'undefined' && savedThemesStorageKey ? localStorage.getItem(savedThemesStorageKey) : null;
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter(
            (t: any) => t && t.id && t.storeTemplate && t.storeTemplate.id
          );
          setSavedThemes(valid);
        }
      }
    } catch (e) {
      console.error('Failed to reload saved themes for store:', e);
    }
  }, [currentStore.id, currentStore.layoutSettings?.activeTemplateId, savedThemesStorageKey, userSelectedThemeKey, user?.id]);

  // Save savedThemes to localStorage whenever it changes (isolated key only)
  useEffect(() => {
    if (!savedThemesStorageKey) return;
    try {
      if (savedThemes.length > 0) {
        localStorage.setItem(savedThemesStorageKey, JSON.stringify(savedThemes));
      } else {
        localStorage.removeItem(savedThemesStorageKey);
      }
    } catch (e) {
      console.error('Failed to persist saved themes:', e);
    }
  }, [savedThemes, savedThemesStorageKey]);

  // Helper: Trigger store creation ONLY when merchant explicitly picks or creates a template
  const ensureStoreExistsForTemplate = async (template: TemplateGalleryItem): Promise<Store> => {
    if (!user) throw new Error('User tidak terautentikasi.');

    const mappedThemeId = normalizeThemeId(template.storeTemplate?.id || template.id);
    const newSections = (template.storeTemplate?.sections || []).map((s, idx) => ({
      ...s,
      key: s.key || `${s.id}-${idx}`,
      order: s.order !== undefined ? s.order : idx,
    }));

    if (currentStore.id) {
      const updatedLayoutSettings = {
        ...currentStore.layoutSettings,
        activeTemplateId: template.id,
        activeThemeId: mappedThemeId,
        themeStyle: mappedThemeId,
        primaryAccent: template.primaryAccent,
        sections: newSections,
      };
      const updatedStore = await storeService.updateStore(currentStore.id, {
        layoutSettings: updatedLayoutSettings,
      });
      setCurrentStore(updatedStore);
      return updatedStore;
    }

    const cleanUserSlug = user.id.replace(/[^a-z0-9]/g, '').slice(0, 10);
    const newStore = await storeService.createStore({
      merchantId: user.id,
      name: '',
      slug: '',
      tagline: '',
      description: 'Pusat belanja produk berkualitas dengan pemesanan praktis dan cepat.',
      logoUrl: user.avatarUrl || '',
      bannerUrl: template.storeTemplate?.bannerUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
      category: 'UMKM & Retail',
      currency: 'IDR',
      isPublished: false,
      layoutSettings: {
        activeTemplateId: template.id,
        activeThemeId: mappedThemeId,
        themeStyle: mappedThemeId,
        primaryAccent: template.primaryAccent,
        sections: newSections,
      },
    });

    setCurrentStore(newStore);
    localStorage.setItem('microcms_auth_store', JSON.stringify(newStore));
    localStorage.setItem('microcms_active_store_id', newStore.id);
    window.dispatchEvent(new CustomEvent('microcms_store_created', { detail: newStore }));
    return newStore;
  };

  const handleAddSavedTheme = async (template: TemplateGalleryItem) => {
    let targetStore = currentStore;
    if (!targetStore.id && user) {
      targetStore = await ensureStoreExistsForTemplate(template);
    }

    const key = user && targetStore.id ? `microcms_user_chose_theme_${user.id}_${targetStore.id}` : '';
    if (key) {
      try {
        localStorage.setItem(key, 'true');
      } catch {}
    }

    setSavedThemes((prev) => {
      const existingIdx = prev.findIndex((t) => t.id === template.id);
      const nowIso = new Date().toISOString();
      const newDraftItem: SavedThemeItem = {
        ...template,
        updatedAt: nowIso,
      };
      if (existingIdx !== -1) {
        const copy = [...prev];
        copy[existingIdx] = { ...copy[existingIdx], updatedAt: nowIso };
        return copy;
      }
      return [newDraftItem, ...prev];
    });
  };

  const handlePublishTheme = (theme: SavedThemeItem) => {
    const storeTemplateId = theme.storeTemplate?.id || theme.id;
    const mappedThemeId = normalizeThemeId(theme.customLayoutSettings?.activeThemeId || storeTemplateId);
    const nowIso = new Date().toISOString();
    
    setActiveThemeId(mappedThemeId);
    useCmsStore.getState().loadThemeData(mappedThemeId);

    // Set as active theme layout
    onSaveLayout({
      ...store.layoutSettings,
      activeTemplateId: storeTemplateId,
      activeThemeId: mappedThemeId,
      themeStyle: mappedThemeId,
      primaryAccent: theme.primaryAccent,
      sections: theme.customLayoutSettings?.sections || theme.storeTemplate.sections,
    });
    
    setSavedThemes((prev) =>
      prev.map((t) => (t.id === theme.id ? { 
        ...t, 
        updatedAt: nowIso,
        customLayoutSettings: {
          ...(t.customLayoutSettings || {}),
          activeThemeId: mappedThemeId,
          themeStyle: mappedThemeId,
        }
      } : t))
    );
    setEditingDraftId(theme.id);
    onShowNotification(`🎉 Tema "${theme.name}" berhasil dipublikasikan sebagai Tema Utama toko!`);
  };

  const handleDuplicateTheme = (theme: SavedThemeItem) => {
    const duplicated: SavedThemeItem = {
      ...theme,
      id: `${theme.id}_copy_${Date.now()}`,
      name: `${theme.name} (Salinan)`,
      updatedAt: new Date().toISOString(),
    };
    setSavedThemes((prev) => [duplicated, ...prev]);
    onShowNotification(`Draf tema "${theme.name}" berhasil diduplikasi.`);
  };

  const handleRenameTheme = (theme: SavedThemeItem, newName: string) => {
    setSavedThemes((prev) =>
      prev.map((t) => (t.id === theme.id ? { ...t, name: newName, updatedAt: new Date().toISOString() } : t))
    );
    onShowNotification(`Nama draf diubah menjadi "${newName}".`);
  };

  const handleDeleteTheme = (themeId: string) => {
    setSavedThemes((prev) => prev.filter((t) => t.id !== themeId));
    onShowNotification('Draf tema berhasil dihapus dari Pustaka Tema.');
  };

  // Handle clicking a template card → redirect to new tab like Canva
  const handlePreviewTemplate = (template: TemplateGalleryItem) => {
    const mappedThemeId = normalizeThemeId(template.storeTemplate?.id || template.id);
    window.open(`/?previewTheme=${mappedThemeId}&toko=${currentStore.slug}`, '_blank');
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    if (!isFullscreen) {
      onShowNotification('Mode Layar Penuh aktif. Tekan Esc atau tombol Layar Penuh untuk keluar.');
    }
  };

  const handleUpdateStore = (updates: Partial<Store>) => {
    setCurrentStore((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  // Handle "Sesuaikan Draf" / "Coba tema" → restore customized sections or template defaults
  const handleApplyAndEdit = (template: SavedThemeItem) => {
    setEditingDraftId(template.id);
    handleAddSavedTheme(template);
    setLoadingTemplateName(template.name);
    setLoadingProgress(0);
    setPageMode('loading');

    const rawId = template.customLayoutSettings?.activeThemeId || 
                  template.storeTemplate?.id || 
                  template.id;
    const mappedThemeId = normalizeThemeId(rawId);
    setActiveThemeId(mappedThemeId);

    // If template has customized layout settings saved, restore them!
    if (template.customLayoutSettings && template.customLayoutSettings.sections) {
      const restoredSections = template.customLayoutSettings.sections;
      setSections(restoredSections);
      setSelectedSectionKey(restoredSections[0]?.key || null);
      if (template.customLayoutSettings.primaryAccent) {
        setPrimaryAccent(template.customLayoutSettings.primaryAccent);
      }
      if (template.customLayoutSettings.globalThemeSettings) {
        setGlobalSettings(template.customLayoutSettings.globalThemeSettings);
      }
      if (template.customLayoutSettings.activeThemeId) {
        setActiveThemeId(normalizeThemeId(template.customLayoutSettings.activeThemeId));
      }
      if (template.customPageSectionsMap) {
        setPageSectionsMap(template.customPageSectionsMap);
      }
      setHistory([restoredSections]);
      setHistoryIndex(0);
      setHasChanges(false);
    } else {
      // Apply template default sections and styling
      const storeTemplate = template.storeTemplate;
      const newSections = storeTemplate.sections.map((s, idx) => ({
        ...s,
        key: s.key || `${s.id}-${idx}`,
        order: s.order !== undefined ? s.order : idx,
      }));
      setSections(newSections);
      setSelectedSectionKey(newSections[0]?.key || null);
      setPrimaryAccent(template.primaryAccent);

      handleUpdateStore({
        bannerUrl: storeTemplate.bannerUrl,
        tagline: storeTemplate.tagline,
        layoutSettings: {
          ...store.layoutSettings,
          activeThemeId: mappedThemeId,
          themeStyle: mappedThemeId,
          primaryAccent: template.primaryAccent,
          sections: newSections,
        }
      });

      onSaveLayout({
        ...store.layoutSettings,
        activeThemeId: mappedThemeId,
        themeStyle: mappedThemeId,
        primaryAccent: template.primaryAccent,
        sections: newSections,
      });
      setHistory([newSections]);
      setHistoryIndex(0);
      setHasChanges(false);
    }

    useCmsStore.getState().loadThemeData(mappedThemeId);
    // Animate progress bar over ~1.5 seconds, then switch to editor
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 25 + 15;
      if (progress >= 100) {
        progress = 100;
        setLoadingProgress(100);
        clearInterval(interval);
        setTimeout(() => {
          setPageMode('editor');
          setPreviewTemplate(null);
        }, 300);
      } else {
        setLoadingProgress(Math.min(progress, 95));
      }
    }, 200);
  };

  // Keyboard shortcut listener for Esc to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const handleWizardComplete = (data: {
    storeUpdates: Partial<Store>;
    layoutSettings: StoreLayoutSettings;
  }) => {
    const updated = { ...currentStore, ...data.storeUpdates };
    setCurrentStore(updated);
    const newSections = getStoreSections(data.layoutSettings);
    setSections(newSections);
    setSelectedSectionKey(newSections.length > 0 ? (newSections[0].key || `${newSections[0].id}-0`) : null);
    if (data.layoutSettings.primaryAccent) {
      setPrimaryAccent(data.layoutSettings.primaryAccent);
    }
    setHistory([newSections]);
    setHistoryIndex(0);
    setHasChanges(false);
    setIsWizardOpen(false);

    // Persist layout
    onSaveLayout(data.layoutSettings);
    onShowNotification(`🎉 Website toko "${updated.name}" berhasil di-generate!`);
  };

  // Undo / Redo History Stack
  const [history, setHistory] = useState<StoreSectionConfig[][]>([initialSections]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Push to history helper
  const pushToHistory = useCallback((newSections: StoreSectionConfig[]) => {
    setHistory((prevHistory) => {
      const nextHistory = prevHistory.slice(0, historyIndex + 1);
      nextHistory.push(newSections);
      // Cap history length to 30
      if (nextHistory.length > 30) {
        nextHistory.shift();
      }
      return nextHistory;
    });
    setHistoryIndex((prevIdx) => prevIdx + 1);
    setHasChanges(true);
  }, [historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = () => {
    if (!canUndo) return;
    const newIdx = historyIndex - 1;
    setHistoryIndex(newIdx);
    const targetSections = history[newIdx];
    setSections(targetSections);
    onShowNotification('Perubahan diurungkan (Undo).');
  };

  const handleRedo = () => {
    if (!canRedo) return;
    const newIdx = historyIndex + 1;
    setHistoryIndex(newIdx);
    const targetSections = history[newIdx];
    setSections(targetSections);
    onShowNotification('Perubahan diulangi (Redo).');
  };

  // Selected section object
  const selectedSection = useMemo(() => {
    if (!selectedSectionKey) return null;
    return (
      sections.find(
        (s, idx) =>
          s.key === selectedSectionKey ||
          s.id === selectedSectionKey ||
          (s.key || `${s.id}-${idx}`) === selectedSectionKey
      ) || null
    );
  }, [sections, selectedSectionKey]);

  // Select section handler
  const handleSelectSection = (key: string) => {
    setSelectedSectionKey(key);
    setShowGlobalSettings(false);
    setActiveLeftPane('settings');
    setEditorMobileTab('settings');
  };

  // Move section (reorder)
  const handleMoveSection = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= sections.length || fromIndex === toIndex) return;

    const updated = [...sections];
    const [movedItem] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, movedItem);

    // Re-index orders
    const reordered = updated.map((s, idx) => ({ ...s, order: idx }));
    setSections(reordered);
    pushToHistory(reordered);
    setActivePreset('custom');
  };

  // Toggle visibility of a section
  const handleToggleVisibility = (key: string) => {
    const updated = sections.map((sec, idx) => {
      const currentKey = sec.key || `${sec.id}-${idx}`;
      if (currentKey === key) {
        return { ...sec, isVisible: !sec.isVisible };
      }
      return sec;
    });
    setSections(updated);
    pushToHistory(updated);
    setActivePreset('custom');
  };

  // Duplicate a section
  const handleDuplicateSection = (key: string) => {
    const targetIdx = sections.findIndex(
      (s, idx) => (s.key || `${s.id}-${idx}`) === key
    );
    if (targetIdx === -1) return;

    const target = sections[targetIdx];
    const newKey = `${target.id}-copy-${Date.now()}`;
    const duplicated: StoreSectionConfig = {
      ...target,
      key: newKey,
      title: `${target.title} (Salinan)`,
      order: targetIdx + 1,
      options: target.options ? JSON.parse(JSON.stringify(target.options)) : {},
    };

    const updated = [...sections];
    updated.splice(targetIdx + 1, 0, duplicated);

    const reordered = updated.map((s, idx) => ({ ...s, order: idx }));
    setSections(reordered);
    setSelectedSectionKey(newKey);
    pushToHistory(reordered);
    setActivePreset('custom');
    onShowNotification(`Bagian "${target.title}" berhasil diduplikasi.`);
  };

  // Rename a section
  const handleRenameSection = (key: string, newTitle: string) => {
    const updated = sections.map((sec, idx) => {
      const currentKey = sec.key || `${sec.id}-${idx}`;
      if (currentKey === key) {
        return { ...sec, title: newTitle };
      }
      return sec;
    });
    setSections(updated);
    pushToHistory(updated);
    onShowNotification('Nama bagian berhasil diubah.');
  };

  // Delete a section
  const handleDeleteSection = (key: string) => {
    if (sections.length <= 1) {
      onShowNotification('Minimal harus ada 1 bagian pada toko.');
      return;
    }

    const updated = sections.filter(
      (s, idx) => (s.key || `${s.id}-${idx}`) !== key
    );
    const reordered = updated.map((s, idx) => ({ ...s, order: idx }));
    setSections(reordered);

    if (selectedSectionKey === key) {
      setSelectedSectionKey(
        reordered.length > 0 ? (reordered[0].key || `${reordered[0].id}-0`) : null
      );
    }

    pushToHistory(reordered);
    setActivePreset('custom');
    onShowNotification('Bagian berhasil dihapus dari etalase toko.');
  };

  // Add section from template
  const handleAddSection = (template: SectionTemplateDef) => {
    const newKey = `${template.id}-${Date.now()}`;
    const newSection: StoreSectionConfig = {
      key: newKey,
      id: template.id,
      title: template.title,
      subtitle: template.subtitle,
      isVisible: true,
      order: sections.length,
      options: JSON.parse(JSON.stringify(template.defaultOptions)),
    };

    const updated = [...sections, newSection];
    setSections(updated);
    setSelectedSectionKey(newKey);
    pushToHistory(updated);
    setActivePreset('custom');
    onShowNotification(`Bagian "${template.title}" berhasil ditambahkan ke tata letak.`);
  };

  // Update specific section options
  const handleUpdateSectionOptions = (
    key: string,
    newOptions: Partial<StoreSectionOptions>
  ) => {
    const updated = sections.map((sec, idx) => {
      const currentKey = sec.key || `${sec.id}-${idx}`;
      if (currentKey === key) {
        return {
          ...sec,
          options: {
            ...sec.options,
            ...newOptions,
          },
        };
      }
      return sec;
    });
    setSections(updated);
    pushToHistory(updated);
    setActivePreset('custom');
  };

  // Update section title
  const handleUpdateSectionTitle = (key: string, newTitle: string) => {
    handleRenameSection(key, newTitle);
  };

  // Apply layout preset
  const handleApplyPreset = (presetId: string) => {
    const preset = LAYOUT_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      const cloned = preset.sections.map((s, idx) => ({
        ...s,
        key: s.key || `${s.id}-${idx}`,
        order: idx,
      }));
      setSections(cloned);
      setSelectedSectionKey(cloned[0].key || `${cloned[0].id}-0`);
      setActivePreset(presetId);
      pushToHistory(cloned);
      onShowNotification(`Preset "${preset.name}" berhasil diterapkan!`);
    }
  };

  // Reset to default
  const handleReset = () => {
    const defaults = DEFAULT_STORE_LAYOUT.sections.map((s, idx) => ({
      ...s,
      key: s.key || `${s.id}-${idx}`,
      order: idx,
    }));
    setSections(defaults);
    setSelectedSectionKey(defaults[0].key || `${defaults[0].id}-0`);
    setActivePreset('standard');
    setPrimaryAccent('#66000E');
    pushToHistory(defaults);
    onShowNotification('Pengaturan tata letak dikembalikan ke bawaan.');
  };

  // Save layout
  const handleSave = () => {
    setIsSaving(true);
    const nowIso = new Date().toISOString();
    const updatedMap = {
      ...pageSectionsMap,
      [activePage]: sections,
    };

    const pagesConfig = Object.entries(updatedMap).map(([slug, secs]) => ({
      id: slug,
      title: slug === 'homepage' ? 'Halaman Utama' : slug.charAt(0).toUpperCase() + slug.slice(1),
      slug,
      sections: secs,
    }));

    const layoutSettings: StoreLayoutSettings = {
      sections: updatedMap['homepage'] || sections,
      themeStyle: activeThemeId,
      primaryAccent,
      activeThemeId,
      globalThemeSettings: globalSettings,
      pages: pagesConfig,
      activePage,
    };

    // UPDATE CURRENT EDITING DRAFT THEME IN savedThemes WITH LATEST TIMESTAMP & CUSTOM DATA!
    setSavedThemes((prev) => {
      const targetIdx = prev.findIndex((t) => t.id === editingDraftId);
      if (targetIdx !== -1) {
        const copy = [...prev];
        copy[targetIdx] = {
          ...copy[targetIdx],
          updatedAt: nowIso,
          customLayoutSettings: layoutSettings,
          customPageSectionsMap: updatedMap,
        };
        const [editedItem] = copy.splice(targetIdx, 1);
        return [editedItem, ...copy];
      } else if (prev.length > 0) {
        const copy = [...prev];
        copy[0] = {
          ...copy[0],
          updatedAt: nowIso,
          customLayoutSettings: layoutSettings,
          customPageSectionsMap: updatedMap,
        };
        return copy;
      }
      return prev;
    });

    onSaveLayout(layoutSettings);
    setHasChanges(false);
    setTimeout(() => {
      setIsSaving(false);
      const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.');
      onShowNotification(`Draf tema & tata letak berhasil disimpan pada pukul ${timeStr}! Jam pembaruan draf diperbarui.`);
    }, 200);
  };

  const handlePublish = () => {
    setIsSaving(true);
    const layoutSettings: StoreLayoutSettings = {
      sections,
      themeStyle: store.layoutSettings?.themeStyle || 'minimal',
      primaryAccent,
    };

    onSaveLayout(layoutSettings);
    if (onPublishStore) {
      onPublishStore();
    }
    setCurrentStore((prev) => ({ ...prev, isPublished: true }));
    setHasChanges(false);
    setTimeout(() => {
      setIsSaving(false);
      setIsPublishModalOpen(true);
      onShowNotification('🎉 Toko online berhasil dipublikasikan dan live!');
    }, 200);
  };

  const [isUnpublishModalOpen, setIsUnpublishModalOpen] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);

  const handleUnpublish = () => {
    setIsUnpublishModalOpen(true);
  };

  const confirmUnpublish = async () => {
    setIsUnpublishing(true);
    try {
      // Panggil backend API unpublish jika aktif
      try {
        await fetch('/api/deploy/unpublish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: currentStore.slug, customDomain: currentStore.customDomain }),
        });
      } catch (e) {
        // Non-fatal jika serverless / remote API
      }

      if (onUnpublishStore) {
        await onUnpublishStore();
      } else {
        await storeService.setPublishedStatus(currentStore.id, false);
      }

      setCurrentStore((prev) => ({ ...prev, isPublished: false }));
      onShowNotification('Toko online berhasil di-unpublish (kembali menjadi draf).');
    } catch (err: any) {
      console.error('Error unpublishing store:', err);
      onShowNotification('Gagal membatalkan publikasi toko.');
    } finally {
      setIsUnpublishing(false);
      setIsUnpublishModalOpen(false);
    }
  };

  return (
    <>
      {/* ═══ MODE 1: LIBRARY (inside dashboard, with sidebar visible) ═══ */}
      {pageMode === 'library' && (
        <div className="h-full w-full bg-[#FAF7F7] font-sans animate-in fade-in duration-200 overflow-hidden">
          <ThemeLibraryView
            store={currentStore}
            products={products}
            onCustomize={() => setPageMode('editor')}
            onSelectTheme={async (themeId) => {
              const storeTemplate = STORE_TEMPLATES.find(t => t.id === themeId);
              if (storeTemplate) {
                const galleryItem = TEMPLATE_GALLERY_ITEMS.find(t => t.storeTemplate.id === themeId || t.id === themeId);
                let targetStore = currentStore;
                if (!targetStore.id && user && galleryItem) {
                  targetStore = await ensureStoreExistsForTemplate(galleryItem);
                }
                const newSections = storeTemplate.sections.map((s, idx) => ({
                  ...s,
                  key: s.key || `${s.id}-${idx}`,
                  order: s.order !== undefined ? s.order : idx,
                }));
                const mappedThemeId = normalizeThemeId(themeId);
                setActiveThemeId(mappedThemeId);
                setSections(newSections);
                setSelectedSectionKey(newSections[0]?.key || null);
                setPrimaryAccent(storeTemplate.primaryAccent);
                handleUpdateStore({
                  bannerUrl: storeTemplate.bannerUrl,
                  tagline: storeTemplate.tagline,
                  layoutSettings: {
                    ...targetStore.layoutSettings,
                    activeThemeId: mappedThemeId,
                    themeStyle: mappedThemeId,
                    primaryAccent: storeTemplate.primaryAccent,
                    sections: newSections,
                  }
                });
                onSaveLayout({
                  ...targetStore.layoutSettings,
                  activeThemeId: mappedThemeId,
                  themeStyle: mappedThemeId,
                  primaryAccent: storeTemplate.primaryAccent,
                  sections: newSections,
                });
                setHistory([newSections]);
                setHistoryIndex(0);
                useCmsStore.getState().loadThemeData(mappedThemeId);
                onShowNotification(`Template "${storeTemplate.name}" berhasil diterapkan!`);
              }
            }}
            onPreviewTheme={(themeId) => {
              console.log('Previewing theme:', themeId);
            }}
            onPreviewTemplate={handlePreviewTemplate}
            onApplyTemplate={(template: SavedThemeItem) => {
              handleApplyAndEdit(template);
            }}
            savedThemes={savedThemes}
            editingDraftId={editingDraftId}
            onAddSavedTheme={handleAddSavedTheme}
            onPublishTheme={handlePublishTheme}
            onDuplicateTheme={handleDuplicateTheme}
            onRenameTheme={handleRenameTheme}
            onDeleteTheme={handleDeleteTheme}
          />
        </div>
      )}

      {/* ═══ MODE 2: PREVIEW (fullscreen overlay, separate page) ═══ */}
      {pageMode === 'preview' && previewTemplate && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col font-sans animate-in fade-in duration-200">
          {/* Shopify Theme Store Top Bar */}
          {/* Preview Modal Header Bar */}
          <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shrink-0 z-50">
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setPageMode('library'); setPreviewTemplate(null); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer text-gray-500 hover:text-gray-900"
                title="Kembali"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-gray-200"></div>
              <div>
                <h2 className="text-base font-bold text-gray-900 leading-none">{previewTemplate.name}</h2>
                <span className="text-xs text-gray-500 font-medium">Gratis • Multi-Page</span>
              </div>
            </div>

            {/* Device Switcher */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              {([
                { mode: 'desktop' as const, icon: Monitor },
                { mode: 'tablet' as const, icon: Tablet },
                { mode: 'mobile' as const, icon: Smartphone },
              ]).map(({ mode, icon: Icon }) => (
                <button
                  key={mode}
                  onClick={() => setPreviewDevice(mode)}
                  className={`p-2 rounded-md transition cursor-pointer ${
                    previewDevice === mode
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            {/* Empty right placeholder for balance */}
            <div className="w-16"></div>
          </div>

          {/* Preview Canvas */}
          <div className="flex-1 overflow-y-auto bg-gray-100 flex justify-center py-4 sm:py-8 px-4 relative">
            <div
              className={`transition-all duration-300 pb-20 ${
                previewDevice === 'desktop'
                  ? 'w-full max-w-6xl'
                  : 'max-w-[390px] w-full'
              }`}
            >
              <div
                className={`bg-white overflow-hidden shadow-2xl ${
                  previewDevice === 'mobile'
                    ? 'rounded-[40px] border-[6px] border-gray-800'
                    : 'rounded-t-xl border border-gray-300'
                }`}
              >
                {/* Mobile Status Bar */}
                {previewDevice === 'mobile' && (
                  <div className="bg-gray-900 pt-2.5 pb-1.5 px-6 flex items-center justify-between text-white text-[10px]">
                    <span className="font-semibold">09:41</span>
                    <div className="w-16 h-4 bg-black rounded-full"></div>
                    <span>5G 100%</span>
                  </div>
                )}

                {/* Template Preview Content */}
                <div 
                  className="w-full h-full relative" 
                  style={{ 
                    minHeight: previewDevice === 'mobile' ? '500px' : '600px',
                    fontFamily: previewTemplate.fontFamily 
                  }}
                >
                  <CenterPreviewCanvas
                    store={{
                      ...currentStore,
                      bannerUrl: previewTemplate.storeTemplate.bannerUrl,
                      tagline: previewTemplate.storeTemplate.tagline,
                    }}
                    products={displayProducts}
                    sections={previewTemplate.storeTemplate.sections.map((s, idx) => ({
                      ...s,
                      key: s.key || `${s.id}-${idx}`,
                      isVisible: s.isVisible !== false,
                    }))}
                    selectedSectionKey={null}
                    onSelectSection={() => {}}
                    deviceMode={previewDevice}
                    onDeviceModeChange={() => {}}
                    primaryAccent={previewTemplate.primaryAccent}
                    readonly={true}
                    activeThemeId={previewTemplate.storeTemplate.id as any}
                  />
                </div>

                {/* Mobile bottom bar */}
                {previewDevice === 'mobile' && (
                  <div className="bg-gray-900 py-2 flex items-center justify-center">
                    <div className="w-28 h-1 bg-white/40 rounded-full"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Floating Compact Action Bar at Bottom */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-3 sm:gap-4 bg-white/95 backdrop-blur-xl px-5 py-2 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.15)] border border-gray-200/80 animate-in fade-in slide-in-from-bottom-4 max-w-fit">
              {/* Template Title & Badge */}
              <div className="flex items-center gap-2 px-1 shrink-0">
                <span className="font-extrabold text-gray-900 text-sm tracking-tight">{previewTemplate.name}</span>
                <span className="text-xs text-gray-500 font-medium">Gratis</span>
              </div>

              <div className="w-px h-5 bg-gray-200 shrink-0 mx-1"></div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => { setPageMode('library'); setPreviewTemplate(null); }}
                  className="px-4 py-1.5 rounded-full border border-gray-300 text-xs font-bold text-gray-800 bg-white hover:bg-gray-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleApplyAndEdit(previewTemplate)}
                  className="px-5 py-2 rounded-full text-xs font-extrabold text-white bg-[#E60023] hover:bg-red-700 transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  Coba tema
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODE 3: LOADING (fullscreen overlay with progress bar) ═══ */}
      {pageMode === 'loading' && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col font-sans">
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-sm">
                <Palette className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-gray-900">MicroCMS</span>
            </div>
          </div>

          {/* Loading Content */}
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="max-w-xl w-full text-center space-y-6">
              <Loader2 className="w-8 h-8 text-red-600 animate-spin mx-auto" />
              <p className="text-lg font-semibold text-gray-700">
                Menambahkan "{loadingTemplateName}" ke tema toko online Anda...
              </p>

              {/* Progress Bar */}
              <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300 ease-out"
                  style={{
                    width: `${loadingProgress}%`,
                    background: 'linear-gradient(90deg, #DC2626 0%, #B91C1C 100%)',
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-8 bg-[#66000E] text-white/70 text-sm">
            <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div>
                <h4 className="font-bold text-white mb-2">MicroCMS</h4>
                <p className="text-xs">Platform toko online #1 Indonesia</p>
              </div>
              <div>
                <h4 className="font-semibold text-white/90 mb-2">Bantuan</h4>
                <p className="text-xs hover:text-white transition-colors cursor-pointer">Pusat Bantuan</p>
                <p className="text-xs hover:text-white transition-colors cursor-pointer mt-1">Dokumentasi API</p>
              </div>
              <div>
                <h4 className="font-semibold text-white/90 mb-2">Kategori</h4>
                <p className="text-xs hover:text-white transition-colors cursor-pointer">Semua Tema</p>
                <p className="text-xs hover:text-white transition-colors cursor-pointer mt-1">Tema Gratis</p>
              </div>
              <div>
                <h4 className="font-semibold text-white/90 mb-2">Tentang</h4>
                <p className="text-xs hover:text-white transition-colors cursor-pointer">Tim Kami</p>
                <p className="text-xs hover:text-white transition-colors cursor-pointer mt-1">Syarat Layanan</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODE 4: EDITOR (fullscreen overlay) ═══ */}
      {pageMode === 'editor' && (
        <div
          id="merchant-visual-layout-editor"
          className="fixed inset-0 z-[60] flex flex-col h-screen w-screen bg-[#FAF7F7] font-sans animate-in fade-in duration-200 overflow-hidden"
        >
          {/* 1. TOP BAR */}
          {/* 1. TOP BAR */}
          <EditorTopBar
            store={currentStore}
            hasChanges={hasChanges}
            deviceMode={deviceMode}
            onDeviceModeChange={setDeviceMode}
            onSave={handleSave}
            onReset={handleReset}
            onOpenStorefront={handleOpenPreviewTab}
            onBack={() => {
              if (window.opener) {
                window.close();
              } else {
                setPageMode('library');
              }
            }}
            isSaving={isSaving}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
            activePage={activePage}
            onPageChange={handlePageChange}
            onPublish={handlePublish}
            onUnpublish={handleUnpublish}
            isUnpublishing={isUnpublishing}
          />

          {/* 2. THREE-PANEL WORKSPACE */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0 relative bg-[#F6F6F7]">
            {/* Left Panel: Sections List */}
            <div className={`${editorMobileTab === 'sections' ? 'flex' : 'hidden'} lg:flex w-full lg:w-[280px] h-full shrink-0 z-10 overflow-hidden`}>
              <LeftPanelSections
                sections={sections}
                selectedSectionKey={selectedSectionKey}
                onSelectSection={handleSelectSection}
                onToggleVisibility={handleToggleVisibility}
                onDuplicateSection={handleDuplicateSection}
                onDeleteSection={handleDeleteSection}
                onMoveSection={handleMoveSection}
                onRenameSection={handleRenameSection}
                onOpenAddModal={(cat) => {
                  setAddModalCategoryFilter(cat);
                  setIsAddModalOpen(true);
                }}
                activePage={activePage}
                onOpenThemeSettings={() => {
                  setShowGlobalSettings(true);
                  setSelectedSectionKey(null);
                  setEditorMobileTab('settings');
                }}
              />
            </div>

            {/* Center Panel: Live Responsive Storefront Preview Canvas */}
            <div className={`${editorMobileTab === 'canvas' ? 'flex' : 'hidden'} lg:flex flex-1 min-w-0 h-full flex-col relative z-0 overflow-hidden`}>
              <CenterPreviewCanvas
                store={currentStore}
                products={displayProducts}
                sections={sections}
                selectedSectionKey={selectedSectionKey}
                onSelectSection={handleSelectSection}
                deviceMode={deviceMode}
                onDeviceModeChange={setDeviceMode}
                primaryAccent={primaryAccent}
                onMoveSection={handleMoveSection}
                onToggleVisibility={handleToggleVisibility}
                onDeleteSection={handleDeleteSection}
                onUpdateSectionOptions={handleUpdateSectionOptions}
                onUpdateStore={handleUpdateStore}
                isFullscreen={isFullscreen}
                onToggleFullscreen={toggleFullscreen}
                activeThemeId={activeThemeId}
                activePage={activePage}
                onPageChange={handlePageChange}
              />
            </div>

            {/* Right Panel: Section Settings */}
            <div className={`${editorMobileTab === 'settings' ? 'flex' : 'hidden'} lg:${(selectedSectionKey || showGlobalSettings) && !isFullscreen ? 'flex' : 'hidden'} w-full lg:w-[320px] h-full shrink-0 z-20 bg-white border-l border-[#E1E3E5] overflow-hidden`}>
              <RightPanelSettings
                store={currentStore}
                selectedSection={selectedSection}
                onUpdateSectionOptions={handleUpdateSectionOptions}
                onUpdateSectionTitle={handleRenameSection}
                onToggleVisibility={handleToggleVisibility}
                onDuplicateSection={handleDuplicateSection}
                onDeleteSection={handleDeleteSection}
                primaryAccent={primaryAccent}
                onChangePrimaryAccent={(color) => {
                  setPrimaryAccent(color);
                  setHasChanges(true);
                  setGlobalSettings({
                    ...globalSettings,
                    colors: { ...globalSettings.colors, primary: color }
                  });
                }}
                onBack={() => {
                  if (showGlobalSettings) {
                    setShowGlobalSettings(false);
                  } else {
                    setSelectedSectionKey(null);
                  }
                  setEditorMobileTab('canvas');
                }}
                showGlobalSettings={showGlobalSettings}
                globalSettings={globalSettings}
                onUpdateGlobalSettings={(newSettings) => {
                  setGlobalSettings(newSettings);
                  setHasChanges(true);
                }}
              />
            </div>
          </div>

          {/* 3. MOBILE & TABLET BOTTOM DOCK (< 1024px) */}
          <div className="lg:hidden shrink-0 bg-white border-t border-[#E1E3E5] px-3 py-1.5 flex items-center justify-around z-30 shadow-md">
            <button
              type="button"
              onClick={() => setEditorMobileTab('canvas')}
              className={`flex-1 py-1.5 px-2 rounded-xl flex flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-all cursor-pointer ${
                editorMobileTab === 'canvas'
                  ? 'bg-[#F1F8FF] text-[#2C6ECB]'
                  : 'text-[#6D7175] hover:text-[#202223] hover:bg-[#F6F6F7]'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span className="text-[10px]">Pratinjau</span>
            </button>
            <button
              type="button"
              onClick={() => setEditorMobileTab('sections')}
              className={`flex-1 py-1.5 px-2 rounded-xl flex flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-all cursor-pointer ${
                editorMobileTab === 'sections'
                  ? 'bg-[#F1F8FF] text-[#2C6ECB]'
                  : 'text-[#6D7175] hover:text-[#202223] hover:bg-[#F6F6F7]'
              }`}
            >
              <ArrowRight className="w-4 h-4 rotate-90" />
              <span className="text-[10px]">Struktur</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (!selectedSectionKey && !showGlobalSettings) {
                  setShowGlobalSettings(true);
                }
                setEditorMobileTab('settings');
              }}
              className={`flex-1 py-1.5 px-2 rounded-xl flex flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-all cursor-pointer ${
                editorMobileTab === 'settings'
                  ? 'bg-[#F1F8FF] text-[#2C6ECB]'
                  : 'text-[#6D7175] hover:text-[#202223] hover:bg-[#F6F6F7]'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span className="text-[10px]">Pengaturan</span>
            </button>
          </div>

          {/* Modal: Add Section from catalog */}
          <AddSectionModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onAddSection={handleAddSection}
          />

          {/* Wizard Modal */}
          {isWizardOpen && (
            <StoreLayoutSetupWizard
              currentStore={currentStore}
              onComplete={handleWizardComplete}
              onCancel={() => setIsWizardOpen(false)}
            />
          )}

          {/* Publish Store Modal */}
          <PublishStoreModal
            isOpen={isPublishModalOpen}
            onClose={() => setIsPublishModalOpen(false)}
            store={currentStore}
            onNavigateBilling={onNavigateBilling}
            onNavigateDomain={onNavigateDomain}
            onPublish={() => {
              if (onPublishStore) onPublishStore();
              setCurrentStore((prev) => ({ ...prev, isPublished: true }));
            }}
            onUnpublish={confirmUnpublish}
          />

          {/* Unpublish Confirmation Modal */}
          {isUnpublishModalOpen && (
            <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EBE5E2] space-y-4 animate-in zoom-in-95 duration-150">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                    <EyeOff className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#241A1A]">Tarik Publikasi Toko?</h3>
                    <p className="text-xs text-[#706866]">Kembalikan website toko ke status Draf</p>
                  </div>
                </div>

                <p className="text-xs text-[#555] leading-relaxed">
                  Setelah di-unpublish, website toko <strong>{currentStore.name}</strong> tidak dapat diakses secara publik oleh pembeli dan statusnya kembali menjadi draf. Anda dapat mempublikasikannya kembali kapan saja.
                </p>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsUnpublishModalOpen(false)}
                    disabled={isUnpublishing}
                    className="px-4 py-2 text-xs font-semibold text-[#706866] hover:bg-gray-100 rounded-xl transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={confirmUnpublish}
                    disabled={isUnpublishing}
                    className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {isUnpublishing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Ya, Unpublish Toko</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
