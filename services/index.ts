// سيتم الحفاظ على منطق الواتساب بناءً على السكيما (Section 6)
export const sendWhatsAppNotification = (phone: string, message: string) => {
  const waText = encodeURIComponent(message);
  const whatsappLink = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '201019672878'}?text=${waText}`;
  return whatsappLink;
};
