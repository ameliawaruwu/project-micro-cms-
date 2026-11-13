import React, { useState, useRef } from 'react';
import { X, User, Upload, Trash2, Lock, Phone, Mail, Loader2, Check } from 'lucide-react';
import { User as UserType } from '../../types';
import { authService } from '../../services/authService';
import { isDataImageUrl, mediaService } from '../../services/mediaService';
import { useLanguage } from '../../contexts/LanguageContext';

/** `admin` = super admin (dasbor admin), `merchant` = pemilik toko (dasbor CMS). */
export type ProfileVariant = 'admin' | 'merchant';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType | null;
  onProfileUpdated: (updatedUser: UserType) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  variant?: ProfileVariant;
}

const COPY = {
  admin: {
    title: { id: 'Pengaturan Profil Admin', en: 'Admin Profile Settings' },
    nameLabel: { id: 'Nama Lengkap Admin', en: 'Admin Name' },
    success: { id: 'Profil admin berhasil diperbarui!', en: 'Admin profile updated successfully!' },
    defaultName: 'Super Admin LapakQ',
  },
  merchant: {
    title: { id: 'Edit Profil', en: 'Edit Profile' },
    nameLabel: { id: 'Nama Lengkap', en: 'Full Name' },
    success: { id: 'Profil berhasil diperbarui!', en: 'Profile updated successfully!' },
    defaultName: '',
  },
} as const;

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onProfileUpdated,
  onShowToast,
  variant = 'merchant',
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const copy = COPY[variant];
  const text = (entry: { id: string; en: string }) => (isEn ? entry.en : entry.id);

  const initialName = variant === 'admin' ? currentUser?.name?.replace(/Kroomify/g, 'LapakQ') : currentUser?.name;
  const [name, setName] = useState(initialName || copy.defaultName);
  const [phone, setPhone] = useState(currentUser?.phoneWhatsApp || '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentUser?.avatarUrl || null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Kolom sandi hanya aktif bila pengguna memang memilih ganti sandi, agar isian otomatis
  // browser (sandi tersimpan) tidak membuat simpan profil biasa meminta konfirmasi sandi.
  const [changePassword, setChangePassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(isEn ? 'Please choose an image file (PNG, JPG, WEBP).' : 'Silakan pilih file gambar (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError(isEn ? 'Image size cannot exceed 2MB.' : 'Ukuran foto maksimal 2MB.');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatarUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(isEn ? 'Name is required.' : 'Nama wajib diisi.');
      return;
    }

    const wantsPasswordChange = changePassword && newPassword.length > 0;

    if (changePassword && !newPassword) {
      setError(isEn ? 'Enter a new password, or cancel the password change.' : 'Isi kata sandi baru, atau batalkan ganti kata sandi.');
      return;
    }

    if (wantsPasswordChange && newPassword.length < 8) {
      setError(isEn ? 'Password must be at least 8 characters.' : 'Kata sandi minimal 8 karakter.');
      return;
    }

    if (wantsPasswordChange && !currentPassword) {
      setError(isEn ? 'Enter your current password to change it.' : 'Masukkan kata sandi saat ini untuk mengganti kata sandi.');
      return;
    }

    if (wantsPasswordChange && newPassword !== confirmPassword) {
      setError(isEn ? 'Password confirmation does not match.' : 'Konfirmasi kata sandi tidak cocok.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const userId = currentUser?.id;
      if (!userId) throw new Error(isEn ? 'Session expired. Please sign in again.' : 'Sesi tidak valid. Silakan masuk ulang.');
      // Foto baru masih berupa pratinjau data URL; unggah ke CDN dan simpan URL-nya saja.
      const savedAvatarUrl = isDataImageUrl(avatarUrl) ? await mediaService.uploadImage(avatarUrl, 'avatar') : avatarUrl;
      const updated = await authService.updateProfile(userId, {
        name: name.trim(),
        phoneWhatsApp: phone.trim(),
        avatarUrl: savedAvatarUrl,
        newPassword: wantsPasswordChange ? newPassword : undefined,
        currentPassword: wantsPasswordChange ? currentPassword : undefined,
      });

      onProfileUpdated(updated);
      onShowToast(text(copy.success), 'success');
      onClose();
    } catch (err: any) {
      setError(err?.message || (isEn ? 'Failed to update profile.' : 'Gagal memperbarui profil.'));
    } finally {
      setIsSaving(false);
    }
  };

  const initials = (name.trim() || 'A')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden text-left">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-linear-to-r from-gray-50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#66000E]/10 text-[#66000E] flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-gray-900">
                {text(copy.title)}
              </h2>
              <p className="text-[11px] text-gray-500">
                {isEn ? 'Manage name, photo, and account security' : 'Kelola nama, foto profil, dan keamanan akun'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          {/* Avatar Upload Section */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 rounded-xl bg-gray-50/80 border border-gray-200/80">
            {/* Avatar Preview */}
            <div className="relative shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#66000E] shadow-xs"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-linear-to-br from-[#66000E] to-[#990014] text-white flex items-center justify-center font-bold text-lg shadow-xs tracking-wider">
                  {initials}
                </div>
              )}
            </div>

            {/* Upload Controls */}
            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <p className="text-xs font-semibold text-gray-800">
                {isEn ? 'Profile Photo' : 'Foto Profil'}
              </p>
              <p className="text-[11px] text-gray-500 leading-tight">
                {avatarUrl
                  ? isEn
                    ? 'Custom photo from device'
                    : 'Foto kustom dari perangkat'
                  : isEn
                    ? 'Default avatar (clean non-image icon)'
                    : 'Avatar bawaan (ikon inisial non-gambar)'}
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 flex-wrap">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg bg-white border border-gray-300 text-gray-700 hover:border-[#66000E] hover:text-[#66000E] text-xs font-medium flex items-center gap-1.5 shadow-2xs transition cursor-pointer active:scale-95"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Upload Photo' : 'Pilih dari Perangkat'}</span>
                </button>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 text-xs font-medium flex items-center gap-1 transition cursor-pointer active:scale-95"
                    title={isEn ? 'Revert to default non-image icon' : 'Kembalikan ke ikon inisial bawaan'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isEn ? 'Reset Default' : 'Hapus Foto'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Nama Admin */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {text(copy.nameLabel)}
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={100}
                autoComplete="name"
                className="w-full h-10 px-3 pl-9 rounded-xl border border-gray-300 focus:border-[#66000E] focus:ring-2 focus:ring-[#66000E]/15 text-xs text-gray-900 transition outline-none"
              />
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Email (Readonly) */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {isEn ? 'Account Email (Locked)' : 'Email Akun (Terkunci)'}
            </label>
            <div className="relative">
              <input
                type="email"
                value={variant === 'admin' ? currentUser?.email?.replace('kroomify.id', 'lapakq.com') || 'admin@lapakq.com' : currentUser?.email || ''}
                disabled
                className="w-full h-10 px-3 pl-9 rounded-xl border border-gray-200 bg-gray-100 text-xs text-gray-500 cursor-not-allowed outline-none"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* No WhatsApp / Phone */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {isEn ? 'Phone / WhatsApp Number' : 'Nomor WhatsApp / Telepon'}
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^\d+\-\s]/g, ''))}
                placeholder="081234567890"
                maxLength={20}
                inputMode="tel"
                autoComplete="tel"
                className="w-full h-10 px-3 pl-9 rounded-xl border border-gray-300 focus:border-[#66000E] focus:ring-2 focus:ring-[#66000E]/15 text-xs text-gray-900 transition outline-none"
              />
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Password Section */}
          <div className="pt-2 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-gray-400" />
                {isEn ? 'Password' : 'Kata Sandi'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setChangePassword((v) => !v);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setError(null);
                }}
                className="text-xs font-medium text-[#66000E] hover:underline cursor-pointer"
              >
                {changePassword
                  ? (isEn ? 'Cancel password change' : 'Batal ganti kata sandi')
                  : (isEn ? 'Change password' : 'Ganti kata sandi')}
              </button>
            </div>

            {changePassword && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {isEn ? 'Current Password' : 'Kata Sandi Saat Ini'}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder={isEn ? 'Required to change password' : 'Wajib untuk mengganti kata sandi'}
                    className="w-full h-10 px-3 pl-9 rounded-xl border border-gray-300 focus:border-[#66000E] focus:ring-2 focus:ring-[#66000E]/15 text-xs text-gray-900 transition outline-none"
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>
            )}

            {changePassword && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {isEn ? 'New Password' : 'Kata Sandi Baru'}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={isEn ? 'Minimum 8 characters' : 'Minimal 8 karakter'}
                    className="w-full h-10 px-3 pl-9 rounded-xl border border-gray-300 focus:border-[#66000E] focus:ring-2 focus:ring-[#66000E]/15 text-xs text-gray-900 transition outline-none"
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>
            )}

            {changePassword && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {isEn ? 'Confirm New Password' : 'Ulangi Kata Sandi Baru'}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={isEn ? 'Re-type new password' : 'Ketik ulang kata sandi baru'}
                    className="w-full h-10 px-3 pl-9 rounded-xl border border-gray-300 focus:border-[#66000E] focus:ring-2 focus:ring-[#66000E]/15 text-xs text-gray-900 transition outline-none"
                  />
                  <Check className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-medium transition cursor-pointer"
            >
              {isEn ? 'Cancel' : 'Batal'}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-[#66000E] hover:bg-[#800012] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-75"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isEn ? 'Saving...' : 'Menyimpan...'}</span>
                </>
              ) : (
                <span>{isEn ? 'Save Changes' : 'Simpan Perubahan'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

