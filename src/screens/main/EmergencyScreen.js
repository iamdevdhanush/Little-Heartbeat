import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Linking, Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { colors, radius, shadows } from '../../theme/colors';
import { useApp } from '../../context/AppContext';
import { 
  triggerSOS, 
  getCurrentLocation, 
  getEmergencyContacts,
  sendEmergencySMS,
} from '../../services/sosService';

const EMERGENCY_NUMBERS = [
  { name: 'Emergency Ambulance', number: '108', emoji: '🚑', color: ['#E53935', '#C62828'] },
  { name: 'Police', number: '100', emoji: '👮', color: ['#1565C0', '#0D47A1'] },
  { name: 'Women Helpline', number: '181', emoji: '👩', color: ['#E8517A', '#C73D65'] },
];

const WARNING_SIGNS = [
  { emoji: '🩸', text: 'Heavy vaginal bleeding' },
  { emoji: '🤕', text: 'Severe persistent headache' },
  { emoji: '👁️', text: 'Blurred vision or seeing spots' },
  { emoji: '😮‍💨', text: 'Difficulty breathing' },
  { emoji: '💔', text: 'Chest pain' },
  { emoji: '🤢', text: 'Severe vomiting that won\'t stop' },
  { emoji: '🌡️', text: 'Fever above 38.5°C' },
  { emoji: '👶', text: 'Baby not moving for 2+ hours' },
  { emoji: '💧', text: 'Water breaks' },
  { emoji: '😵', text: 'Fainting or dizziness' },
];

export default function EmergencyScreen({ navigation }) {
  const { profile } = useApp();
  const insets = useSafeAreaInsets();
  const [sosLoading, setSosLoading] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [locationStatus, setLocationStatus] = useState('checking');
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    checkLocationAndContacts();
  }, []);

  const checkLocationAndContacts = async () => {
    setLocationStatus('checking');
    const [location, contacts] = await Promise.all([
      getCurrentLocation(),
      getEmergencyContacts(),
    ]);
    
    setCurrentLocation(location);
    setEmergencyContacts(contacts);
    setLocationStatus(location ? 'ready' : 'unavailable');
  };

  const handleSOS = async () => {
    setSosLoading(true);
    
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Vibration.vibrate([500, 200, 500]);
      
      const result = await triggerSOS(profile, {
        riskLevel: 'High',
        includeLocation: true,
      });

      setSosSent(true);
      
      if (result.success) {
        Alert.alert(
          '✅ Emergency SMS Sent!',
          `Your location has been sent to ${result.contactsNotified} emergency contact(s).`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('SOS Error:', error);
      Alert.alert('Error', 'Could not send emergency SMS. Try calling directly.');
    }
    
    setSosLoading(false);
  };

  const handleCall = (number, name) => {
    Alert.alert(
      `Call ${name}?`,
      `You are about to call ${number}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `Call ${number}`,
          style: 'destructive',
          onPress: () => {
            Linking.openURL(`tel:${number}`).catch(() => {
              Alert.alert('Call feature', `Please call ${number} manually.`);
            });
          },
        },
      ]
    );
  };

  const handleManageContacts = () => {
    navigation.navigate('EmergencyContacts');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#FFEBEE', '#FFF0F5']} style={styles.header}>
        <View style={styles.alertIcon}>
          <Text style={styles.alertIconText}>🚨</Text>
        </View>
        <Text style={styles.headerTitle}>Emergency Help</Text>
        <Text style={styles.headerSubtitle}>Stay calm. Help is available.</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 80 }]}>
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={handleSOS}
          disabled={sosLoading}
          style={[styles.sosButton, sosSent && styles.sosButtonSent, shadows.lg]}
        >
          <LinearGradient
            colors={sosSent ? ['#4CAF87', '#388E3C'] : ['#E53935', '#B71C1C']}
            style={styles.sosGradient}
          >
            {sosLoading ? (
              <ActivityIndicator color="#fff" size="large" />
            ) : (
              <>
                <Text style={styles.sosEmoji}>{sosSent ? '✅' : '🆘'}</Text>
                <Text style={styles.sosTitle}>
                  {sosSent ? 'SOS SENT!' : 'TAP FOR SOS'}
                </Text>
                <Text style={styles.sosSubtitle}>
                  {sosSent 
                    ? 'Your contacts have been notified' 
                    : 'Send location to emergency contacts'
                  }
                </Text>
                {emergencyContacts.length > 0 && !sosSent && (
                  <Text style={styles.sosContacts}>
                    Will notify: {emergencyContacts.map(c => c.name).join(', ')}
                  </Text>
                )}
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {!sosSent && emergencyContacts.length === 0 && (
          <TouchableOpacity style={[styles.addContactsCard, shadows.sm]} onPress={handleManageContacts}>
            <Text style={styles.addContactsEmoji}>📱</Text>
            <View style={styles.addContactsInfo}>
              <Text style={styles.addContactsTitle}>Set up Emergency Contacts</Text>
              <Text style={styles.addContactsText}>
                Add contacts who will receive your location during an emergency
              </Text>
            </View>
            <Text style={styles.addContactsArrow}>→</Text>
          </TouchableOpacity>
        )}

        {sosSent && (
          <TouchableOpacity style={[styles.addContactsCard, shadows.sm]} onPress={() => setSosSent(false)}>
            <Text style={styles.addContactsText}>Tap to send SOS again if needed</Text>
          </TouchableOpacity>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📞 Emergency Numbers</Text>
          <Text style={styles.sectionSubtitle}>Tap to call immediately</Text>
        </View>

        {EMERGENCY_NUMBERS.map((contact, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => handleCall(contact.number, contact.name)}
            activeOpacity={0.85}
            style={shadows.md}
          >
            <LinearGradient
              colors={contact.color}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.contactCard}
            >
              <Text style={styles.contactEmoji}>{contact.emoji}</Text>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactNumber}>{contact.number}</Text>
              </View>
              <View style={styles.callBtn}>
                <Text style={styles.callBtnText}>Call Now →</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🚨 Go to Hospital if you have:</Text>
          <Text style={styles.sectionSubtitle}>Do not wait — these need immediate care</Text>
        </View>

        <View style={[styles.warningCard, shadows.sm]}>
          {WARNING_SIGNS.map((sign, i) => (
            <View key={i} style={styles.signRow}>
              <Text style={styles.signEmoji}>{sign.emoji}</Text>
              <Text style={styles.signText}>{sign.text}</Text>
            </View>
          ))}
        </View>

        <LinearGradient colors={['#E8F4FF', '#D6E8FF']} style={[styles.calmCard, shadows.sm]}>
          <Text style={styles.calmTitle}>💙 Stay Calm, Mama</Text>
          <Text style={styles.calmText}>
            Take slow, deep breaths.{'\n'}
            Breathe in for 4 counts, hold for 4, out for 4.{'\n\n'}
            You are strong. Help is on the way.
          </Text>
        </LinearGradient>

        <TouchableOpacity style={[styles.manageContactsBtn]} onPress={handleManageContacts}>
          <Text style={styles.manageContactsText}>⚙️ Manage Emergency Contacts</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.hospitalFinderBtn]}
          onPress={() => navigation.navigate('HospitalFinder')}
        >
          <Text style={styles.hospitalFinderText}>🏥 Find Nearby Hospitals</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#FFB3B3' },
  alertIcon: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#FFCDD2', justifyContent: 'center', alignItems: 'center', marginBottom: 8,
    borderWidth: 2, borderColor: '#EF9A9A',
  },
  alertIconText: { fontSize: 32 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#B71C1C' },
  headerSubtitle: { fontSize: 13, color: '#E57373', marginTop: 2 },
  scroll: { padding: 16, gap: 12 },
  sosButton: { borderRadius: radius['2xl'], overflow: 'hidden', marginBottom: 8 },
  sosButtonSent: { transform: [{ scale: 1.02 }] },
  sosGradient: { padding: 32, alignItems: 'center', justifyContent: 'center', minHeight: 180 },
  sosEmoji: { fontSize: 64, marginBottom: 12 },
  sosTitle: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  sosSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.9)', marginTop: 8, textAlign: 'center' },
  sosContacts: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 12, textAlign: 'center' },
  addContactsCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    borderRadius: radius.xl, padding: 16, borderWidth: 1, borderColor: colors.border,
  },
  addContactsEmoji: { fontSize: 32, marginRight: 12 },
  addContactsInfo: { flex: 1 },
  addContactsTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  addContactsText: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  addContactsArrow: { fontSize: 20, color: colors.primary, fontWeight: '700' },
  sectionHeader: { marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  sectionSubtitle: { fontSize: 12, color: colors.textMuted, marginBottom: 8 },
  contactCard: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.xl, padding: 16, marginBottom: 8 },
  contactEmoji: { fontSize: 28, marginRight: 12 },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 14, fontWeight: '700', color: '#fff' },
  contactNumber: { fontSize: 22, fontWeight: '800', color: '#fff' },
  callBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: radius.full,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  callBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  warningCard: {
    backgroundColor: '#FFF5F5', borderRadius: radius.xl,
    padding: 16, borderWidth: 1, borderColor: '#FFCDD2',
  },
  signRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  signEmoji: { fontSize: 18, width: 24 },
  signText: { flex: 1, fontSize: 13, color: '#5D1A1A', lineHeight: 19 },
  calmCard: { borderRadius: radius.xl, padding: 20 },
  calmTitle: { fontSize: 16, fontWeight: '700', color: colors.accentDark, marginBottom: 8 },
  calmText: { fontSize: 14, color: '#2D4A6E', lineHeight: 22 },
  manageContactsBtn: {
    alignItems: 'center', padding: 12, marginTop: 4,
  },
  manageContactsText: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  hospitalFinderBtn: {
    backgroundColor: colors.accent, borderRadius: radius.xl,
    padding: 16, alignItems: 'center', marginTop: 8,
  },
  hospitalFinderText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
