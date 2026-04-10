import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, radius, shadows } from '../../theme/colors';
import { useApp } from '../../context/AppContext';

const CONTractionS_KEY = '@lh_contractions';
const LABOR_THRESHOLDS = {
  activeLabor: { frequency: 5, duration: 60 },
  transition: { frequency: 3, duration: 90 },
};

export default function ContractionTimerScreen({ navigation }) {
  const { profile } = useApp();
  const insets = useSafeAreaInsets();
  const [contractions, setContractions] = useState([]);
  const [isTiming, setIsTiming] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [currentDuration, setCurrentDuration] = useState(0);
  const [lastInterval, setLastInterval] = useState(null);
  const timerRef = useRef(null);
  const durationRef = useRef(null);

  useEffect(() => {
    loadContractions();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (durationRef.current) clearInterval(durationRef.current);
    };
  }, []);

  const loadContractions = async () => {
    try {
      const data = await AsyncStorage.getItem(CONTractionS_KEY);
      if (data) {
        setContractions(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading contractions:', error);
    }
  };

  const saveContractions = async (newContractions) => {
    try {
      await AsyncStorage.setItem(CONTractionS_KEY, JSON.stringify(newContractions));
    } catch (error) {
      console.error('Error saving contractions:', error);
    }
  };

  const startContraction = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Vibration.vibrate(100);

    const now = Date.now();
    setStartTime(now);
    setIsTiming(true);

    durationRef.current = setInterval(() => {
      setCurrentDuration(Math.floor((Date.now() - now) / 1000));
    }, 100);
  };

  const endContraction = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Vibration.vibrate(50);

    if (durationRef.current) {
      clearInterval(durationRef.current);
    }

    const endTime = Date.now();
    const duration = Math.floor((endTime - startTime) / 1000);

    const intervalFromPrevious = lastInterval 
      ? Math.floor((startTime - lastInterval) / 1000)
      : null;

    const newContraction = {
      id: Date.now().toString(),
      startTime: startTime,
      endTime: endTime,
      duration: duration,
      intervalFromPrevious: intervalFromPrevious,
    };

    const updatedContractions = [...contractions, newContraction];
    setContractions(updatedContractions);
    saveContractions(updatedContractions);

    setLastInterval(startTime);
    setIsTiming(false);
    setStartTime(null);
    setCurrentDuration(0);

    checkLaborPattern(updatedContractions);
  };

  const checkLaborPattern = (contractionsList) => {
    const recentContractions = contractionsList.slice(-5);
    
    if (recentContractions.length >= 3) {
      const avgInterval = recentContractions.reduce((sum, c) => {
        return sum + (c.intervalFromPrevious || 0);
      }, 0) / (recentContractions.length - 1);

      const avgDuration = recentContractions.reduce((sum, c) => sum + c.duration, 0) / recentContractions.length;

      if (avgInterval <= LABOR_THRESHOLDS.activeLabor.frequency * 60 && 
          avgDuration >= LABOR_THRESHOLDS.activeLabor.duration) {
        Alert.alert(
          '⚠️ Active Labor Pattern Detected',
          'Your contractions suggest you may be in active labor. Time to head to the hospital!',
          [
            { text: 'Continue Monitoring', style: 'cancel' },
            { text: 'Go to Emergency', onPress: () => navigation.navigate('Emergency') },
          ]
        );
      } else if (avgInterval <= LABOR_THRESHOLDS.transition.frequency * 60 && 
                 avgDuration >= LABOR_THRESHOLDS.transition.duration) {
        Alert.alert(
          '💡 Regular Contractions',
          'Your contractions are becoming regular. Keep monitoring and prepare to go to the hospital.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const clearContractions = () => {
    Alert.alert(
      'Clear All Contractions?',
      'This will delete your contraction history for this session.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setContractions([]);
            saveContractions([]);
            setLastInterval(null);
          },
        },
      ]
    );
  };

  const getStats = () => {
    if (contractions.length === 0) return null;

    const recent = contractions.slice(-5);
    const durations = recent.map(c => c.duration);
    const intervals = recent.filter(c => c.intervalFromPrevious).map(c => c.intervalFromPrevious);

    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const avgInterval = intervals.length > 0 
      ? intervals.reduce((a, b) => a + b, 0) / intervals.length 
      : null;

    return { avgDuration, avgInterval, count: contractions.length };
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getLaborStatus = () => {
    const stats = getStats();
    if (!stats || !stats.avgInterval) return null;

    if (stats.avgInterval <= 180 && stats.avgDuration >= 60) {
      return { label: 'Active Labor', color: colors.riskHigh, emoji: '🚨' };
    } else if (stats.avgInterval <= 300 && stats.avgDuration >= 45) {
      return { label: 'Early Labor', color: colors.riskMedium, emoji: '⚠️' };
    }
    return { label: 'Braxton Hicks', color: colors.riskLow, emoji: '💕' };
  };

  const stats = getStats();
  const laborStatus = getLaborStatus();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#FFE4EE', '#E8F4FF']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⏱️ Contraction Timer</Text>
        <Text style={styles.headerSubtitle}>
          {profile?.pregnancyMonth >= 7 
            ? 'Track your contractions as labor approaches' 
            : 'Practice tracking for when the time comes'}
        </Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 80 }]}>
        <TouchableOpacity
          style={[
            styles.mainButton,
            isTiming ? styles.mainButtonActive : styles.mainButtonInactive,
            shadows.lg,
          ]}
          onPress={isTiming ? endContraction : startContraction}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isTiming ? ['#E53935', '#C62828'] : ['#E8517A', '#C73D65']}
            style={styles.mainButtonGradient}
          >
            <Text style={styles.mainButtonEmoji}>
              {isTiming ? '⏹️' : '▶️'}
            </Text>
            <Text style={styles.mainButtonText}>
              {isTiming ? 'STOP' : 'START'}
            </Text>
            {isTiming && (
              <Text style={styles.durationText}>
                {formatTime(currentDuration)}
              </Text>
            )}
            <Text style={styles.mainButtonHint}>
              {isTiming 
                ? 'Tap when contraction ends' 
                : 'Tap when contraction begins'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {laborStatus && (
          <View style={[styles.statusCard, { borderColor: laborStatus.color }]}>
            <Text style={styles.statusEmoji}>{laborStatus.emoji}</Text>
            <Text style={[styles.statusLabel, { color: laborStatus.color }]}>
              {laborStatus.label}
            </Text>
          </View>
        )}

        {stats && (
          <View style={[styles.statsCard, shadows.sm]}>
            <Text style={styles.statsTitle}>📊 Last 5 Contractions</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.avgDuration.toFixed(0)}s</Text>
                <Text style={styles.statLabel}>Avg Duration</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {stats.avgInterval ? `${Math.floor(stats.avgInterval / 60)}m ${(stats.avgInterval % 60)}s` : '--'}
                </Text>
                <Text style={styles.statLabel}>Avg Interval</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.count}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>
          </View>
        )}

        {contractions.length > 0 && (
          <View style={[styles.historyCard, shadows.sm]}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>📋 History</Text>
              <TouchableOpacity onPress={clearContractions}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            </View>
            {contractions.slice(-10).reverse().map((c, index) => (
              <View key={c.id} style={styles.historyRow}>
                <View style={styles.historyLeft}>
                  <Text style={styles.historyNumber}>#{contractions.length - index}</Text>
                  <Text style={styles.historyTime}>{formatTimestamp(c.startTime)}</Text>
                </View>
                <View style={styles.historyRight}>
                  <Text style={styles.historyDuration}>Duration: {formatTime(c.duration)}</Text>
                  {c.intervalFromPrevious && (
                    <Text style={styles.historyInterval}>
                      Gap: {formatTime(c.intervalFromPrevious)}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={[styles.guideCard, shadows.sm]}>
          <Text style={styles.guideTitle}>📚 How to Use</Text>
          <View style={styles.guideList}>
            <Text style={styles.guideItem}>
              <Text style={styles.guideBold}>1. START</Text> - Tap when a contraction begins
            </Text>
            <Text style={styles.guideItem}>
              <Text style={styles.guideBold}>2. STOP</Text> - Tap when the contraction ends
            </Text>
            <Text style={styles.guideItem}>
              <Text style={styles.guideBold}>3. Track</Text> - We'll show patterns and timing
            </Text>
          </View>
          
          <View style={styles.thresholdBox}>
            <Text style={styles.thresholdTitle}>🚨 Go to Hospital When:</Text>
            <Text style={styles.thresholdItem}>• Contractions are 5 minutes apart</Text>
            <Text style={styles.thresholdItem}>• Each lasts 60+ seconds</Text>
            <Text style={styles.thresholdItem}>• Pattern continues for 1 hour</Text>
          </View>
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
  scroll: { padding: 16, gap: 12 },
  mainButton: { borderRadius: radius['2xl'], overflow: 'hidden', marginBottom: 8 },
  mainButtonActive: { transform: [{ scale: 1.02 }] },
  mainButtonGradient: { padding: 40, alignItems: 'center' },
  mainButtonEmoji: { fontSize: 64, marginBottom: 8 },
  mainButtonText: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: 4 },
  durationText: { fontSize: 48, fontWeight: '800', color: '#fff', marginVertical: 8 },
  mainButtonHint: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 8 },
  statusCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', borderRadius: radius.xl,
    padding: 16, borderWidth: 2, gap: 8,
  },
  statusEmoji: { fontSize: 24 },
  statusLabel: { fontSize: 18, fontWeight: '700' },
  statsCard: {
    backgroundColor: '#fff', borderRadius: radius.xl,
    padding: 16, borderWidth: 1, borderColor: colors.border,
  },
  statsTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 16 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '800', color: colors.primary },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  historyCard: {
    backgroundColor: '#fff', borderRadius: radius.xl,
    padding: 16, borderWidth: 1, borderColor: colors.border,
  },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  historyTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  clearText: { fontSize: 13, color: colors.riskHigh, fontWeight: '600' },
  historyRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  historyLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  historyNumber: { fontSize: 12, fontWeight: '700', color: colors.primary },
  historyTime: { fontSize: 13, color: colors.textSecondary },
  historyRight: { alignItems: 'flex-end' },
  historyDuration: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  historyInterval: { fontSize: 11, color: colors.textMuted },
  guideCard: {
    backgroundColor: '#F0F7FF', borderRadius: radius.xl,
    padding: 16, borderWidth: 1, borderColor: '#D6E8FF',
  },
  guideTitle: { fontSize: 15, fontWeight: '700', color: colors.accentDark, marginBottom: 12 },
  guideList: { gap: 8, marginBottom: 16 },
  guideItem: { fontSize: 13, color: colors.accentDark, lineHeight: 20 },
  guideBold: { fontWeight: '700' },
  thresholdBox: { backgroundColor: '#FFF5F5', borderRadius: radius.lg, padding: 12 },
  thresholdTitle: { fontSize: 13, fontWeight: '700', color: colors.riskHigh, marginBottom: 8 },
  thresholdItem: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
});
