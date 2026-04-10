import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Linking, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { colors, radius, shadows } from '../../theme/colors';
import { useApp } from '../../context/AppContext';
import { 
  searchNearbyHospitals, 
  getCurrentLocation,
  getDirectionsUrl,
  filter24Hours,
  sortByDistance,
} from '../../services/hospitalService';

export default function HospitalFinderScreen({ navigation }) {
  const { profile } = useApp();
  const insets = useSafeAreaInsets();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnly24Hours, setShowOnly24Hours] = useState(false);
  const [sortBy, setSortBy] = useState('distance');

  useEffect(() => {
    loadHospitals();
  }, []);

  const loadHospitals = async () => {
    setLoading(true);
    
    const loc = await getCurrentLocation();
    setLocation(loc);
    
    if (loc) {
      const results = await searchNearbyHospitals(loc.latitude, loc.longitude, 15);
      setHospitals(results);
    } else {
      const results = await searchNearbyHospitals(28.6139, 77.2090, 15);
      setHospitals(results);
    }
    
    setLoading(false);
  };

  const handleGetDirections = (hospital) => {
    const lat = location?.latitude || 28.6139;
    const lon = location?.longitude || 77.2090;
    const url = getDirectionsUrl(lat, lon, hospital.latitude, hospital.longitude);
    
    Alert.alert(
      'Get Directions',
      `Open Google Maps for directions to ${hospital.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Maps', onPress: () => WebBrowser.openBrowserAsync(url) },
      ]
    );
  };

  const handleCallHospital = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`).catch(() => {
        Alert.alert('Call feature', `Please call ${phone} manually.`);
      });
    }
  };

  const getDisplayHospitals = () => {
    let display = [...hospitals];
    
    if (searchQuery) {
      display = display.filter(h => 
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (showOnly24Hours) {
      display = filter24Hours(display);
    }
    
    if (sortBy === 'distance' && location) {
      display = sortByDistance(display, location.latitude, location.longitude);
    }
    
    return display;
  };

  const renderHospitalCard = (hospital, index) => (
    <View key={hospital.id} style={[styles.hospitalCard, shadows.sm]}>
      <View style={styles.hospitalHeader}>
        <View style={styles.hospitalTitleRow}>
          <Text style={styles.hospitalEmoji}>
            {hospital.isEmergency ? '🏥' : '🏨'}
          </Text>
          <View style={styles.hospitalTitleInfo}>
            <Text style={styles.hospitalName}>{hospital.name}</Text>
            <View style={styles.hospitalBadges}>
              {hospital.is24Hours && (
                <View style={styles.badge24}>
                  <Text style={styles.badge24Text}>24/7</Text>
                </View>
              )}
              {hospital.isEmergency && (
                <View style={styles.badgeEmergency}>
                  <Text style={styles.badgeEmergencyText}>Emergency</Text>
                </View>
              )}
              {hospital.rating && (
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>⭐ {hospital.rating}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        
        {hospital.distance !== null && (
          <View style={styles.distanceBadge}>
            <Text style={styles.distanceText}>
              {hospital.distance < 1 
                ? `${Math.round(hospital.distance * 1000)}m` 
                : `${hospital.distance.toFixed(1)}km`}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.hospitalAddress}>{hospital.address}</Text>

      {hospital.isOpen !== undefined && (
        <View style={styles.openStatus}>
          <View style={[styles.statusDot, { backgroundColor: hospital.isOpen ? colors.riskLow : colors.riskHigh }]} />
          <Text style={[styles.statusText, { color: hospital.isOpen ? colors.riskLow : colors.riskHigh }]}>
            {hospital.isOpen ? 'Open Now' : 'Closed'}
          </Text>
        </View>
      )}

      <View style={styles.hospitalActions}>
        <TouchableOpacity 
          style={styles.directionsBtn}
          onPress={() => handleGetDirections(hospital)}
        >
          <Text style={styles.directionsBtnText}>🗺️ Directions</Text>
        </TouchableOpacity>
        
        {hospital.phone && (
          <TouchableOpacity 
            style={styles.callBtn}
            onPress={() => handleCallHospital(hospital.phone)}
          >
            <Text style={styles.callBtnText}>📞 Call</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#EEF4FF', '#FFF0F5']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🏥 Nearby Hospitals</Text>
        <Text style={styles.headerSubtitle}>
          Find the nearest medical facilities
        </Text>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search hospitals..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.textMuted}
        />
        
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, showOnly24Hours && styles.filterChipActive]}
            onPress={() => setShowOnly24Hours(!showOnly24Hours)}
          >
            <Text style={[styles.filterChipText, showOnly24Hours && styles.filterChipTextActive]}>
              24/7 Only
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterChip, sortBy === 'distance' && styles.filterChipActive]}
            onPress={() => setSortBy('distance')}
          >
            <Text style={[styles.filterChipText, sortBy === 'distance' && styles.filterChipTextActive]}>
              📍 Nearest
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterChip, sortBy === 'rating' && styles.filterChipActive]}
            onPress={() => setSortBy('rating')}
          >
            <Text style={[styles.filterChipText, sortBy === 'rating' && styles.filterChipTextActive]}>
              ⭐ Top Rated
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 80 }]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Finding hospitals near you...</Text>
          </View>
        ) : getDisplayHospitals().length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🏥</Text>
            <Text style={styles.emptyTitle}>No hospitals found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your search or filters
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.resultsCount}>
              {getDisplayHospitals().length} hospitals found
            </Text>
            
            {getDisplayHospitals().map((hospital, index) => renderHospitalCard(hospital, index))}
          </>
        )}

        <View style={[styles.infoCard, shadows.sm]}>
          <Text style={styles.infoTitle}>💡 Tips</Text>
          <Text style={styles.infoText}>
            • Always call ahead if possible{'\n'}
            • For emergencies, dial 108 for ambulance{'\n'}
            • Women & Child hospitals are best for pregnancy{'\n'}
            • Government hospitals are available 24/7
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 20 },
  backBtn: { marginBottom: 12 },
  backBtnText: { fontSize: 15, color: colors.primary, fontWeight: '600' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  headerSubtitle: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  searchContainer: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.border },
  searchInput: {
    backgroundColor: colors.background, borderRadius: radius.lg,
    padding: 12, fontSize: 14, color: colors.textPrimary,
    borderWidth: 1, borderColor: colors.border,
  },
  filterRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: colors.background, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  filterChipTextActive: { color: '#fff' },
  scroll: { padding: 16, gap: 12 },
  loadingContainer: { alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 12, fontSize: 14, color: colors.textMuted },
  emptyContainer: { alignItems: 'center', padding: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  emptyText: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  resultsCount: { fontSize: 13, color: colors.textMuted, marginBottom: 4 },
  hospitalCard: {
    backgroundColor: '#fff', borderRadius: radius.xl,
    padding: 16, borderWidth: 1, borderColor: colors.border,
  },
  hospitalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  hospitalTitleRow: { flexDirection: 'row', flex: 1 },
  hospitalEmoji: { fontSize: 28, marginRight: 10 },
  hospitalTitleInfo: { flex: 1 },
  hospitalName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  hospitalBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  badge24: { backgroundColor: colors.riskLowBg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full },
  badge24Text: { fontSize: 10, fontWeight: '700', color: colors.riskLow },
  badgeEmergency: { backgroundColor: colors.riskHighBg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full },
  badgeEmergencyText: { fontSize: 10, fontWeight: '700', color: colors.riskHigh },
  ratingBadge: { backgroundColor: '#FFF8E1', paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full },
  ratingText: { fontSize: 10, fontWeight: '700', color: '#F57C00' },
  distanceBadge: {
    backgroundColor: colors.primaryLight, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radius.full,
  },
  distanceText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  hospitalAddress: { fontSize: 13, color: colors.textMuted, marginTop: 8, lineHeight: 18 },
  openStatus: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12, fontWeight: '600' },
  hospitalActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  directionsBtn: {
    flex: 1, paddingVertical: 10, backgroundColor: colors.accent,
    borderRadius: radius.lg, alignItems: 'center',
  },
  directionsBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  callBtn: {
    flex: 1, paddingVertical: 10, backgroundColor: colors.riskLow,
    borderRadius: radius.lg, alignItems: 'center',
  },
  callBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  infoCard: {
    backgroundColor: '#F0F7FF', borderRadius: radius.xl,
    padding: 16, borderWidth: 1, borderColor: '#D6E8FF',
  },
  infoTitle: { fontSize: 15, fontWeight: '700', color: colors.accentDark, marginBottom: 8 },
  infoText: { fontSize: 13, color: colors.accentDark, lineHeight: 22 },
});
