import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ThemeSchema } from '../schema';
import { Product, OrderItem, Order, BiteshipRateOption, StorePaymentConfig } from '../../types';
import { HeaderSection } from '../sections/HeaderSection';
import { FooterSection } from '../sections/FooterSection';
import { ThemeRegistry } from '../ThemeRegistry';
import {
  Check,
  CreditCard,
  Truck,
  ShieldCheck,
  Loader2,
  Lock,
  ChevronDown,
  ArrowLeft,
  Package,
  Info,
  AlertCircle,
  Clock,
  Sparkles,
  MapPin,
  Banknote,
  QrCode,
  Copy,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { DEFAULT_MANUAL_INSTRUCTIONS, resolveManualInstructions } from '../../utils/manualPayment';
import { cartService } from '../../services/cartService';
import { duitkuService } from '../../services/duitkuService';
import { getDeviceClass } from '../../utils/responsivePreview';
import { shippingService, INDONESIAN_CITIES } from '../../services/shippingService';
import { integrationService } from '../../services/integrationService';
import { adminService } from '../../services/adminService';
import {
  paymentChannelService,
  PaymentChannel,
  getLocalizedChannelDescription,
  getLocalizedChannelName,
} from '../../services/paymentChannelService';
import { wilayahService, WilayahItem, PostalCodeItem } from '../../services/wilayahService';
import { useLanguage } from '../../contexts/LanguageContext';
import { customerService } from '../../services/customerService';

export function mapPaymentIdToDuitkuMethod(paymentId: string): string {
  const p = (paymentId || '').toLowerCase();
  if (p.includes('qris') || p.includes('shopee') || p.includes('gopay') || p.includes('ovo') || p.includes('dana')) return 'SP';
  if (p.includes('bca')) return 'BC';
  if (p.includes('bri')) return 'BR';
  if (p.includes('mandiri') || p.includes('echannel')) return 'M2';
  if (p.includes('bni')) return 'I1';
  if (p.includes('permata')) return 'BT';
  if (p.includes('cimb')) return 'B1';
  if (p.includes('card') || p.includes('credit')) return 'VC';
  if (p.includes('alfa') || p.includes('retail') || p.includes('indo')) return 'FT';
  return 'SP';
}

interface CheckoutPageProps {
  themeData?: ThemeSchema;
  themeId?: string;
  store?: any;
  products?: Product[];
  onNavigate?: (pageId: string) => void;
  deviceMode?: 'desktop' | 'tablet' | 'mobile';
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  themeData,
  themeId: propThemeId,
  store,
  products = [],
  onNavigate,
  deviceMode,
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const activeThemeId = propThemeId || themeData?.themeId || store?.layoutSettings?.activeThemeId || 'minimalist';
  const isMobile = deviceMode === 'mobile';
  const isTablet = deviceMode === 'tablet';
  const formGridColsClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'grid-cols-1',
    tablet: 'grid-cols-2',
    desktop: 'grid-cols-2',
    fallback: 'grid-cols-1 sm:grid-cols-2',
  });
  const settings = themeData?.settings || {
    backgroundColor: '#FFFFFF',
    textColor: '#1A1A1A',
    primaryColor: '#1A1A1A',
    fontFamily: 'sans-serif',
  };

  // 1. Customer contact state - Starts empty so buyer fills in their own details
  // Isi awal dari Profil Saya (jika pelanggan pernah menyimpannya di perangkat ini).
  const savedCustomer = useMemo(() => customerService.getSavedInfo(), []);
  const [customerName, setCustomerName] = useState(() => String(savedCustomer?.name ?? ''));
  const [customerEmail, setCustomerEmail] = useState(() => String(savedCustomer?.email ?? ''));
  const [customerPhone, setCustomerPhone] = useState(() => String(savedCustomer?.phoneWhatsApp ?? ''));

  // 2. Hierarchical Address state: Province -> Regency/City -> District -> Village -> Postal Code
  const [provinces, setProvinces] = useState<WilayahItem[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState('');
  const [selectedProvinceName, setSelectedProvinceName] = useState('');
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);

  const [regencies, setRegencies] = useState<WilayahItem[]>([]);
  const [selectedRegencyId, setSelectedRegencyId] = useState('');
  const [selectedRegencyName, setSelectedRegencyName] = useState('');
  const [isLoadingRegencies, setIsLoadingRegencies] = useState(false);

  const [districts, setDistricts] = useState<WilayahItem[]>([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [selectedDistrictName, setSelectedDistrictName] = useState('');
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);

  const [villages, setVillages] = useState<WilayahItem[]>([]);
  const [selectedVillageId, setSelectedVillageId] = useState('');
  const [selectedVillageName, setSelectedVillageName] = useState('');
  const [isLoadingVillages, setIsLoadingVillages] = useState(false);

  const [postalCodes, setPostalCodes] = useState<PostalCodeItem[]>([]);
  const [selectedPostalCode, setSelectedPostalCode] = useState('');
  const [isLoadingPostalCodes, setIsLoadingPostalCodes] = useState(false);

  // Detailed address & notes
  const [detailedAddress, setDetailedAddress] = useState(() => String(savedCustomer?.address ?? ''));
  const [addressNotes, setAddressNotes] = useState('');

  // 3. Couriers & Rates state
  const [availableRates, setAvailableRates] = useState<BiteshipRateOption[]>([]);
  const [selectedRate, setSelectedRate] = useState<BiteshipRateOption | null>(null);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [ratesError, setRatesError] = useState('');

  // 4. Merchant Active Integrations & Channels state
  const [activeCouriers, setActiveCouriers] = useState<string[]>([]);
  const [activePaymentChannels, setActivePaymentChannels] = useState<PaymentChannel[]>([]);
  const [isGatewayEnabledOnPlatform, setIsGatewayEnabledOnPlatform] = useState<boolean>(() => {
    return adminService.getPlatformSettings().paymentGatewayEnabled ?? true;
  });

  // 5. Payment state
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>('qris');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [paymentConfirmError, setPaymentConfirmError] = useState<string | null>(null);

  const handleConfirmPayment = async () => {
    if (!createdOrder?.id || !createdOrder.storeId) return;
    setIsConfirmingPayment(true);
    setPaymentConfirmError(null);
    try {
      const confirmedAt = await orderService.confirmPaymentByBuyer(createdOrder.id, createdOrder.storeId, createdOrder.orderNumber);
      setCreatedOrder({ ...createdOrder, paymentConfirmedAt: confirmedAt });
    } catch (err: any) {
      setPaymentConfirmError(err?.message || 'Gagal mengirim konfirmasi pembayaran. Silakan coba lagi.');
    } finally {
      setIsConfirmingPayment(false);
    }
  };
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopyText = (text: string, field: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // ignore
    }
  };

  // Cart / sample items
  const cartItemsFromStorage = store?.slug ? cartService.getCart(store.slug) : [];
  const sampleItems = cartItemsFromStorage.length > 0
    ? cartItemsFromStorage.map((ci) => ({
        id: ci.product.id,
        name: ci.product.name,
        price: ci.product.price,
        quantity: ci.quantity,
        // Produk dari kartu tema (CmsProduct) menyimpan gambar di `image`, bukan `imageUrl`.
        imageUrl: ci.product.imageUrl || (ci.product as any).image || ci.product.images?.[0],
        weightGrams: ci.product.weightGrams || 350,
      }))
    : deviceMode === undefined
    ? [] // Toko publik: keranjang kosong tetap kosong, jangan isi produk contoh.
    : products.length > 0
    ? products.slice(0, 2).map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        quantity: 1,
        imageUrl: p.imageUrl,
        weightGrams: p.weightGrams || 350,
      }))
    : [
        {
          id: '1',
          name: 'Produk Unggulan 1',
          price: 150000,
          quantity: 1,
          imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop',
          weightGrams: 350,
        },
        {
          id: '2',
          name: 'Produk Unggulan 2',
          price: 95000,
          quantity: 1,
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop',
          weightGrams: 350,
        },
      ];

  const subtotal: number = sampleItems.reduce((acc, item) => acc + Number(item.price || 0) * (item.quantity || 1), 0);
  const totalWeightGrams: number = Math.max(250, sampleItems.reduce((acc, item) => acc + (item.quantity || 1) * (item.weightGrams || 350), 0));

  // Load provinces on initial render
  useEffect(() => {
    let isMounted = true;
    const fetchProvinces = async () => {
      setIsLoadingProvinces(true);
      try {
        const data = await wilayahService.getProvinces();
        if (isMounted) {
          setProvinces(data);
        }
      } catch (err) {
        console.warn('Failed to load provinces:', err);
      } finally {
        if (isMounted) setIsLoadingProvinces(false);
      }
    };
    fetchProvinces();
    return () => {
      isMounted = false;
    };
  }, []);

  // Load merchant shipping & payment settings
  const loadMerchantSettings = async () => {
    try {
      const shippingIntegrations = await integrationService.getShippingIntegrations();
      const enabled = shippingIntegrations
        .filter((i) => i.isConnected)
        .map((i) => (i.provider || '').toLowerCase())
        .filter(Boolean);
      setActiveCouriers(enabled);
    } catch (err) {
      console.warn('Failed to load merchant shipping integrations:', err);
    }

    try {
      const channels = paymentChannelService.getChannels();
      setActivePaymentChannels(channels.filter((c) => c.isEnabled));
    } catch (err) {
      console.warn('Failed to load merchant payment channels:', err);
    }
    try {
      const settings = await adminService.fetchPlatformSettingsFromDatabase();
      setIsGatewayEnabledOnPlatform(settings.paymentGatewayEnabled ?? true);
    } catch {
      setIsGatewayEnabledOnPlatform(adminService.getPlatformSettings().paymentGatewayEnabled ?? true);
    }
  };

  useEffect(() => {
    loadMerchantSettings();

    const handleSync = () => {
      loadMerchantSettings();
    };

    window.addEventListener('microcms_integrations_updated', handleSync);
    window.addEventListener('microcms_payment_channels_updated', handleSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);
    document.addEventListener('visibilitychange', handleSync);

    return () => {
      window.removeEventListener('microcms_integrations_updated', handleSync);
      window.removeEventListener('microcms_payment_channels_updated', handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
      document.removeEventListener('visibilitychange', handleSync);
    };
  }, []);

  // Fetch courier rates when postal code changes
  const fetchBiteshipRates = async (postalCodeToUse: string) => {
    const destCode = (postalCodeToUse || '').trim();
    if (!destCode) {
      setAvailableRates([]);
      setSelectedRate(null);
      return;
    }
    setIsLoadingRates(true);
    setRatesError('');

    try {
      const result = await shippingService.checkBiteshipRates({
        storeId: store?.id,
        destinationPostalCode: destCode,
        weight: totalWeightGrams,
        couriers: 'jnt,jne,sicepat,anteraja,gosend',
      });

      if (result.rates && result.rates.length > 0) {
        setAvailableRates(result.rates);
      } else {
        setRatesError('Tidak ada layanan kurir yang tersedia untuk area ini.');
        setAvailableRates([]);
        setSelectedRate(null);
      }
    } catch (err: any) {
      console.warn('[Checkout] Failed to fetch rates:', err);
      setRatesError('Gagal memuat tarif kurir otomatis.');
      setAvailableRates([]);
      setSelectedRate(null);
    } finally {
      setIsLoadingRates(false);
    }
  };

  // Filter couriers strictly based on merchant active integrations (with resilient fallback)
  const displayedRates = useMemo(() => {
    if (availableRates.length === 0) return [];
    if (activeCouriers.length === 0) return availableRates;

    const filtered = availableRates.filter((rate) => {
      const code = (rate.courier_code || '').toLowerCase();
      return activeCouriers.some((active) => {
        if (!active || active === 'biteship') return false;
        return code === active || code.startsWith(active) || active.startsWith(code);
      });
    });

    return filtered.length > 0 ? filtered : availableRates;
  }, [availableRates, activeCouriers]);

  // Keep selectedRate valid whenever displayedRates change
  useEffect(() => {
    if (displayedRates.length > 0) {
      const matched = displayedRates.find(
        (r) =>
          selectedRate &&
          r.courier_code === selectedRate.courier_code &&
          r.courier_service_code === selectedRate.courier_service_code
      );
      if (!matched) {
        setSelectedRate(displayedRates[0]);
      }
    } else {
      setSelectedRate(null);
    }
  }, [displayedRates]);

  const shippingFee = selectedRate ? selectedRate.price : 0;
  const total = subtotal + shippingFee;
  const cartTotal = total;

  // Store payment configuration (COD, Manual QRIS/Bank, Payment Gateway)
  const paymentConfig: StorePaymentConfig = useMemo(() => {
    return (
      store?.paymentConfig || {
        enableCod: true,
        codInstructions: 'Siapkan uang pas saat barang diantar oleh kurir/penjual.',
        enableManualTransfer: true,
        manualBankName: 'BCA (Bank Central Asia)',
        manualBankAccountNumber: '',
        manualBankAccountHolder: '',
        manualQrisImageUrl: '',
        manualInstructions: DEFAULT_MANUAL_INSTRUCTIONS,
        enablePaymentGateway: true,
      }
    );
  }, [store?.paymentConfig]);

  // Active payment options
  const paymentOptions = useMemo(() => {
    const options: { id: string; name: string; description: string; badge?: string; type: 'cod' | 'manual' | 'gateway' }[] = [];

    // 1. Bayar di Tempat (COD)
    if (paymentConfig.enableCod) {
      options.push({
        id: 'cod',
        name: isEn ? 'Cash on Delivery (COD)' : 'Bayar di Tempat (COD / Tunai)',
        description:
          paymentConfig.codInstructions ||
          (isEn
            ? 'Pay with cash directly to the courier or seller when package arrives.'
            : 'Bayar secara tunai kepada kurir atau penjual saat barang tiba di alamat Anda.'),
        badge: isEn ? 'COD Cash' : 'COD Tunai',
        type: 'cod',
      });
    }

    // 2. QRIS Statis & Transfer Bank Langsung Milik Toko
    if (paymentConfig.enableManualTransfer) {
      const bankDetails = paymentConfig.manualBankAccountNumber
        ? `${paymentConfig.manualBankName || 'Bank'} (${paymentConfig.manualBankAccountNumber} a.n ${paymentConfig.manualBankAccountHolder || store?.name || 'Toko'})`
        : 'Rekening Toko / Barcode QRIS';

      options.push({
        id: 'manual_transfer',
        name: isEn ? 'Direct Bank Transfer / QRIS' : 'QRIS & Transfer Bank Langsung Milik Toko',
        description: `Transfer langsung ke ${bankDetails} atau scan QRIS toko, lalu klik "Saya Sudah Bayar" agar penjual memeriksa pembayaran Anda.`,
        badge: '0% Biaya Gateway',
        type: 'manual',
      });
    }

    // 3. Automated Gateway Channels (Duitku / Midtrans)
    if (isGatewayEnabledOnPlatform && paymentConfig.enablePaymentGateway) {
      const channelsToRender =
        activePaymentChannels.filter((c) => c.isEnabled).length > 0
          ? activePaymentChannels.filter((c) => c.isEnabled)
          : [
              { id: 'qris', name: 'QRIS Real-Time (Scan Otomatis GoPay, OVO, DANA, ShopeePay)', category: 'ewallet_qris', isEnabled: true, description: 'Bayar instan via scan kode QRIS otomatis dari m-Banking atau E-Wallet mana pun.' },
              { id: 'bca_va', name: 'BCA Virtual Account', category: 'virtual_account', isEnabled: true, description: 'Transfer langsung via BCA Mobile / KlikBCA verifikasi otomatis 24 jam.' },
              { id: 'mandiri_va', name: 'Mandiri Virtual Account', category: 'virtual_account', isEnabled: true, description: 'Transfer langsung via Livin by Mandiri verifikasi otomatis.' },
              { id: 'bri_va', name: 'BRI Virtual Account (BRIVA)', category: 'virtual_account', isEnabled: true, description: 'Transfer langsung via BRImo atau ATM BRI verifikasi otomatis.' },
            ];

      channelsToRender.forEach((channel) => {
        const localizedName = getLocalizedChannelName(channel.id, channel.name, language);
        const localizedDesc = getLocalizedChannelDescription(channel.id, channel.description, language);

        if (channel.id === 'qris') {
          options.push({
            id: 'qris',
            name: isEn ? 'QRIS Real-Time (Instant Scan GoPay, OVO, DANA, ShopeePay)' : 'QRIS Real-Time (Scan Otomatis GoPay, OVO, DANA, ShopeePay)',
            description: localizedDesc || 'Bayar instan via scan kode QRIS otomatis dari aplikasi m-Banking atau E-Wallet mana pun.',
            badge: isEn ? 'Instant' : 'Instan Otomatis',
            type: 'gateway',
          });
        } else if (channel.id === 'gopay') {
          options.push({ id: 'gopay', name: localizedName, description: localizedDesc, badge: 'E-Wallet', type: 'gateway' });
        } else if (channel.id === 'shopeepay') {
          options.push({ id: 'shopeepay', name: localizedName, description: localizedDesc, badge: 'E-Wallet', type: 'gateway' });
        } else if (channel.category === 'virtual_account' || channel.id.includes('va')) {
          options.push({
            id: channel.id,
            name: localizedName,
            description: localizedDesc || (isEn ? 'Automatic transfer with instant 24/7 verification.' : 'Transfer otomatis dengan verifikasi instan 24 jam tanpa perlu upload bukti transfer.'),
            badge: 'Otomatis 24 Jam',
            type: 'gateway',
          });
        } else if (channel.id === 'credit_card') {
          options.push({
            id: 'credit_card',
            name: isEn ? 'Credit / Debit Card Online (Visa, Mastercard, JCB)' : 'Kartu Kredit / Debit Online (Visa, Mastercard, JCB)',
            description: localizedDesc || 'Pembayaran online terenkripsi dengan proteksi 3D Secure OTP.',
            badge: '3D Secure',
            type: 'gateway',
          });
        } else {
          options.push({
            id: channel.id,
            name: localizedName,
            description: localizedDesc || 'Pembayaran resmi melalui gerbang Duitku.',
            badge: 'Otomatis',
            type: 'gateway',
          });
        }
      });
    }

    if (options.length === 0) {
      options.push({
        id: 'cod',
        name: 'Bayar di Tempat (COD)',
        description: 'Bayar secara tunai langsung kepada kurir saat barang tiba.',
        badge: 'COD Tunai',
        type: 'cod',
      });
    }

    return options;
  }, [paymentConfig, activePaymentChannels, language, isEn, store?.name, isGatewayEnabledOnPlatform]);

  // Sync selectedPaymentId with available options
  useEffect(() => {
    if (paymentOptions.length > 0) {
      const exists = paymentOptions.some((p) => p.id === selectedPaymentId);
      if (!exists) {
        setSelectedPaymentId(paymentOptions[0].id);
      }
    }
  }, [paymentOptions, selectedPaymentId]);

  // Cascading Address Selection Handlers
  const handleProvinceChange = async (provId: string) => {
    setSelectedProvinceId(provId);
    const matched = provinces.find((p) => p.id === provId);
    setSelectedProvinceName(matched?.name || '');

    // Reset dependent levels
    setSelectedRegencyId('');
    setSelectedRegencyName('');
    setRegencies([]);

    setSelectedDistrictId('');
    setSelectedDistrictName('');
    setDistricts([]);

    setSelectedVillageId('');
    setSelectedVillageName('');
    setVillages([]);

    setSelectedPostalCode('');
    setPostalCodes([]);
    setAvailableRates([]);
    setSelectedRate(null);

    if (!provId) return;

    setIsLoadingRegencies(true);
    try {
      const data = await wilayahService.getRegencies(provId);
      setRegencies(data);
    } catch (err) {
      console.warn('Failed to load regencies:', err);
    } finally {
      setIsLoadingRegencies(false);
    }
  };

  const handleRegencyChange = async (regId: string) => {
    setSelectedRegencyId(regId);
    const matched = regencies.find((r) => r.id === regId);
    setSelectedRegencyName(matched?.name || '');

    // Reset dependent levels
    setSelectedDistrictId('');
    setSelectedDistrictName('');
    setDistricts([]);

    setSelectedVillageId('');
    setSelectedVillageName('');
    setVillages([]);

    setSelectedPostalCode('');
    setPostalCodes([]);
    setAvailableRates([]);
    setSelectedRate(null);

    if (!regId) return;

    setIsLoadingDistricts(true);
    try {
      const data = await wilayahService.getDistricts(regId);
      setDistricts(data);
    } catch (err) {
      console.warn('Failed to load districts:', err);
    } finally {
      setIsLoadingDistricts(false);
    }
  };

  const handleDistrictChange = async (distId: string) => {
    setSelectedDistrictId(distId);
    const matched = districts.find((d) => d.id === distId);
    setSelectedDistrictName(matched?.name || '');

    // Reset dependent levels
    setSelectedVillageId('');
    setSelectedVillageName('');
    setVillages([]);

    setSelectedPostalCode('');
    setPostalCodes([]);
    setAvailableRates([]);
    setSelectedRate(null);

    if (!distId) return;

    setIsLoadingVillages(true);
    try {
      const data = await wilayahService.getVillages(distId);
      setVillages(data);
    } catch (err) {
      console.warn('Failed to load villages:', err);
    } finally {
      setIsLoadingVillages(false);
    }
  };

  const handleVillageChange = async (vilId: string) => {
    setSelectedVillageId(vilId);
    const matched = villages.find((v) => v.id === vilId);
    const vName = matched?.name || '';
    setSelectedVillageName(vName);

    // Reset postal code & shipping rates
    setSelectedPostalCode('');
    setPostalCodes([]);
    setAvailableRates([]);
    setSelectedRate(null);

    if (!vilId || !vName) return;

    setIsLoadingPostalCodes(true);
    try {
      let list = await wilayahService.getPostalCodes(vName, selectedDistrictName, selectedRegencyName);
      if (!list || list.length === 0) {
        list = await wilayahService.getPostalCodes('', selectedDistrictName, selectedRegencyName);
      }
      if (!list || list.length === 0) {
        const single = await wilayahService.findPostalCode(vName, selectedDistrictName, selectedRegencyName);
        if (single?.code) {
          list = [{ code: single.code, village: vName, district: selectedDistrictName, isExact: true }];
        }
      }
      if (!list || list.length === 0) {
        const cleanRegency = (selectedRegencyName || '').toLowerCase().replace(/^(kabupaten|kota)\s+/i, '');
        const cityMatch = INDONESIAN_CITIES.find(
          (c) =>
            c.name.toLowerCase().includes(cleanRegency) ||
            cleanRegency.includes(c.name.toLowerCase())
        );
        if (cityMatch?.postalCode) {
          list = [{ code: cityMatch.postalCode, village: vName, district: selectedDistrictName, isExact: true }];
        }
      }

      setPostalCodes(list || []);
      if (list && list.length > 0) {
        setSelectedPostalCode(list[0].code);
        fetchBiteshipRates(list[0].code);
      }
    } catch (err) {
      console.warn('Failed to load postal codes:', err);
    } finally {
      setIsLoadingPostalCodes(false);
    }
  };

  const handlePostalCodeChange = (code: string) => {
    setSelectedPostalCode(code);
    if (code) {
      fetchBiteshipRates(code);
    } else {
      setAvailableRates([]);
      setSelectedRate(null);
    }
  };

  // Pesanan gateway yang sudah dibuat (belum lunas) dipakai ulang bila pembeli mencoba bayar lagi
  // tanpa mengubah keranjang/ongkir, agar tidak tercipta pesanan ganda.
  const pendingGatewayOrderRef = useRef<{ key: string; order: Order } | null>(null);

  const createOrderRecord = async (methodDesc: string): Promise<Order> => {
    const orderItems: OrderItem[] = sampleItems.map((s) => ({
      productId: s.id,
      productName: s.name,
      productImage: s.imageUrl,
      price: s.price,
      quantity: s.quantity || 1,
      subtotal: s.price * (s.quantity || 1),
    }));

    const courierDisplayName = selectedRate
      ? `${selectedRate.courier_name} (${selectedRate.courier_service_name})`
      : 'Pengiriman Standar';

    const fullAddressParts = [
      detailedAddress.trim(),
      addressNotes.trim() ? `(Patokan / Catatan: ${addressNotes.trim()})` : '',
      `Kel. ${selectedVillageName}`,
      `Kec. ${selectedDistrictName}`,
      selectedRegencyName,
      selectedProvinceName,
      selectedPostalCode ? `Kode Pos ${selectedPostalCode}` : '',
    ].filter(Boolean);

    const formattedFullAddress = fullAddressParts.join(', ');

    return orderService.createOrder({
      storeId: store?.id || '',
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || undefined,
      customerAddress: formattedFullAddress,
      customerCity: selectedRegencyName || 'Indonesia',
      customerPostalCode: selectedPostalCode || undefined,
      items: orderItems,
      subtotal,
      shippingCost: shippingFee,
      discount: 0,
      grandTotal: total,
      paymentMethod: methodDesc as any,
      paymentStatus: 'Belum Dibayar',
      courier: (selectedRate?.courier_code?.toUpperCase() || 'KURIR') as any,
      courierCode: selectedRate?.courier_code || 'kurir',
      courierService: selectedRate ? `${selectedRate.courier_service_name} • ${selectedRate.etd}` : 'Reguler',
      shippingStatus: 'Baru',
      notes: `Alamat: ${formattedFullAddress}. Kurir: ${courierDisplayName}. Ongkir: Rp ${shippingFee.toLocaleString('id-ID')}`,
    });
  };

  /** Tampilkan halaman selesai. Saldo toko tidak lagi ditambah dari browser (server yang mengurus). */
  const completeOrder = (newOrder: Order) => {
    pendingGatewayOrderRef.current = null;
    setCreatedOrder(newOrder);
    setIsCompleted(true);
    if (store?.slug) {
      cartService.clearCart(store.slug);
    }
    window.dispatchEvent(new CustomEvent('microcms_order_created', { detail: newOrder }));
  };

  const handleProcessCheckout = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Silakan lengkapi Nama Lengkap dan Nomor WhatsApp penerima.');
      return;
    }

    if (!/^\d{9,15}$/.test(customerPhone.trim())) {
      alert('Nomor WhatsApp harus berupa angka 9–15 digit, contoh: 081234567890.');
      return;
    }

    if (!selectedProvinceId || !selectedRegencyId || !selectedDistrictId || !selectedVillageId || !selectedPostalCode) {
      alert('Silakan lengkapi pemilihan alamat bertingkat (Provinsi → Kota → Kecamatan → Kelurahan → Kode Pos).');
      return;
    }

    if (!detailedAddress.trim()) {
      alert('Silakan isi Detail Alamat (nama jalan, nomor rumah/gedung, RT/RW).');
      return;
    }

    if (!selectedRate && displayedRates.length > 0) {
      alert('Silakan pilih salah satu opsi pengiriman kurir.');
      return;
    }

    if (paymentOptions.length === 0) {
      alert('Tidak ada metode pembayaran yang aktif di toko ini.');
      return;
    }

    const selectedOption = paymentOptions.find((p) => p.id === selectedPaymentId) || paymentOptions[0];

    // 1. Direct COD Checkout (Bayar Tunai di Tempat)
    if (selectedOption?.type === 'cod' || selectedPaymentId === 'cod') {
      setIsSubmitting(true);
      try {
        completeOrder(await createOrderRecord('Bayar di Tempat (COD)'));
      } catch (err: any) {
        console.error('COD checkout error:', err);
        alert('Gagal memproses pesanan COD: ' + (err?.message || 'Silakan coba lagi.'));
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // 2. Direct QRIS & Transfer Bank Langsung Milik Toko
    if (selectedOption?.type === 'manual' || selectedPaymentId === 'manual_transfer') {
      setIsSubmitting(true);
      try {
        const title = `QRIS & Transfer Bank Langsung (${paymentConfig.manualBankName || 'Toko'})`;
        completeOrder(await createOrderRecord(title));
      } catch (err: any) {
        console.error('Manual transfer checkout error:', err);
        alert('Gagal memproses pesanan: ' + (err?.message || 'Silakan coba lagi.'));
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // 3. Automated Gateway (Duitku)
    setIsSubmitting(true);
    try {
      const duitkuMethod = mapPaymentIdToDuitkuMethod(selectedPaymentId);
      const methodLabel = selectedOption?.name || 'Payment Gateway';
      const orderKey = JSON.stringify([
        sampleItems.map((s) => [s.id, s.quantity || 1]),
        shippingFee,
        selectedPaymentId,
        customerName.trim(),
        customerPhone.trim(),
        selectedPostalCode,
      ]);
      // Pesanan dibuat dulu (belum dibayar); nominal tagihan diambil dari total versi database.
      const order =
        pendingGatewayOrderRef.current?.key === orderKey
          ? pendingGatewayOrderRef.current.order
          : await createOrderRecord(`Duitku (${methodLabel})`);
      pendingGatewayOrderRef.current = { key: orderKey, order };
      // Sufiks unik per percobaan bayar; server mencocokkan awalan dengan nomor pesanan.
      const orderId = `${order.orderNumber}-${Date.now().toString(36)}`;

      await duitkuService.payWithDuitku(
        {
          orderId,
          grossAmount: order.grandTotal,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim() || 'customer@example.com',
          customerPhone: customerPhone.trim(),
          paymentMethod: duitkuMethod,
          productDetails: `Pesanan ${order.orderNumber} - ${store?.name || 'Store'}`,
          // Rincian memakai harga dari database agar jumlahnya sama dengan total tagihan.
          items: [
            ...order.items.map((it) => ({
              id: it.productId,
              name: it.productName,
              price: it.price,
              quantity: it.quantity,
            })),
            {
              id: 'shipping-charge',
              name: `Ongkir (${selectedRate?.courier_name || 'Pengiriman'})`,
              price: order.shippingCost,
              quantity: 1,
            },
          ],
        },
        {
          onSuccess: async () => {
            const paid = await orderService.confirmGatewayPayment(order, orderId);
            completeOrder(paid ? { ...order, paymentStatus: 'Sudah Dibayar', shippingStatus: 'Diproses' } : order);
            setIsSubmitting(false);
          },
          onPending: async () => {
            completeOrder(order);
            setIsSubmitting(false);
          },
          onError: (err) => {
            console.error('Duitku payment notice:', err);
            setIsSubmitting(false);
            alert('Kendala pembayaran: ' + (err?.statusMessage || 'Pembayaran dibatalkan atau terjadi kendala. Silakan coba lagi.'));
          },
          onClose: () => {
            setIsSubmitting(false);
          },
        }
      );
    } catch (err: any) {
      console.error('Checkout error:', err);
      alert('Terjadi kendala saat memproses pesanan: ' + (err?.message || 'Silakan coba kembali.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const sections = themeData?.sections || {};
  const headerSection = Object.values(sections).find((s) => s.type === 'Header');
  const footerSection = Object.values(sections).find((s) => s.type === 'Footer');

  const CustomNavbar = ThemeRegistry[activeThemeId as keyof typeof ThemeRegistry]?.Navbar;
  const CustomFooter = ThemeRegistry[activeThemeId as keyof typeof ThemeRegistry]?.Footer;

  const renderContent = () => {
    // 1. ORDER COMPLETED VIEW
    if (isCompleted) {
      // Keranjang sudah dikosongkan setelah pesanan dibuat; pakai total dari pesanan.
      const total = createdOrder?.grandTotal ?? cartTotal;
      const orderNum = createdOrder?.orderNumber || '#ORD-88231';
      const courierInfo = selectedRate
        ? `${selectedRate.courier_name} (${selectedRate.courier_service_name})`
        : 'Pengiriman Standar';
      const selectedPaymentName =
        paymentOptions.find((p) => p.id === selectedPaymentId)?.name || 'Metode Pembayaran';

      const isCodOrder = createdOrder?.paymentMethod?.includes('COD') || selectedPaymentId === 'cod';
      const isManualTransfer =
        createdOrder?.paymentMethod?.includes('Transfer') ||
        createdOrder?.paymentMethod?.includes('QRIS & Transfer') ||
        selectedPaymentId === 'manual_transfer';


      return (
        <div className="py-12 sm:py-20 px-4 sm:px-6 max-w-2xl mx-auto text-center font-sans">
          <div className="p-6 sm:p-10 rounded-[var(--sf-radius)] bg-[var(--sf-card)] border border-[var(--sf-border)] shadow-xl space-y-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto border ${
              isCodOrder
                ? 'bg-amber-50 text-amber-600 border-amber-200'
                : isManualTransfer
                ? 'bg-[var(--sf-primary-soft)] text-[var(--sf-primary)] border-[var(--sf-primary-border)]'
                : 'bg-emerald-50 text-emerald-600 border-emerald-200'
            }`}>
              {isCodOrder ? (
                <Banknote className="w-8 h-8 stroke-[2.5]" />
              ) : isManualTransfer ? (
                <QrCode className="w-8 h-8 stroke-[2.5]" />
              ) : (
                <Check className="w-8 h-8 stroke-[2.5]" />
              )}
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--sf-text)] tracking-tight">
                {isCodOrder
                  ? 'Pesanan COD Berhasil Diterima!'
                  : isManualTransfer
                  ? 'Pesanan Diterima! Selesaikan Pembayaran'
                  : 'Pesanan Berhasil Diproses!'}
              </h1>
              <p className="text-sm font-medium text-[var(--sf-muted)]">
                Nomor Pesanan: <span className="font-bold font-mono text-[var(--sf-text)]">{orderNum}</span>
              </p>
            </div>

            {/* Instruction Box for COD */}
            {isCodOrder && (
              <div className="p-4 rounded-[var(--sf-radius)] bg-amber-50/80 border border-amber-200/80 text-left text-xs text-amber-900 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <Banknote className="w-4 h-4 text-amber-700" />
                  <span>Petunjuk Pembayaran Tunai (COD)</span>
                </div>
                <p className="leading-relaxed">
                  {paymentConfig.codInstructions || 'Siapkan uang tunai pas saat barang diantar oleh kurir atau penjual.'}
                </p>
                <p className="text-[11px] text-amber-800 font-medium pt-1">
                  Total yang harus dibayarkan:{' '}
                  <strong className="text-amber-950 text-sm">Rp {total.toLocaleString('id-ID')}</strong>
                </p>
              </div>
            )}

            {/* Instruction Box for Manual Transfer / QRIS */}
            {isManualTransfer && (
              <div className="p-5 rounded-[var(--sf-radius)] bg-[var(--sf-primary-soft)] border border-[var(--sf-primary-border)] text-left text-xs text-[var(--sf-primary-strong)] space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--sf-primary-border)]">
                  <div className="flex items-center gap-2 font-bold text-[var(--sf-primary-strong)] text-sm">
                    <QrCode className="w-4 h-4 text-[var(--sf-primary)]" />
                    <span>Rekening &amp; QRIS Pembayaran Toko</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--sf-primary-soft)] text-[var(--sf-primary-strong)] font-bold text-[10px]">
                    Direct Transfer
                  </span>
                </div>

                {/* QRIS Image if available */}
                {paymentConfig.manualQrisImageUrl && (
                  <div className="text-center py-2 bg-[var(--sf-card)] p-3 rounded-[var(--sf-radius)] border border-[var(--sf-primary-border)] space-y-2">
                    <p className="text-[11px] font-bold text-[var(--sf-text-soft)]">Scan QR Code Barcode di Bawah Ini:</p>
                    <img
                      src={paymentConfig.manualQrisImageUrl}
                      alt="Barcode QRIS Toko"
                      className="w-48 h-48 mx-auto object-contain rounded-[var(--sf-radius)] border border-[var(--sf-border)] shadow-2xs"
                    />
                    <p className="text-[10px] text-[var(--sf-muted)]">Mendukung BCA, Mandiri, BRI, BNI, GoPay, OVO, DANA, ShopeePay</p>
                  </div>
                )}

                {/* Bank Account Info Card */}
                <div className="bg-[var(--sf-card)] p-3.5 rounded-[var(--sf-radius)] border border-[var(--sf-primary-border)] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[var(--sf-muted)] font-medium">Bank Tujuan:</span>
                    <span className="font-bold text-[var(--sf-text)]">{paymentConfig.manualBankName || 'Transfer Bank'}</span>
                  </div>
                  {paymentConfig.manualBankAccountNumber && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[var(--sf-muted)] font-medium">Nomor Rekening:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-[var(--sf-primary-strong)] text-sm">
                          {paymentConfig.manualBankAccountNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(paymentConfig.manualBankAccountNumber!, 'account')}
                          className="px-2 py-0.5 bg-[var(--sf-primary-soft)] hover:bg-[var(--sf-primary-soft)] text-[var(--sf-primary)] rounded text-[10px] font-bold border border-[var(--sf-primary-border)] transition cursor-pointer"
                        >
                          {copiedField === 'account' ? 'Tersalin!' : 'Salin'}
                        </button>
                      </div>
                    </div>
                  )}
                  {paymentConfig.manualBankAccountHolder && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[var(--sf-muted)] font-medium">Atas Nama:</span>
                      <span className="font-bold text-[var(--sf-text)]">{paymentConfig.manualBankAccountHolder}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xs pt-2 border-t border-[var(--sf-border)]">
                    <span className="text-[var(--sf-muted)] font-medium">Total Nominal Transfer:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[var(--sf-primary)] text-base">
                        Rp {total.toLocaleString('id-ID')}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyText(String(total), 'amount')}
                        className="px-2 py-0.5 bg-[var(--sf-primary-soft)] hover:bg-[var(--sf-primary-soft)] text-[var(--sf-primary)] rounded text-[10px] font-bold border border-[var(--sf-primary-border)] transition cursor-pointer"
                      >
                        {copiedField === 'amount' ? 'Tersalin!' : 'Salin'}
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-[var(--sf-primary-strong)] leading-relaxed">
                  {resolveManualInstructions(paymentConfig.manualInstructions)}
                </p>
              </div>
            )}

            {/* General Manifest Details */}
            <div className="p-5 bg-[var(--sf-subtle)] rounded-[var(--sf-radius)] text-left text-xs text-[var(--sf-text-soft)] space-y-2.5 border border-[var(--sf-border)]">
              <div className="flex justify-between items-center pb-2 border-b border-[var(--sf-border)]">
                <span className="font-semibold text-[var(--sf-text-soft)]">Status Transaksi:</span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                  isCodOrder
                    ? 'bg-amber-100 text-amber-800'
                    : isManualTransfer
                    ? 'bg-[var(--sf-primary-soft)] text-[var(--sf-primary-strong)]'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {isCodOrder
                    ? 'Menunggu Pengantaran (COD)'
                    : isManualTransfer
                    ? createdOrder?.paymentConfirmedAt
                      ? 'Menunggu Pengecekan Penjual'
                      : 'Menunggu Pembayaran'
                    : 'Terkonfirmasi Otomatis'}
                </span>
              </div>
              <p><span className="text-[var(--sf-muted)]">Metode Pembayaran:</span> <span className="font-semibold text-[var(--sf-text)]">{selectedPaymentName}</span></p>
              <p><span className="text-[var(--sf-muted)]">Penerima:</span> <span className="font-semibold text-[var(--sf-text)]">{customerName} ({customerPhone})</span></p>
              <p><span className="text-[var(--sf-muted)]">Alamat Pengiriman:</span> <span className="font-semibold text-[var(--sf-text)]">{createdOrder?.customerAddress || detailedAddress}</span></p>
              <p><span className="text-[var(--sf-muted)]">Kurir:</span> <span className="font-semibold text-[var(--sf-text)]">{courierInfo} • Rp {shippingFee.toLocaleString('id-ID')}</span></p>
              <div className="pt-2.5 border-t border-[var(--sf-border)] flex justify-between items-center text-sm font-extrabold text-[var(--sf-text)]">
                <span>Total Tagihan</span>
                <span className="text-[var(--sf-primary)] text-base">Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              {isManualTransfer ? (
                createdOrder?.paymentConfirmedAt ? (
                  <div className="w-full p-4 rounded-[var(--sf-radius)] bg-emerald-50 border border-emerald-200 text-left flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-emerald-900">Konfirmasi pembayaran terkirim</p>
                      <p className="text-xs text-emerald-800 leading-relaxed">
                        Penjual akan memeriksa pembayaran Anda. Pesanan diproses setelah pembayaran dinyatakan lunas.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleConfirmPayment}
                      disabled={isConfirmingPayment}
                      className="w-full py-3.5 px-4 bg-[var(--sf-primary)] hover:bg-[var(--sf-primary)] text-white font-bold rounded-[var(--sf-radius)] flex items-center justify-center gap-2 transition cursor-pointer shadow-md text-sm disabled:opacity-70 disabled:cursor-wait"
                    >
                      {isConfirmingPayment ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ShieldCheck className="w-4 h-4" />
                      )}
                      <span>{isConfirmingPayment ? 'Mengirim Konfirmasi...' : 'Saya Sudah Bayar'}</span>
                    </button>
                    <p className="text-[11px] text-[var(--sf-muted)]">
                      Klik setelah Anda menyelesaikan transfer atau scan QRIS sebesar Rp {total.toLocaleString('id-ID')}.
                    </p>
                    {paymentConfirmError && (
                      <p className="text-xs font-semibold text-red-600">{paymentConfirmError}</p>
                    )}
                  </>
                )
              ) : null}

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => (onNavigate ? onNavigate('orders') : null)}
                  className="w-full sm:w-1/2 py-3 px-4 bg-[var(--sf-primary)] hover:bg-[var(--sf-primary)] text-white font-bold rounded-[var(--sf-radius)] flex items-center justify-center gap-2 transition cursor-pointer shadow-xs text-xs"
                >
                  <Package className="w-4 h-4" />
                  <span>Lihat Riwayat Pesanan</span>
                </button>

                <button
                  onClick={() => (onNavigate ? onNavigate('homepage') : null)}
                  className="w-full sm:w-1/2 py-3 px-4 bg-[var(--sf-subtle)] hover:brightness-95 text-[var(--sf-text)] font-bold rounded-[var(--sf-radius)] transition cursor-pointer text-xs"
                >
                  Kembali Belanja
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Toko publik dengan keranjang kosong.
    if (sampleItems.length === 0) {
      return (
        <div className="pt-24 pb-24 min-h-[60vh] flex items-center justify-center px-6 text-center font-sans">
          <div className="max-w-sm space-y-3">
            <h1 className="text-xl font-semibold text-[var(--sf-text)]">Keranjang belanja kosong</h1>
            <p className="text-sm text-[var(--sf-muted)]">Tambahkan produk ke keranjang terlebih dahulu sebelum checkout.</p>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('katalog')}
              className="px-5 py-2.5 rounded-[var(--sf-radius)] bg-[var(--sf-primary)] text-white text-xs font-semibold hover:bg-[var(--sf-primary)] transition cursor-pointer"
            >
              Lihat Katalog
            </button>
          </div>
        </div>
      );
    }

    // 2. MAIN REDESIGNED BALANCED CHECKOUT FLOW
    return (
      <div className="pt-20 pb-28 bg-[var(--sf-subtle)] text-[var(--sf-text)] min-h-screen font-sans antialiased">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar Navigation */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => (onNavigate ? onNavigate('homepage') : null)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--sf-muted)] hover:text-[var(--sf-primary)] transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Katalog Belanja</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left Column: Checkout Details Form (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Card 1: Data Kontak Penerima */}
              <div className="bg-[var(--sf-card)] p-5 sm:p-6 rounded-[var(--sf-radius)] border border-[var(--sf-border)] shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--sf-border)]">
                  <div className="w-6 h-6 rounded-full bg-[var(--sf-primary)] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[var(--sf-text)]">Informasi Kontak Penerima</h2>
                    <p className="text-[11px] text-[var(--sf-muted)]">Data penerima paket pesanan dan konfirmasi pembayaran</p>
                  </div>
                </div>

                <div className={`grid ${formGridColsClass} gap-3.5`}>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--sf-text-soft)] mb-1.5">Nama Lengkap *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nama lengkap penerima"
                      className="w-full px-3.5 py-2.5 rounded-[var(--sf-radius)] border border-[var(--sf-border)] text-xs font-medium text-[var(--sf-text)] placeholder:text-[var(--sf-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--sf-primary)] focus:border-transparent transition bg-[var(--sf-card)] shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--sf-text-soft)] mb-1.5">Nomor WhatsApp *</label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      pattern="[0-9]{9,15}"
                      maxLength={15}
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="08xxxxxxxxxx"
                      className="w-full px-3.5 py-2.5 rounded-[var(--sf-radius)] border border-[var(--sf-border)] text-xs font-medium text-[var(--sf-text)] placeholder:text-[var(--sf-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--sf-primary)] focus:border-transparent transition bg-[var(--sf-card)] shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--sf-text-soft)] mb-1.5">
                    Alamat Email <span className="text-[var(--sf-muted)] font-normal">(Untuk invoice &amp; tanda terima pesanan)</span>
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-3.5 py-2.5 rounded-[var(--sf-radius)] border border-[var(--sf-border)] text-xs font-medium text-[var(--sf-text)] placeholder:text-[var(--sf-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--sf-primary)] focus:border-transparent transition bg-[var(--sf-card)] shadow-2xs"
                  />
                </div>
              </div>

              {/* Card 2: Hierarchical Address Selection */}
              <div className="bg-[var(--sf-card)] p-5 sm:p-6 rounded-[var(--sf-radius)] border border-[var(--sf-border)] shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--sf-border)]">
                  <div className="w-6 h-6 rounded-full bg-[var(--sf-primary)] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[var(--sf-text)]">Alamat Pengiriman Bertingkat</h2>
                    <p className="text-[11px] text-[var(--sf-muted)]">Provinsi → Kota/Kabupaten → Kecamatan → Kelurahan/Desa → Kode Pos</p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  {/* Level 1 & 2: Provinsi & Kota/Kabupaten */}
                  <div className={`grid ${formGridColsClass} gap-3.5`}>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--sf-text-soft)] mb-1.5 flex items-center justify-between">
                        <span>1. Provinsi *</span>
                        {isLoadingProvinces && <Loader2 className="w-3 h-3 animate-spin text-[var(--sf-primary)]" />}
                      </label>
                      <div className="relative">
                        <select
                          value={selectedProvinceId}
                          onChange={(e) => handleProvinceChange(e.target.value)}
                          className="w-full appearance-none px-3.5 py-2.5 rounded-[var(--sf-radius)] border border-[var(--sf-border)] text-xs font-medium text-[var(--sf-text)] bg-[var(--sf-card)] focus:outline-none focus:ring-2 focus:ring-[var(--sf-primary)] focus:border-transparent transition cursor-pointer pr-9 shadow-2xs"
                        >
                          <option value="">-- Pilih Provinsi --</option>
                          {provinces.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-[var(--sf-muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--sf-text-soft)] mb-1.5 flex items-center justify-between">
                        <span>2. Kota / Kabupaten *</span>
                        {isLoadingRegencies && <Loader2 className="w-3 h-3 animate-spin text-[var(--sf-primary)]" />}
                      </label>
                      <div className="relative">
                        <select
                          disabled={!selectedProvinceId || isLoadingRegencies}
                          value={selectedRegencyId}
                          onChange={(e) => handleRegencyChange(e.target.value)}
                          className={`w-full appearance-none px-3.5 py-2.5 rounded-[var(--sf-radius)] border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--sf-primary)] focus:border-transparent transition pr-9 shadow-2xs ${
                            !selectedProvinceId
                              ? 'bg-[var(--sf-subtle)] border-[var(--sf-border)] text-[var(--sf-muted)] cursor-not-allowed'
                              : 'bg-[var(--sf-card)] border-[var(--sf-border)] text-[var(--sf-text)] cursor-pointer'
                          }`}
                        >
                          <option value="">
                            {isLoadingRegencies
                              ? 'Memuat Kota / Kabupaten...'
                              : !selectedProvinceId
                              ? '-- Pilih Provinsi Terlebih Dahulu --'
                              : '-- Pilih Kota / Kabupaten --'}
                          </option>
                          {regencies.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-[var(--sf-muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Level 3 & 4: Kecamatan & Kelurahan/Desa */}
                  <div className={`grid ${formGridColsClass} gap-3.5`}>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--sf-text-soft)] mb-1.5 flex items-center justify-between">
                        <span>3. Kecamatan *</span>
                        {isLoadingDistricts && <Loader2 className="w-3 h-3 animate-spin text-[var(--sf-primary)]" />}
                      </label>
                      <div className="relative">
                        <select
                          disabled={!selectedRegencyId || isLoadingDistricts}
                          value={selectedDistrictId}
                          onChange={(e) => handleDistrictChange(e.target.value)}
                          className={`w-full appearance-none px-3.5 py-2.5 rounded-[var(--sf-radius)] border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--sf-primary)] focus:border-transparent transition pr-9 shadow-2xs ${
                            !selectedRegencyId
                              ? 'bg-[var(--sf-subtle)] border-[var(--sf-border)] text-[var(--sf-muted)] cursor-not-allowed'
                              : 'bg-[var(--sf-card)] border-[var(--sf-border)] text-[var(--sf-text)] cursor-pointer'
                          }`}
                        >
                          <option value="">
                            {isLoadingDistricts
                              ? 'Memuat Kecamatan...'
                              : !selectedRegencyId
                              ? '-- Pilih Kota Terlebih Dahulu --'
                              : '-- Pilih Kecamatan --'}
                          </option>
                          {districts.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-[var(--sf-muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--sf-text-soft)] mb-1.5 flex items-center justify-between">
                        <span>4. Kelurahan / Desa *</span>
                        {isLoadingVillages && <Loader2 className="w-3 h-3 animate-spin text-[var(--sf-primary)]" />}
                      </label>
                      <div className="relative">
                        <select
                          disabled={!selectedDistrictId || isLoadingVillages}
                          value={selectedVillageId}
                          onChange={(e) => handleVillageChange(e.target.value)}
                          className={`w-full appearance-none px-3.5 py-2.5 rounded-[var(--sf-radius)] border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--sf-primary)] focus:border-transparent transition pr-9 shadow-2xs ${
                            !selectedDistrictId
                              ? 'bg-[var(--sf-subtle)] border-[var(--sf-border)] text-[var(--sf-muted)] cursor-not-allowed'
                              : 'bg-[var(--sf-card)] border-[var(--sf-border)] text-[var(--sf-text)] cursor-pointer'
                          }`}
                        >
                          <option value="">
                            {isLoadingVillages
                              ? 'Memuat Kelurahan...'
                              : !selectedDistrictId
                              ? '-- Pilih Kecamatan Terlebih Dahulu --'
                              : '-- Pilih Kelurahan / Desa --'}
                          </option>
                          {villages.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-[var(--sf-muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Level 5: Kode Pos (Dropdown selection, NOT free-text input) */}
                  <div>
                    <label className="block text-xs font-semibold text-[var(--sf-text-soft)] mb-1.5 flex items-center justify-between">
                      <span>5. Kode Pos * (Pilihan Wilayah Valid)</span>
                      {isLoadingPostalCodes && <Loader2 className="w-3 h-3 animate-spin text-[var(--sf-primary)]" />}
                    </label>
                    <div className="relative">
                      <select
                        disabled={!selectedVillageId || isLoadingPostalCodes}
                        value={selectedPostalCode}
                        onChange={(e) => handlePostalCodeChange(e.target.value)}
                        className={`w-full appearance-none px-3.5 py-2.5 rounded-[var(--sf-radius)] border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--sf-primary)] focus:border-transparent transition pr-9 shadow-2xs ${
                          !selectedVillageId
                            ? 'bg-[var(--sf-subtle)] border-[var(--sf-border)] text-[var(--sf-muted)] cursor-not-allowed'
                            : 'bg-[var(--sf-card)] border-[var(--sf-border)] text-[var(--sf-text)] cursor-pointer'
                        }`}
                      >
                        <option value="">
                          {isLoadingPostalCodes
                            ? 'Memuat daftar kode pos...'
                            : !selectedVillageId
                            ? '-- Pilih Kelurahan / Desa Terlebih Dahulu --'
                            : postalCodes.length === 0
                            ? '-- Kode Pos Tidak Ditemukan --'
                            : '-- Pilih Kode Pos Valid --'}
                        </option>
                        {postalCodes.map((item) => (
                          <option key={item.code} value={item.code}>
                            {item.code} {item.district ? `(${item.village}, Kec. ${item.district})` : `(${item.village})`}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[var(--sf-muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Detailed Address (Street name, building number, unit, floor) */}
                  <div className="pt-1">
                    <label className="block text-xs font-semibold text-[var(--sf-text-soft)] mb-1.5">
                      Alamat Lengkap &amp; Nomor Bangunan *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={detailedAddress}
                      onChange={(e) => setDetailedAddress(e.target.value)}
                      placeholder="Nama jalan, nomor rumah/gedung, RT/RW, lantai, unit, atau detail spesifik lainnya"
                      className="w-full px-3.5 py-2.5 rounded-[var(--sf-radius)] border border-[var(--sf-border)] text-xs font-medium text-[var(--sf-text)] placeholder:text-[var(--sf-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--sf-primary)] focus:border-transparent transition resize-none bg-[var(--sf-card)] shadow-2xs"
                    />
                  </div>

                  {/* Address Notes (Patokan / Catatan Pengiriman) */}
                  <div>
                    <label className="block text-xs font-semibold text-[var(--sf-text-soft)] mb-1.5">
                      Catatan Alamat / Patokan <span className="text-[var(--sf-muted)] font-normal">(Opsional)</span>
                    </label>
                    <input
                      type="text"
                      value={addressNotes}
                      onChange={(e) => setAddressNotes(e.target.value)}
                      placeholder="Contoh: Rumah cat putih pagar hitam depan musholla, titip di pos sekuriti"
                      className="w-full px-3.5 py-2.5 rounded-[var(--sf-radius)] border border-[var(--sf-border)] text-xs font-medium text-[var(--sf-text)] placeholder:text-[var(--sf-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--sf-primary)] focus:border-transparent transition bg-[var(--sf-card)] shadow-2xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Unified Card (lg:col-span-5) */}
            {/* Hierarchy: Shipping/Courier -> Payment Method -> Order Manifest -> Order Total -> Checkout/Pay Button */}
            <div className="lg:col-span-5 sticky top-24 space-y-4">
              <div className="bg-[var(--sf-card)] p-5 sm:p-6 rounded-[var(--sf-radius)] border border-[var(--sf-border)] shadow-xs space-y-5">
                {/* 1. SHIPPING / COURIER SELECTION */}
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--sf-border)] mb-3.5">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[var(--sf-primary)]" />
                      <h3 className="text-sm font-bold text-[var(--sf-text)]">1. Pilihan Ekspedisi</h3>
                    </div>
                    {selectedRate && (
                      <span className="text-[11px] font-semibold text-[var(--sf-primary)] bg-[var(--sf-primary-soft)] px-2 py-0.5 rounded-full border border-[var(--sf-primary-border)]">
                        {selectedRate.courier_name}
                      </span>
                    )}
                  </div>

                  {!selectedPostalCode ? (
                    <div className="p-3.5 rounded-[var(--sf-radius)] bg-[var(--sf-subtle)] border border-dashed border-[var(--sf-border)] text-xs text-[var(--sf-muted)] flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-[var(--sf-muted)] shrink-0 mt-0.5" />
                      <span>Pilih wilayah pengiriman bertingkat dan kode pos di formulir sebelah kiri untuk melihat pilihan kurir dan tarif ongkir otomatis.</span>
                    </div>
                  ) : isLoadingRates ? (
                    <div className="p-4 rounded-[var(--sf-radius)] bg-[var(--sf-subtle)] border border-[var(--sf-border)] flex items-center justify-center gap-2.5 text-xs text-[var(--sf-text-soft)] font-medium">
                      <Loader2 className="w-4 h-4 animate-spin text-[var(--sf-primary)]" />
                      <span>Menghitung tarif ongkir resmi...</span>
                    </div>
                  ) : displayedRates.length === 0 ? (
                    <div className="p-3.5 rounded-[var(--sf-radius)] bg-amber-50 border border-amber-200/80 text-xs text-amber-800 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{ratesError || 'Tidak ada kurir yang tersedia untuk kode pos ini.'}</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div role="radiogroup" aria-label="Pilihan kurir" className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                        {displayedRates.map((rate) => {
                          const key = `${rate.courier_code}-${rate.courier_service_code}`;
                          const isSelected =
                            !!selectedRate &&
                            selectedRate.courier_code === rate.courier_code &&
                            selectedRate.courier_service_code === rate.courier_service_code;
                          return (
                            <button
                              key={key}
                              type="button"
                              role="radio"
                              aria-checked={isSelected}
                              onClick={() => setSelectedRate(rate)}
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-[var(--sf-radius)] border text-left transition cursor-pointer ${
                                isSelected
                                  ? 'border-[var(--sf-primary)] bg-[var(--sf-primary-soft)] ring-1 ring-[var(--sf-primary)]'
                                  : 'border-[var(--sf-border)] bg-[var(--sf-card)] hover:border-[var(--sf-border)]'
                              }`}
                            >
                              <span
                                className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                                  isSelected ? 'border-[var(--sf-primary)]' : 'border-[var(--sf-border)]'
                                }`}
                              >
                                {isSelected && <span className="w-2 h-2 rounded-full bg-[var(--sf-primary)]" />}
                              </span>
                              <span className="flex-1 min-w-0">
                                <span className="block text-xs font-bold text-[var(--sf-text)] truncate">
                                  {rate.courier_name} · {rate.courier_service_name}
                                </span>
                                <span className="block text-[11px] text-[var(--sf-muted)] mt-0.5">Estimasi tiba {rate.etd}</span>
                              </span>
                              <span className="text-xs font-bold text-[var(--sf-text)] whitespace-nowrap">
                                Rp {rate.price.toLocaleString('id-ID')}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[11px] text-[var(--sf-muted)] leading-relaxed">
                        Ongkir dihitung otomatis dari kode pos toko ke kode pos tujuan dan berat total paket ({(totalWeightGrams / 1000).toLocaleString('id-ID')} kg).
                      </p>
                    </div>
                  )}
                </div>

                {/* 2. PAYMENT METHOD SELECTION */}
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--sf-border)] mb-3.5">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      <h3 className="text-sm font-bold text-[var(--sf-text)]">2. Metode Pembayaran</h3>
                    </div>
                    <span className="text-[10px] font-bold text-[var(--sf-primary)] bg-[var(--sf-primary-soft)] px-2 py-0.5 rounded-full border border-[var(--sf-primary-border)] uppercase tracking-wider">
                      {paymentOptions.find((p) => p.id === selectedPaymentId)?.badge || 'Pilihan Toko'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <select
                        value={selectedPaymentId}
                        onChange={(e) => setSelectedPaymentId(e.target.value)}
                        className="w-full appearance-none px-3.5 py-2.5 rounded-[var(--sf-radius)] border border-[var(--sf-border)] text-xs font-semibold text-[var(--sf-text)] bg-[var(--sf-card)] focus:outline-none focus:ring-2 focus:ring-[var(--sf-primary)] focus:border-transparent transition cursor-pointer pr-9 shadow-2xs"
                      >
                        {paymentOptions.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-[var(--sf-muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <div className="p-2.5 bg-[var(--sf-subtle)] rounded-[var(--sf-radius)] border border-[var(--sf-border)] text-[11px] text-[var(--sf-text-soft)] flex items-start gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">
                        {paymentOptions.find((p) => p.id === selectedPaymentId)?.description ||
                          'Pembayaran resmi terhubung langsung ke gerbang Duitku dengan verifikasi instan.'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. ORDER ITEMS MANIFEST */}
                <div>
                  <div className="flex items-center justify-between pb-2.5 border-b border-[var(--sf-border)] mb-3">
                    <h4 className="text-xs font-bold text-[var(--sf-text-soft)] uppercase tracking-wider">Daftar Produk ({sampleItems.length})</h4>
                  </div>
                  <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
                    {sampleItems.map((p) => (
                      <div key={p.id} className="flex gap-2.5 items-center">
                        <img
                          src={p.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop'}
                          alt={p.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop';
                          }}
                          className="w-11 h-11 object-cover rounded-[var(--sf-radius)] border border-[var(--sf-border)] bg-[var(--sf-subtle)] shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs text-[var(--sf-text)] truncate">{p.name}</p>
                          <p className="text-[11px] text-[var(--sf-muted)]">Qty: {p.quantity || 1}</p>
                        </div>
                        <p className="font-bold text-xs text-[var(--sf-text)] shrink-0">
                          Rp {(p.price * (p.quantity || 1)).toLocaleString('id-ID')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. ORDER TOTAL BREAKDOWN */}
                <div className="pt-3 border-t border-[var(--sf-border)] space-y-2 text-xs text-[var(--sf-text-soft)]">
                  <div className="flex justify-between">
                    <span>Subtotal Produk</span>
                    <span className="font-semibold text-[var(--sf-text)]">Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Biaya Pengiriman</span>
                    <span className="font-semibold text-[var(--sf-text)]">
                      {shippingFee > 0 ? `Rp ${shippingFee.toLocaleString('id-ID')}` : selectedRate ? 'Gratis' : 'Menunggu alamat'}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline font-extrabold text-[var(--sf-text)] text-base pt-2.5 border-t border-[var(--sf-border)]">
                    <span>Total Tagihan</span>
                    <span className="text-[var(--sf-primary)] text-lg">Rp {total.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* 5. CHECKOUT / PAY BUTTON */}
                <div className="pt-2 space-y-2.5">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleProcessCheckout}
                    className="w-full py-3.5 px-4 bg-[var(--sf-primary)] hover:bg-[var(--sf-primary)] active:scale-[0.99] text-white rounded-[var(--sf-radius)] font-bold text-sm transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Memproses Pesanan...</span>
                      </>
                    ) : selectedPaymentId === 'cod' ? (
                      <>
                        <Banknote className="w-4 h-4" />
                        <span>Pesan Sekarang (Bayar COD) • Rp {total.toLocaleString('id-ID')}</span>
                      </>
                    ) : selectedPaymentId === 'manual_transfer' ? (
                      <>
                        <QrCode className="w-4 h-4" />
                        <span>Lanjut Pembayaran Transfer • Rp {total.toLocaleString('id-ID')}</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Bayar Sekarang (Otomatis) • Rp {total.toLocaleString('id-ID')}</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--sf-muted)] font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {selectedPaymentId === 'cod'
                        ? 'Transaksi Aman Bayar di Tempat (COD)'
                        : selectedPaymentId === 'manual_transfer'
                        ? 'Transfer Langsung ke Rekening Resmi Toko'
                        : 'Gerbang Pembayaran Otomatis Resmi & Terenkripsi'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[var(--sf-page)] text-[var(--sf-text)]">
      {CustomNavbar ? <CustomNavbar /> : headerSection && (
        <HeaderSection settings={headerSection.settings} themeSettings={settings} themeId={activeThemeId} />
      )}

      <div className="flex-1">{renderContent()}</div>

      {CustomFooter ? <CustomFooter /> : footerSection && (
        <FooterSection settings={footerSection.settings} themeSettings={settings} themeId={activeThemeId} />
      )}
    </div>
  );
};
