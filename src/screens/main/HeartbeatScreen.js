import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Animated, Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { colors, radius, shadows } from '../../theme/colors';
import { useApp } from '../../context/AppContext';

const HEARTBEAT_INTERVALS = {
  firstTrimester: 110,
  secondTrimester: 100,
  thirdTrimester: 90,
};

export default function HeartbeatScreen({ navigation }) {
  const { profile } = useApp();
  const insets = useSafeAreaInsets();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMode, setCurrentMode] = useState('reassurance');
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const secondPulseAnim = useRef(new Animated.Value(1)).current;

  const getTrimester = () => {
    const month = profile?.pregnancyMonth || 5;
    if (month <= 3) return 'firstTrimester';
    if (month <= 6) return 'secondTrimester';
    return 'thirdTrimester';
  };

  const getBPM = () => {
    return HEARTBEAT_INTERVALS[getTrimester()];
  };

  useEffect(() => {
    return () => {
      pulseAnim.stopAnimation();
      glowAnim.stopAnimation();
      secondPulseAnim.stopAnimation();
    };
  }, []);

  const playHeartbeatPattern = async () => {
    if (isPlaying) {
      stopAnimation();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    const bpm = getBPM();
    const beatDuration = 60000 / bpm;
    const lubDuration = beatDuration * 0.3;
    const dubDuration = beatDuration * 0.2;
    const pauseDuration = beatDuration * 0.5;

    const animateLoop = async () => {
      while (isPlaying) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: lubDuration,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: lubDuration * 0.5,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start();

        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: lubDuration,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: lubDuration * 0.5,
            useNativeDriver: true,
          }),
        ]).start();

        await new Promise(resolve => setTimeout(resolve, lubDuration * 1.5));

        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        Animated.sequence([
          Animated.timing(secondPulseAnim, {
            toValue: 1.15,
            duration: dubDuration,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(secondPulseAnim, {
            toValue: 1,
            duration: dubDuration * 0.5,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start();

        await new Promise(resolve => setTimeout(resolve, pauseDuration));
      }
    };

    animateLoop();
  };

  const stopAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
    glowAnim.stopAnimation();
    glowAnim.setValue(0);
    secondPulseAnim.stopAnimation();
    secondPulseAnim.setValue(1);
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.8],
  });

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });

  const renderReassuranceMode = () => (
    <>
      <Text style={styles.modeDescription}>
        Take a moment to bond with your baby
      </Text>
      <Text style={styles.reassuranceText}>
        Did you know? Your baby's heart starts beating at about 6 weeks! 
        By month {profile?.pregnancyMonth || 5}, their heart beats around {getBPM()} times per minute.
      </Text>
    </>
  );

  const renderSleepMode = () => (
    <>
      <Text style={styles.modeDescription}>
        Gentle lullaby rhythm for relaxation
      </Text>
      <Text style={styles.reassuranceText}>
        A slower heartbeat can help you relax and may encourage 
        your baby to settle down too. Perfect for bedtime or nap time.
      </Text>
    </>
  );

  const renderBondingMode = () => (
    <>
      <Text style={styles.modeDescription}>
        Share this moment with your partner
      </Text>
      <Text style={styles.reassuranceText}>
        Playing heartbeat sounds can help your partner feel more 
        connected to the pregnancy. Put your phone on your belly 
        and let them experience this magical moment!
      </Text>
    </>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#FFE4EE', '#E8F4FF']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💗 Heartbeat</Text>
        <Text style={styles.headerSubtitle}>
          Listen to your baby's heartbeat
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.modeSelector}>
          {['reassurance', 'sleep', 'bonding'].map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[styles.modeChip, currentMode === mode && styles.modeChipActive]}
              onPress={() => setCurrentMode(mode)}
            >
              <Text style={[styles.modeChipText, currentMode === mode && styles.modeChipTextActive]}>
                {mode === 'reassurance' ? '💕 Reassurance' : 
                 mode === 'sleep' ? '😴 Sleep' : '👨‍👩‍👧 Bonding'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.heartContainer}>
          <Animated.View style={[
            styles.heartGlow,
            {
              opacity: glowOpacity,
              transform: [{ scale: glowScale }],
            }
          ]} />
          
          <Animated.View 
            style={[
              styles.heartCircle,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <TouchableOpacity 
              style={styles.heartButton}
              onPress={playHeartbeatPattern}
              activeOpacity={0.8}
            >
              <Text style={styles.heartEmoji}>💗</Text>
              {isPlaying && (
                <Text style={styles.playingText}>Playing...</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          <Animated.View 
            style={[
              styles.secondHeart,
              { transform: [{ scale: secondPulseAnim }] }
            ]}
          />
        </View>

        <View style={styles.infoCard}>
          {currentMode === 'reassurance' && renderReassuranceMode()}
          {currentMode === 'sleep' && renderSleepMode()}
          {currentMode === 'bonding' && renderBondingMode()}
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>📊 Heartbeat Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{getBPM()}</Text>
              <Text style={styles.statLabel}>BPM</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile?.pregnancyMonth || 5}</Text>
              <Text style={styles.statLabel}>Month</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{getTrimester().replace('Trimester', '')}</Text>
              <Text style={styles.statLabel}>Trimester</Text>
            </View>
          </View>
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>📝 Note</Text>
          <Text style={styles.noteText}>
            This feature uses haptic feedback to simulate the heartbeat experience. 
            Add a heartbeat.mp3 audio file to assets/audio/ for actual sound.
          </Text>
        </View>
      </View>
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
  modeSelector: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  modeChip: {
    flex: 1, paddingVertical: 10, paddingHorizontal: 8,
    backgroundColor: '#fff', borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center',
  },
  modeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  modeChipText: { fontSize: 11, color: colors.textSecondary, fontWeight: '600', textAlign: 'center' },
  modeChipTextActive: { color: '#fff' },
  heartContainer: { alignItems: 'center', justifyContent: 'center', height: 250 },
  heartGlow: {
    position: 'absolute',
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: colors.primary,
  },
  heartCircle: {
    ...shadows.lg,
  },
  heartButton: {
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 4, borderColor: colors.primary,
  },
  heartEmoji: { fontSize: 64 },
  playingText: { fontSize: 12, color: colors.primary, fontWeight: '600', marginTop: 4 },
  secondHeart: {
    position: 'absolute',
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primaryLight,
    right: '30%', top: '20%',
    opacity: 0.6,
  },
  modeDescription: { fontSize: 16, color: colors.textPrimary, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
  reassuranceText: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  infoCard: { backgroundColor: '#fff', borderRadius: radius.xl, padding: 20, marginBottom: 12, ...shadows.sm },
  statsCard: { backgroundColor: '#F0F7FF', borderRadius: radius.xl, padding: 16, marginBottom: 12, ...shadows.sm },
  statsTitle: { fontSize: 14, fontWeight: '700', color: colors.accentDark, marginBottom: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: '800', color: colors.accentDark },
  statLabel: { fontSize: 12, color: colors.accent, marginTop: 2 },
  statDivider: { width: 1, height: 40, backgroundColor: colors.accentLight },
  noteCard: { backgroundColor: '#FFF8E1', borderRadius: radius.xl, padding: 16, ...shadows.sm },
  noteTitle: { fontSize: 13, fontWeight: '700', color: '#F57C00', marginBottom: 4 },
  noteText: { fontSize: 12, color: '#795548', lineHeight: 18 },
});
