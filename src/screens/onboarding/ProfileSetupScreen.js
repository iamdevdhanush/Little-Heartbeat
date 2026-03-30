import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView,
  TouchableOpacity, Alert, Platform, KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadows } from '../../theme/colors';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useApp } from '../../context/AppContext';

const MONTHS = [1,2,3,4,5,6,7,8,9];
const REGIONS = [
  { key: 'north_india', label: 'North India' },
  { key: 'south_india', label: 'South India' },
  { key: 'west_india', label: 'West India' },
  { key: 'east_india', label: 'East India' },
  { key: 'other', label: 'Other / General' },
];

export default function ProfileSetupScreen({ navigation, route }) {
  const { updateProfile } = useApp();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState(route?.params?.name || '');
  const [age, setAge] = useState('');
  const [pregnancyMonth, setPregnancyMonth] = useState(null);
  const [region, setRegion] = useState(null);
  const [bp, setBp] = useState('');
  const [sugar, setSugar] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleSave = async () => {
    if (!name || !age || !pregnancyMonth || !region) {
      Alert.alert('Please complete all required fields');
      return;
    }
    setLoading(true);
    await updateProfile({ name, age: parseInt(age), pregnancyMonth, region, bp, sugar, createdAt: new Date().toISOString() });
    setLoading(false);
    navigation.replace('MainTabs');
  };

  return (
    <LinearGradient colors={['#FFF0F5', '#F0F7FF']} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.stepLabel}>Step {step} of 2</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: step === 1 ? '50%' : '100%' }]} />
            </View>
            <Text style={styles.title}>{step === 1 ? 'Tell us about you 👋' : 'A bit more detail 💕'}</Text>
            <Text style={styles.subtitle}>{step === 1 ? 'This helps us personalize your care' : 'Optional — helps us give better advice'}</Text>
          </View>

          {step === 1 ? (
            <View style={[styles.card, shadows.md]}>
              <Input label="Your Name *" value={name} onChangeText={setName} placeholder="e.g. Priya" />
              <Input label="Your Age *" value={age} onChangeText={setAge} placeholder="e.g. 27" keyboardType="numeric" />

              <Text style={styles.sectionLabel}>Pregnancy Month *</Text>
              <View style={styles.monthGrid}>
                {MONTHS.map(m => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.monthChip, pregnancyMonth === m && styles.monthChipActive]}
                    onPress={() => setPregnancyMonth(m)}
                  >
                    <Text style={[styles.monthChipText, pregnancyMonth === m && styles.monthChipTextActive]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionLabel}>Your Region *</Text>
              {REGIONS.map(r => (
                <TouchableOpacity
                  key={r.key}
                  style={[styles.regionChip, region === r.key && styles.regionChipActive]}
                  onPress={() => setRegion(r.key)}
                >
                  <Text style={[styles.regionText, region === r.key && styles.regionTextActive]}>{r.label}</Text>
                  {region === r.key && <Text style={styles.checkMark}>✓</Text>}
                </TouchableOpacity>
              ))}

              <Button
                title="Next →"
                onPress={() => {
                  if (!name || !age || !pregnancyMonth || !region) {
                    Alert.alert('Please fill in all required fields');
                    return;
                  }
                  setStep(2);
                }}
                style={{ marginTop: 8 }}
              />
            </View>
          ) : (
            <View style={[styles.card, shadows.md]}>
              <Text style={styles.optionalNote}>These are optional but help us give you better health insights.</Text>

              <Input
                label="Blood Pressure"
                value={bp}
                onChangeText={setBp}
                placeholder="e.g. 120/80"
                hint="Enter as systolic/diastolic"
              />
              <Input
                label="Fasting Sugar Level"
                value={sugar}
                onChangeText={setSugar}
                placeholder="e.g. 90"
                keyboardType="numeric"
                hint="In mg/dL"
              />

              <View style={styles.infoBox}>
                <Text style={styles.infoText}>🔒 Your health data is stored only on your device. We never share it.</Text>
              </View>

              <View style={styles.buttonRow}>
                <Button title="← Back" variant="outline" onPress={() => setStep(1)} style={{ flex: 1, marginRight: 8 }} />
                <Button title="Get Started 💕" onPress={handleSave} loading={loading} style={{ flex: 1.5 }} />
              </View>

              <TouchableOpacity onPress={handleSave} style={styles.skipBtn}>
                <Text style={styles.skipText}>Skip for now</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, flexGrow: 1 },
  header: { marginBottom: 24 },
  stepLabel: { fontSize: 13, color: colors.textMuted, fontWeight: '600', marginBottom: 8 },
  progressBar: {
    height: 4, backgroundColor: '#FFD6E5', borderRadius: 2, marginBottom: 16, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', backgroundColor: colors.primary, borderRadius: 2,
  },
  title: { fontSize: 24, fontWeight: '800', color: colors.textPrimary },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius['2xl'],
    padding: 20,
    borderWidth: 1, borderColor: colors.border,
  },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 10, marginTop: 4 },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  monthChip: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#FFF0F5', borderWidth: 1.5, borderColor: '#FFD6E5',
    justifyContent: 'center', alignItems: 'center',
  },
  monthChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  monthChipText: { fontSize: 16, fontWeight: '600', color: colors.textSecondary },
  monthChipTextActive: { color: '#fff' },
  regionChip: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: '#FFFBFD', marginBottom: 8,
  },
  regionChipActive: { borderColor: colors.primary, backgroundColor: '#FFF0F5' },
  regionText: { fontSize: 15, color: colors.textSecondary, fontWeight: '500' },
  regionTextActive: { color: colors.primary, fontWeight: '700' },
  checkMark: { fontSize: 16, color: colors.primary, fontWeight: '700' },
  optionalNote: { fontSize: 14, color: colors.textMuted, marginBottom: 16, lineHeight: 20 },
  infoBox: {
    backgroundColor: '#EEF4FF', borderRadius: radius.lg, padding: 12, marginTop: 4, marginBottom: 16,
  },
  infoText: { fontSize: 13, color: colors.accentDark, lineHeight: 18 },
  buttonRow: { flexDirection: 'row' },
  skipBtn: { alignItems: 'center', marginTop: 12 },
  skipText: { fontSize: 13, color: colors.textMuted, textDecorationLine: 'underline' },
});
