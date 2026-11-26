import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Bot,
  User,
  Sparkles,
  RotateCcw,
  Package,
  ShoppingBag,
  Wallet,
  Share2,
  Settings,
  Layers,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  CheckCircle2,
  Store,
} from 'lucide-react';
import { MerchantTab, Store as StoreType } from '../../types';
import { WALLET_ENABLED } from '../../config/features';
import { useLanguage } from '../../contexts/LanguageContext';

export interface SupportChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeStore: StoreType;
  onNavigateTab?: (tab: MerchantTab) => void;
  onOpenAddProduct?: () => void;
  onOpenWithdraw?: () => void;
  onOpenShareStore?: () => void;
  onOpenStorefront?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  actionButton?: {
    label: string;
    actionType: 'addProduct' | 'orders' | 'products' | 'settings' | 'integrations' | 'withdraw' | 'share' | 'storefront';
  };
  quickSuggestions?: string[];
}

const getInitialQuickTopics = (isEn: boolean) => isEn ? [
  '📦 How do I add a new product?',
  '🚚 How do I process orders & tracking numbers?',
  ...(WALLET_ENABLED ? ['💰 How do I withdraw my sales balance?'] : []),
  '🔗 How do I share my store link with buyers?',
  '⚙️ How do I change store info & WhatsApp settings?',
  '💳 Which payment methods are supported?',
] : [
  '📦 Cara tambah produk baru?',
  '🚚 Bagaimana cara proses pesanan & resi?',
  ...(WALLET_ENABLED ? ['💰 Cara tarik saldo penjualan?'] : []),
  '🔗 Cara bagikan link toko ke pembeli?',
  '⚙️ Cara ubah info toko & WhatsApp?',
  '💳 Metode pembayaran apa saja yang didukung?',
];

export const SupportChatbotModal: React.FC<SupportChatbotModalProps> = ({
  isOpen,
  onClose,
  activeStore,
  onNavigateTab,
  onOpenAddProduct,
  onOpenWithdraw,
  onOpenShareStore,
  onOpenStorefront,
}) => {
  const { isEn } = useLanguage();
  const INITIAL_QUICK_TOPICS = getInitialQuickTopics(isEn);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString(isEn ? 'en-US' : 'id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  // Initialize welcome message when opened for the first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome-1',
        sender: 'bot',
        text: isEn
          ? `Hi ${activeStore.name ? activeStore.name : 'there'}! 👋\n\nI'm the **LapakQ Virtual Assistant**. I'm here to help you manage your online store, add products, process orders, and withdraw your balance.\n\nPick a quick help topic below or type your question directly.`
          : `Halo ${activeStore.name ? activeStore.name : 'Juragan'}! 👋\n\nSaya **Asisten Virtual LapakQ**. Saya siap membantu Anda mengelola toko online, menambah produk, memproses pesanan, hingga penarikan saldo.\n\nSilakan pilih topik bantuan cepat di bawah ini atau ketik pertanyaan Anda langsung.`,
        timestamp: getCurrentTime(),
        quickSuggestions: INITIAL_QUICK_TOPICS,
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, activeStore.name, messages.length]);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [isOpen]);

  const handleActionClick = (actionType: string) => {
    switch (actionType) {
      case 'addProduct':
        if (onOpenAddProduct) onOpenAddProduct();
        onClose();
        break;
      case 'orders':
        if (onNavigateTab) onNavigateTab('pesanan');
        onClose();
        break;
      case 'products':
        if (onNavigateTab) onNavigateTab('produk');
        onClose();
        break;
      case 'settings':
        if (onNavigateTab) onNavigateTab('pengaturan');
        onClose();
        break;
      case 'payments':
        if (onNavigateTab) onNavigateTab('pembayaran');
        onClose();
        break;
      case 'shipping':
        if (onNavigateTab) onNavigateTab('pengiriman');
        onClose();
        break;
      case 'integrations':
        if (onNavigateTab) onNavigateTab('pembayaran');
        onClose();
        break;
      case 'withdraw':
        if (onOpenWithdraw) onOpenWithdraw();
        onClose();
        break;
      case 'share':
        if (onOpenShareStore) onOpenShareStore();
        onClose();
        break;
      case 'storefront':
        if (onOpenStorefront) onOpenStorefront();
        onClose();
        break;
      default:
        break;
    }
  };

  const generateBotReply = (query: string): ChatMessage => {
    const q = query.toLowerCase().trim();
    const time = getCurrentTime();
    const id = `bot-${Date.now()}`;

    // 1. Tambah Produk
    if (q.includes('tambah produk') || q.includes('upload produk') || q.includes('buat produk') || q.includes('barang baru') || q.includes('jual barang') || q.includes('add a new product') || q.includes('add product') || q.includes('new product')) {
      return {
        id,
        sender: 'bot',
        text: isEn
          ? `To add a new product in LapakQ:\n\n1. Click the **+ Add Product** button below or on the home page.\n2. Enter the **Product Name**, **Price**, and **Stock**.\n3. Add a **Product Photo** (pick a sample photo or upload from your device).\n4. Set the **Product Weight (grams)** for automatic shipping cost calculation.\n5. Click **Save & Publish**. Your product is ready to buy right away!`
          : `Untuk menambah produk baru di LapakQ:\n\n1. Klik tombol **+ Tambah Produk** di bawah atau di halaman utama.\n2. Masukkan **Nama Produk**, **Harga**, dan **Stok**.\n3. Masukkan **Foto Produk** (bisa pilih foto contoh atau upload dari perangkat).\n4. Tentukan **Berat Produk (gram)** untuk kalkulasi ongkir otomatis.\n5. Klik **Simpan & Publikasikan**. Produk Anda langsung siap dibeli!`,
        timestamp: time,
        actionButton: {
          label: isEn ? '✨ Add Product Now' : '✨ Tambah Produk Sekarang',
          actionType: 'addProduct',
        },
        quickSuggestions: isEn ? [
          'How do I set variants or discounts?',
          'How do I delete or edit a product?',
          'View my product catalog',
        ] : [
          'Cara atur varian atau diskon?',
          'Bagaimana cara hapus atau edit produk?',
          'Lihat katalog produk saya',
        ],
      };
    }

    // 2. Edit / Hapus Produk
    if (q.includes('edit produk') || q.includes('hapus produk') || q.includes('ubah harga') || q.includes('katalog') || q.includes('edit a product') || q.includes('edit product') || q.includes('delete') || q.includes('change price') || q.includes('catalog')) {
      return {
        id,
        sender: 'bot',
        text: isEn
          ? `To edit prices, stock, or delete products:\n\n1. Open the **Products** menu in the sidebar.\n2. Click the product card you want to change.\n3. Update stock right away with the quick **+ / -** buttons, or click **Edit Product** to change the description & price.\n4. You can also set the product status to *Draft* when it is out of stock.`
          : `Untuk mengedit harga, stok, atau menghapus produk:\n\n1. Buka menu **Produk** di sidebar.\n2. Klik kartu produk yang ingin Anda ubah.\n3. Anda bisa langsung memperbarui stok dengan tombol cepat **+ / -** atau klik **Edit Produk** untuk mengubah deskripsi & harga.\n4. Anda juga bisa menonaktifkan status produk menjadi *Draft* jika stok sedang kosong.`,
        timestamp: time,
        actionButton: {
          label: isEn ? 'Open Products Menu' : 'Buka Menu Produk',
          actionType: 'products',
        },
        quickSuggestions: isEn ? [
          'How do I add a new product?',
          'How do I share my store on WhatsApp?',
        ] : [
          'Cara tambah produk baru?',
          'Cara bagikan katalog toko ke WhatsApp?',
        ],
      };
    }

    // 3. Pesanan & Resi
    if (q.includes('pesanan') || q.includes('resi') || q.includes('order') || q.includes('kirim') || q.includes('ekspedisi') || q.includes('ongkir') || q.includes('tracking')) {
      return {
        id,
        sender: 'bot',
        text: isEn
          ? `How to process incoming orders in LapakQ:\n\n1. Go to the **Orders** tab.\n2. Orders with the *Needs Processing* status mean the buyer has checked out.\n3. Click **Process Shipment** and enter the tracking number from your courier (JNE, J&T, SiCepat, GoSend, etc.).\n4. You can also print **Shipping Labels & Thermal Receipts** automatically.\n5. The status updates automatically and the buyer can track the package.`
          : `Alur memproses pesanan masuk di LapakQ:\n\n1. Masuk ke tab **Pesanan**.\n2. Pesanan berstatus *Perlu Diproses* menunjukkan pembeli sudah checkout.\n3. Klik **Proses Pengiriman**, masukkan nomor resi dari kurir pilihan (JNE, J&T, SiCepat, GoSend, dll).\n4. Anda juga dapat mencetak **Label Pengiriman & Struk Thermal** secara otomatis.\n5. Status akan otomatis diperbarui dan pembeli dapat melacak paketnya.`,
        timestamp: time,
        actionButton: {
          label: isEn ? 'View Orders' : 'Lihat Daftar Pesanan',
          actionType: 'orders',
        },
        quickSuggestions: isEn ? [
          'How do I print a shipping receipt?',
          'How does order payment work?',
        ] : [
          'Cara cetak struk pengiriman?',
          'Bagaimana sistem pembayaran pesanan?',
        ],
      };
    }

    // 4. Tarik Saldo / Penarikan Uang
    if (q.includes('tarik saldo') || q.includes('pencairan') || q.includes('rekening') || q.includes('dompet') || q.includes('uang') || q.includes('withdraw') || q.includes('balance') || q.includes('bank account')) {
      if (!WALLET_ENABLED) {
        return {
          id,
          sender: 'bot',
          text: isEn
            ? 'The Wallet & Balance Withdrawal feature is temporarily disabled. COD and QRIS/bank transfer payments go straight to your account.'
            : 'Fitur Dompet & Tarik Saldo sedang dinonaktifkan sementara. Pembayaran COD dan QRIS/Transfer Bank langsung masuk ke rekening Anda.',
          timestamp: time,
        };
      }
      return {
        id,
        sender: 'bot',
        text: isEn
          ? `The balance from successful store transactions can be withdrawn straight to your bank account or e-wallet:\n\n1. Make sure you have filled in your bank/e-wallet account number in the **Settings** menu.\n2. Click the **Withdraw Balance** button on the Home page or the button below.\n3. Enter the amount you want to withdraw.\n4. Funds are processed and transferred within 1x24 business hours with no hidden fees.`
          : `Saldo dari transaksi toko yang berhasil dapat ditarik langsung ke rekening bank atau e-wallet Anda:\n\n1. Pastikan Anda telah mengisi nomor rekening/e-wallet di menu **Pengaturan**.\n2. Klik tombol **Tarik Saldo** di Beranda atau tombol di bawah ini.\n3. Masukkan nominal yang ingin dicairkan.\n4. Dana akan diproses dan ditransfer dalam waktu 1x24 jam kerja tanpa potongan tersembunyi.`,
        timestamp: time,
        actionButton: {
          label: isEn ? 'Withdraw Balance Now' : 'Tarik Saldo Sekarang',
          actionType: 'withdraw',
        },
        quickSuggestions: isEn ? [
          'What is the minimum withdrawal?',
          'How do I change the destination bank account?',
        ] : [
          'Berapa minimal penarikan saldo?',
          'Cara ubah rekening bank tujuan?',
        ],
      };
    }

    // 5. Bagikan Toko / Link Toko
    if (q.includes('bagikan') || q.includes('link toko') || q.includes('share') || q.includes('promosi') || q.includes('whatsapp') || q.includes('instagram') || q.includes('medsos') || q.includes('store link') || q.includes('promot')) {
      return {
        id,
        sender: 'bot',
        text: isEn
          ? `Your online store has a unique link: \n🔗 **lapakq.com/${activeStore.slug || 'toko-umkm'}**\n\nTips to boost sales:\n• Copy your store link and add it to your Instagram & TikTok bio.\n• Share the ready-made message straight to your WhatsApp contacts & groups.\n• Share your store QR Code to print on banners or product packaging.`
          : `Toko online Anda memiliki link unik: \n🔗 **lapakq.com/${activeStore.slug || 'toko-umkm'}**\n\nTips meningkatkan penjualan:\n• Salin link toko dan pasang di Bio Instagram & TikTok.\n• Bagikan pesan otomatis yang sudah kami siapkan langsung ke kontak & grup WhatsApp.\n• Bagikan QR Code toko untuk dicetak di banner atau kemasan produk Anda.`,
        timestamp: time,
        actionButton: {
          label: isEn ? 'Share Store Link' : 'Bagikan Link Toko',
          actionType: 'share',
        },
        quickSuggestions: isEn ? [
          'View how my store looks right now',
          'How do I change my store name?',
        ] : [
          'Lihat tampilan toko saya saat ini',
          'Cara ubah link/nama toko?',
        ],
      };
    }

    // 6. Pengaturan Toko & WhatsApp Notifikasi
    if (q.includes('pengaturan') || q.includes('ubah nama') || q.includes('ganti nomor') || q.includes('nomor wa') || q.includes('lokasi') || q.includes('profil') || q.includes('settings') || q.includes('store info') || q.includes('store name') || q.includes('location')) {
      return {
        id,
        sender: 'bot',
        text: isEn
          ? `In the **Store Settings** menu, you can set:\n\n• **Store Name & Custom URL**: Match it to your brand.\n• **Store WhatsApp Number**: To receive order confirmations from buyers.\n• **Shipping Origin City**: For accurate shipping cost calculation.\n• **Bank Account & QRIS**: The destination account for sales balance withdrawals.`
          : `Di menu **Pengaturan Toko**, Anda dapat mengatur:\n\n• **Nama Toko & Custom URL**: Sesuaikan dengan brand Anda.\n• **Nomor WhatsApp Toko**: Untuk menerima konfirmasi pesanan dari pembeli.\n• **Kota Asal Pengiriman**: Untuk perhitungan ongkir yang akurat.\n• **Rekening Bank & QRIS**: Rekening tujuan penarikan saldo penjualan.`,
        timestamp: time,
        actionButton: {
          label: isEn ? 'Open Store Settings' : 'Buka Pengaturan Toko',
          actionType: 'settings',
        },
        quickSuggestions: isEn ? [
          'How do I set up payment & shipping?',
          'How do I view the buyer storefront?',
        ] : [
          'Cara atur pembayaran & pengiriman?',
          'Cara lihat tampilan toko online pembeli?',
        ],
      };
    }

    // 7. Pembayaran & Pengiriman
    if (q.includes('integrasi') || q.includes('pembayaran') || q.includes('pengiriman') || q.includes('qris') || q.includes('midtrans') || q.includes('kurir') || q.includes('metode') || q.includes('payment') || q.includes('shipping') || q.includes('courier') || q.includes('method')) {
      return {
        id,
        sender: 'bot',
        text: isEn
          ? `LapakQ supports a range of payment channels & automatic courier shipping:\n\n💳 **Payment Methods**:\n• Instant QRIS (GoPay, OVO, Dana, ShopeePay, BCA)\n• Bank Virtual Account Transfer (BCA, Mandiri, BRI, BNI)\n• Cash on Delivery (COD)\n\n🚚 **Courier Shipping**:\n• JNE, J&T Express, SiCepat, Anteraja\n• Instant Delivery (GoSend & GrabExpress)`
          : `LapakQ mendukung berbagai channel pembayaran & pengiriman ekspedisi otomatis:\n\n💳 **Metode Pembayaran**:\n• QRIS Instant (GoPay, OVO, Dana, ShopeePay, BCA)\n• Transfer Virtual Account Bank (BCA, Mandiri, BRI, BNI)\n• Bayar di Tempat (COD)\n\n🚚 **Pengiriman Ekspedisi**:\n• JNE, J&T Express, SiCepat, Anteraja\n• Instant Delivery (GoSend & GrabExpress)`,
        timestamp: time,
        actionButton: {
          label: isEn ? 'Open Payment & Shipping' : 'Buka Pembayaran & Pengiriman',
          actionType: 'integrations',
        },
        quickSuggestions: isEn ? [
          'How do I process incoming orders?',
          'How do I add a new product?',
        ] : [
          'Cara proses pesanan masuk?',
          'Cara tambah produk baru?',
        ],
      };
    }

    // 8. Tampilan Toko / Toko Pembeli
    if (q.includes('lihat toko') || q.includes('toko pembeli') || q.includes('tampilan') || q.includes('storefront') || q.includes('view how my store') || q.includes('view store') || q.includes('preview')) {
      return {
        id,
        sender: 'bot',
        text: isEn
          ? `You can preview your online store exactly as buyers see it when shopping. The store page comes with an instant shopping cart and automatic Midtrans online payments (QRIS & VA).`
          : `Anda dapat melihat pratinjau toko online Anda persis seperti yang dilihat oleh pembeli saat berbelanja. Halaman toko sudah dilengkapi keranjang belanja instan dan pembayaran online otomatis Midtrans (QRIS & VA).`,
        timestamp: time,
        actionButton: {
          label: isEn ? 'Open Online Store' : 'Buka Toko Online',
          actionType: 'storefront',
        },
        quickSuggestions: isEn ? [
          'How do I share my store link?',
          'How do I add a new product?',
        ] : [
          'Cara bagikan link toko?',
          'Cara tambah produk baru?',
        ],
      };
    }

    // 9. Greeting
    if (q.includes('halo') || q.includes('hai') || q.includes('pagi') || q.includes('siang') || q.includes('malam') || q.includes('assalamualaikum') || q.includes('tes') || q.includes('hello') || q.includes('hey')) {
      return {
        id,
        sender: 'bot',
        text: isEn
          ? `Hello! Happy to help. 😊\n\nIs there anything you'd like to ask about using the LapakQ dashboard, selling online, or managing products and orders?`
          : `Halo! Senang bisa membantu Anda. 😊\n\nAda yang ingin Anda tanyakan seputar penggunaan dashboard LapakQ, cara jualan online, atau pengaturan produk dan pesanan?`,
        timestamp: time,
        quickSuggestions: INITIAL_QUICK_TOPICS,
      };
    }

    // 10. Default Smart Fallback
    return {
      id,
      sender: 'bot',
      text: isEn
        ? `Thanks for your question. You can manage that directly through the LapakQ navigation menu:\n\n• **Products**: Manage items, prices, and stock.\n• **Orders**: Confirm orders, print tracking labels & shipping.\n• **Settings**: Store identity, WhatsApp number, and bank account.\n\nIs there a specific step you'd like me to explain?`
        : `Terima kasih atas pertanyaannya. Terkait hal tersebut, Anda dapat mengelolanya langsung melalui menu navigasi di LapakQ:\n\n• **Produk**: Untuk mengelola barang, harga, dan stok.\n• **Pesanan**: Untuk konfirmasi order, cetak resi & pengiriman.\n• **Pengaturan**: Untuk identitas toko, nomor WhatsApp, dan rekening bank.\n\nApakah ada langkah spesifik yang ingin saya bantu jelaskan?`,
      timestamp: time,
      quickSuggestions: isEn ? [
        '📦 How do I add a new product?',
        '🚚 How do I process orders?',
        ...(WALLET_ENABLED ? ['💰 How do I withdraw my balance?'] : []),
        '⚙️ Open Store Settings',
      ] : [
        '📦 Cara tambah produk baru?',
        '🚚 Cara proses pesanan?',
        ...(WALLET_ENABLED ? ['💰 Cara tarik saldo?'] : []),
        '⚙️ Buka Pengaturan Toko',
      ],
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const content = (textToSend || inputMessage).trim();
    if (!content) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: content,
      timestamp: getCurrentTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate realistic typing delay
    setTimeout(() => {
      const botMsg = generateBotReply(content);
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleResetChat = () => {
    const welcomeMessage: ChatMessage = {
      id: `welcome-${Date.now()}`,
      sender: 'bot',
      text: isEn
        ? `Hi ${activeStore.name ? activeStore.name : 'there'}! 👋\n\nThe conversation has been reset. How can I help you manage your online store today?`
        : `Halo ${activeStore.name ? activeStore.name : 'Juragan'}! 👋\n\nPercakapan telah diatur ulang. Ada yang bisa saya bantu terkait pengelolaan toko online Anda hari ini?`,
      timestamp: getCurrentTime(),
      quickSuggestions: INITIAL_QUICK_TOPICS,
    };
    setMessages([welcomeMessage]);
  };

  if (!isOpen) return null;

  return (
    <div
      id="support-chatbot-overlay"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end sm:p-6 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Chatbot Window */}
      <div
        id="support-chatbot-modal"
        className="w-full sm:w-[440px] h-[85vh] sm:h-[620px] max-h-[90vh] bg-white rounded-t-2xl sm:rounded-2xl border border-[#E5E0DD] shadow-2xl flex flex-col overflow-hidden font-sans text-left animate-in slide-in-from-bottom-6 duration-300"
      >
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-[#66000E] text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white shrink-0 border border-white/20">
              <Bot className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-white truncate">
                  {isEn ? 'LapakQ Help Assistant' : 'Asisten Bantuan LapakQ'}
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" title="Online" />
              </div>
              <p className="text-[11px] text-white/80 font-normal truncate">
                {isEn ? 'Help & Guides for SME Online Stores' : 'Bantuan & Panduan Toko Online UMKM'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleResetChat}
              className="p-1.5 rounded-lg hover:bg-white/15 text-white/90 hover:text-white transition cursor-pointer"
              title={isEn ? 'Restart Chat' : 'Mulai Ulang Obrolan'}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/15 text-white/90 hover:text-white transition cursor-pointer"
              title={isEn ? 'Close Chat' : 'Tutup Chat'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Area */}
        <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5 bg-[#FAF7F7] custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'bot' && (
                <div className="w-7 h-7 rounded-lg bg-[#66000E] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3 sm:p-3.5 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                  msg.sender === 'user'
                    ? 'bg-[#66000E] text-white rounded-br-xs'
                    : 'bg-white text-[#241A1A] border border-[#E5E0DD] rounded-tl-xs'
                }`}
              >
                <div className="whitespace-pre-line font-normal space-y-1">
                  {msg.text.split('\n').map((line, idx) => {
                    // Simple bold formatting replacement
                    if (line.startsWith('• ') || line.match(/^[0-9]\. /)) {
                      return (
                        <p key={idx} className="pl-1">
                          {line}
                        </p>
                      );
                    }
                    return <p key={idx}>{line}</p>;
                  })}
                </div>

                {/* Inline Action Button (if any) */}
                {msg.actionButton && (
                  <div className="mt-3 pt-2.5 border-t border-[#E5E0DD]">
                    <button
                      onClick={() => handleActionClick(msg.actionButton!.actionType)}
                      className="w-full py-2 px-3 rounded-xl bg-[#66000E] hover:bg-[#801010] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-2xs active:scale-98 cursor-pointer"
                    >
                      <span>{msg.actionButton.label}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Quick Suggestion Chips */}
                {msg.quickSuggestions && msg.quickSuggestions.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-[#E5E0DD] space-y-1.5">
                    <p className="text-[11px] font-semibold text-[#706866] mb-1">
                      {isEn ? 'Help Topics:' : 'Pilihan Topik Bantuan:'}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.quickSuggestions.map((suggestion, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSendMessage(suggestion)}
                          className="text-left text-[11px] font-medium py-1 px-2.5 rounded-lg bg-[#FAF7F7] hover:bg-[#F9EDEF] text-[#241A1A] hover:text-[#66000E] border border-[#E5E0DD] hover:border-[#66000E]/40 transition cursor-pointer"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className={`text-[10px] mt-1.5 text-right font-light ${
                    msg.sender === 'user' ? 'text-white/70' : 'text-[#706866]'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-[#FAF7F7] border border-[#E5E0DD] text-[#241A1A] flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-7 h-7 rounded-lg bg-[#66000E] text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-white border border-[#E5E0DD] rounded-2xl rounded-tl-xs px-4 py-2.5 shadow-2xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#66000E] animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#66000E] animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#66000E] animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-[#E5E0DD] shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isEn ? 'Type your help question here...' : 'Ketik pertanyaan bantuan di sini...'}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E5E0DD] bg-[#FAF7F7] focus:bg-white focus:border-[#66000E] focus:outline-none text-xs sm:text-sm text-[#241A1A] placeholder-[#706866] transition"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className="p-2.5 rounded-xl bg-[#66000E] hover:bg-[#801010] disabled:bg-[#E5E0DD] disabled:text-[#706866] text-white transition shadow-2xs cursor-pointer disabled:cursor-not-allowed shrink-0"
              title={isEn ? 'Send Message' : 'Kirim Pesan'}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-[#706866] mt-1.5 px-1 font-normal">
            <span>{isEn ? 'LapakQ Help Assistant' : 'Asisten Bantuan LapakQ'}</span>
            <span>{isEn ? 'Fast Response 24/7' : 'Respon Cepat 24/7'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
