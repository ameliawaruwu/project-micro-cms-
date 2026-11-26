/**
 * Saklar fitur yang sengaja dimatikan sementara.
 *
 * WALLET_ENABLED: Dompet toko & penarikan saldo. Dimatikan sampai payment gateway aktif,
 * karena saldo hanya bertambah dari pembayaran gateway. Saat dinyalakan kembali, izin RPC
 * public.request_withdrawal juga perlu dikembalikan (lihat migrasi 20261111_disable_wallet_withdrawal.sql).
 */
export const WALLET_ENABLED = false;
