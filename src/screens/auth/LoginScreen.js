import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadows } from '../../theme/colors';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { setLoggedIn } from '../../services/storageService';
import { useApp } from '../../context/AppContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const { updateProfile } = useApp();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Please fill in all fields');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    await setLoggedIn(true);
    setLoading(false);
    navigation.replace('ProfileSetup');
  };

  return (
    <LinearGradient colors={['#FFF0F5', '#EEF4FF', '#FFF8FA']} style={styles.gradient}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]} showsVerticalScrollIndicator={false}>

          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>💗</Text>
            </View>
            <Text style={styles.appName}>Little Heartbeat</Text>
            <Text style={styles.tagline}>Your caring pregnancy companion</Text>
          </View>

          {/* Card */}
          <View style={[styles.card, shadows.lg]}>
            <Text style={styles.cardTitle}>Welcome back 🌸</Text>
            <Text style={styles.cardSubtitle}>Log in to continue your journey</Text>

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              keyboardType="email-address"
              style={{ marginTop: 20 }}
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Your password"
              secureTextEntry
            />

            <Button title="Log In" onPress={handleLogin} loading={loading} style={{ marginTop: 8 }} />

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Sign Up */}
          <View style={styles.signupRow}>
            <Text style={styles.signupText}>New here? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>Create an account</Text>
            </TouchableOpacity>
          </View>

          {/* Quick continue for demo */}
          <TouchableOpacity style={styles.demoBtn} onPress={handleLogin}>
            <Text style={styles.demoText}>✨ Continue without account (Demo)</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: { paddingHorizontal: 24, flexGrow: 1 },
  hero: { alignItems: 'center', marginBottom: 32 },
  logoCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center',
    ...shadows.lg,
    marginBottom: 16,
    borderWidth: 2, borderColor: '#FFD6E5',
  },
  logoEmoji: { fontSize: 44 },
  appName: { fontSize: 28, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5 },
  tagline: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius['2xl'],
    padding: 24,
    borderWidth: 1, borderColor: colors.border,
  },
  cardTitle: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  cardSubtitle: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  forgotBtn: { alignItems: 'center', marginTop: 16 },
  forgotText: { fontSize: 14, color: colors.primary, fontWeight: '500' },
  signupRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  signupText: { fontSize: 15, color: colors.textSecondary },
  signupLink: { fontSize: 15, color: colors.primary, fontWeight: '700' },
  demoBtn: { alignItems: 'center', marginTop: 16, padding: 12 },
  demoText: { fontSize: 13, color: colors.textMuted, textDecorationLine: 'underline' },
});
