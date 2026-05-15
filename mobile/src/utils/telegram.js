import { TG_TOKEN, TG_CHAT } from '../config';

/**
 * Send an alert message to the Telegram bot.
 * Falls silently if token/chat not configured.
 */
export async function sendTelegramAlert(message) {
  if (!TG_TOKEN || !TG_CHAT) {
    console.log('Telegram not configured — skipping');
    return;
  }
  try {
    const url = `https://api.telegram.org/bot${TG_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TG_CHAT,
        text: message,
        parse_mode: 'HTML',
      }),
    });
    const data = await response.json();
    if (data.ok) {
      console.log('Telegram alert sent ✅');
    } else {
      console.log('Telegram error:', data.description);
    }
  } catch (error) {
    console.log('Telegram failed:', error.message);
  }
}
