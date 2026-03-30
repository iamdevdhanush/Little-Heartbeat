import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity } from 'react-native';
import { colors, radius } from '../../theme/colors';

export default function Input({ label, value, onChangeText, placeholder, keyboardType, secureTextEntry, style, multiline, hint }) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, focused && styles.focused]}>
        <TextInput
          style={[styles.input, multiline && styles.multiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType={keyboardType || 'default'}
          secureTextEntry={secureTextEntry && !show}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShow(!show)} style={styles.eyeBtn}>
            <Text style={styles.eyeIcon}>{show ? '👁' : '👁‍🗨'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBFD',
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
  focused: { borderColor: colors.primary, backgroundColor: '#FFF8FA' },
  input: { flex: 1, height: 50, color: colors.textPrimary, fontSize: 15 },
  multiline: { height: 80, textAlignVertical: 'top', paddingTop: 12 },
  eyeBtn: { padding: 4 },
  eyeIcon: { fontSize: 18 },
  hint: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
});
