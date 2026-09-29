import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { deployRouter } from './backend/deployController';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5055;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

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
          if (!serverKey && dbRow.midtrans_server_key) {
            serverKey = dbRow.midtrans_server_key.trim();
          }
          if (!clientKey && dbRow.midtrans_client_key) {
            clientKey = dbRow.midtrans_client_key.trim();
          }
          if (dbRow.midtrans_environment) {
            env = dbRow.midtrans_environment.trim().toLowerCase();
          }
        }
      }
    } catch {
      // Fallback silently to process.env
    }
  }

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

// 5. Endpoint Auto-Deploy Toko (Packaging Webroot, Nginx Vhost & Cloudflare Tunnel Ingress)
app.use('/deploy', deployRouter);
app.use('/api/deploy', deployRouter);
app.use('/', deployRouter); // Kompatibilitas rute domainService.ts (/cloudflare/*)
app.use('/api', deployRouter);

app.listen(PORT, () => {
  console.log(`Server is running securely on http://localhost:${PORT}`);
});
