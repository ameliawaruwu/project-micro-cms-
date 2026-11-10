import { pool } from './publicApiController';

/**
 * Baca platform_settings (termasuk kunci rahasia seperti midtrans_server_key) lewat koneksi
 * database server (DATABASE_URL). Kolom rahasia TIDAK lagi bisa dibaca anon key, jadi server
 * tidak boleh membacanya lewat REST publik. Mengembalikan null bila DB tidak bisa dihubungi
 * (pemanggil lalu memakai nilai dari .env).
 */
export async function readPlatformSettings(): Promise<Record<string, any> | null> {
  if (!process.env.DATABASE_URL) return null;
  try {
    const result = await pool.query('SELECT * FROM platform_settings ORDER BY id LIMIT 1');
    return result.rows[0] || null;
  } catch (err: any) {
    console.warn('[platformSettings] gagal membaca platform_settings:', err?.message);
    return null;
  }
}
