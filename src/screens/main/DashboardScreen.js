import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadows } from '../../theme/colors';
import { useApp } from '../../context/AppContext';
import { getBabyData } from '../../data/babyGrowth';
import { getRegionDiet } from '../../data/dietData';
import { getInsight } from '../../data/insights';
import { getTranslation } from '../../data/translations';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
  const { profile, language } = useApp();
  const insets = useSafeAreaInsets();
  const t = getTranslation(language);

  const month = profile?.pregnancyMonth || 5;
  const babyData = getBabyData(month);
  const diet = getRegionDiet(profile?.region);
  const insight = getInsight(month);

  const [dietTab, setDietTab] = useState('eat');

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      >
        {/* Hero Header */}
        <LinearGradient colors={['#FFE4EE', '#E8F4FF']} style={[styles.hero, { paddingTop: insets.top + 12 }]}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.greeting}>{greeting()}, {profile?.name || 'Mama'} 💕</Text>
              <Text style={styles.weekLabel}>Month {month} of your pregnancy</Text>
            </View>
            <TouchableOpacity
              style={styles.emergencyBtn}
              onPress={() => navigation.navigate('Emergency')}
            >
              <Text style={styles.emergencyBtnText}>🚨</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.content}>

          {/* Baby Card */}
          <View style={[styles.babyCard, shadows.lg]}>
            <LinearGradient colors={['#FFF0F5', '#F0F7FF']} style={styles.babyGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <View style={styles.babyLeft}>
                <Text style={styles.babyEmoji}>{babyData.emoji}</Text>
              </View>
              <View style={styles.babyRight}>
                <Text style={styles.babyLabel}>Your Baby</Text>
                <Text style={styles.babySize}>
                  is the size of{'\n'}
                  <Text style={styles.babySizeBold}>a {babyData.size}</Text>
                </Text>
                <View style={styles.babyStat}>
                  <Text style={styles.babyStatText}>📏 {babyData.sizeInCm}</Text>
                  <Text style={styles.babyStatText}>⚖️ {babyData.weight}</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Baby Development */}
          <View style={[styles.devCard, shadows.sm]}>
            <Text style={styles.devTitle}>👶 What's Happening Inside</Text>
            <Text style={styles.devText}>{babyData.description}</Text>
            <Text style={styles.devDevelopment}>{babyData.development}</Text>
          </View>

          {/* Today's Insight */}
          <LinearGradient colors={['#E8F4FF', '#D6E8FF']} style={[styles.insightCard, shadows.sm]}>
            <Text style={styles.insightTitle}>💡 Today's Insight</Text>
            <Text style={styles.insightText}>{insight.insight}</Text>
            <View style={styles.insightTip}>
              <Text style={styles.insightTipLabel}>This week's tip</Text>
              <Text style={styles.insightTipText}>{insight.tip}</Text>
            </View>
          </LinearGradient>

          {/* Body Changes */}
          <View style={[styles.section, shadows.sm]}>
            <Text style={styles.sectionTitle}>🏃 Exercise & Care</Text>
            <Text style={styles.sectionText}>{insight.exercise}</Text>
            <View style={styles.bodyChangesList}>
              {babyData.tips.map((tip, i) => (
                <View key={i} style={styles.tipRow}>
                  <Text style={styles.tipDot}>✓</Text>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Body Changes this month */}
          <View style={[styles.section, shadows.sm]}>
            <Text style={styles.sectionTitle}>🧘 Your Body This Month</Text>
            {babyData.bodyChanges.map((change, i) => (
              <View key={i} style={styles.changeRow}>
                <Text style={styles.changeDot}>💗</Text>
                <Text style={styles.changeText}>{change}</Text>
              </View>
            ))}
          </View>

          {/* Regional Diet */}
          <View style={[styles.dietCard, shadows.sm]}>
            <Text style={styles.sectionTitle}>🍽️ Your Diet Guide</Text>
            <Text style={styles.dietRegion}>{diet.label} Recommendations</Text>

            <View style={styles.dietTabs}>
              <TouchableOpacity
                style={[styles.dietTab, dietTab === 'eat' && styles.dietTabActive]}
                onPress={() => setDietTab('eat')}
              >
                <Text style={[styles.dietTabText, dietTab === 'eat' && styles.dietTabTextActive]}>✅ Eat These</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dietTab, dietTab === 'avoid' && styles.dietTabActive]}
                onPress={() => setDietTab('avoid')}
              >
                <Text style={[styles.dietTabText, dietTab === 'avoid' && styles.dietTabTextActive]}>🚫 Avoid These</Text>
              </TouchableOpacity>
            </View>

            {(dietTab === 'eat' ? diet.toEat : diet.toAvoid).map((item, i) => (
              <View key={i} style={styles.dietItem}>
                <View style={styles.dietEmoji}>
                  <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
                </View>
                <View style={styles.dietInfo}>
                  <Text style={styles.dietName}>{item.name}</Text>
                  <Text style={styles.dietReason}>{item.reason}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            {(profile?.pregnancyMonth || 5) >= 7 && (
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: '#FFF0F5' }]} onPress={() => navigation.navigate('ContractionTimer')}>
                <Text style={styles.quickBtnEmoji}>⏱️</Text>
                <Text style={styles.quickBtnText}>Contractions</Text>
              </TouchableOpacity>
            )}
            {(profile?.pregnancyMonth || 5) < 7 && (
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: '#FFF0F5' }]} onPress={() => navigation.navigate('Heartbeat')}>
                <Text style={styles.quickBtnEmoji}>💗</Text>
                <Text style={styles.quickBtnText}>Heartbeat</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.quickBtn, { backgroundColor: '#EEF4FF' }]} onPress={() => navigation.navigate('RiskAnalysis')}>
              <Text style={styles.quickBtnEmoji}>📊</Text>
              <Text style={styles.quickBtnText}>Health Check</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickBtn, { backgroundColor: '#FFF8EA' }]} onPress={() => navigation.navigate('HospitalFinder')}>
              <Text style={styles.quickBtnEmoji}>🏥</Text>
              <Text style={styles.quickBtnText}>Hospitals</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: 20, paddingBottom: 24 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  weekLabel: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  emergencyBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#FFE4E4', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#FFB3B3',
  },
  emergencyBtnText: { fontSize: 20 },
  content: { padding: 16, gap: 12 },

  babyCard: { borderRadius: radius['2xl'], overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  babyGradient: { flexDirection: 'row', padding: 20, alignItems: 'center' },
  babyLeft: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 16,
  },
  babyEmoji: { fontSize: 44 },
  babyRight: { flex: 1 },
  babyLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  babySize: { fontSize: 15, color: colors.textSecondary, marginTop: 4, lineHeight: 22 },
  babySizeBold: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  babyStat: { flexDirection: 'row', gap: 12, marginTop: 8 },
  babyStatText: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },

  devCard: {
    backgroundColor: '#FFFBFD', borderRadius: radius.xl,
    padding: 16, borderWidth: 1, borderColor: colors.border,
  },
  devTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  devText: { fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: 6 },
  devDevelopment: { fontSize: 13, color: colors.textMuted, lineHeight: 19, fontStyle: 'italic' },

  insightCard: { borderRadius: radius.xl, padding: 16 },
  insightTitle: { fontSize: 15, fontWeight: '700', color: colors.accentDark, marginBottom: 8 },
  insightText: { fontSize: 14, color: '#2D4A6E', lineHeight: 20, marginBottom: 10 },
  insightTip: { backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: radius.lg, padding: 12 },
  insightTipLabel: { fontSize: 11, fontWeight: '700', color: colors.accentDark, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  insightTipText: { fontSize: 13, color: '#2D4A6E', lineHeight: 18 },

  section: {
    backgroundColor: '#FFFFFF', borderRadius: radius.xl,
    padding: 16, borderWidth: 1, borderColor: colors.border,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 10 },
  sectionText: { fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: 8 },
  bodyChangesList: { gap: 6 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  tipDot: { fontSize: 14, color: colors.success, fontWeight: '700', marginTop: 1 },
  tipText: { flex: 1, fontSize: 13, color: colors.textSecondary, lineHeight: 19 },
  changeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 4 },
  changeDot: { fontSize: 14 },
  changeText: { flex: 1, fontSize: 13, color: colors.textSecondary, lineHeight: 19 },

  dietCard: {
    backgroundColor: '#FFFFFF', borderRadius: radius.xl,
    padding: 16, borderWidth: 1, borderColor: colors.border,
  },
  dietRegion: { fontSize: 12, color: colors.textMuted, marginBottom: 12 },
  dietTabs: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  dietTab: {
    flex: 1, paddingVertical: 8, borderRadius: radius.full,
    backgroundColor: '#F5F5F5', alignItems: 'center',
  },
  dietTabActive: { backgroundColor: colors.primary },
  dietTabText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  dietTabTextActive: { color: '#fff' },
  dietItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  dietEmoji: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#FFF5F8', justifyContent: 'center', alignItems: 'center',
  },
  dietInfo: { flex: 1 },
  dietName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  dietReason: { fontSize: 12, color: colors.textMuted, marginTop: 2 },

  quickActions: { flexDirection: 'row', gap: 8 },
  quickBtn: {
    flex: 1, padding: 14, borderRadius: radius.lg,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  quickBtnEmoji: { fontSize: 24, marginBottom: 4 },
  quickBtnText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
});
