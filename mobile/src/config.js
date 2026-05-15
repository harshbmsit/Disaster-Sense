import { GOOGLE_MAPS_API_KEY, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_IDS } from '@env';

export const API_BASE_URL = 'http://172.45.1.111:8000';
export const WS_URL = 'ws://172.45.1.111:8000/ws/live-updates';
export const MAPS_KEY = GOOGLE_MAPS_API_KEY || '';
export const TG_TOKEN = TELEGRAM_BOT_TOKEN || '';
export const TG_CHAT = TELEGRAM_CHAT_IDS || '';
