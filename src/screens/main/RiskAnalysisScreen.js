import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadows } from '../../theme/colors';
import { useApp } from '../../context/AppContext';
import { analyzeHealthForm } from '../../services/aiService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import RiskBadge from '../../components/common/RiskBadge';

const SYMPTOMS = [
  { key: 'severe_headache', label: 'Severe Headache', emoji: '🤕' },
  { key: 'mild_headache', label: 'Mild Headache', emoji: '😔' },
  { key: 'blurred_vision', label: 'Blurred Vision', emoji: '👁' },
  { key: 'vomiting', label: 'Vomiting', emoji: '🤢' },
  { key: 'spotting', label: 'Light Spotting', emoji: '🩸' },
  { key: 'severe_cramps', label: 'Severe Cramps', emoji: '😣' },
  { key: 'swollen_feet', label: 'Swollen Feet', emoji: '🦵' },
  { key: 'difficulty_breathing', label: 'Difficulty Breathing', emoji: '😮‍💨' },
  { key: 'fever', label: 'Fever', emoji: '🌡️' },
  { key: 'chest_pain', label: 'Chest Pain', emoji: '💔' },
  { key: 'no_movement', label: 'No Baby Movement', emoji: '👶' },
  { key: 'fainting', label: 'Dizziness/Fainting', emoji: '💫' },
];

export default function RiskAnalysisScreen({ navigation }) {
  const { profile } = useApp();
  const insets = useSafeAreaInsets();

  const [systolic, setSystolic] = useState(profile?.bp?.split('/')[0] || '');
  const [diastolic, setDiastolic] = useState(profile?.bp?.split('/')[1] || '');
  const [sugarFasting, setSugarFasting] = useState(profile?.sugar || '');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleSymptom = (key) => {
    setSelectedSymptoms(prev =>
      prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]
    );
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const analysis = await analyzeHealthForm({
        systolic, diastolic, sugarFasting,
        symptoms: selectedSymptoms,
      });
      setResult(analysis);
      
      if (analysis.risk === 'High') {
        Alert.alert(
          '🚨 High Risk Detected',
          'Your symptoms indicate you should seek immediate medical attention.',
          [
            { text: 'View Emergency Help', onPress: () => navigation.navigate('Emergency') },
            { text: 'I\'ll Monitor', style: 'cancel' },
          ]
        );
      }
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Error', 'Unable to analyze your health data. Please try again.');
    }
    setLoading(false);
  };

  const handleReset = () => {
    setResult(null);
    setSelectedSymptoms([]);
    setSystolic(''); setDiastolic(''); setSugarFasting('');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#EEF4FF', '#FFF0F5']} style={styles.header}>
        <Text style={styles.headerTitle}>📊 Health Check</Text>
        <Text style={styles.headerSubtitle}>Let's see how you're doing today</Text>
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 80 }]} showsVerticalScrollIndicator={false}>

          {!result ? (
            <View style={{ gap: 12 }}>
              {/* BP Section */}
              <View style={[styles.card, shadows.sm]}>
                <Text style={styles.cardTitle}>🩺 Blood Pressure</Text>
                <Text style={styles.cardSubtitle}>Optional — enter if you have a reading</Text>
                <View style={styles.bpRow}>
                  <Input
                    label="Upper Number (Systolic)"
                    value={systolic}
                    onChangeText={setSystolic}
                    placeholder="e.g. 120"
                    keyboardType="numeric"
                    style={{ flex: 1, marginBottom: 0 }}
                  />
                  <Text style={styles.bpSlash}>/</Text>
                  <Input
                    label="Lower Number (Diastolic)"
                    value={diastolic}
                    onChangeText={setDiastolic}
                    placeholder="e.g. 80"
                    keyboardType="numeric"
                    style={{ flex: 1, marginBottom: 0 }}
                  />
                </View>
                <View style={styles.bpGuide}>
                  <Text style={styles.bpGuideTitle}>What's normal in pregnancy?</Text>
                  <Text style={styles.bpGuideText}>✅ Normal: below 120/80</Text>
                  <Text style={styles.bpGuideText}>⚠️ Monitor: 120–140 / 80–90</Text>
                  <Text style={styles.bpGuideText}>🚨 High risk: above 140/90</Text>
                </View>
              </View>

              {/* Sugar Section */}
              <View style={[styles.card, shadows.sm]}>
                <Text style={styles.cardTitle}>🍬 Blood Sugar</Text>
                <Text style={styles.cardSubtitle}>Fasting sugar level (optional)</Text>
                <Input
                  label="Fasting Sugar (mg/dL)"
                  value={sugarFasting}
                  onChangeText={setSugarFasting}
                  placeholder="e.g. 90"
                  keyboardType="numeric"
                  style={{ marginBottom: 0, marginTop: 8 }}
                />
                <View style={styles.bpGuide}>
                  <Text style={styles.bpGuideTitle}>What's normal in pregnancy?</Text>
                  <Text style={styles.bpGuideText}>✅ Normal fasting: below 95 mg/dL</Text>
                  <Text style={styles.bpGuideText}>⚠️ Monitor: 95–125 mg/dL</Text>
                  <Text style={styles.bpGuideText}>🚨 High: above 126 mg/dL</Text>
                </View>
              </View>

              {/* Symptoms Section */}
              <View style={[styles.card, shadows.sm]}>
                <Text style={styles.cardTitle}>🩹 Current Symptoms</Text>
                <Text style={styles.cardSubtitle}>Select all that apply today</Text>
                <View style={styles.symptomsGrid}>
                  {SYMPTOMS.map(s => {
                    const active = selectedSymptoms.includes(s.key);
                    return (
                      <TouchableOpacity
                        key={s.key}
                        style={[styles.symptomChip, active && styles.symptomChipActive]}
                        onPress={() => toggleSymptom(s.key)}
                      >
                        <Text style={styles.symptomEmoji}>{s.emoji}</Text>
                        <Text style={[styles.symptomLabel, active && styles.symptomLabelActive]}>
                          {s.label}
                        </Text>
                        {active && <Text style={styles.symptomCheck}>✓</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <Button
                title="Analyze My Health 🔍"
                onPress={handleAnalyze}
                loading={loading}
              />

              <View style={styles.disclaimer}>
                <Text style={styles.disclaimerText}>
                  ⚕️ This tool provides general guidance only. It is NOT a medical diagnosis. Always consult your doctor.
                </Text>
              </View>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {/* Result Header */}
              <LinearGradient
                colors={result.risk === 'High' ? ['#FFEBEE', '#FFCDD2'] : result.risk === 'Medium' ? ['#FEF6E7', '#FFF3CD'] : ['#E8F8F2', '#C8F0E2']}
                style={[styles.resultHeader, shadows.md]}
              >
                <Text style={styles.resultEmoji}>{result.emoji}</Text>
                <Text style={styles.resultTitle}>Your Health Report</Text>
                <View style={styles.riskBadgeWrapper}>
                  <RiskBadge risk={result.risk} size="lg" />
                </View>
                <Text style={styles.resultOverallMessage}>{result.overallMessage}</Text>
              </LinearGradient>

              {/* Reasons */}
              {result.reasons.length > 0 && (
                <View style={[styles.card, shadows.sm]}>
                  <Text style={styles.cardTitle}>🔍 What We Found</Text>
                  {result.reasons.map((reason, i) => (
                    <View key={i} style={styles.reasonRow}>
                      <Text style={styles.reasonDot}>•</Text>
                      <Text style={styles.reasonText}>{reason}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Steps */}
              <View style={[styles.card, shadows.sm]}>
                <Text style={styles.cardTitle}>✅ What To Do Now</Text>
                {result.steps.map((step, i) => (
                  <View key={i} style={styles.stepRow}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{i + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>

              {/* Confidence */}
              <View style={[styles.card, shadows.sm]}>
                <Text style={styles.cardTitle}>📈 How Sure Are We</Text>
                <View style={styles.confidenceRow}>
                  <View style={[
                    styles.confidenceBadge,
                    { backgroundColor: result.confidence === 'High' ? colors.riskLowBg : colors.riskMediumBg }
                  ]}>
                    <Text style={[
                      styles.confidenceText,
                      { color: result.confidence === 'High' ? colors.riskLow : colors.riskMedium }
                    ]}>
                      {result.confidence} Confidence
                    </Text>
                  </View>
                  <Text style={styles.confidenceNote}>Based on the information provided</Text>
                </View>
              </View>

              {/* Emergency button if High */}
              {result.risk === 'High' && (
                <TouchableOpacity
                  style={[styles.emergencyAction, shadows.md]}
                  onPress={() => navigation.navigate('Emergency')}
                >
                  <Text style={styles.emergencyActionText}>🚨 Get Emergency Help Now</Text>
                </TouchableOpacity>
              )}

              {/* Disclaimer */}
              <View style={styles.disclaimer}>
                <Text style={styles.disclaimerText}>
                  ⚕️ This is NOT a medical diagnosis. Always consult your doctor or midwife for proper medical advice.
                </Text>
              </View>

              <Button title="Check Again" variant="outline" onPress={handleReset} />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  headerSubtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  scroll: { padding: 16 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: radius.xl,
    padding: 16, borderWidth: 1, borderColor: colors.border,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  cardSubtitle: { fontSize: 12, color: colors.textMuted, marginBottom: 12 },
  bpRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  bpSlash: { fontSize: 24, color: colors.textMuted, fontWeight: '700', marginTop: 28 },
  bpGuide: { backgroundColor: '#F8F8FF', borderRadius: radius.lg, padding: 12, marginTop: 8 },
  bpGuideTitle: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginBottom: 6 },
  bpGuideText: { fontSize: 12, color: colors.textSecondary, marginBottom: 2 },
  symptomsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  symptomChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: '#F5F5F5', borderRadius: radius.full,
    borderWidth: 1.5, borderColor: '#E0E0E0',
  },
  symptomChipActive: { backgroundColor: '#FFF0F5', borderColor: colors.primary },
  symptomEmoji: { fontSize: 14 },
  symptomLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  symptomLabelActive: { color: colors.primary, fontWeight: '700' },
  symptomCheck: { fontSize: 12, color: colors.primary, fontWeight: '700' },

  resultHeader: {
    borderRadius: radius['2xl'], padding: 24, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)',
  },
  resultEmoji: { fontSize: 48, marginBottom: 8 },
  resultTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  riskBadgeWrapper: { marginBottom: 12 },
  resultOverallMessage: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },

  reasonRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  reasonDot: { fontSize: 18, color: colors.primary, lineHeight: 20 },
  reasonText: { flex: 1, fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  stepRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 8 },
  stepNumber: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  stepNumberText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  stepText: { flex: 1, fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginTop: 3 },

  confidenceRow: { gap: 6 },
  confidenceBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.full },
  confidenceText: { fontSize: 13, fontWeight: '700' },
  confidenceNote: { fontSize: 12, color: colors.textMuted },

  emergencyAction: {
    backgroundColor: colors.emergency, borderRadius: radius.xl,
    padding: 16, alignItems: 'center',
  },
  emergencyActionText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  disclaimer: {
    backgroundColor: '#F0F7FF', borderRadius: radius.lg,
    padding: 12, borderWidth: 1, borderColor: '#D6E8FF',
  },
  disclaimerText: { fontSize: 12, color: colors.accentDark, lineHeight: 18 },
});
