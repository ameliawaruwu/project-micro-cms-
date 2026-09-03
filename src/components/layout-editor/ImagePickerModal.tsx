import React, { useState } from 'react';
import {
  X,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Check,
  Trash2,
  Sparkles,
  ShoppingBag,
  Coffee,
  Shirt,
  Smartphone,
  Gem,
} from 'lucide-react';

export interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImageUrl?: string;
  title?: string;
  onSelectImage: (newUrl: string) => void;
  onRemoveImage?: () => void;
}

const CURATED_GALLERIES = [
  {
    category: 'Kuliner & Makanan',
    icon: Coffee,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
        title: 'Restoran & Masakan Lezat',
      },
      {
        url: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=1200&q=80',
        title: 'Kopi & Cafe Santai',
      },
      {
        url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
        title: 'Salad & Makanan Sehat',
      },
      {
        url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80',
        title: 'Pizza & Camilan Hangat',
      },
    ],
  },
  {
    category: 'Fashion & Pakaian',
    icon: Shirt,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
        title: 'Boutique & Toko Pakaian',
      },
      {
        url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
        title: 'Koleksi Busana Trendy',
      },
      {
        url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80',
        title: 'Apparel & Kaos Minimalis',
      },
      {
        url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
        title: 'Model Fashion Elegan',
      },
    ],
  },
  {
    category: 'Kriya & Produk UMKM',
    icon: Gem,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
        title: 'Kerajinan Tangan Lokal',
      },
      {
        url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80',
        title: 'Tas & Aksesoris Kulit',
      },
      {
        url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
        title: 'Dekorasi Rumah Alami',
      },
      {
        url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
        title: 'Produk Keramik & Tembikar',
      },
    ],
  },
  {
    category: 'Elektronik & Gadget',
    icon: Smartphone,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
        title: 'Headphone & Audio Premium',
      },
      {
        url: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1200&q=80',
        title: 'Gadget & Setup Kerja',
      },
      {
        url: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=1200&q=80',
        title: 'Kamera & Aksesoris Fotografi',
      },
    ],
  },
];

export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  isOpen,
  onClose,
  currentImageUrl = '',
  title = 'Ganti Gambar Komponen',
  onSelectImage,
  onRemoveImage,
}) => {
  const [activeTab, setActiveTab] = useState<'gallery' | 'url' | 'upload'>('gallery');
  const [customUrl, setCustomUrl] = useState(currentImageUrl);
  const [selectedCategory, setSelectedCategory] = useState(CURATED_GALLERIES[0].category);

  if (!isOpen) return null;

  const handleApplyUrl = () => {
    if (customUrl.trim()) {
      onSelectImage(customUrl.trim());
      onClose();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          onSelectImage(result);
          onClose();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const activeGallery = CURATED_GALLERIES.find((g) => g.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl border border-[#E5E0DD] shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E5E0DD] flex items-center justify-between bg-[#FAF7F7]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F5E8EA] text-[#66000E] flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#241A1A]">{title}</h3>
              <p className="text-[11px] text-[#706866]">
                Pilih foto kurasi berkualitas tinggi, tautan URL, atau unggah gambar
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#706866] hover:text-[#241A1A] hover:bg-[#EBE5E1] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E5E0DD] px-5 bg-white text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`py-3 px-4 flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === 'gallery'
                ? 'border-[#66000E] text-[#66000E]'
                : 'border-transparent text-[#706866] hover:text-[#241A1A]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Galeri Pilihan</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`py-3 px-4 flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === 'url'
                ? 'border-[#66000E] text-[#66000E]'
                : 'border-transparent text-[#706866] hover:text-[#241A1A]'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Tautan URL</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-4 flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === 'upload'
                ? 'border-[#66000E] text-[#66000E]'
                : 'border-transparent text-[#706866] hover:text-[#241A1A]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Unggah Berkas</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
          {/* TAB 1: GALERI */}
          {activeTab === 'gallery' && (
            <div className="space-y-4">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                {CURATED_GALLERIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.category;
                  return (
                    <button
                      key={cat.category}
                      type="button"
                      onClick={() => setSelectedCategory(cat.category)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#66000E] text-white shadow-2xs'
                          : 'bg-[#FAF7F7] border border-[#E5E0DD] text-[#5A5250] hover:bg-[#EBE5E1]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{cat.category}</span>
                    </button>
                  );
                })}
              </div>

              {/* Photos Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {activeGallery?.images.map((img, idx) => {
                  const isCurrent = currentImageUrl === img.url;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        onSelectImage(img.url);
                        onClose();
                      }}
                      className={`group relative rounded-xl overflow-hidden aspect-4/3 cursor-pointer border-2 transition-all hover:shadow-md ${
                        isCurrent
                          ? 'border-[#66000E] ring-2 ring-[#66000E]/30'
                          : 'border-[#E5E0DD] hover:border-[#66000E]/50'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2">
                        <span className="text-[10px] text-white font-medium line-clamp-1">
                          {img.title}
                        </span>
                      </div>
                      {isCurrent && (
                        <div className="absolute top-1.5 right-1.5 bg-[#66000E] text-white p-1 rounded-full shadow-xs">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: URL */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#241A1A] mb-1.5">
                  URL Gambar Eksternal
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-[#FAF7F7] border border-[#E5E0DD] text-[#241A1A] focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-4 py-2 bg-[#66000E] hover:bg-[#52000B] text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Gunakan
                  </button>
                </div>
                <p className="text-[10px] text-[#706866] mt-1.5">
                  Tempelkan tautan langsung ke gambar format JPG, PNG, atau WEBP.
                </p>
              </div>

              {customUrl && (
                <div className="p-3 bg-[#FAF7F7] rounded-xl border border-[#E5E0DD]">
                  <span className="text-[10px] font-bold text-[#706866] block mb-1">
                    Pratinjau Gambar:
                  </span>
                  <div className="h-40 rounded-lg overflow-hidden bg-white border border-[#E5E0DD]">
                    <img
                      src={customUrl}
                      alt="Preview"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <label className="border-2 border-dashed border-[#D5CEC9] hover:border-[#66000E] bg-[#FAF7F7] hover:bg-[#F5E8EA]/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#E5E0DD] text-[#66000E] flex items-center justify-center mb-3 shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-[#241A1A] mb-1">
                  Pilih Berkas atau Tarik Gambar ke Sini
                </h4>
                <p className="text-[10px] text-[#706866] max-w-xs">
                  Mendukung PNG, JPG, GIF hingga ukuran 5MB
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-[#E5E0DD] bg-[#FAF7F7] flex items-center justify-between">
          {onRemoveImage && (
            <button
              type="button"
              onClick={() => {
                onRemoveImage();
                onClose();
              }}
              className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-red-50 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Gambar</span>
            </button>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#5A5250] hover:text-[#241A1A] bg-white border border-[#E5E0DD] rounded-xl hover:bg-[#EBE5E1] transition cursor-pointer"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
