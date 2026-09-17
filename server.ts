import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Missing required fields (to, subject, html)' });
    }

    const smtpEmail = process.env.SMTP_EMAIL;
    const smtpPassword = process.env.SMTP_PASSWORD;

    if (!smtpEmail || !smtpPassword) {
      console.error('SMTP credentials are not configured in .env');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const isGmail = smtpEmail.toLowerCase().includes('@gmail.com');

    // Create a Nodemailer transporter using SMTP
    const transporter = nodemailer.createTransport({
      host: isGmail ? 'smtp.gmail.com' : 'smtp.ethereal.email',
      port: 465,
      secure: true,
      tls: {
        rejectUnauthorized: false
      },
      auth: {
        user: smtpEmail,
        pass: smtpPassword,
      },
    });

    // Send the email
    const info = await transporter.sendMail({
      from: `"Kroomify" <${smtpEmail}>`,
      to,
      subject,
      html,
    });

    console.log('Email sent successfully:', info.messageId);

    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running locally on http://localhost:${PORT}`);
  console.log('Ready to send emails via SMTP!');
});
