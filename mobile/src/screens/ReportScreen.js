import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { saveReport } from '../utils/storage';
import { submitReport as apiSubmitReport } from '../hooks/useApi';
import { sendTelegramAlert } from '../utils/telegram';
import OfflineBar from '../components/OfflineBar';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';

const HAZARD_TYPES = ['Flood', 'Earthquake', 'Fire', 'Landslide', 'Storm', 'Air Quality', 'Other'];
const MAX_DESC = 500;

export default function ReportScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [hazardType, setHazardType] = useState('');
  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMsg, setBannerMsg] = useState('');
  const [bannerColor, setBannerColor] = useState('#1A4D2E');

  const bannerAnim = useRef(new Animated.Value(-80)).current;

  useEffect(() => {
    const t = setTimeout(() => { setLoading(false); }, 1000);
    return () => clearTimeout(t);
  }, []);

  const handleGPS = async () => {
    setGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        setGpsLoading(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const lat = pos.coords.latitude.toFixed(4);
      const lon = pos.coords.longitude.toFixed(4);
      const ns = pos.coords.latitude >= 0 ? 'N' : 'S';
      const ew = pos.coords.longitude >= 0 ? 'E' : 'W';
      setLocation(`${Math.abs(lat)}° ${ns}, ${Math.abs(lon)}° ${ew}`);
      setErrors((p) => ({ ...p, location: false }));
    } catch {
      Alert.alert('GPS Error', 'Could not get location. Enter manually.');
    }
    setGpsLoading(false);
  };

  const handlePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Media library permission required.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7, allowsEditing: true, aspect: [4, 3],
      });
      if (!result.canceled && result.assets?.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Error', 'Could not open image picker.');
    }
  };

  const flashBanner = (msg, color = '#1A4D2E') => {
    setBannerMsg(msg);
    setBannerColor(color);
    setShowBanner(true);
    Animated.timing(bannerAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    setTimeout(() => {
      Animated.timing(bannerAnim, { toValue: -80, duration: 300, useNativeDriver: true }).start(() => setShowBanner(false));
    }, 3000);
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = true;
    if (!location.trim()) newErrors.location = true;
    if (!hazardType) newErrors.hazardType = true;
    if (!description.trim()) newErrors.description = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Alert.alert('Missing Fields', 'Please fill all required fields.');
      return;
    }

    const report = {
      name: name.trim(),
      location: location.trim(),
      hazardType,
      description: description.trim(),
      photoUri,
      timestamp: new Date().toISOString(),
    };

    // Step 1: Save locally (offline backup)
    await saveReport(report);

    // Step 2: Try submitting to backend
    const result = await apiSubmitReport(report);

    if (result.success) {
      flashBanner('✅ Report submitted successfully!', '#1A4D2E');
      // Send Telegram confirmation
      sendTelegramAlert(
        `📝 <b>Citizen Report Submitted</b>\n` +
        `Type: ${hazardType}\n` +
        `Location: ${location.trim()}\n` +
        `Reporter: ${name.trim()}\n` +
        `Time: ${new Date().toLocaleString('en-IN')}`
      );
    } else {
      flashBanner('📱 Report saved offline, will sync later', '#2D1A00');
    }

    // Reset form
    setName('');
    setLocation('');
    setHazardType('');
    setDescription('');
    setPhotoUri(null);
    setErrors({});
  };

  if (loading) return <LoadingScreen message="Loading report form..." />;
  if (error) return <ErrorScreen message="Could not load report form." onRetry={() => { setError(false); setLoading(false); }} />;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080C14" />
      <OfflineBar />
      {showBanner && (
        <Animated.View style={[styles.banner, { backgroundColor: bannerColor, transform: [{ translateY: bannerAnim }] }]}>
          <Text style={styles.bannerText}>{bannerMsg}</Text>
        </Animated.View>
      )}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={80}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Report Hazard</Text>
          <Text style={styles.subtitle}>Help your community stay safe</Text>

          <Text style={styles.label}>Your Name <Text style={styles.required}>*</Text></Text>
          <TextInput style={[styles.input, errors.name && styles.inputError]} value={name} onChangeText={(t) => { setName(t); setErrors((p) => ({ ...p, name: false })); }} placeholder="Enter your name" placeholderTextColor="#5A6B80" />

          <Text style={styles.label}>Location <Text style={styles.required}>*</Text></Text>
          <View style={styles.locationRow}>
            <TextInput style={[styles.input, styles.locationInput, errors.location && styles.inputError]} value={location} onChangeText={(t) => { setLocation(t); setErrors((p) => ({ ...p, location: false })); }} placeholder="Enter location or use GPS" placeholderTextColor="#5A6B80" />
            <TouchableOpacity style={styles.gpsBtn} onPress={handleGPS} disabled={gpsLoading} activeOpacity={0.7}>
              <Text style={styles.gpsBtnText}>{gpsLoading ? '...' : '📍'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Hazard Type <Text style={styles.required}>*</Text></Text>
          {errors.hazardType && <Text style={styles.errorHint}>Select a hazard type</Text>}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipContainer}>
            {HAZARD_TYPES.map((type) => {
              const selected = hazardType === type;
              return (
                <TouchableOpacity key={type} style={[styles.chip, selected && styles.chipSelected]} onPress={() => { setHazardType(type); setErrors((p) => ({ ...p, hazardType: false })); }} activeOpacity={0.7}>
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{type}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.label}>Description <Text style={styles.required}>*</Text></Text>
          <TextInput style={[styles.input, styles.textArea, errors.description && styles.inputError]} value={description} onChangeText={(t) => { if (t.length <= MAX_DESC) { setDescription(t); setErrors((p) => ({ ...p, description: false })); } }} placeholder="Describe what you observed..." placeholderTextColor="#5A6B80" multiline numberOfLines={4} textAlignVertical="top" />
          <Text style={styles.charCount}>{description.length}/{MAX_DESC}</Text>

          <Text style={styles.label}>Photo</Text>
          {photoUri ? (
            <View style={styles.photoPreview}>
              <Image source={{ uri: photoUri }} style={styles.thumbnail} />
              <TouchableOpacity style={styles.removePhoto} onPress={() => setPhotoUri(null)}>
                <Text style={styles.removePhotoText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.photoBtn} onPress={handlePhoto} activeOpacity={0.7}>
              <Text style={styles.photoBtnIcon}>📷</Text>
              <Text style={styles.photoBtnText}>Add Photo (Optional)</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.8}>
            <Text style={styles.submitText}>Submit Report</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080C14' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 54, paddingBottom: 40 },
  banner: { position: 'absolute', top: 0, left: 0, right: 0, paddingVertical: 14, paddingHorizontal: 20, paddingTop: 50, zIndex: 999, alignItems: 'center' },
  bannerText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  title: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', marginBottom: 4 },
  subtitle: { color: '#8A9BB0', fontSize: 14, marginBottom: 28 },
  label: { color: '#8A9BB0', fontSize: 13, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  required: { color: '#FF4444' },
  input: { backgroundColor: '#0F1A2E', borderWidth: 1, borderColor: '#1E3A5F', borderRadius: 12, padding: 14, fontSize: 15, color: '#FFFFFF', marginBottom: 20 },
  inputError: { borderColor: '#FF4444' },
  errorHint: { color: '#FF4444', fontSize: 11, marginBottom: 6, marginTop: -4 },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  charCount: { color: '#5A6B80', fontSize: 11, textAlign: 'right', marginTop: -14, marginBottom: 20 },
  locationRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  locationInput: { flex: 1, marginBottom: 0 },
  gpsBtn: { backgroundColor: '#FF6B35', borderRadius: 12, width: 52, justifyContent: 'center', alignItems: 'center' },
  gpsBtnText: { fontSize: 22 },
  chipScroll: { marginBottom: 20 },
  chipContainer: { gap: 8 },
  chip: { backgroundColor: '#0F1A2E', borderWidth: 1, borderColor: '#1E3A5F', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10 },
  chipSelected: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  chipText: { color: '#8A9BB0', fontSize: 13, fontWeight: '600' },
  chipTextSelected: { color: '#FFFFFF' },
  photoBtn: { backgroundColor: '#0F1A2E', borderWidth: 1, borderColor: '#1E3A5F', borderStyle: 'dashed', borderRadius: 12, padding: 20, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 28 },
  photoBtnIcon: { fontSize: 20 },
  photoBtnText: { color: '#8A9BB0', fontSize: 14, fontWeight: '600' },
  photoPreview: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 28, gap: 10 },
  thumbnail: { width: 80, height: 80, borderRadius: 10, backgroundColor: '#0F1A2E' },
  removePhoto: { backgroundColor: '#2D0000', width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', marginLeft: -20, marginTop: -6 },
  removePhotoText: { color: '#FF4444', fontSize: 14, fontWeight: '700' },
  submitBtn: { backgroundColor: '#FF6B35', borderRadius: 14, padding: 18, alignItems: 'center', shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  submitText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
});
