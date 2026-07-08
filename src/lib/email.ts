import nodemailer from "nodemailer";

export type SendEmailResult = { sent: boolean; provider: "resend" | "smtp" | "console" };

function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? "http://localhost:3000").replace(
    /\/$/,
    ""
  );
}

function fromAddress(): string {
  return process.env.EMAIL_FROM ?? "no-reply@mallanet.org";
}

/** True when Resend or SMTP is configured (not console fallback). */
export function isEmailDeliveryConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() || process.env.SMTP_HOST?.trim());
}

async function sendViaResend(to: string, subject: string, text: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return false;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress(),
      to: [to],
      subject,
      text,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${body.slice(0, 300)}`);
  }
  return true;
}

async function sendViaSmtp(to: string, subject: string, text: string): Promise<boolean> {
  const host = process.env.SMTP_HOST?.trim();
  if (!host) return false;

  const port = Number(process.env.SMTP_PORT || "465");
  const user = process.env.SMTP_USERNAME?.trim();
  const pass = process.env.SMTP_PASSWORD ?? "";
  const from = process.env.SMTP_FROM?.trim() || fromAddress();

  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user ? { user, pass } : undefined,
  });

  await transport.sendMail({ from, to, subject, text });
  return true;
}

/**
 * Envío de emails.
 * Prioridad: RESEND_API_KEY → SMTP_* → consola (solo sin proveedor).
 */
export async function sendEmail(to: string, subject: string, body: string): Promise<SendEmailResult> {
  if (process.env.RESEND_API_KEY?.trim()) {
    await sendViaResend(to, subject, body);
    return { sent: true, provider: "resend" };
  }

  if (process.env.SMTP_HOST?.trim()) {
    await sendViaSmtp(to, subject, body);
    return { sent: true, provider: "smtp" };
  }

  console.log(`\n===== EMAIL a ${to} =====\n${subject}\n\n${body}\n=====================\n`);
  if (process.env.NODE_ENV === "production") {
    console.error("[email] No hay RESEND_API_KEY ni SMTP_HOST — el correo no se envió");
  }
  return { sent: false, provider: "console" };
}

export async function sendVerificationEmail(to: string, token: string): Promise<SendEmailResult> {
  const url = `${appUrl()}/api/verify-email?token=${token}`;
  return sendEmail(
    to,
    "Verifica tu email — Venezuela Te Ayuda",
    `Hola, gracias por registrarte en Venezuela Te Ayuda.\n\nVerifica tu email haciendo clic en el siguiente enlace:\n${url}\n\nEl enlace expira en 24 horas. Si no creaste esta cuenta, ignora este mensaje.`
  );
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<SendEmailResult> {
  const url = `${appUrl()}/recuperar/${token}`;
  return sendEmail(
    to,
    "Restablece tu contraseña — Venezuela Te Ayuda",
    `Hola,\n\nRecibimos una solicitud para restablecer la contraseña de tu cuenta en Venezuela Te Ayuda.\n\nUsa este enlace (válido 1 hora):\n${url}\n\nSi no pediste este cambio, ignora este mensaje.`
  );
}
