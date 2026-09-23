import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

function midtransDevPlugin(): Plugin {
  return {
    name: 'midtrans-dev-server',
    configureServer(server) {
      server.middlewares.use('/api/midtrans/snap-token', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
            if (!serverKey) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'MIDTRANS_SERVER_KEY tidak ditemukan di .env' }));
              return;
            }

            // Security Hardening: Validasi nominal transaksi di sisi server
            const rawAmount = Number(data.grossAmount);
            if (isNaN(rawAmount) || rawAmount <= 0) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Nominal transaksi tidak valid (harus lebih besar dari Rp 0)' }));
              return;
            }
            if (rawAmount > 500_000_000) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Nominal transaksi melebihi batas yang diizinkan' }));
              return;
            }

            // Sanitasi input teks
            const sanitizedOrderId = String(data.orderId || `ORDER-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
            const sanitizedName = String(data.customerName || 'Pembeli').replace(/<[^>]*>/g, '').trim().slice(0, 100);
            const sanitizedPhone = String(data.customerPhone || '08123456789').replace(/[^0-9+]/g, '').slice(0, 20);
            const sanitizedEmail = String(data.customerEmail || 'customer@example.com').trim().slice(0, 100);

            const env = process.env.VITE_MIDTRANS_ENV || 'sandbox';
            const apiUrl =
              env === 'production'
                ? 'https://app.midtrans.com/snap/v1/transactions'
                : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

            const payload: any = {
              transaction_details: {
                order_id: sanitizedOrderId,
                gross_amount: Math.round(rawAmount),
              },
              customer_details: {
                first_name: sanitizedName,
                phone: sanitizedPhone,
                email: sanitizedEmail,
              },
            };

            if (Array.isArray(data.enabledPayments) && data.enabledPayments.length > 0) {
              payload.enabled_payments = data.enabledPayments.map((p: string) => {
                if (p === 'mandiri_bill') return 'echannel';
                return p;
              });
            }

            const midtransRes = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Basic ${Buffer.from(serverKey + ':').toString('base64')}`,
              },
              body: JSON.stringify(payload),
            });

            const midtransData = await midtransRes.json();

            res.setHeader('Content-Type', 'application/json');
            if (!midtransRes.ok) {
              res.statusCode = midtransRes.status;
              res.end(
                JSON.stringify({
                  error: true,
                  message: midtransData.error_messages ? midtransData.error_messages.join(', ') : 'Midtrans API Error',
                  details: midtransData,
                })
              );
              return;
            }

            res.statusCode = 200;
            res.end(
              JSON.stringify({
                token: midtransData.token,
                redirectUrl: midtransData.redirect_url,
              })
            );
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: true, message: err?.message || 'Internal Server Error' }));
          }
        });
      });

      // Endpoint Webhook Notifikasi Midtrans dengan Verifikasi Signature SHA-512
      server.middlewares.use('/api/midtrans/notification', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', async () => {
          try {
            const notif = JSON.parse(body || '{}');
            const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
            const orderId = notif.order_id || '';
            const statusCode = notif.status_code || '';
            const grossAmount = notif.gross_amount || '';
            const receivedSignature = notif.signature_key || '';

            // Verifikasi Signature SHA-512
            const crypto = await import('crypto');
            const expectedSignature = crypto
              .createHash('sha512')
              .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
              .digest('hex');

            if (receivedSignature.toLowerCase() !== expectedSignature.toLowerCase()) {
              res.statusCode = 403;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Invalid Midtrans Signature Key' }));
              return;
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, message: 'Notification verified successfully' }));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err?.message || 'Webhook processing error' }));
          }
        });
      });

      server.middlewares.use('/api/midtrans/status', async (req, res) => {
        if (req.method !== 'GET' && req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let orderId = '';
        if (req.method === 'GET') {
          const url = new URL(req.url || '', 'http://localhost');
          orderId = url.searchParams.get('orderId') || '';
        } else {
          let body = '';
          await new Promise<void>((resolve) => {
            req.on('data', (chunk) => (body += chunk));
            req.on('end', () => resolve());
          });
          try {
            const parsed = JSON.parse(body || '{}');
            orderId = parsed.orderId || '';
          } catch {
            orderId = '';
          }
        }

        if (!orderId) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'orderId is required' }));
          return;
        }

        try {
          const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
          const env = process.env.VITE_MIDTRANS_ENV || 'sandbox';
          const apiUrl =
            env === 'production'
              ? `https://api.midtrans.com/v2/${encodeURIComponent(orderId)}/status`
              : `https://api.sandbox.midtrans.com/v2/${encodeURIComponent(orderId)}/status`;

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);

          let midtransData: any = {};
          try {
            const midtransRes = await fetch(apiUrl, {
              headers: {
                Accept: 'application/json',
                Authorization: `Basic ${Buffer.from(serverKey + ':').toString('base64')}`,
              },
              signal: controller.signal,
            });
            clearTimeout(timeoutId);
            midtransData = await midtransRes.json().catch(() => ({}));
          } catch (fetchErr: any) {
            clearTimeout(timeoutId);
            const isTimeout = fetchErr?.name === 'AbortError';
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(
              JSON.stringify({
                success: false,
                isPaid: false,
                isTimeout,
                error: isTimeout ? 'Midtrans server timeout' : (fetchErr?.message || 'Network error'),
              })
            );
            return;
          }

          const txStatus = midtransData.transaction_status || '';
          const isPaid = txStatus === 'settlement' || txStatus === 'capture';

          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(
            JSON.stringify({
              success: true,
              isPaid,
              transactionStatus: txStatus,
              statusCode: midtransData.status_code,
              statusMessage: midtransData.status_message,
              data: midtransData,
            })
          );
        } catch (err: any) {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify({ success: false, isPaid: false, error: err?.message || 'Server error' }));
        }
      });
    },
  };
}

// Backend Proxy untuk Biteship API (Menyembunyikan BITESHIP_API_KEY dari browser client)
function shippingDevPlugin(): Plugin {
  return {
    name: 'shipping-dev-server',
    configureServer(server) {
      server.middlewares.use('/api/shipping/rates', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const apiKey = process.env.BITESHIP_API_KEY || '';
            if (!apiKey) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'BITESHIP_API_KEY belum dikonfigurasi di server .env' }));
              return;
            }

            const { origin_postal_code, destination_postal_code, couriers, weight } = data;
            if (!origin_postal_code || !destination_postal_code) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Kode pos asal dan tujuan harus diisi' }));
              return;
            }

            const biteshipRes = await fetch('https://api.biteship.com/v1/rates/couriers', {
              method: 'POST',
              headers: {
                Authorization: apiKey.startsWith('Bearer ') ? apiKey : `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                origin_postal_code: Number(origin_postal_code),
                destination_postal_code: Number(destination_postal_code),
                couriers: couriers || 'jne,sicepat,jnt',
                items: [
                  {
                    name: 'Paket Pesanan Toko',
                    value: 100000,
                    weight: Math.max(50, Number(weight) || 250),
                    quantity: 1,
                  },
                ],
              }),
            });

            const biteshipData = await biteshipRes.json();
            res.statusCode = biteshipRes.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(biteshipData));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err?.message || 'Gagal menghubungi Biteship API' }));
          }
        });
      });
    },
  };
}

// In-memory rate limiting map untuk email (maksimal 10 email per menit per IP)
const emailRateLimitMap = new Map<string, { count: number; resetAt: number }>();

function emailDevPlugin(): Plugin {
  return {
    name: 'email-dev-server',
    configureServer(server) {
      server.middlewares.use('/api/send-email', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        // Rate Limiting Check
        const clientIp = req.socket.remoteAddress || 'unknown';
        const now = Date.now();
        const limitInfo = emailRateLimitMap.get(clientIp);

        if (limitInfo && now < limitInfo.resetAt) {
          if (limitInfo.count >= 10) {
            res.statusCode = 429;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Terlalu banyak permintaan pengiriman email. Silakan coba lagi nanti.' }));
            return;
          }
          limitInfo.count += 1;
        } else {
          emailRateLimitMap.set(clientIp, { count: 1, resetAt: now + 60_000 });
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const { to, subject, html } = data;

            if (!to || !subject || !html) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Field to, subject, dan html wajib diisi' }));
              return;
            }

            // Validasi format email & batas ukuran
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(String(to).trim())) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Format email tujuan tidak valid' }));
              return;
            }

            if (String(subject).length > 200) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Subjek email maksimal 200 karakter' }));
              return;
            }

            if (String(html).length > 100_000) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Ukuran konten email melebihi batas (maks 100KB)' }));
              return;
            }

            try {
              const dotenv = await import('dotenv');
              dotenv.config();
            } catch (e) {}

            const smtpEmail = process.env.SMTP_EMAIL;
            const smtpPassword = process.env.SMTP_PASSWORD;

            if (!smtpEmail || !smtpPassword) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Konfigurasi SMTP belum tersedia di server .env. Pastikan file .env sudah di-Save (Ctrl+S).' }));
              return;
            }

            const nodemailer = await import('nodemailer');
            const isGmail = smtpEmail.toLowerCase().includes('@gmail.com');
            const transporter = nodemailer.createTransport({
              host: isGmail ? 'smtp.gmail.com' : 'smtp.ethereal.email',
              port: 587,
              secure: false,
              requireTLS: true,
              auth: {
                user: smtpEmail,
                pass: smtpPassword,
              },
            });

            const info = await transporter.sendMail({
              from: `"Kroomify" <${smtpEmail}>`,
              to: String(to).trim(),
              subject: String(subject).trim(),
              html: String(html),
            });

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, messageId: info.messageId }));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err?.message || 'Gagal mengirim email' }));
          }
        });
      });
    },
  };
}

function cloudflareDevPlugin(): Plugin {
  return {
    name: 'cloudflare-dev-server',
    configureServer(server) {
      server.middlewares.use('/api/cloudflare/routes', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }
        try {
          const panelUrl = process.env.KROOMIFY_PANEL_URL || process.env.KROOMBOX_PANEL_URL || 'https://panel.kroomify.com';
          const token = process.env.KROOMIFY_API_TOKEN || process.env.KROOMBOX_API_TOKEN || '';
          const tunnelId = process.env.KROOMIFY_TUNNEL_ID || process.env.KROOMBOX_TUNNEL_ID || '9743ab8b-d18a-47ac-aeac-87cc6d177db2';

          const response = await fetch(`${panelUrl}/api/admin/cloudflare/tunnels/${tunnelId}/routes`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          const data = await response.json();
          res.statusCode = response.status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });

      server.middlewares.use('/api/cloudflare/connect-domain', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });
        req.on('end', async () => {
          try {
            const { hostname, service } = JSON.parse(body || '{}');
            if (!hostname) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Hostname wajib diisi' }));
              return;
            }

            const cleanHost = hostname
              .trim()
              .toLowerCase()
              .replace(/^https?:\/\//, '')
              .replace(/\/+$/, '');
            const panelUrl = process.env.KROOMIFY_PANEL_URL || process.env.KROOMBOX_PANEL_URL || 'https://panel.kroomify.com';
            const token = process.env.KROOMIFY_API_TOKEN || process.env.KROOMBOX_API_TOKEN || '';
            const tunnelId = process.env.KROOMIFY_TUNNEL_ID || process.env.KROOMBOX_TUNNEL_ID || '9743ab8b-d18a-47ac-aeac-87cc6d177db2';
            const targetService = service || 'http://127.0.0.1:3001';

            // 1. Cek apakah hostname sudah ada di daftar rute tunnel
            const listRes = await fetch(
              `${panelUrl}/api/admin/cloudflare/tunnels/${tunnelId}/routes`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            const existingRoutes: any[] = listRes.ok ? await listRes.json() : [];
            const alreadyExists =
              Array.isArray(existingRoutes) &&
              existingRoutes.some((r) => r.hostname?.toLowerCase() === cleanHost);

            if (alreadyExists) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: true,
                  message: 'Domain sudah terdaftar di Cloudflare Tunnel',
                  hostname: cleanHost,
                })
              );
              return;
            }

            // 2. Daftarkan rute baru ke Cloudflare Tunnel
            const createRes = await fetch(
              `${panelUrl}/api/admin/cloudflare/tunnels/${tunnelId}/routes`,
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  hostname: cleanHost,
                  service: targetService,
                }),
              }
            );

            const createData = await createRes.json();
            if (!createRes.ok) {
              res.statusCode = createRes.status;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  error:
                    createData.message || 'Gagal mendaftarkan domain ke Cloudflare Tunnel',
                })
              );
              return;
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                success: true,
                message: 'Domain berhasil didaftarkan ke Cloudflare Tunnel',
                data: createData,
                hostname: cleanHost,
              })
            );
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Internal server error' }));
          }
        });
      });

      server.middlewares.use('/api/cloudflare/disconnect-domain', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });
        req.on('end', async () => {
          try {
            const { hostname } = JSON.parse(body || '{}');
            if (!hostname) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Hostname wajib diisi' }));
              return;
            }

            const cleanHost = hostname
              .trim()
              .toLowerCase()
              .replace(/^https?:\/\//, '')
              .replace(/\/+$/, '');
            const panelUrl = process.env.KROOMIFY_PANEL_URL || process.env.KROOMBOX_PANEL_URL || 'https://panel.kroomify.com';
            const token = process.env.KROOMIFY_API_TOKEN || process.env.KROOMBOX_API_TOKEN || '';
            const tunnelId = process.env.KROOMIFY_TUNNEL_ID || process.env.KROOMBOX_TUNNEL_ID || '9743ab8b-d18a-47ac-aeac-87cc6d177db2';

            const delRes = await fetch(
              `${panelUrl}/api/admin/cloudflare/tunnels/${tunnelId}/routes`,
              {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  hostname: cleanHost,
                }),
              }
            );

            const delData = await delRes.json();
            res.statusCode = delRes.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(delData));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Internal server error' }));
          }
        });
      });

      server.middlewares.use('/api/cloudflare/health', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }
        try {
          const panelUrl = process.env.KROOMIFY_PANEL_URL || process.env.KROOMBOX_PANEL_URL || 'https://panel.kroomify.com';
          const token = process.env.KROOMIFY_API_TOKEN || process.env.KROOMBOX_API_TOKEN || '';

          const response = await fetch(`${panelUrl}/api/admin/cloudflare/health`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          const data = await response.json();
          res.statusCode = response.status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      midtransDevPlugin(),
      shippingDevPlugin(),
      emailDevPlugin(),
      cloudflareDevPlugin(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
