const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const APP    = process.env.APP_URL    || 'http://localhost:5173';

function baseTemplate(content) {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Selecta</title></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 16px;">
  <tr><td align="center">
    <table width="100%" style="max-width:480px;background:#ffffff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden;">
      <tr><td style="padding:32px 32px 0;text-align:center;">
        <span style="font-size:22px;font-weight:700;color:#111827;letter-spacing:-0.5px;">Selecta</span>
      </td></tr>
      <tr><td style="padding:24px 32px 32px;">${content}</td></tr>
      <tr><td style="padding:20px 32px;background:#f9fafb;border-top:1px solid #f3f4f6;text-align:center;">
        <p style="margin:0;font-size:12px;color:#9ca3af;">Este email fue enviado automáticamente. No respondas a este mensaje.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

async function sendVerificationEmail(to, name, token) {
  const link = `${APP}/verify-email?token=${token}`;
  const html = baseTemplate(`
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111827;">Verificá tu cuenta</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">Hola ${name}, hacé click en el botón para activar tu cuenta en Selecta.</p>
    <a href="${link}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 28px;border-radius:10px;">Verificar mi cuenta</a>
    <p style="margin:20px 0 0;font-size:13px;color:#9ca3af;">Este link expira en 24 horas. Si no creaste una cuenta, ignorá este email.</p>
  `);
  await resend.emails.send({ from: FROM, to, subject: 'Verificá tu cuenta en Selecta', html });
}

async function sendResetEmail(to, name, token) {
  const link = `${APP}/reset-password?token=${token}`;
  const html = baseTemplate(`
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111827;">Recuperá tu contraseña</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">Hola ${name}, recibimos una solicitud para restablecer tu contraseña. Hacé click abajo para elegir una nueva.</p>
    <a href="${link}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 28px;border-radius:10px;">Restablecer contraseña</a>
    <p style="margin:20px 0 0;font-size:13px;color:#9ca3af;">Este link expira en 1 hora. Si no solicitaste esto, ignorá este email.</p>
  `);
  await resend.emails.send({ from: FROM, to, subject: 'Recuperá tu contraseña de Selecta', html });
}

module.exports = { sendVerificationEmail, sendResetEmail };
