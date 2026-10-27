// This helper has no server-only dependencies (no database imports) so it is
// safe to use from both client and server components.
export function whatsappLink(number: string, message: string) {
  const digits = number.replace(/[^\d]/g, "");
  // Convert a local Algerian number (0X XXXXXXXX) to international format (213X XXXXXXXX)
  const international = digits.startsWith("0") ? `213${digits.slice(1)}` : digits;
  return `https://wa.me/${international}?text=${encodeURIComponent(message)}`;
}
