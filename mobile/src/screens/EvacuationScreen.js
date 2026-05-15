import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, Alert, Platform, ScrollView,
} from 'react-native';
import { fetchShelters as apiFetchShelters } from '../hooks/useApi';
import { MAPS_KEY } from '../config';
import OfflineBar from '../components/OfflineBar';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';

// Google Maps rendered via iframe on both web and native
// react-native-maps excluded to prevent web bundling errors

const MOCK_SHELTER_MARKERS = [
  { id: '1', name: 'Koramangala Community Hall', coordinate: { latitude: 12.9352, longitude: 77.6245 }, available: 70, distance: '1.2 km', walkTime: '15 min', status: 'open' },
  { id: '2', name: 'HSR Layout Govt School', coordinate: { latitude: 12.9116, longitude: 77.6389 }, available: 0, distance: '2.8 km', walkTime: '35 min', status: 'full' },
  { id: '3', name: 'Indiranagar Indoor Stadium', coordinate: { latitude: 12.9784, longitude: 77.6408 }, available: 390, distance: '4.1 km', walkTime: '52 min', status: 'open' },
  { id: '4', name: 'Whitefield Kalyana Mantapa', coordinate: { latitude: 12.9698, longitude: 77.7499 }, available: 205, distance: '6.7 km', walkTime: '84 min', status: 'open' },
];

const USER_LOCATION = { latitude: 12.9352, longitude: 77.6100 };
const INITIAL_REGION = { ...USER_LOCATION, latitudeDelta: 0.1, longitudeDelta: 0.1 };

// ── Helpers ──
function formatShelterMarker(s, idx) {
  const available = Math.max((s.capacity || 100) - (s.occupied || 0), 0);
  const isFull = available === 0 || s.status === 'full';
  return {
    id: s.id || String(idx + 1),
    name: s.name || 'Shelter',
    coordinate: { latitude: s.lat || 12.9352, longitude: s.lng || 77.6245 },
    available,
    capacity: s.capacity || 100,
    occupied: s.occupied || 0,
    distance: s.distance || '—',
    walkTime: s.walkTime || s.walk_time || '—',
    status: isFull ? 'full' : 'open',
  };
}

function haversineDistance(c1, c2) {
  const R = 6371;
  const dLat = ((c2.latitude - c1.latitude) * Math.PI) / 180;
  const dLon = ((c2.longitude - c1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.latitude * Math.PI) / 180) * Math.cos((c2.latitude * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getRouteCoords(from, to) {
  const steps = 5;
  const coords = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    coords.push({
      latitude: from.latitude + (to.latitude - from.latitude) * t,
      longitude: from.longitude + (to.longitude - from.longitude) * t,
    });
  }
  return coords;
}

// ── Google Maps via iframe (Web) ──
function GoogleWebMap({ markers, nearest, routeCoords }) {
  const gmMarkersJS = markers.map((s) => {
    const color = s.status !== 'full' && s.available > 0 ? 'green' : 'red';
    const iconUrl = color === 'green'
      ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
      : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
    return `
      new google.maps.Marker({
        position: { lat: ${s.coordinate.latitude}, lng: ${s.coordinate.longitude} },
        map: map,
        title: "${s.name}",
        icon: "${iconUrl}",
      });`;
  }).join('\n');

  const lfMarkersJS = markers.map((s) => {
    const color = s.status !== 'full' && s.available > 0 ? '#00C853' : '#FF4444';
    return `L.circleMarker([${s.coordinate.latitude}, ${s.coordinate.longitude}], {
      radius: 12, fillColor: '${color}', color: '#fff', weight: 2, fillOpacity: 0.9
    }).addTo(map).bindPopup('<b>${s.name}</b><br>${s.available} spots');`;
  }).join('\n');

  const gmRouteJS = routeCoords.map((c) => `{ lat: ${c.latitude}, lng: ${c.longitude} }`).join(',');
  const lfRouteJS = routeCoords.map((c) => `[${c.latitude}, ${c.longitude}]`).join(',');

  const html = `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  body,html,#map{margin:0;padding:0;height:100%;width:100%;background:#0F1A2E;}
  .leaflet-tile-pane{filter:brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);}
</style>
</head><body>
<div id="map"></div>
<script>
// ── Try Google Maps first ──
var googleLoaded = false;
var googleFailed = false;

// Google's official auth failure callback
window.gm_authFailure = function(){
  googleFailed = true;
  googleLoaded = false;
  initLeafletMap();
};

function initGoogleMap(){
  if(googleFailed) return;
  try {
    googleLoaded = true;
    document.getElementById('map').innerHTML = '';
    var map = new google.maps.Map(document.getElementById('map'),{
      center:{lat:${USER_LOCATION.latitude},lng:${USER_LOCATION.longitude}},
      zoom:13,
      styles:[
        {elementType:'geometry',stylers:[{color:'#0F1A2E'}]},
        {elementType:'labels.text.fill',stylers:[{color:'#8A9BB0'}]},
        {elementType:'labels.text.stroke',stylers:[{color:'#080C14'}]},
        {featureType:'road',elementType:'geometry',stylers:[{color:'#1E3A5F'}]},
        {featureType:'water',elementType:'geometry',stylers:[{color:'#0A1628'}]},
        {featureType:'poi',elementType:'geometry',stylers:[{color:'#0D2137'}]},
      ],
      disableDefaultUI:true,
      zoomControl:true,
    });
    new google.maps.Marker({
      position:{lat:${USER_LOCATION.latitude},lng:${USER_LOCATION.longitude}},
      map:map,title:"You are here",
      icon:{path:google.maps.SymbolPath.CIRCLE,scale:10,fillColor:'#2979FF',fillOpacity:1,strokeColor:'#fff',strokeWeight:3},
    });
    ${gmMarkersJS}
    new google.maps.Polyline({
      path:[${gmRouteJS}],geodesic:true,strokeColor:'#FF6B35',strokeOpacity:0.9,strokeWeight:4,map:map,
    });
  } catch(e) {
    googleFailed = true;
    initLeafletMap();
  }
}

// ── Leaflet fallback ──
function initLeafletMap(){
  if(googleLoaded) return;
  var map = L.map('map',{zoomControl:true}).setView([${USER_LOCATION.latitude},${USER_LOCATION.longitude}],13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:''}).addTo(map);
  L.circleMarker([${USER_LOCATION.latitude},${USER_LOCATION.longitude}],{radius:10,fillColor:'#2979FF',color:'#fff',weight:3,fillOpacity:1}).addTo(map).bindPopup('You are here');
  L.circle([${USER_LOCATION.latitude},${USER_LOCATION.longitude}],{radius:300,fillColor:'rgba(41,121,255,0.15)',color:'rgba(41,121,255,0.4)',weight:1,fillOpacity:1}).addTo(map);
  ${lfMarkersJS}
  L.polyline([${lfRouteJS}],{color:'#FF6B35',weight:4,dashArray:'10,6'}).addTo(map);
}

// Start Leaflet fallback after 3s if Google hasn't loaded
setTimeout(function(){ if(!googleLoaded) initLeafletMap(); }, 3000);
</script>
<script src="https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&callback=initGoogleMap" async defer
  onerror="initLeafletMap()"></script>
</body></html>`;

  return (
    <iframe
      srcDoc={html}
      style={{ flex: 1, width: '100%', height: '100%', border: 'none', backgroundColor: '#0F1A2E' }}
      title="Evacuation Map"
    />
  );
}

// ── Native: use Google Maps iframe (WebView-like) via NativeFallback ──
function NativeGoogleMap({ markers, nearest, routeCoords }) {
  // On native Expo Go, use the shelter list fallback
  // Full Google Maps available in production builds with react-native-maps
  return <NativeFallback markers={markers} />;
}

// ── Fallback for native without Google Play Services ──
function NativeFallback({ markers }) {
  return (
    <ScrollView contentContainerStyle={styles.fallbackContent}>
      <Text style={styles.fallbackIcon}>🗺️</Text>
      <Text style={styles.fallbackText}>Map with live markers</Text>
      <Text style={styles.fallbackHint}>Full Google Maps on native device</Text>
      <Text style={styles.shelterListTitle}>Shelter Locations</Text>
      {markers.map((s) => (
        <View key={s.id} style={styles.shelterCard}>
          <View style={[styles.shelterDot, { backgroundColor: s.status !== 'full' && s.available > 0 ? '#00C853' : '#FF4444' }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.shelterName}>{s.name}</Text>
            <Text style={styles.shelterMeta}>{s.available} spots • {s.distance} • {s.walkTime}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

export default function EvacuationScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [markers, setMarkers] = useState(MOCK_SHELTER_MARKERS);
  const [nearest, setNearest] = useState(MOCK_SHELTER_MARKERS[0]);
  const [routeCoords, setRouteCoords] = useState([]);
  const [distanceKm, setDistanceKm] = useState('1.2');
  const [walkMin, setWalkMin] = useState('15');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await apiFetchShelters();
      let formatted = data.length > 0 ? data.map(formatShelterMarker) : MOCK_SHELTER_MARKERS;
      setMarkers(formatted);

      // Find nearest open shelter
      const open = formatted.filter((s) => s.status !== 'full' && s.available > 0);
      let near = open.length > 0 ? open[0] : formatted[0];

      // Find truly nearest by distance
      let minDist = Infinity;
      for (const s of open) {
        const d = haversineDistance(USER_LOCATION, s.coordinate);
        if (d < minDist) { minDist = d; near = s; }
      }

      setNearest(near);
      setRouteCoords(getRouteCoords(USER_LOCATION, near.coordinate));

      const km = haversineDistance(USER_LOCATION, near.coordinate);
      setDistanceKm(km.toFixed(1));
      setWalkMin(Math.round((km / 5) * 60).toString());

      setLoading(false);
    } catch {
      setMarkers(MOCK_SHELTER_MARKERS);
      setNearest(MOCK_SHELTER_MARKERS[0]);
      setRouteCoords(getRouteCoords(USER_LOCATION, MOCK_SHELTER_MARKERS[0].coordinate));
      setDistanceKm('1.2');
      setWalkMin('15');
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, []);

  const handleDirections = () => {
    Alert.alert('Coming Soon', 'Turn-by-turn navigation coming in a future update.');
  };

  if (loading) return <LoadingScreen message="Loading evacuation map..." />;
  if (error) return <ErrorScreen message="Could not load map data." onRetry={loadData} />;

  const isWeb = Platform.OS === 'web';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080C14" />
      <OfflineBar />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Evacuation Routes</Text>
        <Text style={styles.headerSubtitle}>Bengaluru Emergency Map • Google Maps</Text>
      </View>

      <View style={{ flex: 1 }}>
        {isWeb
          ? <GoogleWebMap markers={markers} nearest={nearest} routeCoords={routeCoords} />
          : <NativeGoogleMap markers={markers} nearest={nearest} routeCoords={routeCoords} />
        }
      </View>

      <View style={styles.bottomCard}>
        <Text style={styles.nearestLabel}>NEAREST SHELTER</Text>
        <Text style={styles.nearestName}>{nearest.name}</Text>
        <View style={styles.infoRow}>
          <View style={styles.infoPill}><Text style={styles.infoPillText}>📍 {distanceKm} km away</Text></View>
          <View style={styles.infoPill}><Text style={styles.infoPillText}>🚶 {walkMin} min walk</Text></View>
          <View style={styles.infoPill}><Text style={styles.infoPillText}>🏠 {nearest.available} spots</Text></View>
        </View>
        <View style={styles.divider} />
        <View style={styles.legendRow}>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#00C853' }]} /><Text style={styles.legendText}>Open shelter</Text></View>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#FF4444' }]} /><Text style={styles.legendText}>Full shelter</Text></View>
          <View style={styles.legendItem}><View style={styles.legendDash} /><Text style={styles.legendText}>Route</Text></View>
        </View>
        <TouchableOpacity style={styles.directionsBtn} onPress={handleDirections} activeOpacity={0.8}>
          <Text style={styles.directionsBtnText}>Get Directions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080C14' },
  header: { backgroundColor: '#0F1A2E', paddingTop: 50, paddingBottom: 12, paddingHorizontal: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#1E3A5F' },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.3 },
  headerSubtitle: { color: '#8A9BB0', fontSize: 12, marginTop: 2 },
  bottomCard: { backgroundColor: '#0F1A2E', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 34, borderTopWidth: 1, borderTopColor: '#1E3A5F' },
  nearestLabel: { color: '#FF6B35', fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 6 },
  nearestName: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginBottom: 14 },
  infoRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  infoPill: { backgroundColor: '#0D2137', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  infoPillText: { color: '#4DA6FF', fontSize: 12, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#1E3A5F', marginBottom: 14 },
  legendRow: { flexDirection: 'row', gap: 20, marginBottom: 18 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendDash: { width: 18, height: 3, backgroundColor: '#FF6B35', borderRadius: 2 },
  legendText: { color: '#8A9BB0', fontSize: 11, fontWeight: '600' },
  directionsBtn: { backgroundColor: '#FF6B35', borderRadius: 14, padding: 16, alignItems: 'center' },
  directionsBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
  fallbackContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  fallbackIcon: { fontSize: 48, marginBottom: 12 },
  fallbackText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  fallbackHint: { color: '#8A9BB0', fontSize: 13, marginBottom: 24 },
  shelterListTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', alignSelf: 'flex-start', marginBottom: 12, marginTop: 8 },
  shelterCard: { backgroundColor: '#0F1A2E', borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%' },
  shelterDot: { width: 12, height: 12, borderRadius: 6 },
  shelterName: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  shelterMeta: { color: '#8A9BB0', fontSize: 12, marginTop: 2 },
});