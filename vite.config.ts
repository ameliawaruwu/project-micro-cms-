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
            const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-zR9u3M2vX8pLk1A0yW4t';
            const env = process.env.VITE_MIDTRANS_ENV || 'sandbox';
            const apiUrl =
              env === 'production'
                ? 'https://app.midtrans.com/snap/v1/transactions'
                : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

            const payload = {
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

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), midtransDevPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
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
