import { generateWhatsAppLink } from '../utils/formatters';

/**
 * Nomor WhatsApp CS/admin LapakQ untuk tombol konsultasi di landing page.
 * Bisa ditimpa saat build lewat `VITE_ADMIN_WHATSAPP` (format 08xx atau 628xx).
 */
export const ADMIN_WHATSAPP = (import.meta.env.VITE_ADMIN_WHATSAPP || '').trim() || '6281234567890';

/** Tautan wa.me ke admin LapakQ dengan pesan pembuka yang sudah terisi. */
export const adminWhatsAppLink = (message: string) => generateWhatsAppLink(ADMIN_WHATSAPP, message);
