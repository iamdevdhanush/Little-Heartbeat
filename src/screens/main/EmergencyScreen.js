import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadows } from '../../theme/colors';

const EMERGENCY_SIGNS = [
  { emoji: '🩸', text: 'Heavy bleeding from the vagina' },
  { emoji: '😵', text: 'Severe headache that does not go away' },
  { emoji: '👁', text: 'Blurry or double vision' },
  { emoji: '💔', text: 'Chest pain or difficulty breathing' },
  { emoji: '🤰', text: 'Severe stomach pain or cramping' },
  { emoji: '👶', text: 'Baby is not moving for more than 2 hours' },
  { emoji: '🌡️', text: 'High fever (above 38.5°C / 101.3°F)' },
  { emoji: '💫', text: 'Fainting or losing consciousness' },
  { emoji: '🦵', text: 'Sudden severe swelling of face, hands, or feet' },
  { emoji: '💧', text: 'Your water breaks before 37 weeks' },
];

const EMERGENCY_CONTACTS = [
  { name: 'Emergency Ambulance', number: '108', emoji: '🚑', color: ['#E53935', '#C62828'] },
  { name: 'Women Helpline', number: '1091', emoji: '👩', color: ['#E8517A', '#C73D65'] },
  { name: 'National Health Helpline', number: '104', emoji: '🏥', color: ['#7B9FD4', '#5A7FB8'] },
];

export default function EmergencyScreen() {
  const insets = useSafeAreaInsets();
  const [alertVisible, setAlertVisible] = useState(false);

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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#FFEBEE', '#FFF0F5']} style={styles.header}>
        <View style={styles.alertIcon}>
          <Text style={styles.alertIconText}>🚨</Text>
        </View>
        <Text style={styles.headerTitle}>Emergency Help</Text>
        <Text style={styles.headerSubtitle}>Stay calm. Help is available.</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 80 }]} showsVerticalScrollIndicator={false}>

        {/* Main Emergency Message */}
        <LinearGradient colors={['#E53935', '#C62828']} style={[styles.mainAlert, shadows.lg]}>
          <Text style={styles.mainAlertTitle}>⚠️ HIGH RISK DETECTED</Text>
          <Text style={styles.mainAlertText}>
            If you are experiencing any dangerous symptoms, please go to the nearest hospital immediately.
          </Text>
          <Text style={styles.mainAlertSub}>
            Do NOT drive yourself. Call someone or take an auto/taxi.
          </Text>
        </LinearGradient>

        {/* Emergency Numbers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📞 Emergency Numbers</Text>
          <Text style={styles.sectionSubtitle}>Tap to call immediately</Text>
          {EMERGENCY_CONTACTS.map((contact, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => handleCall(contact.number, contact.name)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={contact.color}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.contactCard, shadows.md]}
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
        </View>

        {/* Warning Signs */}
        <View style={[styles.warningCard, shadows.sm]}>
          <Text style={styles.warningTitle}>🚨 Go to Hospital if you have:</Text>
          <Text style={styles.warningSubtitle}>Do not wait — these signs need immediate care</Text>
          {EMERGENCY_SIGNS.map((sign, i) => (
            <View key={i} style={styles.signRow}>
              <Text style={styles.signEmoji}>{sign.emoji}</Text>
              <Text style={styles.signText}>{sign.text}</Text>
            </View>
          ))}
        </View>

        {/* What to Take */}
        <View style={[styles.infoCard, shadows.sm]}>
          <Text style={styles.infoTitle}>🎒 What to Take to Hospital</Text>
          {[
            'Your pregnancy card / antenatal records',
            'Identity proof (Aadhar / any ID)',
            'Any medications you currently take',
            'A trusted family member or friend',
            'Your insurance card if you have one',
          ].map((item, i) => (
            <View key={i} style={styles.infoRow}>
              <Text style={styles.infoDot}>✓</Text>
              <Text style={styles.infoText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Stay Calm */}
        <LinearGradient colors={['#E8F4FF', '#D6E8FF']} style={[styles.calmCard, shadows.sm]}>
          <Text style={styles.calmTitle}>💙 Stay Calm, Mama</Text>
          <Text style={styles.calmText}>
            Take slow, deep breaths. Breathe in for 4 counts, hold for 4, out for 4.
            {'\n\n'}
            You are strong. Help is on the way. Your baby needs you to stay calm.
          </Text>
        </LinearGradient>

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

  mainAlert: {
    borderRadius: radius.xl, padding: 20, alignItems: 'center',
  },
  mainAlertTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 8 },
  mainAlertText: { fontSize: 15, color: '#fff', textAlign: 'center', lineHeight: 22, marginBottom: 8 },
  mainAlertSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },

  section: { gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  sectionSubtitle: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },
  contactCard: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.xl, padding: 16 },
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
  warningTitle: { fontSize: 16, fontWeight: '700', color: '#B71C1C', marginBottom: 4 },
  warningSubtitle: { fontSize: 12, color: '#E57373', marginBottom: 12 },
  signRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  signEmoji: { fontSize: 18, width: 24 },
  signText: { flex: 1, fontSize: 13, color: '#5D1A1A', lineHeight: 19 },

  infoCard: {
    backgroundColor: '#FFFFFF', borderRadius: radius.xl,
    padding: 16, borderWidth: 1, borderColor: colors.border,
  },
  infoTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  infoRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  infoDot: { fontSize: 14, color: colors.primary, fontWeight: '700' },
  infoText: { flex: 1, fontSize: 13, color: colors.textSecondary, lineHeight: 19 },

  calmCard: { borderRadius: radius.xl, padding: 20 },
  calmTitle: { fontSize: 16, fontWeight: '700', color: colors.accentDark, marginBottom: 8 },
  calmText: { fontSize: 14, color: '#2D4A6E', lineHeight: 22 },
});
