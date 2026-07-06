/**
 * Envío de emails. En desarrollo (sin proveedor configurado) los mensajes
 * se imprimen en la consola del servidor para poder copiar el enlace.
 * En producción, conectar un proveedor (Resend, SES, etc.) en sendEmail.
 */
export async function sendEmail(to: string, subject: string, body: string) {
  console.log(`\n===== EMAIL a ${to} =====\n${subject}\n\n${body}\n=====================\n`);
}

export async function sendVerificationEmail(to: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/verify-email?token=${token}`;
  await sendEmail(
    to,
    "Verifica tu email — Venezuela Te Ayuda",
    `Hola, gracias por registrarte en Venezuela Te Ayuda.\n\nVerifica tu email haciendo clic en el siguiente enlace:\n${url}\n\nEl enlace expira en 24 horas. Si no creaste esta cuenta, ignora este mensaje.`
  );
}
