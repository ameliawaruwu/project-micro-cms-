import nodemailer from 'nodemailer';
import dns from 'dns';

export class MailerNotConfiguredError extends Error {}

/**
 * Kirim email lewat SMTP (.env: SMTP_EMAIL, SMTP_PASSWORD).
 *
 * Nodemailer v10 melakukan resolusi DNS sendiri (resolve4 + resolve6) lalu memilih alamat secara
 * ACAK, sehingga opsi `family: 4` diabaikan. Di jaringan yang IPv6-nya tidak ter-route keluar, ini
 * menyebabkan "ENETUNREACH". Karena itu IPv4 di-resolve manual dan disambungkan langsung, dengan
 * `servername` asli agar verifikasi sertifikat TLS tetap cocok.
 */
export async function sendMail(to: string, subject: string, html: string): Promise<string> {
  const smtpEmail = process.env.SMTP_EMAIL;
  const smtpPassword = process.env.SMTP_PASSWORD;
  if (!smtpEmail || !smtpPassword) {
    throw new MailerNotConfiguredError('Konfigurasi SMTP server belum tersedia');
  }

  const isGmail = smtpEmail.toLowerCase().includes('@gmail.com');
  const smtpHostname = isGmail ? 'smtp.gmail.com' : 'smtp.ethereal.email';

  const smtpHostIpv4: string = await new Promise((resolve, reject) => {
    dns.resolve4(smtpHostname, (err, addresses) => {
      if (err || !addresses || !addresses.length) {
        return reject(err || new Error(`Gagal resolve alamat IPv4 untuk ${smtpHostname}`));
      }
      resolve(addresses[0]);
    });
  });

  const transporter = nodemailer.createTransport({
    host: smtpHostIpv4,
    port: 587,
    secure: false,
    requireTLS: true,
    tls: { servername: smtpHostname },
    auth: { user: smtpEmail, pass: smtpPassword },
  });

  const info = await transporter.sendMail({
    from: `"LapakQ" <${smtpEmail}>`,
    to,
    subject,
    html,
  });
  return info.messageId;
}
