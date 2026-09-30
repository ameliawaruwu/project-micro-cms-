import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import dotenv from 'dotenv';
import nodeCrypto from 'crypto';


dotenv.config();

async function getDevMidtransConfig() {
  let serverKey = (process.env.MIDTRANS_SERVER_KEY || '').trim();
  let clientKey = (process.env.VITE_MIDTRANS_CLIENT_KEY || '').trim();
  let env = (process.env.VITE_MIDTRANS_ENV || 'sandbox').trim().toLowerCase();

  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const resp = await fetch(`${supabaseUrl}/rest/v1/platform_settings?select=midtrans_environment,midtrans_server_key,midtrans_client_key&limit=1`, {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      });
      if (resp.ok) {
        const rows = await resp.json();
        if (Array.isArray(rows) && rows[0]) {
          const dbRow = rows[0];
          if (dbRow.midtrans_server_key && dbRow.midtrans_server_key.trim()) {
            serverKey = dbRow.midtrans_server_key.trim();
          }
          if (dbRow.midtrans_client_key && dbRow.midtrans_client_key.trim()) {
            clientKey = dbRow.midtrans_client_key.trim();
          }
          if (dbRow.midtrans_environment && dbRow.midtrans_environment.trim()) {
            env = dbRow.midtrans_environment.trim().toLowerCase();
          }
        }
      }
    } catch {
      // Fallback silently
    }
  }

  serverKey = serverKey.replace(/^["']|["']$/g, '').trim();
  clientKey = clientKey.replace(/^["']|["']$/g, '').trim();
  env = env.replace(/^["']|["']$/g, '').trim().toLowerCase();

  return { serverKey, clientKey, env };
}

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
            let data: any = {};
            try {
              data = JSON.parse(body || '{}');
            } catch {
              data = {};
            }

            const { serverKey, env } = await getDevMidtransConfig();
            if (!serverKey) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'MIDTRANS_SERVER_KEY tidak ditemukan di .env atau database' }));
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
              let errorMsg = 'Midtrans API Error';
              if (Array.isArray(midtransData?.error_messages) && midtransData.error_messages.length > 0) {
                errorMsg = midtransData.error_messages.join(', ');
              } else if (midtransData?.status_message) {
                errorMsg = midtransData.status_message;
              } else if (midtransData?.error === 'Unauthorized' || midtransRes.status === 401) {
                errorMsg = 'Kunci MIDTRANS_SERVER_KEY tidak valid atau belum diotorisasi di Midtrans (401 Unauthorized)';
              } else if (typeof midtransData?.error === 'string') {
                errorMsg = midtransData.error;
              } else if (typeof midtransData?.message === 'string') {
                errorMsg = midtransData.message;
              }

              res.statusCode = midtransRes.status;
              res.end(
                JSON.stringify({
                  error: true,
                  message: errorMsg,
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

      // Endpoint Cek Status Pembayaran Midtrans Dev Server
      server.middlewares.use('/api/midtrans/status', async (req, res) => {
        const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
        const orderId = url.searchParams.get('orderId');
        if (!orderId) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: true, message: 'orderId parameter is required' }));
          return;
        }

        try {
          const { serverKey, env } = await getDevMidtransConfig();
          const apiUrl =
            env === 'production'
              ? `https://api.midtrans.com/v2/${encodeURIComponent(orderId)}/status`
              : `https://api.sandbox.midtrans.com/v2/${encodeURIComponent(orderId)}/status`;

          const statusRes = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              Authorization: `Basic ${Buffer.from(serverKey + ':').toString('base64')}`,
            },
          });

          const statusData = await statusRes.json();
          res.statusCode = statusRes.status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(statusData));
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: true, message: err?.message || 'Failed checking status' }));
        }
      });

      // Endpoint Tes Ping & Diagnosa Kunci Midtrans
      server.middlewares.use('/api/midtrans/test-ping', async (_req, res) => {
        try {
          const { serverKey, env } = await getDevMidtransConfig();
          if (!serverKey) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, message: 'MIDTRANS_SERVER_KEY belum disetel di .env atau database' }));
            return;
          }

          const apiUrl =
            env === 'production'
              ? 'https://app.midtrans.com/snap/v1/transactions'
              : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

          const testRes = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: `Basic ${Buffer.from(serverKey + ':').toString('base64')}`,
            },
            body: JSON.stringify({
              transaction_details: {
                order_id: `PING-TEST-${Date.now()}`,
                gross_amount: 10000,
              },
            }),
          });

          const data = await testRes.json();
          res.statusCode = testRes.status;
          res.setHeader('Content-Type', 'application/json');
          if (testRes.ok && data.token) {
            res.end(
              JSON.stringify({
                success: true,
                message: `Koneksi Midtrans ${env.toUpperCase()} BERHASIL! Token Snap berhasil dibuat.`,
                env,
                maskedKey: serverKey.slice(0, 12) + '...',
              })
            );
          } else if (testRes.status === 401) {
            res.end(
              JSON.stringify({
                success: false,
                message: `Server Key Midtrans ${env.toUpperCase()} ditolak (401 Unauthorized). Silakan periksa Server Key di dashboard Midtrans (Settings > Access Keys). Pastikan IP Whitelist kosong.`,
                env,
                details: data,
              })
            );
          } else {
            res.end(
              JSON.stringify({
                success: false,
                message: data.message || (Array.isArray(data.error_messages) ? data.error_messages.join(', ') : 'Respon gagal dari Midtrans'),
                env,
                details: data,
              })
            );
          }
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, message: err?.message || 'Gagal menghubungi server Midtrans' }));
        }
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

async function getDevDuitkuConfig(): Promise<{ merchantCode: string; apiKey: string; env: 'sandbox' | 'production' }> {
  let merchantCode = process.env.DUITKU_MERCHANT_CODE || '';
  let apiKey = process.env.DUITKU_API_KEY || '';
  let env: 'sandbox' | 'production' = (process.env.DUITKU_ENV as any) === 'production' ? 'production' : 'sandbox';

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const resp = await fetch(`${supabaseUrl}/rest/v1/platform_settings?select=*&limit=1`, {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      });
      if (resp.ok) {
        const rows = await resp.json();
        if (Array.isArray(rows) && rows[0]) {
          const dbRow = rows[0];
          if (dbRow.duitku_merchant_code && dbRow.duitku_merchant_code.trim()) {
            merchantCode = dbRow.duitku_merchant_code.trim();
          }
          if (dbRow.duitku_api_key && dbRow.duitku_api_key.trim()) {
            apiKey = dbRow.duitku_api_key.trim();
          }
          if (dbRow.duitku_environment && dbRow.duitku_environment.trim()) {
            env = dbRow.duitku_environment.trim().toLowerCase() === 'production' ? 'production' : 'sandbox';
          }
        }
      }
    } catch {
      // Fallback
    }
  }

  merchantCode = merchantCode.replace(/^["']|["']$/g, '').trim();
  apiKey = apiKey.replace(/^["']|["']$/g, '').trim();

  return { merchantCode, apiKey, env };
}

function duitkuDevPlugin(): Plugin {
  return {
    name: 'duitku-dev-server',
    configureServer(server) {
      // 1. Get Payment Methods
      server.middlewares.use('/api/duitku/payment-methods', async (req, res) => {
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
            const { merchantCode, apiKey, env } = await getDevDuitkuConfig();
            if (!merchantCode || !apiKey) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: true, message: 'DUITKU_MERCHANT_CODE atau DUITKU_API_KEY belum disetel' }));
              return;
            }

            const rawAmount = Number(data.amount || 10000);
            const amount = isNaN(rawAmount) || rawAmount <= 0 ? 10000 : Math.round(rawAmount);

            const now = new Date();
            const pad = (n: number) => String(n).padStart(2, '0');
            const datetime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

            const stringToSign = `${merchantCode}${amount}${datetime}${apiKey}`;
            const signature = nodeCrypto.createHash('sha256').update(stringToSign).digest('hex');

            const apiUrl =
              env === 'production'
                ? 'https://passport.duitku.com/webapi/api/merchant/paymentmethod/getpaymentmethod'
                : 'https://sandbox.duitku.com/webapi/api/merchant/paymentmethod/getpaymentmethod';

            const resp = await fetch(apiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                merchantcode: merchantCode,
                amount: String(amount),
                datetime,
                signature,
              }),
            });

            const resData = await resp.json();
            res.statusCode = resp.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(resData));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: true, message: err?.message || 'Gagal mengambil metode pembayaran Duitku' }));
          }
        });
      });

      // 2. Create Invoice / Inquiry
      server.middlewares.use('/api/duitku/create-invoice', async (req, res) => {
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
            const { merchantCode, apiKey, env } = await getDevDuitkuConfig();
            if (!merchantCode || !apiKey) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: true, message: 'DUITKU_MERCHANT_CODE atau DUITKU_API_KEY belum dikonfigurasi di .env atau Pengaturan Admin.' }));
              return;
            }

            const rawAmount = Number(data.grossAmount || data.paymentAmount);
            if (isNaN(rawAmount) || rawAmount <= 0) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: true, message: 'Nominal transaksi tidak valid' }));
              return;
            }

            const paymentAmount = Math.round(rawAmount);
            const merchantOrderId = String(data.orderId || `ORDER-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50);
            const productDetails = String(data.productDetails || 'Pembayaran Toko').slice(0, 255);
            const customerVaName = String(data.customerName || 'Pelanggan').slice(0, 20);
            const email = String(data.customerEmail || 'customer@example.com').trim().slice(0, 100);
            const phoneNumber = String(data.customerPhone || '08123456789').replace(/[^0-9+]/g, '').slice(0, 20);
            const paymentMethod = String(data.paymentMethod || '').trim();

            const stringToSign = `${merchantCode}${merchantOrderId}${paymentAmount}${apiKey}`;
            const signature = nodeCrypto.createHash('md5').update(stringToSign).digest('hex');

            const appUrl = (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
            const callbackUrl = `${appUrl}/api/duitku/callback`;
            const returnUrl = `${appUrl}/`;

            const apiUrl =
              env === 'production'
                ? 'https://passport.duitku.com/webapi/api/merchant/v2/inquiry'
                : 'https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry';

            const payload: any = {
              merchantCode,
              paymentAmount: String(paymentAmount),
              paymentMethod,
              merchantOrderId,
              productDetails,
              additionalParam: '',
              merchantUserInfo: '',
              customerVaName,
              email,
              phoneNumber,
              itemDetails: Array.isArray(data.items) && data.items.length > 0
                ? data.items.map((it: any) => ({
                    name: String(it.name || 'Item').slice(0, 50),
                    price: Math.round(Number(it.price || 0)),
                    quantity: Math.max(1, Math.round(Number(it.quantity || 1))),
                  }))
                : [
                    {
                      name: productDetails.slice(0, 50),
                      price: paymentAmount,
                      quantity: 1,
                    },
                  ],
              customerDetail: {
                firstName: customerVaName,
                lastName: '',
                email,
                phoneNumber,
              },
              callbackUrl,
              returnUrl,
              signature,
              expiryPeriod: 15,
            };

            const duitkuRes = await fetch(apiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

            const duitkuData = await duitkuRes.json();
            if (!duitkuRes.ok || (duitkuData.statusCode && duitkuData.statusCode !== '00')) {
              const errorMsg = duitkuData.statusMessage || duitkuData.Message || 'Gagal memproses transaksi di Duitku';
              res.statusCode = duitkuRes.ok ? 400 : duitkuRes.status;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: true, message: errorMsg, details: duitkuData }));
              return;
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              reference: duitkuData.reference,
              paymentUrl: duitkuData.paymentUrl,
              vaNumber: duitkuData.vaNumber,
              statusCode: duitkuData.statusCode,
              statusMessage: duitkuData.statusMessage,
            }));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: true, message: err?.message || 'Internal Server Error' }));
          }
        });
      });

      // 3. Check Status
      server.middlewares.use('/api/duitku/check-status', async (req, res) => {
        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const merchantOrderId = data.merchantOrderId || '';
            if (!merchantOrderId) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: true, message: 'Parameter merchantOrderId wajib diisi' }));
              return;
            }

            const { merchantCode, apiKey, env } = await getDevDuitkuConfig();
            if (!merchantCode || !apiKey) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: true, message: 'DUITKU_MERCHANT_CODE belum disetel' }));
              return;
            }

            const stringToSign = `${merchantCode}${merchantOrderId}${apiKey}`;
            const signature = nodeCrypto.createHash('md5').update(stringToSign).digest('hex');

            const apiUrl =
              env === 'production'
                ? 'https://passport.duitku.com/webapi/api/merchant/transactionStatus'
                : 'https://sandbox.duitku.com/webapi/api/merchant/transactionStatus';

            const statusRes = await fetch(apiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                merchantCode,
                merchantOrderId,
                signature,
              }).toString(),
            });

            const statusData = await statusRes.json();
            res.statusCode = statusRes.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(statusData));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: true, message: err?.message || 'Gagal cek status Duitku' }));
          }
        });
      });

      // 4. Test Connection
      server.middlewares.use('/api/duitku/test-connection', async (_req, res) => {
        try {
          const { merchantCode, apiKey, env } = await getDevDuitkuConfig();
          if (!merchantCode || !apiKey) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, message: 'Kredensial Duitku belum lengkap di .env atau database.' }));
            return;
          }

          const now = new Date();
          const pad = (n: number) => String(n).padStart(2, '0');
          const datetime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

          const stringToSign = `${merchantCode}10000${datetime}${apiKey}`;
          const signature = nodeCrypto.createHash('sha256').update(stringToSign).digest('hex');

          const apiUrl =
            env === 'production'
              ? 'https://passport.duitku.com/webapi/api/merchant/paymentmethod/getpaymentmethod'
              : 'https://sandbox.duitku.com/webapi/api/merchant/paymentmethod/getpaymentmethod';

          const pingRes = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              merchantcode: merchantCode,
              amount: '10000',
              datetime,
              signature,
            }),
          });


          const pingData = await pingRes.json();
          if (pingRes.ok && pingData.responseCode === '00') {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              message: `Koneksi Duitku ${env.toUpperCase()} BERHASIL! Saluran pembayaran aktif terdeteksi.`,
              env,
              channelCount: Array.isArray(pingData.paymentFee) ? pingData.paymentFee.length : 0,
            }));
          } else {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              message: pingData.responseMessage || pingData.Message || 'Respon ditolak oleh Duitku. Periksa Merchant Code dan API Key.',
              details: pingData,
            }));
          }
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, message: err?.message || 'Gagal menghubungi server Duitku' }));
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
      duitkuDevPlugin(),
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
