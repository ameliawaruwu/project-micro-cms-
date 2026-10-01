import React, { useState, useEffect, useMemo } from 'react';
import { ThemeSchema } from '../schema';
import { Product, OrderItem, Order, BiteshipRateOption } from '../../types';
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
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { cartService } from '../../services/cartService';
import { duitkuService } from '../../services/duitkuService';
import { storeService } from '../../services/storeService';
import { shippingService, INDONESIAN_CITIES } from '../../services/shippingService';
import { integrationService } from '../../services/integrationService';
import {
  paymentChannelService,
  PaymentChannel,
  getLocalizedChannelDescription,
  getLocalizedChannelName,
} from '../../services/paymentChannelService';
import { wilayahService, WilayahItem, PostalCodeItem } from '../../services/wilayahService';
import { useLanguage } from '../../contexts/LanguageContext';

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
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  themeData,
  themeId: propThemeId,
  store,
  products = [],
  onNavigate,
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const activeThemeId = propThemeId || themeData?.themeId || store?.layoutSettings?.activeThemeId || 'minimalist';
  const settings = themeData?.settings || {
    backgroundColor: '#FFFFFF',
    textColor: '#1A1A1A',
    primaryColor: '#1A1A1A',
    fontFamily: 'sans-serif',
  };

  // 1. Customer contact state - Starts empty so buyer fills in their own details
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

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
  const [detailedAddress, setDetailedAddress] = useState('');
  const [addressNotes, setAddressNotes] = useState('');

  // 3. Couriers & Rates state
  const [availableRates, setAvailableRates] = useState<BiteshipRateOption[]>([]);
  const [selectedRate, setSelectedRate] = useState<BiteshipRateOption | null>(null);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [ratesError, setRatesError] = useState('');

  // 4. Merchant Active Integrations & Channels state
  const [activeCouriers, setActiveCouriers] = useState<string[]>([]);
  const [activePaymentChannels, setActivePaymentChannels] = useState<PaymentChannel[]>([]);

  // 5. Payment state
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>('qris');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Cart / sample items
  const cartItemsFromStorage = store?.slug ? cartService.getCart(store.slug) : [];
  const sampleItems = cartItemsFromStorage.length > 0
    ? cartItemsFromStorage.map((ci) => ({
        id: ci.product.id,
        name: ci.product.name,
        price: ci.product.price,
        quantity: ci.quantity,
        imageUrl: ci.product.imageUrl,
        weightGrams: ci.product.weightGrams || 350,
      }))
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

  // Active payment options
  const paymentOptions = useMemo(() => {
    const options: { id: string; name: string; description: string; badge?: string }[] = [];

    const channelsToRender =
      activePaymentChannels.filter((c) => c.isEnabled).length > 0
        ? activePaymentChannels.filter((c) => c.isEnabled)
        : [
            { id: 'qris', name: 'QRIS & E-Wallet (Scan Otomatis GoPay, OVO, DANA, ShopeePay)', category: 'ewallet_qris', isEnabled: true, description: 'Bayar instan via scan kode QRIS dari aplikasi m-Banking atau E-Wallet mana pun.' },
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
          name: isEn ? 'QRIS & E-Wallet (Instant Scan GoPay, OVO, DANA, ShopeePay)' : 'QRIS & E-Wallet (Scan Otomatis GoPay, OVO, DANA, ShopeePay)',
          description: localizedDesc || (isEn ? 'Instant scan via QRIS code from any mobile banking or e-wallet.' : 'Bayar instan via scan kode QRIS dari aplikasi m-Banking atau E-Wallet mana pun.'),
          badge: isEn ? 'Instant' : 'Instan',
        });
      } else if (channel.id === 'gopay') {
        options.push({ id: 'gopay', name: localizedName, description: localizedDesc, badge: 'E-Wallet' });
      } else if (channel.id === 'shopeepay') {
        options.push({ id: 'shopeepay', name: localizedName, description: localizedDesc, badge: 'E-Wallet' });
      } else if (channel.category === 'virtual_account' || channel.id.includes('va')) {
        options.push({
          id: channel.id,
          name: localizedName,
          description: localizedDesc || (isEn ? 'Automatic transfer with instant 24/7 verification.' : 'Transfer otomatis dengan verifikasi instan 24 jam tanpa perlu upload bukti transfer.'),
          badge: 'Otomatis 24 Jam',
        });
      } else if (channel.id === 'credit_card') {
        options.push({
          id: 'credit_card',
          name: isEn ? 'Credit / Debit Card Online (Visa, Mastercard, JCB)' : 'Kartu Kredit / Debit Online (Visa, Mastercard, JCB)',
          description: localizedDesc || 'Pembayaran online terenkripsi dengan proteksi 3D Secure OTP.',
          badge: '3D Secure',
        });
      } else {
        options.push({
          id: channel.id,
          name: localizedName,
          description: localizedDesc || 'Pembayaran resmi melalui gerbang Duitku.',
        });
      }
    });

    return options;
  }, [activePaymentChannels, language, isEn]);

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

  const finalizeOrder = async (isPaid: boolean, methodDesc: string) => {
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

    const newOrder = await orderService.createOrder({
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
      paymentStatus: isPaid ? 'Sudah Dibayar' : 'Belum Dibayar',
      courier: (selectedRate?.courier_code?.toUpperCase() || 'KURIR') as any,
      courierCode: selectedRate?.courier_code || 'kurir',
      courierService: selectedRate ? `${selectedRate.courier_service_name} • ${selectedRate.etd}` : 'Reguler',
      shippingStatus: 'Baru',
      notes: `Alamat: ${formattedFullAddress}. Kurir: ${courierDisplayName}. Ongkir: Rp ${shippingFee.toLocaleString('id-ID')}`,
    });

    if (isPaid && store?.id) {
      const currentBalance = store.balance || 0;
      await storeService.updateStore(store.id, { balance: currentBalance + total });
    }

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

    setIsSubmitting(true);
    try {
      const orderId = `INV-${Date.now()}`;
      const duitkuMethod = mapPaymentIdToDuitkuMethod(selectedPaymentId);
      const selectedOption = paymentOptions.find((p) => p.id === selectedPaymentId);
      const methodLabel = selectedOption?.name || 'Duitku Payment';

      await duitkuService.payWithDuitku(
        {
          orderId,
          grossAmount: total,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim() || 'customer@example.com',
          customerPhone: customerPhone.trim(),
          paymentMethod: duitkuMethod,
          productDetails: `Pesanan ${orderId} - ${store?.name || 'Store'}`,
          items: [
            ...sampleItems.map((s) => ({
              id: s.id,
              name: s.name,
              price: s.price,
              quantity: s.quantity || 1,
            })),
            {
              id: 'shipping-charge',
              name: `Ongkir (${selectedRate?.courier_name || 'Pengiriman'})`,
              price: shippingFee,
              quantity: 1,
            },
          ],
        },
        {
          onSuccess: async (result) => {
            await finalizeOrder(true, `Duitku (${methodLabel})`);
            setIsSubmitting(false);
          },
          onPending: async (result) => {
            await finalizeOrder(false, `Duitku Pending (${methodLabel})`);
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
      const orderNum = createdOrder?.orderNumber || '#ORD-88231';
      const courierInfo = selectedRate
        ? `${selectedRate.courier_name} (${selectedRate.courier_service_name})`
        : 'Pengiriman Standar';
      const selectedPaymentName =
        paymentOptions.find((p) => p.id === selectedPaymentId)?.name || 'Duitku Payment';

      return (
        <div className="py-16 sm:py-24 px-4 sm:px-6 max-w-2xl mx-auto text-center font-sans">
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-gray-200/90 shadow-xl space-y-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Pesanan Berhasil Diproses!</h1>
              <p className="text-sm font-medium text-gray-500">
                Nomor Pesanan: <span className="font-bold font-mono text-gray-900">{orderNum}</span>
              </p>
            </div>

            <div className="p-5 bg-gray-50/90 rounded-2xl text-left text-xs text-gray-700 space-y-2.5 border border-gray-200/70">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="font-semibold text-gray-600">Status Transaksi:</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                  Terkonfirmasi Duitku
                </span>
              </div>
              <p><span className="text-gray-500">Metode Pembayaran:</span> <span className="font-semibold text-gray-900">{selectedPaymentName}</span></p>
              <p><span className="text-gray-500">Penerima:</span> <span className="font-semibold text-gray-900">{customerName} ({customerPhone})</span></p>
              <p><span className="text-gray-500">Alamat Pengiriman:</span> <span className="font-semibold text-gray-900">{createdOrder?.customerAddress || detailedAddress}</span></p>
              <p><span className="text-gray-500">Kurir:</span> <span className="font-semibold text-gray-900">{courierInfo} • Rp {shippingFee.toLocaleString('id-ID')}</span></p>
              <div className="pt-2.5 border-t border-gray-200 flex justify-between items-center text-sm font-extrabold text-gray-900">
                <span>Total Tagihan</span>
                <span className="text-blue-600 text-base">Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={() => (onNavigate ? onNavigate('orders') : null)}
                className="w-full sm:w-1/2 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-sm text-sm"
              >
                <Package className="w-4 h-4" />
                <span>Lihat Status Pesanan</span>
              </button>

              <button
                onClick={() => (onNavigate ? onNavigate('homepage') : null)}
                className="w-full sm:w-1/2 py-3.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition cursor-pointer text-sm"
              >
                Kembali ke Toko
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 2. MAIN REDESIGNED BALANCED CHECKOUT FLOW
    return (
      <div className="pt-20 pb-28 bg-[#F8FAFC] text-[#1E293B] min-h-screen font-sans antialiased">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar Navigation */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => (onNavigate ? onNavigate('homepage') : null)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-blue-600 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Katalog Belanja</span>
            </button>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Duitku Payment Gateway • 256-Bit SSL</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left Column: Checkout Details Form (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Card 1: Data Kontak Penerima */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/90 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Informasi Kontak Penerima</h2>
                    <p className="text-[11px] text-gray-500">Data penerima paket pesanan dan konfirmasi pembayaran</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nama Lengkap *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nama lengkap penerima"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition bg-white shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nomor WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition bg-white shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Alamat Email <span className="text-gray-400 font-normal">(Untuk invoice &amp; tanda terima pesanan)</span>
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition bg-white shadow-2xs"
                  />
                </div>
              </div>

              {/* Card 2: Hierarchical Address Selection */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/90 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Alamat Pengiriman Bertingkat</h2>
                    <p className="text-[11px] text-gray-500">Provinsi → Kota/Kabupaten → Kecamatan → Kelurahan/Desa → Kode Pos</p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  {/* Level 1 & 2: Provinsi & Kota/Kabupaten */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                        <span>1. Provinsi *</span>
                        {isLoadingProvinces && <Loader2 className="w-3 h-3 animate-spin text-blue-600" />}
                      </label>
                      <div className="relative">
                        <select
                          value={selectedProvinceId}
                          onChange={(e) => handleProvinceChange(e.target.value)}
                          className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition cursor-pointer pr-9 shadow-2xs"
                        >
                          <option value="">-- Pilih Provinsi --</option>
                          {provinces.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                        <span>2. Kota / Kabupaten *</span>
                        {isLoadingRegencies && <Loader2 className="w-3 h-3 animate-spin text-blue-600" />}
                      </label>
                      <div className="relative">
                        <select
                          disabled={!selectedProvinceId || isLoadingRegencies}
                          value={selectedRegencyId}
                          onChange={(e) => handleRegencyChange(e.target.value)}
                          className={`w-full appearance-none px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition pr-9 shadow-2xs ${
                            !selectedProvinceId
                              ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-white border-gray-200 text-gray-900 cursor-pointer'
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
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Level 3 & 4: Kecamatan & Kelurahan/Desa */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                        <span>3. Kecamatan *</span>
                        {isLoadingDistricts && <Loader2 className="w-3 h-3 animate-spin text-blue-600" />}
                      </label>
                      <div className="relative">
                        <select
                          disabled={!selectedRegencyId || isLoadingDistricts}
                          value={selectedDistrictId}
                          onChange={(e) => handleDistrictChange(e.target.value)}
                          className={`w-full appearance-none px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition pr-9 shadow-2xs ${
                            !selectedRegencyId
                              ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-white border-gray-200 text-gray-900 cursor-pointer'
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
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                        <span>4. Kelurahan / Desa *</span>
                        {isLoadingVillages && <Loader2 className="w-3 h-3 animate-spin text-blue-600" />}
                      </label>
                      <div className="relative">
                        <select
                          disabled={!selectedDistrictId || isLoadingVillages}
                          value={selectedVillageId}
                          onChange={(e) => handleVillageChange(e.target.value)}
                          className={`w-full appearance-none px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition pr-9 shadow-2xs ${
                            !selectedDistrictId
                              ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-white border-gray-200 text-gray-900 cursor-pointer'
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
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Level 5: Kode Pos (Dropdown selection, NOT free-text input) */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                      <span>5. Kode Pos * (Pilihan Wilayah Valid)</span>
                      {isLoadingPostalCodes && <Loader2 className="w-3 h-3 animate-spin text-blue-600" />}
                    </label>
                    <div className="relative">
                      <select
                        disabled={!selectedVillageId || isLoadingPostalCodes}
                        value={selectedPostalCode}
                        onChange={(e) => handlePostalCodeChange(e.target.value)}
                        className={`w-full appearance-none px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition pr-9 shadow-2xs ${
                          !selectedVillageId
                            ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-white border-gray-200 text-gray-900 cursor-pointer'
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
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Detailed Address (Street name, building number, unit, floor) */}
                  <div className="pt-1">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Alamat Lengkap &amp; Nomor Bangunan *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={detailedAddress}
                      onChange={(e) => setDetailedAddress(e.target.value)}
                      placeholder="Nama jalan, nomor rumah/gedung, RT/RW, lantai, unit, atau detail spesifik lainnya"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition resize-none bg-white shadow-2xs"
                    />
                  </div>

                  {/* Address Notes (Patokan / Catatan Pengiriman) */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Catatan Alamat / Patokan <span className="text-gray-400 font-normal">(Opsional)</span>
                    </label>
                    <input
                      type="text"
                      value={addressNotes}
                      onChange={(e) => setAddressNotes(e.target.value)}
                      placeholder="Contoh: Rumah cat putih pagar hitam depan musholla, titip di pos sekuriti"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition bg-white shadow-2xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Unified Card (lg:col-span-5) */}
            {/* Hierarchy: Shipping/Courier -> Payment Method -> Order Manifest -> Order Total -> Checkout/Pay Button */}
            <div className="lg:col-span-5 sticky top-24 space-y-4">
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/90 shadow-xs space-y-5">
                {/* 1. SHIPPING / COURIER SELECTION */}
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3.5">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-bold text-gray-900">1. Pilihan Ekspedisi</h3>
                    </div>
                    {selectedRate && (
                      <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">
                        {selectedRate.courier_name}
                      </span>
                    )}
                  </div>

                  {!selectedPostalCode ? (
                    <div className="p-3.5 rounded-xl bg-gray-50 border border-dashed border-gray-200 text-xs text-gray-500 flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      <span>Pilih wilayah pengiriman bertingkat dan kode pos di formulir sebelah kiri untuk melihat pilihan kurir dan tarif ongkir otomatis.</span>
                    </div>
                  ) : isLoadingRates ? (
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center gap-2.5 text-xs text-gray-600 font-medium">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span>Menghitung tarif ongkir resmi...</span>
                    </div>
                  ) : displayedRates.length === 0 ? (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-800 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{ratesError || 'Tidak ada kurir yang tersedia untuk kode pos ini.'}</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative">
                        <select
                          value={selectedRate ? `${selectedRate.courier_code}-${selectedRate.courier_service_code}` : ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const match = displayedRates.find((r) => `${r.courier_code}-${r.courier_service_code}` === val);
                            if (match) setSelectedRate(match);
                          }}
                          className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition cursor-pointer pr-9 shadow-2xs"
                        >
                          {displayedRates.map((rate) => (
                            <option
                              key={`${rate.courier_code}-${rate.courier_service_code}`}
                              value={`${rate.courier_code}-${rate.courier_service_code}`}
                            >
                              {rate.courier_name} - {rate.courier_service_name} ({rate.etd}) — Rp {rate.price.toLocaleString('id-ID')}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>

                      {selectedRate && (
                        <div className="flex items-center justify-between px-3 py-2 bg-blue-50/60 rounded-lg border border-blue-100 text-[11px] text-blue-900">
                          <span className="font-medium text-blue-700">Estimasi Tiba: {selectedRate.etd}</span>
                          <span className="font-bold text-blue-950">Ongkir: Rp {selectedRate.price.toLocaleString('id-ID')}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. PAYMENT METHOD SELECTION */}
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3.5">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      <h3 className="text-sm font-bold text-gray-900">2. Metode Pembayaran</h3>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 uppercase tracking-wider">
                      Duitku Resmi
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <select
                        value={selectedPaymentId}
                        onChange={(e) => setSelectedPaymentId(e.target.value)}
                        className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition cursor-pointer pr-9 shadow-2xs"
                      >
                        {paymentOptions.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-[11px] text-gray-600 flex items-start gap-2">
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
                  <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 mb-3">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Daftar Produk ({sampleItems.length})</h4>
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
                          className="w-11 h-11 object-cover rounded-lg border border-gray-100 bg-gray-50 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs text-gray-900 truncate">{p.name}</p>
                          <p className="text-[11px] text-gray-500">Qty: {p.quantity || 1}</p>
                        </div>
                        <p className="font-bold text-xs text-gray-900 shrink-0">
                          Rp {(p.price * (p.quantity || 1)).toLocaleString('id-ID')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. ORDER TOTAL BREAKDOWN */}
                <div className="pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal Produk</span>
                    <span className="font-semibold text-gray-900">Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Biaya Pengiriman</span>
                    <span className="font-semibold text-gray-900">
                      {shippingFee > 0 ? `Rp ${shippingFee.toLocaleString('id-ID')}` : selectedRate ? 'Gratis' : 'Menunggu alamat'}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline font-extrabold text-gray-900 text-base pt-2.5 border-t border-gray-100">
                    <span>Total Tagihan</span>
                    <span className="text-blue-700 text-lg">Rp {total.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* 5. CHECKOUT / PAY BUTTON */}
                <div className="pt-2 space-y-2.5">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleProcessCheckout}
                    className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white rounded-xl font-bold text-sm transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Menghubungkan ke Duitku...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Bayar Sekarang • Rp {total.toLocaleString('id-ID')}</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Gerbang Pembayaran Duitku Resmi &amp; Terenkripsi</span>
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
    <div className="flex flex-col w-full min-h-screen">
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
