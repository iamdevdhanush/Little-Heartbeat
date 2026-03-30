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

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Please fill in all fields');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    await setLoggedIn(true);
    setLoading(false);
    navigation.replace('ProfileSetup', { name });
  };

  return (
    <LinearGradient colors={['#EEF4FF', '#FFF0F5', '#FFF8FA']} style={styles.gradient}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 20 }]} showsVerticalScrollIndicator={false}>

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.emoji}>🌸</Text>
            <Text style={styles.title}>Create Your Account</Text>
            <Text style={styles.subtitle}>Start your pregnancy journey with us</Text>
          </View>

          <View style={[styles.card, shadows.lg]}>
            <Input label="Your Name" value={name} onChangeText={setName} placeholder="e.g. Priya" />
            <Input label="Email" value={email} onChangeText={setEmail} placeholder="your@email.com" keyboardType="email-address" />
            <Input label="Password" value={password} onChangeText={setPassword} placeholder="Create a password" secureTextEntry />

            <Button title="Create Account 💕" onPress={handleSignup} loading={loading} style={{ marginTop: 8 }} />
          </View>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Log in</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.terms}>
            By continuing, you agree to our Terms of Service and Privacy Policy. Your data is kept private.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: { paddingHorizontal: 24, flexGrow: 1 },
  backBtn: { alignSelf: 'flex-start', padding: 4, marginBottom: 8 },
  backText: { fontSize: 16, color: colors.primary, fontWeight: '600' },
  header: { alignItems: 'center', marginBottom: 28 },
  emoji: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '800', color: colors.textPrimary },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius['2xl'],
    padding: 24,
    borderWidth: 1, borderColor: colors.border,
  },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  loginText: { fontSize: 15, color: colors.textSecondary },
  loginLink: { fontSize: 15, color: colors.primary, fontWeight: '700' },
  terms: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 16, lineHeight: 18 },
});
