import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadows } from '../../theme/colors';
import { useApp } from '../../context/AppContext';
import { 
  isSupabaseConfigured, 
  shareWithPartner, 
  getSharedProfiles,
  getHealthLogs,
} from '../../services/supabaseService';
import Button from '../../components/common/Button';

export default function FamilyDashboardScreen({ navigation }) {
  const { profile } = useApp();
  const insets = useSafeAreaInsets();
  const [partnerEmail, setPartnerEmail] = useState('');
  const [sharedProfiles, setSharedProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    checkConfiguration();
    loadSharedProfiles();
  }, []);

  const checkConfiguration = () => {
    setIsConfigured(isSupabaseConfigured());
  };

  const loadSharedProfiles = async () => {
    if (!isSupabaseConfigured()) return;

    setLoading(true);
    const { data, error } = await getSharedProfiles('current-user-id');
    if (data) {
      setSharedProfiles(data);
    }
    setLoading(false);
  };

  const handleShare = async () => {
    if (!partnerEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    if (!isConfigured) {
      Alert.alert(
        'Setup Required',
        'Supabase is not configured. Please set up Supabase environment variables to enable sharing.',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);
    const { data, error } = await shareWithPartner('current-user-id', partnerEmail.trim());
    setLoading(false);

    if (error) {
      Alert.alert('Error', 'Failed to send invitation. Please try again.');
    } else {
      Alert.alert(
        'Invitation Sent! 💕',
        `An invitation has been sent to ${partnerEmail}. Once they accept, they\'ll be able to see your health updates.`,
        [{ text: 'OK' }]
      );
      setPartnerEmail('');
    }
  };

  const renderSharedProfile = (sharedProfile) => (
    <View key={sharedProfile.id} style={[styles.profileCard, shadows.sm]}>
      <View style={styles.profileAvatar}>
        <Text style={styles.profileAvatarText}>
          {sharedProfile.name?.[0]?.toUpperCase() || '?'}
        </Text>
      </View>
      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>{sharedProfile.name}</Text>
        <Text style={styles.profileMonth}>
          Month {sharedProfile.pregnancyMonth || '?'} of pregnancy
        </Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: colors.riskLowBg }]}>
        <Text style={[styles.statusText, { color: colors.riskLow }]}>Connected</Text>
      </View>
    </View>
  );

  if (!isConfigured) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#EEF4FF', '#FFF0F5']} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>👨‍👩‍👧 Family Dashboard</Text>
          <Text style={styles.headerSubtitle}>Share your pregnancy journey</Text>
        </LinearGradient>

        <View style={styles.content}>
          <View style={[styles.setupCard, shadows.sm]}>
            <Text style={styles.setupEmoji}>🔧</Text>
            <Text style={styles.setupTitle}>Setup Required</Text>
            <Text style={styles.setupText}>
              To enable family sharing, you need to set up Supabase:
            </Text>
            <View style={styles.setupSteps}>
              <Text style={styles.setupStep}>1. Create a project at supabase.com</Text>
              <Text style={styles.setupStep}>2. Add EXPO_PUBLIC_SUPABASE_URL to .env</Text>
              <Text style={styles.setupStep}>3. Add EXPO_PUBLIC_SUPABASE_ANON_KEY to .env</Text>
              <Text style={styles.setupStep}>4. Run the app again</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#EEF4FF', '#FFF0F5']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>👨‍👩‍👧 Family Dashboard</Text>
        <Text style={styles.headerSubtitle}>Share your pregnancy journey with loved ones</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 80 }]}>
        <View style={[styles.shareCard, shadows.sm]}>
          <Text style={styles.shareTitle}>📤 Share with Partner</Text>
          <Text style={styles.shareText}>
            Invite your partner or family member to see your health updates and baby milestones.
          </Text>
          
          <TextInput
            style={styles.input}
            placeholder="Partner's email address"
            value={partnerEmail}
            onChangeText={setPartnerEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={colors.textMuted}
          />
          
          <Button
            title="Send Invitation"
            onPress={handleShare}
            loading={loading}
            style={{ marginTop: 12 }}
          />
        </View>

        {sharedProfiles.length > 0 ? (
          <View style={[styles.profilesSection]}>
            <Text style={styles.sectionTitle}>Connected Family</Text>
            {sharedProfiles.map(renderSharedProfile)}
          </View>
        ) : (
          <View style={[styles.emptyCard, shadows.sm]}>
            <Text style={styles.emptyEmoji}>👨‍👩‍👧</Text>
            <Text style={styles.emptyTitle}>No Family Connected</Text>
            <Text style={styles.emptyText}>
              Share your profile with your partner to let them follow your pregnancy journey.
            </Text>
          </View>
        )}

        <View style={[styles.infoCard, shadows.sm]}>
          <Text style={styles.infoTitle}>💡 What Family Can See</Text>
          <Text style={styles.infoText}>
            When you share your profile, your partner or family can see:{'\n\n'}
            • Current pregnancy stage and due date{'\n'}
            • Health check results (with your consent){'\n'}
            • Daily insights and tips{'\n'}
            • Emergency contact information{'\n\n'}
            They will NOT see:{'\n'}
            • Your personal notes{'\n'}
            • Detailed medical information{'\n'}
            • Chat history with AI
          </Text>
        </View>

        <View style={[styles.featuredCard, shadows.md]}>
          <LinearGradient colors={['#FFE4EE', '#E8F4FF']} style={styles.featuredGradient}>
            <Text style={styles.featuredEmoji}>💪</Text>
            <Text style={styles.featuredTitle}>Be Supportive</Text>
            <Text style={styles.featuredText}>
              Pregnancy is a journey best shared with loved ones. Keep your partner involved and connected.
            </Text>
          </LinearGradient>
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
  content: { flex: 1, padding: 16 },
  scroll: { padding: 16, gap: 12 },
  setupCard: {
    backgroundColor: '#FFF3E0', borderRadius: radius.xl,
    padding: 24, borderWidth: 1, borderColor: '#FFB74D',
  },
  setupEmoji: { fontSize: 48, textAlign: 'center', marginBottom: 12 },
  setupTitle: { fontSize: 18, fontWeight: '700', color: '#E65100', textAlign: 'center', marginBottom: 12 },
  setupText: { fontSize: 14, color: '#795548', textAlign: 'center', marginBottom: 16 },
  setupSteps: { gap: 8 },
  setupStep: { fontSize: 13, color: '#795548', lineHeight: 20 },
  shareCard: {
    backgroundColor: '#fff', borderRadius: radius.xl,
    padding: 20, borderWidth: 1, borderColor: colors.border,
  },
  shareTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  shareText: { fontSize: 14, color: colors.textMuted, marginBottom: 16, lineHeight: 20 },
  input: {
    backgroundColor: colors.background, borderRadius: radius.lg,
    padding: 14, fontSize: 14, color: colors.textPrimary,
    borderWidth: 1, borderColor: colors.border,
  },
  profilesSection: { gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  profileCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: radius.xl,
    padding: 16, borderWidth: 1, borderColor: colors.border,
  },
  profileAvatar: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  profileAvatarText: { fontSize: 20, fontWeight: '700', color: '#fff' },
  profileInfo: { flex: 1, marginLeft: 12 },
  profileName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  profileMonth: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  statusText: { fontSize: 11, fontWeight: '700' },
  emptyCard: {
    backgroundColor: '#fff', borderRadius: radius.xl,
    padding: 24, alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  emptyText: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  infoCard: {
    backgroundColor: '#F0F7FF', borderRadius: radius.xl,
    padding: 16, borderWidth: 1, borderColor: '#D6E8FF',
  },
  infoTitle: { fontSize: 15, fontWeight: '700', color: colors.accentDark, marginBottom: 12 },
  infoText: { fontSize: 13, color: colors.accentDark, lineHeight: 22 },
  featuredCard: { borderRadius: radius.xl, overflow: 'hidden' },
  featuredGradient: { padding: 20, alignItems: 'center' },
  featuredEmoji: { fontSize: 40, marginBottom: 8 },
  featuredTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  featuredText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});
