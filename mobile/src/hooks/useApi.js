import axios from 'axios';
import { API_BASE_URL } from '../config';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * GET /api/v1/alerts → array of alerts
 */
export async function fetchAlerts() {
  try {
    const res = await api.get('/api/v1/alerts');
    return res.data.alerts || [];
  } catch (err) {
    console.log('fetchAlerts error:', err.message);
    return [];
  }
}

/**
 * GET /api/v1/shelters → array of shelters
 */
export async function fetchShelters() {
  try {
    const res = await api.get('/api/v1/shelters');
    return res.data.shelters || [];
  } catch (err) {
    console.log('fetchShelters error:', err.message);
    return [];
  }
}

/**
 * GET /api/v1/risk-scores/latest → risk score object
 */
export async function fetchRiskScore() {
  try {
    const res = await api.get('/api/v1/risk-scores/latest');
    return res.data;
  } catch (err) {
    console.log('fetchRiskScore error:', err.message);
    return { fused_score: 0, alert_level: 'Monitor', flood_risk: 0, earthquake_risk: 0, cyclone_risk: 0 };
  }
}

/**
 * POST /api/v1/reports → submit citizen report
 */
export async function submitReport(reportData) {
  try {
    await api.post('/api/v1/reports', {
      name: reportData.name,
      location: reportData.location,
      hazard_type: reportData.hazardType || reportData.hazard_type,
      description: reportData.description,
      timestamp: reportData.timestamp || new Date().toISOString(),
    });
    return { success: true };
  } catch (err) {
    console.log('submitReport error:', err.message);
    return { success: false };
  }
}

/**
 * GET /health → check backend status
 */
export async function checkHealth() {
  try {
    const res = await api.get('/health');
    return res.data.status === 'ok';
  } catch {
    return false;
  }
}
