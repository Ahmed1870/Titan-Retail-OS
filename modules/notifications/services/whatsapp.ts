export async function sendWhatsAppMessage(phone: string, message: string) {
  // بروتوكول الربط مع API خارجي (مثال)
  try {
    const response = await fetch(process.env.WHATSAPP_API_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: process.env.WHATSAPP_TOKEN,
        to: phone,
        body: message
      })
    });
    return response.ok;
  } catch (error) {
    console.error("WhatsApp Dispatch Error:", error);
    return false;
  }
}
