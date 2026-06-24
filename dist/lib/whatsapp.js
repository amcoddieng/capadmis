const WAAPI_INSTANCE_ID = process.env.WAAPI_INSTANCE_ID;
const WAAPI_TOKEN = process.env.WAAPI_TOKEN;
export async function sendWhatsApp(telephone, message) {
    if (!WAAPI_INSTANCE_ID || !WAAPI_TOKEN) {
        throw new Error('WAAPI_INSTANCE_ID et WAAPI_TOKEN sont requis dans le .env');
    }
    const chatId = telephone.replace(/\D/g, '').replace(/^\+/, '') + '@c.us';
    console.log('[WaAPI] Envoi vers chatId:', chatId);
    const response = await fetch(`https://waapi.app/api/v1/instances/${WAAPI_INSTANCE_ID}/client/action/send-message`, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
            'authorization': `Bearer ${WAAPI_TOKEN}`,
        },
        body: JSON.stringify({ chatId, message }),
    });
    const result = await response.json().catch(() => ({}));
    console.log('[WaAPI] Réponse:', JSON.stringify(result));
    if (!response.ok) {
        throw new Error(`WaAPI error ${response.status}: ${JSON.stringify(result)}`);
    }
}
//# sourceMappingURL=whatsapp.js.map