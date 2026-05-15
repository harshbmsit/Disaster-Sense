import { useState, useEffect, useRef } from 'react';

const BACKEND_URL = 'http://172.45.1.111:8000';
const WS_URL = 'ws://172.45.1.111:8000/ws/live-updates';

export function useBackendData() {
  const [riskScores, setRiskScores] = useState({
    flood_risk: 18,
    earthquake_risk: 45,
    cyclone_risk: 32,
    fused_score: 31,
    alert_level: 'Advisory',
    alert_color: 'blue'
  });
  const [alerts, setAlerts] = useState([]);
  const [riskGrid, setRiskGrid] = useState([]);
  const [sensorData, setSensorData] = useState(null);
  const [shelters, setShelters] = useState([]);
  const [rescueTeams, setRescueTeams] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const wsRef = useRef(null);

  // WebSocket for live risk scores (updates every 5 seconds)
  useEffect(() => {
    function connectWebSocket() {
      try {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('✅ WebSocket connected');
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setRiskScores(data);
            setLastUpdated(new Date().toLocaleTimeString());
          } catch (e) {
            console.error('WebSocket parse error:', e);
          }
        };

        ws.onclose = () => {
          console.log('⚠️ WebSocket disconnected — reconnecting in 3s');
          setIsConnected(false);
          setTimeout(connectWebSocket, 3000);
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        };
      } catch (e) {
        console.error('WebSocket connection failed:', e);
        setTimeout(connectWebSocket, 3000);
      }
    }

    connectWebSocket();

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Fetch alerts from GET /api/v1/alerts
  useEffect(() => {
    async function fetchAlerts() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/v1/alerts`);
        const data = await res.json();
        
        // Backend returns { alerts: [...], total: N }
        const alertsArray = data.alerts || data;
        
        // Filter out junk test entries where type is "string"
        const realAlerts = alertsArray.filter(a => 
          a.type && a.type !== "string" && a.level !== "string"
        );
        
        if (realAlerts.length > 0) {
          setAlerts(realAlerts);
        }
      } catch (e) {
        console.error('Failed to fetch alerts:', e);
        // Keep existing mock data as fallback
      }
    }
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch risk grid from GET /api/v1/risk-grid
  useEffect(() => {
    async function fetchRiskGrid() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/v1/risk-grid`);
        const data = await res.json();
        if (data && data.length > 0) setRiskGrid(data);
      } catch (e) {
        console.error('Failed to fetch risk grid:', e);
        // Keep mock data if fetch fails
      }
    }
    fetchRiskGrid();
    const interval = setInterval(fetchRiskGrid, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch sensor data from GET /api/v1/sensor-data
  useEffect(() => {
    async function fetchSensorData() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/v1/sensor-data`);
        const data = await res.json();
        if (data) setSensorData(data);
      } catch (e) {
        console.error('Failed to fetch sensor data:', e);
      }
    }
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch shelters from GET /api/v1/shelters
  useEffect(() => {
    async function fetchShelters() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/v1/shelters`);
        const data = await res.json();
        const shelterArray = data.shelters || data;
        if (shelterArray && shelterArray.length > 0) setShelters(shelterArray);
      } catch (e) {
        console.error('Failed to fetch shelters:', e);
      }
    }
    fetchShelters();
    const interval = setInterval(fetchShelters, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch rescue teams from GET /api/v1/rescue-teams
  useEffect(() => {
    async function fetchRescueTeams() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/v1/rescue-teams`);
        const data = await res.json();
        const teamsArray = data.teams || data;
        if (teamsArray && teamsArray.length > 0) setRescueTeams(teamsArray);
      } catch (e) {
        console.error('Failed to fetch rescue teams:', e);
      }
    }
    fetchRescueTeams();
    const interval = setInterval(fetchRescueTeams, 30000);
    return () => clearInterval(interval);
  }, []);

  return { riskScores, alerts, riskGrid, sensorData, shelters, rescueTeams, isConnected, lastUpdated };
}
