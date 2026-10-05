export function getWhatsAppNumber(): string {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "237697982437";
  return raw.replace(/\D/g, "");
}
