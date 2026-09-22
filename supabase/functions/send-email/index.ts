import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import nodemailer from "npm:nodemailer";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, subject, html } = await req.json();

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const smtpEmail = Deno.env.get('SMTP_EMAIL');
    const smtpPassword = Deno.env.get('SMTP_PASSWORD');

    if (!smtpEmail || !smtpPassword) {
      console.error('SMTP credentials are not configured in environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a Nodemailer transporter using SMTP
    const isGmail = smtpEmail.toLowerCase().includes('@gmail.com');
    
    const transporter = nodemailer.createTransport({
      host: isGmail ? 'smtp.gmail.com' : 'smtp.ethereal.email',
      port: isGmail ? 465 : 587,
      secure: isGmail,
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

    return new Response(
      JSON.stringify({ success: true, messageId: info.messageId }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
});
