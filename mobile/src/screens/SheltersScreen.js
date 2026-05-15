import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, Modal, TouchableWithoutFeedback,
} from 'react-native';
import { fetchShelters as apiFetchShelters } from '../hooks/useApi';
import OfflineBar from '../components/OfflineBar';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';

const MOCK_SHELTERS = [
  { id: '1', name: 'Koramangala Community Hall', address: '80 Feet Road, Koramangala 4th Block, Bengaluru', capacity: 250, occupied: 180, distance: '1.2 km', walkTime: '15 min walk', contact: '+91 80 2553 1234', facilities: ['Food', 'Water', 'Medical Aid', 'Toilets'], lat: 12.9352, lng: 77.6245, status: 'open' },
  { id: '2', name: 'HSR Layout Govt School', address: 'Sector 6, HSR Layout, Bengaluru', capacity: 400, occupied: 400, distance: '2.8 km', walkTime: '35 min walk', contact: '+91 80 2573 5678', facilities: ['Water', 'Toilets', 'Electricity'], lat: 12.9116, lng: 77.6389, status: 'full' },
  { id: '3', name: 'Indiranagar Indoor Stadium', address: '100 Feet Road, Indiranagar, Bengaluru', capacity: 600, occupied: 210, distance: '4.1 km', walkTime: '52 min walk', contact: '+91 80 2520 9012', facilities: ['Food', 'Water', 'Medical Aid', 'Toilets', 'Electricity', 'WiFi'], lat: 12.9784, lng: 77.6408, status: 'open' },
  { id: '4', name: 'Whitefield Kalyana Mantapa', address: 'ITPL Main Road, Whitefield, Bengaluru', capacity: 300, occupied: 95, distance: '6.7 km', walkTime: '84 min walk', contact: '+91 80 2845 3456', facilities: ['Food', 'Water', 'Toilets', 'Parking'], lat: 12.9698, lng: 77.7499, status: 'open' },
];

function formatApiShelter(s, idx) {
  const occupied = s.occupied || 0;
  const capacity = s.capacity || 100;
  const available = capacity - occupied;
  const isFull = available <= 0 || s.status === 'full';
  return {
    id: s.id || String(idx + 1),
    name: s.name || 'Shelter',
    address: s.address || `Lat: ${s.lat}, Lng: ${s.lng}`,
    capacity,
    occupied,
    distance: s.distance || '—',
    walkTime: s.walkTime || s.walk_time || '—',
    contact: s.contact || '—',
    facilities: s.facilities || ['Water', 'Toilets'],
    lat: s.lat,
    lng: s.lng,
    status: isFull ? 'full' : 'open',
  };
}

function getShelterStatus(capacity, occupied, status) {
  const available = capacity - occupied;
  if (status === 'full' || available === 0) return { label: 'Full', color: '#FF4444', barColor: '#FF4444' };
  const pct = (occupied / capacity) * 100;
  if (pct >= 80) return { label: 'Almost Full', color: '#FF8C00', barColor: '#FF8C00' };
  return { label: 'Available', color: '#00C853', barColor: '#00C853' };
}

function CapacityBar({ capacity, occupied, status, large }) {
  const available = capacity - occupied;
  const percent = Math.min((occupied / capacity) * 100, 100);
  const h = large ? 10 : 8;
  return (
    <View>
      <View style={styles.capRow}>
        <Text style={styles.capLabel}>Capacity</Text>
        <Text style={styles.capValue}>{occupied}/{capacity} spots</Text>
      </View>
      <View style={[styles.barTrack, { height: h }]}>
        <View style={[styles.barFill, { width: `${percent}%`, backgroundColor: status.barColor, height: h }]} />
      </View>
      <Text style={[styles.spotsText, { color: status.color }]}>
        {available > 0 ? `${available} spots available` : 'No spots available'}
      </Text>
    </View>
  );
}

function ShelterCard({ shelter, onPress }) {
  const status = getShelterStatus(shelter.capacity, shelter.occupied, shelter.status);
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.cardBar, { backgroundColor: status.barColor }]} />
      <View style={styles.cardContent}>
        <View style={styles.topRow}>
          <Text style={styles.cardName} numberOfLines={1}>{shelter.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
        <Text style={styles.cardAddress} numberOfLines={1}>📍 {shelter.address}</Text>
        <CapacityBar capacity={shelter.capacity} occupied={shelter.occupied} status={status} />
        <View style={styles.bottomRow}>
          <View style={styles.infoBadge}><Text style={styles.infoBadgeText}>📍 {shelter.distance}</Text></View>
          <View style={styles.infoBadge}><Text style={styles.infoBadgeText}>🚶 {shelter.walkTime}</Text></View>
          <Text style={styles.contactSmall}>{shelter.contact}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function ShelterModal({ shelter, visible, onClose }) {
  if (!shelter) return null;
  const status = getShelterStatus(shelter.capacity, shelter.occupied, shelter.status);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modal}>
              <View style={styles.dragHandle} />
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalName}>{shelter.name}</Text>
                  <View style={[styles.statusBadge, styles.statusBadgeLg, { backgroundColor: status.color + '20' }]}>
                    <Text style={[styles.statusText, styles.statusTextLg, { color: status.color }]}>{status.label}</Text>
                  </View>
                </View>
                <Text style={styles.modalAddress}>📍 {shelter.address}</Text>
                <View style={styles.modalSection}>
                  <CapacityBar capacity={shelter.capacity} occupied={shelter.occupied} status={status} large />
                </View>
                <View style={styles.modalInfoRow}>
                  <View style={styles.modalInfoCard}><Text style={styles.modalInfoEmoji}>📍</Text><Text style={styles.modalInfoLabel}>Distance</Text><Text style={styles.modalInfoValue}>{shelter.distance}</Text></View>
                  <View style={styles.modalInfoCard}><Text style={styles.modalInfoEmoji}>🚶</Text><Text style={styles.modalInfoLabel}>Walk Time</Text><Text style={styles.modalInfoValue}>{shelter.walkTime}</Text></View>
                </View>
                <Text style={styles.modalSectionLabel}>Facilities Available</Text>
                <View style={styles.facilityWrap}>
                  {shelter.facilities.map((f) => (
                    <View key={f} style={styles.facilityChip}><Text style={styles.facilityText}>{f}</Text></View>
                  ))}
                </View>
                <Text style={styles.modalSectionLabel}>Contact</Text>
                <Text style={styles.modalContact}>{shelter.contact}</Text>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
                  <Text style={styles.closeBtnText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

export default function SheltersScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [shelters, setShelters] = useState([]);
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await apiFetchShelters();
      if (data.length > 0) {
        setShelters(data.map(formatApiShelter));
      } else {
        setShelters(MOCK_SHELTERS);
      }
      setLoading(false);
    } catch {
      setShelters(MOCK_SHELTERS);
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, []);

  if (loading) return <LoadingScreen message="Loading shelters..." />;
  if (error) return <ErrorScreen message="Could not load shelter data." onRetry={loadData} />;

  const totalShelters = shelters.length;
  const availableCount = shelters.filter((s) => s.capacity - s.occupied > 0 && s.status !== 'full').length;
  const totalSpotsFree = shelters.reduce((sum, s) => sum + Math.max(s.capacity - s.occupied, 0), 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080C14" />
      <OfflineBar />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Emergency Shelters</Text>
        <Text style={styles.subtitle}>Bengaluru Active Shelters</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}><Text style={styles.statNum}>{totalShelters}</Text><Text style={styles.statLabel}>Total</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.stat}><Text style={[styles.statNum, { color: '#00C853' }]}>{availableCount}</Text><Text style={styles.statLabel}>Available</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.stat}><Text style={[styles.statNum, { color: '#4DA6FF' }]}>{totalSpotsFree}</Text><Text style={styles.statLabel}>Spots Free</Text></View>
        </View>
        {shelters.map((shelter) => (
          <ShelterCard key={shelter.id} shelter={shelter} onPress={() => { setSelectedShelter(shelter); setModalVisible(true); }} />
        ))}
      </ScrollView>
      <ShelterModal shelter={selectedShelter} visible={modalVisible} onClose={() => { setModalVisible(false); setSelectedShelter(null); }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080C14' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 54, paddingBottom: 30 },
  title: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', marginBottom: 4 },
  subtitle: { color: '#8A9BB0', fontSize: 14, marginBottom: 20 },
  statsRow: { backgroundColor: '#0F1A2E', borderRadius: 14, flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 22, borderWidth: 1, borderColor: '#1A2A45' },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  statLabel: { color: '#8A9BB0', fontSize: 11, fontWeight: '600', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  statDivider: { width: 1, height: 30, backgroundColor: '#1E3A5F' },
  card: { backgroundColor: '#0F1A2E', borderRadius: 12, marginBottom: 12, flexDirection: 'row', overflow: 'hidden' },
  cardBar: { width: 6 },
  cardContent: { flex: 1, padding: 16 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardName: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', flex: 1, marginRight: 10 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusBadgeLg: { paddingHorizontal: 14, paddingVertical: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },
  statusTextLg: { fontSize: 13 },
  cardAddress: { color: '#8A9BB0', fontSize: 12, marginBottom: 14 },
  capRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  capLabel: { color: '#8A9BB0', fontSize: 12, fontWeight: '600' },
  capValue: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  barTrack: { backgroundColor: '#1E3A5F', borderRadius: 4, overflow: 'hidden' },
  barFill: { borderRadius: 4 },
  spotsText: { fontSize: 12, fontWeight: '600', marginTop: 6 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 8 },
  infoBadge: { backgroundColor: '#0D2137', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  infoBadgeText: { color: '#4DA6FF', fontSize: 11, fontWeight: '600' },
  contactSmall: { color: '#8A9BB0', fontSize: 11, marginLeft: 'auto' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#0F1A2E', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '80%' },
  dragHandle: { width: 40, height: 4, backgroundColor: '#3A4A60', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  modalName: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', flex: 1, marginRight: 12 },
  modalAddress: { color: '#8A9BB0', fontSize: 13, marginBottom: 20, lineHeight: 18 },
  modalSection: { marginBottom: 22 },
  modalInfoRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  modalInfoCard: { flex: 1, backgroundColor: '#0D1B2E', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#1E3A5F' },
  modalInfoEmoji: { fontSize: 22, marginBottom: 6 },
  modalInfoLabel: { color: '#8A9BB0', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  modalInfoValue: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  modalSectionLabel: { color: '#8A9BB0', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  facilityWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  facilityChip: { backgroundColor: '#1E3A5F', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
  facilityText: { color: '#4DA6FF', fontSize: 12, fontWeight: '600' },
  modalContact: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginBottom: 28 },
  closeBtn: { backgroundColor: '#FF6B35', borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 10 },
  closeBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
