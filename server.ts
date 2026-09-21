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

// 3. Endpoint Midtrans Snap Token dengan Validasi Nominal di Sisi Server
app.post('/api/midtrans/snap-token', async (req, res) => {
  try {
    const data = req.body || {};
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    if (!serverKey) {
      return res.status(500).json({ error: 'MIDTRANS_SERVER_KEY tidak ditemukan di .env' });
    }

    const rawAmount = Number(data.grossAmount);
    if (isNaN(rawAmount) || rawAmount <= 0) {
      return res.status(400).json({ error: 'Nominal transaksi tidak valid (harus lebih besar dari Rp 0)' });
    }
    if (rawAmount > 500_000_000) {
      return res.status(400).json({ error: 'Nominal transaksi melebihi batas maksimum' });
    }

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
      return res.status(midtransRes.status).json({
        error: true,
        message: midtransData.error_messages ? midtransData.error_messages.join(', ') : 'Midtrans API Error',
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
