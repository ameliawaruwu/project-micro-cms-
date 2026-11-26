import React, { useState } from 'react';
import { Store as StoreIcon, User as UserIcon } from 'lucide-react';

/**
 * Foto bulat kecil untuk merchant / toko di panel admin.
 * Mencoba URL berurutan; bila semua kosong/gagal dimuat, tampilkan ikon.
 */
interface EntityAvatarProps {
  sources: (string | null | undefined)[];
  alt: string;
  kind?: 'store' | 'user';
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'full' | 'lg';
}

const SIZE = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-16 h-16' };
const ICON = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-7 h-7' };

const isSafeImageUrl = (u: string) => /^(https?:\/\/|\/|data:image\/(png|jpe?g|webp|gif);)/i.test(u);

export const EntityAvatar: React.FC<EntityAvatarProps> = ({ sources, alt, kind = 'store', size = 'md', rounded = 'full' }) => {
  const urls = sources.filter((u): u is string => typeof u === 'string' && u.trim() !== '' && isSafeImageUrl(u.trim()));
  const [failed, setFailed] = useState(0);
  const src = urls[failed];
  const radius = rounded === 'full' ? 'rounded-full' : 'rounded-lg';
  const Icon = kind === 'user' ? UserIcon : StoreIcon;
  return (
    <div className={`${SIZE[size]} ${radius} shrink-0 overflow-hidden bg-[#F5F2F1] border border-[#E5E0DD] flex items-center justify-center`}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" loading="lazy" onError={() => setFailed((n) => n + 1)} />
      ) : (
        <Icon className={`${ICON[size]} text-[#A8A09D]`} />
      )}
    </div>
  );
};
