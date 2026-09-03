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

const INITIAL_QUICK_TOPICS = [
  '📦 Cara tambah produk baru?',
  '🚚 Bagaimana cara proses pesanan & resi?',
  '💰 Cara tarik saldo penjualan?',
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  // Initialize welcome message when opened for the first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome-1',
        sender: 'bot',
        text: `Halo ${activeStore.name ? activeStore.name : 'Juragan'}! 👋\n\nSaya **Asisten Virtual Kroombox**. Saya siap membantu Anda mengelola toko online, menambah produk, memproses pesanan, hingga penarikan saldo.\n\nSilakan pilih topik bantuan cepat di bawah ini atau ketik pertanyaan Anda langsung.`,
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
      case 'integrations':
        if (onNavigateTab) onNavigateTab('integrasi');
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
    if (q.includes('tambah produk') || q.includes('upload produk') || q.includes('buat produk') || q.includes('barang baru') || q.includes('jual barang')) {
      return {
        id,
        sender: 'bot',
        text: `Untuk menambah produk baru di Kroombox:\n\n1. Klik tombol **+ Tambah Produk** di bawah atau di halaman utama.\n2. Masukkan **Nama Produk**, **Harga**, dan **Stok**.\n3. Masukkan **Foto Produk** (bisa pilih foto contoh atau upload dari perangkat).\n4. Tentukan **Berat Produk (gram)** untuk kalkulasi ongkir otomatis.\n5. Klik **Simpan & Publikasikan**. Produk Anda langsung siap dibeli!`,
        timestamp: time,
        actionButton: {
          label: '✨ Tambah Produk Sekarang',
          actionType: 'addProduct',
        },
        quickSuggestions: [
          'Cara atur varian atau diskon?',
          'Bagaimana cara hapus atau edit produk?',
          'Lihat katalog produk saya',
        ],
      };
    }

    // 2. Edit / Hapus Produk
    if (q.includes('edit produk') || q.includes('hapus produk') || q.includes('ubah harga') || q.includes('katalog')) {
      return {
        id,
        sender: 'bot',
        text: `Untuk mengedit harga, stok, atau menghapus produk:\n\n1. Buka menu **Produk** di sidebar.\n2. Klik kartu produk yang ingin Anda ubah.\n3. Anda bisa langsung memperbarui stok dengan tombol cepat **+ / -** atau klik **Edit Produk** untuk mengubah deskripsi & harga.\n4. Anda juga bisa menonaktifkan status produk menjadi *Draft* jika stok sedang kosong.`,
        timestamp: time,
        actionButton: {
          label: 'Buka Menu Produk',
          actionType: 'products',
        },
        quickSuggestions: [
          'Cara tambah produk baru?',
          'Cara bagikan katalog toko ke WhatsApp?',
        ],
      };
    }

    // 3. Pesanan & Resi
    if (q.includes('pesanan') || q.includes('resi') || q.includes('order') || q.includes('kirim') || q.includes('ekspedisi') || q.includes('ongkir')) {
      return {
        id,
        sender: 'bot',
        text: `Alur memproses pesanan masuk di Kroombox:\n\n1. Masuk ke tab **Pesanan**.\n2. Pesanan berstatus *Perlu Diproses* menunjukkan pembeli sudah checkout.\n3. Klik **Proses Pengiriman**, masukkan nomor resi dari kurir pilihan (JNE, J&T, SiCepat, GoSend, dll).\n4. Anda juga dapat mencetak **Label Pengiriman & Struk Thermal** secara otomatis.\n5. Status akan otomatis diperbarui dan pembeli dapat melacak paketnya.`,
        timestamp: time,
        actionButton: {
          label: 'Lihat Daftar Pesanan',
          actionType: 'orders',
        },
        quickSuggestions: [
          'Cara cetak struk pengiriman?',
          'Bagaimana sistem pembayaran pesanan?',
        ],
      };
    }

    // 4. Tarik Saldo / Penarikan Uang
    if (q.includes('tarik saldo') || q.includes('pencairan') || q.includes('rekening') || q.includes('dompet') || q.includes('uang') || q.includes('withdraw')) {
      return {
        id,
        sender: 'bot',
        text: `Saldo dari transaksi toko yang berhasil dapat ditarik langsung ke rekening bank atau e-wallet Anda:\n\n1. Pastikan Anda telah mengisi nomor rekening/e-wallet di menu **Pengaturan**.\n2. Klik tombol **Tarik Saldo** di Beranda atau tombol di bawah ini.\n3. Masukkan nominal yang ingin dicairkan.\n4. Dana akan diproses dan ditransfer dalam waktu 1x24 jam kerja tanpa potongan tersembunyi.`,
        timestamp: time,
        actionButton: {
          label: 'Tarik Saldo Sekarang',
          actionType: 'withdraw',
        },
        quickSuggestions: [
          'Berapa minimal penarikan saldo?',
          'Cara ubah rekening bank tujuan?',
        ],
      };
    }

    // 5. Bagikan Toko / Link Toko
    if (q.includes('bagikan') || q.includes('link toko') || q.includes('share') || q.includes('promosi') || q.includes('whatsapp') || q.includes('instagram') || q.includes('medsos')) {
      return {
        id,
        sender: 'bot',
        text: `Toko online Anda memiliki link unik: \n🔗 **kroombox.id/${activeStore.slug || 'toko-umkm'}**\n\nTips meningkatkan penjualan:\n• Salin link toko dan pasang di Bio Instagram & TikTok.\n• Bagikan pesan otomatis yang sudah kami siapkan langsung ke kontak & grup WhatsApp.\n• Bagikan QR Code toko untuk dicetak di banner atau kemasan produk Anda.`,
        timestamp: time,
        actionButton: {
          label: 'Bagikan Link Toko',
          actionType: 'share',
        },
        quickSuggestions: [
          'Lihat tampilan toko saya saat ini',
          'Cara ubah link/nama toko?',
        ],
      };
    }

    // 6. Pengaturan Toko & WhatsApp Notifikasi
    if (q.includes('pengaturan') || q.includes('ubah nama') || q.includes('ganti nomor') || q.includes('nomor wa') || q.includes('lokasi') || q.includes('profil')) {
      return {
        id,
        sender: 'bot',
        text: `Di menu **Pengaturan Toko**, Anda dapat mengatur:\n\n• **Nama Toko & Custom URL**: Sesuaikan dengan brand Anda.\n• **Nomor WhatsApp Toko**: Untuk menerima konfirmasi pesanan dari pembeli.\n• **Kota Asal Pengiriman**: Untuk perhitungan ongkir yang akurat.\n• **Rekening Bank & QRIS**: Rekening tujuan penarikan saldo penjualan.`,
        timestamp: time,
        actionButton: {
          label: 'Buka Pengaturan Toko',
          actionType: 'settings',
        },
        quickSuggestions: [
          'Cara atur pembayaran & pengiriman?',
          'Cara lihat tampilan toko online pembeli?',
        ],
      };
    }

    // 7. Pembayaran & Pengiriman
    if (q.includes('integrasi') || q.includes('pembayaran') || q.includes('pengiriman') || q.includes('qris') || q.includes('midtrans') || q.includes('kurir') || q.includes('metode')) {
      return {
        id,
        sender: 'bot',
        text: `Kroombox mendukung berbagai channel pembayaran & pengiriman ekspedisi otomatis:\n\n💳 **Metode Pembayaran**:\n• QRIS Instant (GoPay, OVO, Dana, ShopeePay, BCA)\n• Transfer Virtual Account Bank (BCA, Mandiri, BRI, BNI)\n• Bayar di Tempat (COD)\n\n🚚 **Pengiriman Ekspedisi**:\n• JNE, J&T Express, SiCepat, Anteraja\n• Instant Delivery (GoSend & GrabExpress)`,
        timestamp: time,
        actionButton: {
          label: 'Buka Pembayaran & Pengiriman',
          actionType: 'integrations',
        },
        quickSuggestions: [
          'Cara proses pesanan masuk?',
          'Cara tambah produk baru?',
        ],
      };
    }

    // 8. Tampilan Toko / Toko Pembeli
    if (q.includes('lihat toko') || q.includes('toko pembeli') || q.includes('tampilan') || q.includes('storefront')) {
      return {
        id,
        sender: 'bot',
        text: `Anda dapat melihat pratinjau toko online Anda persis seperti yang dilihat oleh pembeli saat berbelanja. Halaman toko sudah dilengkapi keranjang belanja, checkout WhatsApp, dan pembayaran otomatis.`,
        timestamp: time,
        actionButton: {
          label: 'Buka Toko Online',
          actionType: 'storefront',
        },
        quickSuggestions: [
          'Cara bagikan link toko?',
          'Cara tambah produk baru?',
        ],
      };
    }

    // 9. Greeting
    if (q.includes('halo') || q.includes('hai') || q.includes('pagi') || q.includes('siang') || q.includes('malam') || q.includes('assalamualaikum') || q.includes('tes')) {
      return {
        id,
        sender: 'bot',
        text: `Halo! Senang bisa membantu Anda. 😊\n\nAda yang ingin Anda tanyakan seputar penggunaan dashboard Kroombox, cara jualan online, atau pengaturan produk dan pesanan?`,
        timestamp: time,
        quickSuggestions: INITIAL_QUICK_TOPICS,
      };
    }

    // 10. Default Smart Fallback
    return {
      id,
      sender: 'bot',
      text: `Terima kasih atas pertanyaannya. Terkait hal tersebut, Anda dapat mengelolanya langsung melalui menu navigasi di Kroombox:\n\n• **Produk**: Untuk mengelola barang, harga, dan stok.\n• **Pesanan**: Untuk konfirmasi order, cetak resi & pengiriman.\n• **Pengaturan**: Untuk identitas toko, nomor WhatsApp, dan rekening bank.\n\nApakah ada langkah spesifik yang ingin saya bantu jelaskan?`,
      timestamp: time,
      quickSuggestions: [
        '📦 Cara tambah produk baru?',
        '🚚 Cara proses pesanan?',
        '💰 Cara tarik saldo?',
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
      text: `Halo ${activeStore.name ? activeStore.name : 'Juragan'}! 👋\n\nPercakapan telah diatur ulang. Ada yang bisa saya bantu terkait pengelolaan toko online Anda hari ini?`,
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
                  Asisten Bantuan Kroombox
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" title="Online" />
              </div>
              <p className="text-[11px] text-white/80 font-normal truncate">
                Bantuan & Panduan Toko Online UMKM
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleResetChat}
              className="p-1.5 rounded-lg hover:bg-white/15 text-white/90 hover:text-white transition cursor-pointer"
              title="Mulai Ulang Obrolan"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/15 text-white/90 hover:text-white transition cursor-pointer"
              title="Tutup Chat"
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
                      Pilihan Topik Bantuan:
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
              placeholder="Ketik pertanyaan bantuan di sini..."
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E5E0DD] bg-[#FAF7F7] focus:bg-white focus:border-[#66000E] focus:outline-none text-xs sm:text-sm text-[#241A1A] placeholder-[#706866] transition"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className="p-2.5 rounded-xl bg-[#66000E] hover:bg-[#801010] disabled:bg-[#E5E0DD] disabled:text-[#706866] text-white transition shadow-2xs cursor-pointer disabled:cursor-not-allowed shrink-0"
              title="Kirim Pesan"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-[#706866] mt-1.5 px-1 font-normal">
            <span>Asisten Bantuan Kroombox</span>
            <span>Respon Cepat 24/7</span>
          </div>
        </div>
      </div>
    </div>
  );
};
