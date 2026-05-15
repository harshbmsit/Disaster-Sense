# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Telegram Bot Integration for DisasterSense Backend
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
# Add these to backend/.env:
#   TELEGRAM_BOT_TOKEN=8488639254:AAE_zZvqwATz8vQT9p5Com4BGFfjdgGnc2k
#   TELEGRAM_CHAT_IDS=5250795020
#
# Then add this to app/main.py:

import os
import httpx


async def send_telegram_alert(message: str):
    """Send an alert to Telegram bot."""
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_IDS")
    if not token or not chat_id:
        return
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    try:
        async with httpx.AsyncClient() as client:
            await client.post(url, json={
                "chat_id": chat_id,
                "text": message,
                "parse_mode": "HTML"
            })
    except Exception as e:
        print(f"Telegram error: {e}")


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Usage in run_ingestion() after saving risk score:
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
# if fused_score >= 60:
#     await send_telegram_alert(
#         f"🚨 <b>DisasterSense Backend Alert</b>\n"
#         f"Fused Score: {fused_score:.1f}/100\n"
#         f"Level: {alert_level}\n"
#         f"Flood: {flood_risk:.1f}/100\n"
#         f"Earthquake: {earthquake_risk:.1f}/100\n"
#         f"Cyclone: {cyclone_risk:.1f}/100"
#     )
#
# Also add 'httpx' to backend requirements.txt:
#   pip install httpx
