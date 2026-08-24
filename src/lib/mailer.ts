import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const transporter = getTransporter();
  if (!transporter) return false;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: "Redefina sua senha na Lumina",
    text: `Recebemos um pedido para redefinir sua senha. Acesse ${resetUrl} para continuar. Este link expira em 1 hora.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#20252b"><h1 style="font-family:Georgia,serif;font-weight:500">Redefina sua senha.</h1><p>Recebemos um pedido para criar uma nova senha para sua conta Lumina.</p><p><a href="${resetUrl}" style="display:inline-block;background:#20252b;color:#fff;padding:13px 18px;text-decoration:none">Criar nova senha</a></p><p style="color:#788087;font-size:12px">Este link expira em 1 hora. Se você não fez este pedido, ignore este e-mail.</p></div>`,
  });
  return true;
}
