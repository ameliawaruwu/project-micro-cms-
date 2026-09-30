import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { deployRouter } from './backend/deployController';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5055;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// In-memory rate limiting untuk email (maks 10 per menit per IP)
const emailRateLimit = new Map<string, { count: number; resetAt: number }>();

// 1. Endpoint Kirim Email dengan Proteksi Anti-Spam & Rate Limiting
app.post('/api/send-email', async (req, res) => {
  try {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const limitInfo = emailRateLimit.get(clientIp);

    if (limitInfo && now < limitInfo.resetAt) {
      if (limitInfo.count >= 10) {
        return res.status(429).json({ error: 'Terlalu banyak permintaan pengiriman email. Silakan coba lagi beberapa saat lagi.' });
      }
      limitInfo.count += 1;
    } else {
      emailRateLimit.set(clientIp, { count: 1, resetAt: now + 60_000 });
    }

    const { to, subject, html } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Field to, subject, dan html wajib diisi' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(to).trim())) {
      return res.status(400).json({ error: 'Format email tujuan tidak valid' });
    }

    if (String(subject).length > 200) {
      return res.status(400).json({ error: 'Subjek email maksimal 200 karakter' });
    }

    if (String(html).length > 100_000) {
      return res.status(400).json({ error: 'Ukuran konten email melebihi batas (maks 100KB)' });
    }

    const smtpEmail = process.env.SMTP_EMAIL;
    const smtpPassword = process.env.SMTP_PASSWORD;

    if (!smtpEmail || !smtpPassword) {
      console.error('SMTP credentials are not configured in .env');
      return res.status(500).json({ error: 'Konfigurasi SMTP server belum tersedia' });
    }

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

    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// 2. Endpoint Proxy Cek Ongkir Biteship (Menyembunyikan BITESHIP_API_KEY dari Client)
app.post('/api/shipping/rates', async (req, res) => {
  try {
    const apiKey = process.env.BITESHIP_API_KEY || '';
    if (!apiKey) {
      return res.status(500).json({ error: 'BITESHIP_API_KEY belum dikonfigurasi di server .env' });
    }

    const { origin_postal_code, destination_postal_code, couriers, weight } = req.body;
    if (!origin_postal_code || !destination_postal_code) {
      return res.status(400).json({ error: 'Kode pos asal dan tujuan harus diisi' });
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
    return res.status(biteshipRes.status).json(biteshipData);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Gagal menghubungi Biteship API' });
  }
});

// Helper untuk mendapatkan kredensial Midtrans dari env atau database platform_settings
async function getMidtransConfig() {
  let serverKey = (process.env.MIDTRANS_SERVER_KEY || '').trim();
  let clientKey = (process.env.VITE_MIDTRANS_CLIENT_KEY || '').trim();
  let env = (process.env.VITE_MIDTRANS_ENV || 'sandbox').trim().toLowerCase();

  // Jika serverKey belum diisi di .env atau ingin fallback ke Supabase platform_settings
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
      // Fallback silently to process.env
    }
  }

  serverKey = serverKey.replace(/^["']|["']$/g, '').trim();
  clientKey = clientKey.replace(/^["']|["']$/g, '').trim();
  env = env.replace(/^["']|["']$/g, '').trim().toLowerCase();

  return { serverKey, clientKey, env };
}

// 3. Endpoint Midtrans Snap Token dengan Validasi Nominal di Sisi Server
app.post('/api/midtrans/snap-token', async (req, res) => {
  try {
    const data = req.body || {};
    const { serverKey, env } = await getMidtransConfig();

    if (!serverKey) {
      return res.status(500).json({ error: true, message: 'MIDTRANS_SERVER_KEY belum dikonfigurasi di server .env atau Pengaturan Admin.' });
    }

    const rawAmount = Number(data.grossAmount);
    if (isNaN(rawAmount) || rawAmount <= 0) {
      return res.status(400).json({ error: true, message: 'Nominal transaksi tidak valid (harus lebih besar dari Rp 0)' });
    }
    if (rawAmount > 500_000_000) {
      return res.status(400).json({ error: true, message: 'Nominal transaksi melebihi batas maksimum' });
    }

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
      payload.enabled_payments = data.enabledPayments.map((p: string) => (p === 'mandiri_bill' ? 'echannel' : p));
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
    if (!midtransRes.ok) {
      let errorMsg = 'Midtrans API Error';
      if (Array.isArray(midtransData?.error_messages) && midtransData.error_messages.length > 0) {
        errorMsg = midtransData.error_messages.join(', ');
      } else if (midtransData?.status_message) {
        errorMsg = midtransData.status_message;
      } else if (midtransData?.error === 'Unauthorized' || midtransRes.status === 401) {
        errorMsg = 'Kunci MIDTRANS_SERVER_KEY tidak valid atau belum diotorisasi di Midtrans (401 Unauthorized). Pastikan Server Key Sandbox Anda sesuai di Midtrans Merchant Portal.';
      } else if (typeof midtransData?.error === 'string') {
        errorMsg = midtransData.error;
      } else if (typeof midtransData?.message === 'string') {
        errorMsg = midtransData.message;
      }

      return res.status(midtransRes.status).json({
        error: true,
        message: errorMsg,
        details: midtransData,
      });
    }

    return res.status(200).json({
      token: midtransData.token,
      redirectUrl: midtransData.redirect_url,
    });
  } catch (err: any) {
    return res.status(500).json({ error: true, message: err?.message || 'Internal Server Error' });
  }
});

// 3b. Endpoint Cek Status Pembayaran Midtrans Langsung dari Server
app.get('/api/midtrans/status', async (req, res) => {
  try {
    const orderId = String(req.query.orderId || '').trim();
    if (!orderId) {
      return res.status(400).json({ error: true, message: 'Parameter orderId wajib disertakan' });
    }

    const { serverKey, env } = await getMidtransConfig();
    if (!serverKey) {
      return res.status(500).json({ error: true, message: 'MIDTRANS_SERVER_KEY belum dikonfigurasi' });
    }

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
    return res.status(statusRes.status).json(statusData);
  } catch (err: any) {
    return res.status(500).json({ error: true, message: err?.message || 'Gagal mengecek status transaksi Midtrans' });
  }
});

// 3c. Endpoint Tes Ping & Diagnosa Kunci Midtrans
app.get('/api/midtrans/test-ping', async (_req, res) => {
  try {
    const { serverKey, env } = await getMidtransConfig();
    if (!serverKey) {
      return res.status(400).json({ success: false, message: 'MIDTRANS_SERVER_KEY belum disetel' });
    }

    const apiUrl =
      env === 'production'
        ? 'https://app.midtrans.com/snap/v1/transactions'
        : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

    // Test authorization with a dummy transaction
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
    if (testRes.ok && data.token) {
      return res.status(200).json({
        success: true,
        message: `Koneksi Midtrans ${env.toUpperCase()} BERHASIL! Token Snap berhasil dibuat.`,
        env,
        maskedKey: serverKey.slice(0, 12) + '...',
      });
    } else if (testRes.status === 401) {
      return res.status(401).json({
        success: false,
        message: `Server Key Midtrans ${env.toUpperCase()} ditolak (401 Unauthorized). Silakan periksa Server Key di dashboard Midtrans (Settings > Access Keys).`,
        env,
        details: data,
      });
    } else {
      return res.status(testRes.status).json({
        success: false,
        message: data.message || (Array.isArray(data.error_messages) ? data.error_messages.join(', ') : 'Respon gagal dari Midtrans'),
        env,
        details: data,
      });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Gagal menghubungi server Midtrans' });
  }
});

// 4. Webhook Notifikasi Midtrans dengan Verifikasi Signature SHA-512
app.post('/api/midtrans/notification', async (req, res) => {
  try {
    const notif = req.body || {};
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    const orderId = notif.order_id || '';
    const statusCode = notif.status_code || '';
    const grossAmount = notif.gross_amount || '';
    const receivedSignature = notif.signature_key || '';

    const expectedSignature = crypto
      .createHash('sha512')
      .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
      .digest('hex');

    if (receivedSignature.toLowerCase() !== expectedSignature.toLowerCase()) {
      return res.status(403).json({ error: 'Invalid Midtrans Signature Key' });
    }

    return res.status(200).json({ success: true, message: 'Notification verified successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Webhook processing error' });
  }
});

// ==========================================
// 4b. DUITKU PAYMENT GATEWAY ENDPOINTS
// ==========================================

async function getDuitkuConfig(): Promise<{ merchantCode: string; apiKey: string; env: 'sandbox' | 'production' }> {
  let merchantCode = process.env.DUITKU_MERCHANT_CODE || '';
  let apiKey = process.env.DUITKU_API_KEY || '';
  let env: 'sandbox' | 'production' = (process.env.DUITKU_ENV as any) === 'production' ? 'production' : 'sandbox';

  // Baca ulang file .env dari disk secara langsung agar selalu sinkron jika diedit
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const parsed = dotenv.parse(fs.readFileSync(envPath, 'utf8'));
      if (parsed.DUITKU_MERCHANT_CODE) merchantCode = parsed.DUITKU_MERCHANT_CODE;
      if (parsed.DUITKU_API_KEY) apiKey = parsed.DUITKU_API_KEY;
      if (parsed.DUITKU_ENV) env = parsed.DUITKU_ENV.toLowerCase() === 'production' ? 'production' : 'sandbox';
    }
  } catch {}

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
      // Fallback to process.env
    }
  }

  merchantCode = merchantCode.replace(/^["']|["']$/g, '').trim();
  apiKey = apiKey.replace(/^["']|["']$/g, '').trim();

  return { merchantCode, apiKey, env };
}

// 4b.1 Get Payment Methods (Metode Pembayaran Aktif Duitku)
app.post('/api/duitku/payment-methods', async (req, res) => {
  try {
    const { merchantCode, apiKey, env } = await getDuitkuConfig();
    if (!merchantCode || !apiKey) {
      return res.status(500).json({ error: true, message: 'DUITKU_MERCHANT_CODE atau DUITKU_API_KEY belum dikonfigurasi.' });
    }

    const rawAmount = Number(req.body?.amount || 10000);
    const amount = isNaN(rawAmount) || rawAmount <= 0 ? 10000 : Math.round(rawAmount);

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const datetime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    // Postman: CryptoJS.SHA256(merchantcode + paymentAmount + datetime + apiKey)
    const hashText = `${merchantCode}${amount}${datetime}${apiKey}`;
    const signature = crypto.createHash('sha256').update(hashText).digest('hex');

    const apiUrl =
      env === 'production'
        ? 'https://passport.duitku.com/webapi/api/merchant/paymentmethod/getpaymentmethod'
        : 'https://sandbox.duitku.com/webapi/api/merchant/paymentmethod/getpaymentmethod';

    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        merchantcode: merchantCode,
        amount: String(amount),
        datetime,
        signature,
      }),
    });

    const data = await resp.json();
    return res.status(resp.status).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: true, message: err?.message || 'Gagal mengambil metode pembayaran Duitku' });
  }
});

// 4b.2 Create Invoice / Inquiry Duitku (v2/inquiry)
app.post('/api/duitku/create-invoice', async (req, res) => {
  try {
    const data = req.body || {};
    const { merchantCode, apiKey, env } = await getDuitkuConfig();

    if (!merchantCode || !apiKey) {
      return res.status(500).json({
        error: true,
        message: 'Kredensial Duitku belum lengkap (DUITKU_MERCHANT_CODE atau DUITKU_API_KEY belum diisi di .env atau Pengaturan Admin).',
      });
    }

    const rawAmount = Number(data.grossAmount || data.paymentAmount);
    if (isNaN(rawAmount) || rawAmount <= 0) {
      return res.status(400).json({ error: true, message: 'Nominal transaksi tidak valid (harus lebih besar dari Rp 0)' });
    }

    const paymentAmount = Math.round(rawAmount);
    const merchantOrderId = String(data.orderId || `ORDER-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50);
    const productDetails = String(data.productDetails || 'Pembayaran Toko').slice(0, 255);
    const customerVaName = String(data.customerName || 'Pelanggan').slice(0, 20);
    const email = String(data.customerEmail || 'customer@example.com').trim().slice(0, 100);
    const phoneNumber = String(data.customerPhone || '08123456789').replace(/[^0-9+]/g, '').slice(0, 20);
    let paymentMethod = String(data.paymentMethod || '').trim();
    if (!paymentMethod) {
      paymentMethod = 'SP'; // Default ShopeePay QRIS jika tidak ditentukan
    } else {
      const pmLower = paymentMethod.toLowerCase();
      if (pmLower === 'qris' || pmLower.includes('qris') || pmLower.includes('gopay') || pmLower.includes('shopee')) {
        paymentMethod = 'SP';
      } else if (pmLower === 'bca_va' || pmLower.includes('bca') || pmLower === 'va' || pmLower.includes('virtual_account')) {
        paymentMethod = 'BC';
      } else if (pmLower.includes('bri')) {
        paymentMethod = 'BR';
      } else if (pmLower.includes('mandiri') || pmLower.includes('echannel')) {
        paymentMethod = 'M2';
      } else if (pmLower.includes('bni')) {
        paymentMethod = 'I1';
      } else if (pmLower.includes('permata')) {
        paymentMethod = 'BT';
      }
    }

    // Postman: CryptoJS.MD5(merchantCode + merchantOrderId + paymentAmount + apiKey)
    const hashText = `${merchantCode}${merchantOrderId}${paymentAmount}${apiKey}`;
    const signature = crypto.createHash('md5').update(hashText).digest('hex');

    const appUrl = (process.env.APP_URL || 'https://kroomify.kroombox.com').replace(/\/$/, '');
    const callbackUrl = `${appUrl}/api/payment/callback`;
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const duitkuData = await duitkuRes.json();
    if (!duitkuRes.ok || (duitkuData.statusCode && duitkuData.statusCode !== '00')) {
      const errorMsg = duitkuData.statusMessage || duitkuData.Message || 'Gagal memproses transaksi di Duitku';
      return res.status(duitkuRes.ok ? 400 : duitkuRes.status).json({
        error: true,
        message: errorMsg,
        details: duitkuData,
      });
    }

    return res.status(200).json({
      success: true,
      reference: duitkuData.reference,
      paymentUrl: duitkuData.paymentUrl,
      vaNumber: duitkuData.vaNumber,
      qrString: duitkuData.qrString,
      amount: duitkuData.amount,
      statusCode: duitkuData.statusCode,
      statusMessage: duitkuData.statusMessage,
    });
  } catch (err: any) {
    return res.status(500).json({ error: true, message: err?.message || 'Internal Server Error pada Duitku' });
  }
});

// 4b.3 Check Transaction Status
app.post('/api/duitku/check-status', async (req, res) => {
  try {
    const { merchantOrderId } = req.body || {};
    if (!merchantOrderId) {
      return res.status(400).json({ error: true, message: 'Parameter merchantOrderId wajib diisi' });
    }

    const { merchantCode, apiKey, env } = await getDuitkuConfig();
    if (!merchantCode || !apiKey) {
      return res.status(500).json({ error: true, message: 'DUITKU_MERCHANT_CODE belum dikonfigurasi' });
    }

    // Postman: CryptoJS.MD5(merchantCode + merchantOrderId + apiKey)
    const hashText = `${merchantCode}${merchantOrderId}${apiKey}`;
    const signature = crypto.createHash('md5').update(hashText).digest('hex');

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

    const data = await statusRes.json();
    return res.status(statusRes.status).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: true, message: err?.message || 'Gagal memeriksa status Duitku' });
  }
});

// 4b.4 Test Connection Duitku
app.post('/api/duitku/test-connection', async (req, res) => {
  try {
    const { merchantCode, apiKey, env } = await getDuitkuConfig();
    if (!merchantCode || !apiKey) {
      return res.status(400).json({
        success: false,
        message: 'Kredensial Duitku belum lengkap di .env atau database (Merchant Code / API Key kosong).',
      });
    }

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const datetime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    // Postman: CryptoJS.SHA256(merchantcode + paymentAmount + datetime + apiKey)
    const hashText = `${merchantCode}10000${datetime}${apiKey}`;
    const signature = crypto.createHash('sha256').update(hashText).digest('hex');

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

    const data = await pingRes.json();
    if (pingRes.ok && (data.responseCode === '00' || Array.isArray(data.paymentFee))) {
      return res.status(200).json({
        success: true,
        message: `Koneksi Duitku ${env.toUpperCase()} BERHASIL! Saluran pembayaran aktif terdeteksi.`,
        env,
        channelCount: Array.isArray(data.paymentFee) ? data.paymentFee.length : 0,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: data.responseMessage || data.Message || 'Respon ditolak oleh Duitku. Periksa Merchant Code dan API Key.',
        details: data,
      });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Gagal menghubungi server Duitku' });
  }
});

// 4b.5 Duitku Webhook Callback (Notifikasi Pembayaran)
// Mendukung endpoint elegan /api/payment/callback, /api/callback, dan /api/duitku/callback
app.post(['/api/payment/callback', '/api/callback', '/api/duitku/callback'], async (req, res) => {
  try {
    const { merchantCode: receivedCode, amount, merchantOrderId, signature, resultCode, reference } = req.body || {};
    const { merchantCode, apiKey } = await getDuitkuConfig();

    if (!merchantOrderId || !amount || !signature) {
      return res.status(400).send('Bad Parameter');
    }

    const code = receivedCode || merchantCode;
    // Cek kalkulasi signature (mendukung format MD5 maupun SHA256)
    const md5Signature = crypto.createHash('md5').update(`${code}${amount}${merchantOrderId}${apiKey}`).digest('hex');
    const sha256Signature = crypto.createHash('sha256').update(`${code}${amount}${merchantOrderId}${apiKey}`).digest('hex');
    const hmacSignature = crypto.createHmac('sha256', apiKey).update(`${code}${amount}${merchantOrderId}`).digest('hex');

    const isValid =
      signature.toLowerCase() === md5Signature.toLowerCase() ||
      signature.toLowerCase() === sha256Signature.toLowerCase() ||
      signature.toLowerCase() === hmacSignature.toLowerCase();

    if (!isValid) {
      console.warn(`[Duitku Callback] Invalid Signature for order ${merchantOrderId}`);
      return res.status(400).send('Wrong Signature');
    }

    console.log(`[Duitku Callback] Pembayaran Order ${merchantOrderId} status: ${resultCode} (Ref: ${reference})`);

    // Jika pembayaran berhasil (00)
    if (resultCode === '00') {
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseAnonKey) {
        // Update Order di database
        await fetch(`${supabaseUrl}/rest/v1/orders?order_number=eq.${encodeURIComponent(merchantOrderId)}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            payment_status: 'paid',
            order_status: 'processing',
            updated_at: new Date().toISOString(),
          }),
        }).catch(() => {});
      }
    }

    // Duitku mewajibkan respon HTTP 200 dengan text "Success" atau "OK"
    return res.status(200).send('Success');
  } catch (err: any) {
    console.error('[Duitku Callback Error]', err);
    return res.status(500).send(err?.message || 'Internal Error');
  }
});


// 5. Endpoint Auto-Deploy Toko (Packaging Webroot, Nginx Vhost & Cloudflare Tunnel Ingress)

app.use('/deploy', deployRouter);
app.use('/api/deploy', deployRouter);
app.use('/', deployRouter); // Kompatibilitas rute domainService.ts (/cloudflare/*)
app.use('/api', deployRouter);

app.listen(PORT, () => {
  console.log(`Server is running securely on http://localhost:${PORT}`);
});
