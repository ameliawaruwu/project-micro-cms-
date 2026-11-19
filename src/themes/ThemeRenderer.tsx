import React from 'react';
import { Store, Product } from '../types';
import { getStoreSectionsForPage, getLayoutLogoUrl } from '../utils/layoutConstants';
import { CenterPreviewCanvas } from '../components/layout-editor/CenterPreviewCanvas';
import { THEME_DATA_MAP } from './themeData';
import { normalizeThemeId } from './ThemeRegistry';
import { useCmsStore } from '../cms/useCmsStore';
import { filterRealProducts } from '../utils/demoProducts';
import { useLanguage } from '../contexts/LanguageContext';
import { pageFromPath, pathForPage, isSamePath, type StorefrontRoute } from './storefrontRouting';

const NO_PRODUCTS: Product[] = [];

interface ThemeRendererProps {
  store?: Store;
  products?: Product[];
}

// Halaman awal dari URL: ?page= (mis. Lacak Pesanan setelah checkout) lalu path (/katalog, /produk/<slug>, ...).
const resolveInitialRoute = (store?: Store): StorefrontRoute => {
  const params = new URLSearchParams(window.location.search);
  const pageParam = params.get('page');
  if (pageParam) return { page: pageParam };
  // Path panel (/dashboard/produk, /admin/toko/...) bukan halaman toko: abaikan saat pratinjau di dashboard.
  const rawPath = window.location.pathname;
  if (!/^\/(dashboard|admin)(\/|$)/i.test(rawPath)) {
    const fromPath = pageFromPath(rawPath);
    if (fromPath && fromPath.page !== 'homepage') return fromPath;
  }
  // Halaman terakhir di editor hanya dipakai untuk pratinjau; toko live di "/" selalu membuka Beranda.
  const isPreview = params.get('preview') === 'true' || Boolean(params.get('previewTheme'));
  const savedPage = (store?.layoutSettings as any)?.activePage;
  if (isPreview && savedPage) return { page: savedPage };
  return { page: 'homepage' };
};

/** Navigasi toko boleh menulis URL hanya di storefront (bukan di path panel dashboard/admin). */
const canWriteStoreUrl = () => !/^\/(dashboard|admin)(\/|$)/i.test(window.location.pathname);

export const ThemeRenderer: React.FC<ThemeRendererProps> = ({ store, products = NO_PRODUCTS }) => {
  const { isEn } = useLanguage();
  // ✅ Hooks MUST be called unconditionally at the top — before any early returns
  const initialRoute = React.useMemo(() => resolveInitialRoute(store), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [activePage, setActivePage] = React.useState<string>(initialRoute.page);
  const [routeProductId, setRouteProductId] = React.useState<string | undefined>(initialRoute.productId);

  // Setelah checkout, simpan nomor pesanan di URL agar halaman yang di-refresh langsung membuka
  // Lacak Pesanan (status & instruksi bayar) alih-alih checkout dengan keranjang kosong.
  React.useEffect(() => {
    const handleOrderCreated = (event: Event) => {
      const orderNumber = (event as CustomEvent<{ orderNumber?: string }>).detail?.orderNumber;
      if (!orderNumber) return;
      const url = new URL(window.location.href);
      url.searchParams.set('page', 'track_order');
      url.searchParams.set('no', orderNumber);
      window.history.replaceState(window.history.state, '', url);
    };
    window.addEventListener('microcms_order_created', handleOrderCreated);
    return () => window.removeEventListener('microcms_order_created', handleOrderCreated);
  }, []);

  // Slug produk untuk URL /produk/<slug> (ID dipakai bila produk belum punya slug).
  const productsRef = React.useRef(products);
  productsRef.current = products;

  // Navigasi di dalam toko menulis URL halaman (/katalog, /produk/<slug>, ...) lewat pushState agar
  // tautan bisa dibagikan/di-refresh dan tombol Back browser kembali ke halaman sebelumnya.
  // Query string (?toko=, ?preview=) dipertahankan; ?page=/?no= lama dibuang saat pindah halaman.
  const handlePageChange = React.useCallback((newPage: string, productId?: string) => {
    if (productId) setRouteProductId(productId);
    if (canWriteStoreUrl()) {
      const url = new URL(window.location.href);
      if (url.searchParams.has('page') && url.searchParams.get('page') !== newPage) {
        url.searchParams.delete('page');
        url.searchParams.delete('no');
      }
      let path: string | null = null;
      if (newPage === 'product') {
        const match = productId ? productsRef.current.find((p) => p.id === productId || p.slug === productId) : undefined;
        path = pathForPage('product', match?.slug || match?.id || productId);
      } else {
        path = pathForPage(newPage);
      }
      const nextHref = `${path ?? url.pathname}${url.search}${url.hash}`;
      const currentHref = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (path && !isSamePath(path, window.location.pathname)) {
        window.history.pushState({ lapakqStorePage: newPage, productId }, '', nextHref);
      } else if (nextHref !== currentHref) {
        window.history.replaceState(window.history.state, '', nextHref);
      }
    }
    setActivePage(newPage);
    window.scrollTo({ top: 0 });
  }, []);

  // Back/Forward browser: tampilkan halaman sesuai URL.
  React.useEffect(() => {
    const onPop = () => {
      if (!canWriteStoreUrl()) return;
      const pageParam = new URLSearchParams(window.location.search).get('page');
      const route = pageParam ? { page: pageParam } : pageFromPath(window.location.pathname) || { page: 'homepage' };
      if (route.productId) setRouteProductId(route.productId);
      setActivePage(route.page);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Section tema membaca produk & info toko dari CMS store. Isi dengan data asli toko agar
  // storefront tidak jatuh ke konten contoh template. setProductsFromMerchant juga mengisi ulang
  // storeInfo dengan data tema, jadi info toko asli harus ditimpa setelahnya.
  React.useEffect(() => {
    const cms = useCmsStore.getState();
    cms.setProductsFromMerchant(filterRealProducts(products));
    cms.updateStoreInfo({
      name: store?.name || '',
      description: store?.description || '',
      address: store?.address || '',
      // Toko tidak menyimpan email publik; kosongkan agar email contoh tema tidak tampil.
      email: '',
      phone: store?.phoneWhatsApp || '',
      // Logo gambar toko (stores.logo_url, atau logo header halaman mana pun) dipakai navbar tema di semua halaman.
      logoUrl: store?.logoUrl || getLayoutLogoUrl(store?.layoutSettings),
    });
  }, [products, store?.name, store?.description, store?.address, store?.phoneWhatsApp, store?.logoUrl, store?.layoutSettings]);

  // Guard: if no store, render a fallback (after hooks)
  if (!store || !store.id) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">{isEn ? 'Loading preview...' : 'Memuat pratinjau...'}</span>
        </div>
      </div>
    );
  }

  const rawThemeId = (store.layoutSettings as any)?.activeThemeId || store.layoutSettings?.themeStyle || 'minimalist';
  const activeThemeId = normalizeThemeId(rawThemeId);
  const themeData = THEME_DATA_MAP[activeThemeId] || THEME_DATA_MAP['minimalist'];

  // Storefront publik & pratinjau hanya menampilkan produk asli toko (dari menu Produk).
  // Produk contoh template hanya dipakai di Editor Layout.
  const displayProducts = products || [];

  const sections = getStoreSectionsForPage(store.layoutSettings, activePage);

  return (
    <CenterPreviewCanvas
      store={store}
      products={displayProducts}
      sections={sections}
      selectedSectionKey={null}
      onSelectSection={() => {}}
      deviceMode="desktop"
      onDeviceModeChange={() => {}}
      primaryAccent={store.layoutSettings?.primaryAccent || '#1A1A1A'}
      readonly={true}
      isLiveStorefront={true}
      activeThemeId={activeThemeId as any}
      activePage={activePage}
      onPageChange={handlePageChange}
      routeProductId={routeProductId}
    />
  );
};
