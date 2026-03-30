import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadows } from '../../theme/colors';
import { useApp } from '../../context/AppContext';
import { clearAll } from '../../services/storageService';
import Button from '../../components/common/Button';

const REGIONS = {
  north_india: 'North India', south_india: 'South India',
  west_india: 'West India', east_india: 'East India', other: 'Other / General',
};

const BODY_CHANGES = [
  { symptom: 'Back Pain', title: 'Back Pain During Pregnancy', emoji: '🔙',
    explanation: 'As your baby grows, your body shifts its center of gravity. This puts extra strain on your back. Mild back pain is very normal.',
    tips: ['Rest and avoid standing for too long', 'Use a pregnancy pillow when sleeping', 'Gentle back stretches can help', 'Warm compress on the lower back'] },
  { symptom: 'Swelling', title: 'Mild Swelling is Normal', emoji: '🦵',
    explanation: 'Mild swelling in feet and ankles is very common, especially after month 5. Your body holds extra fluid during pregnancy.',
    tips: ['Elevate your feet when sitting', 'Avoid standing for long periods', 'Drink plenty of water', 'Avoid too much salt'] },
  { symptom: 'Heartburn', title: 'Heartburn During Pregnancy', emoji: '🔥',
    explanation: 'Pregnancy hormones relax the valve between your stomach and food pipe. This causes a burning feeling. It is uncomfortable but not harmful.',
    tips: ['Eat smaller meals more often', 'Avoid lying down right after eating', 'Avoid spicy or oily foods', 'Sleep with head slightly raised'] },
  { symptom: 'Nausea', title: 'Morning Sickness', emoji: '🤢',
    explanation: 'Nausea is caused by rising pregnancy hormones. It usually improves after month 3. It is a sign your pregnancy is going well!',
    tips: ['Eat small meals every 2-3 hours', 'Ginger tea or ginger biscuits help', 'Avoid strong smells', 'Keep crackers nearby'] },
];

export default function ProfileScreen({ navigation }) {
  const { profile, language, setLanguage, updateProfile } = useApp();
  const insets = useSafeAreaInsets();
  const [expandedSymptom, setExpandedSymptom] = useState(null);

  const handleLanguageToggle = async () => {
    const newLang = language === 'en' ? 'hi' : 'en';
    await setLanguage(newLang);
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out?',
      'Are you sure you want to log out? Your data will remain saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: async () => {
          await clearAll();
          navigation.replace('Login');
        }},
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#FFE4EE', '#E8F4FF']} style={styles.profileHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{profile?.name?.[0]?.toUpperCase() || '💕'}</Text>
        </View>
        <Text style={styles.profileName}>{profile?.name || 'Mama'}</Text>
        <Text style={styles.profileDetail}>
          Age {profile?.age || '--'} • Month {profile?.pregnancyMonth || '--'} • {REGIONS[profile?.region] || 'General'}
        </Text>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('ProfileSetup')}
        >
          <Text style={styles.editBtnText}>✏️ Edit Profile</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 80 }]} showsVerticalScrollIndicator={false}>

        {/* Pregnancy Progress */}
        <View style={[styles.card, shadows.sm]}>
          <Text style={styles.cardTitle}>🤰 Pregnancy Progress</Text>
          <View style={styles.progressRow}>
            {[1,2,3,4,5,6,7,8,9].map(m => (
              <View key={m} style={[
                styles.progressDot,
                m < (profile?.pregnancyMonth || 5) && styles.progressDotDone,
                m === (profile?.pregnancyMonth || 5) && styles.progressDotCurrent,
              ]}>
                <Text style={[
                  styles.progressDotText,
                  (m <= (profile?.pregnancyMonth || 5)) && styles.progressDotTextActive,
                ]}>{m}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.progressLabel}>
            You are in month {profile?.pregnancyMonth || 5} of your pregnancy 💕
          </Text>
        </View>

        {/* Health Stats */}
        {(profile?.bp || profile?.sugar) && (
          <View style={[styles.card, shadows.sm]}>
            <Text style={styles.cardTitle}>📋 Health Stats</Text>
            <View style={styles.statsRow}>
              {profile?.bp && (
                <View style={styles.statItem}>
                  <Text style={styles.statEmoji}>🩺</Text>
                  <Text style={styles.statValue}>{profile.bp}</Text>
                  <Text style={styles.statLabel}>Blood Pressure</Text>
                </View>
              )}
              {profile?.sugar && (
                <View style={styles.statItem}>
                  <Text style={styles.statEmoji}>🍬</Text>
                  <Text style={styles.statValue}>{profile.sugar} mg/dL</Text>
                  <Text style={styles.statLabel}>Sugar Level</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Body Changes Explainer */}
        <View style={[styles.card, shadows.sm]}>
          <Text style={styles.cardTitle}>🧘 Body Changes Explained</Text>
          <Text style={styles.cardSubtitle}>Tap any symptom to learn more</Text>
          {BODY_CHANGES.map((item, i) => (
            <View key={i}>
              <TouchableOpacity
                style={styles.symptomRow}
                onPress={() => setExpandedSymptom(expandedSymptom === i ? null : i)}
              >
                <Text style={styles.symptomEmoji}>{item.emoji}</Text>
                <Text style={styles.symptomTitle}>{item.symptom}</Text>
                <Text style={styles.chevron}>{expandedSymptom === i ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {expandedSymptom === i && (
                <View style={styles.symptomExpanded}>
                  <Text style={styles.symptomExplanation}>{item.explanation}</Text>
                  <Text style={styles.tipsTitle}>What helps:</Text>
                  {item.tips.map((tip, ti) => (
                    <View key={ti} style={styles.tipRow}>
                      <Text style={styles.tipDot}>•</Text>
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Settings */}
        <View style={[styles.card, shadows.sm]}>
          <Text style={styles.cardTitle}>⚙️ Settings</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Language</Text>
              <Text style={styles.settingValue}>{language === 'en' ? '🇬🇧 English' : '🇮🇳 हिंदी'}</Text>
            </View>
            <Switch
              value={language === 'hi'}
              onValueChange={handleLanguageToggle}
              trackColor={{ false: '#E0E0E0', true: '#FFB3CC' }}
              thumbColor={language === 'hi' ? colors.primary : '#BDBDBD'}
            />
          </View>
        </View>

        {/* About */}
        <View style={[styles.card, shadows.sm]}>
          <Text style={styles.cardTitle}>💗 About Little Heartbeat</Text>
          <Text style={styles.aboutText}>
            Little Heartbeat is your caring AI pregnancy companion. We provide general health insights and support — but we are NOT a replacement for medical care.
            {'\n\n'}
            Always consult your doctor or midwife for proper medical advice.
          </Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </View>

        <Button title="Log Out" variant="outline" onPress={handleLogout} style={{ marginTop: 4 }} />

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  profileHeader: { padding: 24, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border },
  avatarCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    marginBottom: 12, ...shadows.md, borderWidth: 2, borderColor: '#FFD6E5',
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: colors.primary },
  profileName: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  profileDetail: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  editBtn: {
    marginTop: 10, paddingHorizontal: 16, paddingVertical: 7,
    backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.border,
  },
  editBtnText: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  scroll: { padding: 16, gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: radius.xl, padding: 16, borderWidth: 1, borderColor: colors.border },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  cardSubtitle: { fontSize: 12, color: colors.textMuted, marginBottom: 10 },

  progressRow: { flexDirection: 'row', gap: 6, marginVertical: 10 },
  progressDot: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#F5F5F5', borderWidth: 1.5, borderColor: '#E0E0E0',
    justifyContent: 'center', alignItems: 'center',
  },
  progressDotDone: { backgroundColor: '#FFD6E5', borderColor: '#FFB3CC' },
  progressDotCurrent: { backgroundColor: colors.primary, borderColor: colors.primaryDark },
  progressDotText: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  progressDotTextActive: { color: '#fff' },
  progressLabel: { fontSize: 13, color: colors.textSecondary },

  statsRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  statItem: { flex: 1, alignItems: 'center', backgroundColor: '#FFF5F8', borderRadius: radius.lg, padding: 12 },
  statEmoji: { fontSize: 24, marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2 },

  symptomRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  symptomEmoji: { fontSize: 20, width: 30 },
  symptomTitle: { flex: 1, fontSize: 14, color: colors.textSecondary, fontWeight: '500' },
  chevron: { fontSize: 12, color: colors.textMuted },
  symptomExpanded: { backgroundColor: '#FFF8FA', borderRadius: radius.lg, padding: 12, marginBottom: 4 },
  symptomExplanation: { fontSize: 13, color: colors.textSecondary, lineHeight: 19, marginBottom: 8 },
  tipsTitle: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  tipRow: { flexDirection: 'row', gap: 6, marginBottom: 3 },
  tipDot: { fontSize: 14, color: colors.primary },
  tipText: { flex: 1, fontSize: 12, color: colors.textSecondary, lineHeight: 18 },

  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  settingLeft: {},
  settingLabel: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  settingValue: { fontSize: 13, color: colors.textMuted, marginTop: 2 },

  aboutText: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
  versionBadge: { alignSelf: 'flex-start', backgroundColor: '#F0F7FF', borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4, marginTop: 8 },
  versionText: { fontSize: 12, color: colors.accentDark },
});
