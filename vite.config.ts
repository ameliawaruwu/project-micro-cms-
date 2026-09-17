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
            const env = process.env.VITE_MIDTRANS_ENV || 'sandbox';
            const apiUrl =
              env === 'production'
                ? 'https://app.midtrans.com/snap/v1/transactions'
                : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

            const payload: any = {
              transaction_details: {
                order_id: data.orderId || `ORDER-${Date.now()}`,
                gross_amount: Math.round(data.grossAmount || 10000),
              },
              customer_details: {
                first_name: data.customerName || 'Pembeli',
                phone: data.customerPhone || '08123456789',
                email: data.customerEmail || 'customer@example.com',
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
    },
  };
}

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
              res.end(JSON.stringify({ error: 'Missing required fields' }));
              return;
            }

            const smtpEmail = process.env.SMTP_EMAIL;
            const smtpPassword = process.env.SMTP_PASSWORD;

            if (!smtpEmail || !smtpPassword) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Server configuration error' }));
              return;
            }

            const nodemailer = await import('nodemailer');
            const isGmail = smtpEmail.toLowerCase().includes('@gmail.com');
            const transporter = nodemailer.createTransport({
              host: isGmail ? 'smtp.gmail.com' : 'smtp.ethereal.email',
              port: 587,
              secure: false, // true for 465, false for other ports
              requireTLS: true,
              auth: {
                user: smtpEmail,
                pass: smtpPassword,
              },
            });


            const info = await transporter.sendMail({
              from: `"Kroombox" <${smtpEmail}>`,
              to,
              subject,
              html,
            });

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, messageId: info.messageId }));
          } catch (err: any) {
            console.error('Email sending error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Internal server error' }));
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), midtransDevPlugin(), emailDevPlugin()],
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
