import React, { useState } from 'react';
import { Image as ImageIcon, Sparkles, Trash2, Camera } from 'lucide-react';
import { ImagePickerModal } from './ImagePickerModal';

interface InlineEditableImageProps {
  src?: string;
  alt?: string;
  className?: string;
  containerClassName?: string;
  title?: string;
  onUpdateImage: (newUrl: string) => void;
  onRemoveImage?: () => void;
  isSelected?: boolean;
}

export const InlineEditableImage: React.FC<InlineEditableImageProps> = ({
  src,
  alt = 'Image',
  className = 'w-full h-full object-cover',
  containerClassName = '',
  title = 'Ganti Gambar',
  onUpdateImage,
  onRemoveImage,
  isSelected = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <div
        className={`relative group/image-edit cursor-pointer ${containerClassName}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          setIsModalOpen(true);
        }}
        title="Klik untuk mengganti gambar ini"
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className={`${className} transition-all duration-200 group-hover/image-edit:brightness-90`}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full min-h-[120px] bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center p-4 text-slate-400 text-xs">
            <Camera className="w-6 h-6 mb-1 text-slate-400" />
            <span>Klik untuk tambah gambar</span>
          </div>
        )}

        {/* Floating Quick Action Overlay on Hover or Selection */}
        <div
          className={`absolute inset-0 bg-slate-900/30 backdrop-blur-[1px] transition-opacity duration-150 flex items-center justify-center gap-1.5 ${
            isHovered || isSelected ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-2 border border-white/20 animate-in zoom-in-95 duration-100">
            <ImageIcon className="w-3.5 h-3.5 text-amber-300" />
            <span>Ganti Gambar</span>
          </div>
        </div>

        {/* Small Corner Badge */}
        <div className="absolute top-2 right-2 bg-slate-900/80 text-white p-1 rounded-lg opacity-0 group-hover/image-edit:opacity-100 transition-opacity shadow-md pointer-events-none z-10">
          <Camera className="w-3 h-3 text-white" />
        </div>
      </div>

      {/* Image Picker Modal */}
      <ImagePickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentImageUrl={src}
        title={title}
        onSelectImage={onUpdateImage}
        onRemoveImage={onRemoveImage}
      />
    </>
  );
};
