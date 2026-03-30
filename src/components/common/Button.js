import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius } from '../../theme/colors';

export default function Button({ title, onPress, variant = 'primary', loading, disabled, style, icon }) {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isOutline = variant === 'outline';
  const isDanger = variant === 'danger';

  if (isPrimary || isDanger) {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled || loading} style={style} activeOpacity={0.85}>
        <LinearGradient
          colors={isDanger ? ['#E53935', '#C62828'] : ['#E8517A', '#C73D65']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.button, (disabled || loading) && styles.disabled]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <View style={styles.row}>
              {icon && <Text style={styles.icon}>{icon}</Text>}
              <Text style={styles.primaryText}>{title}</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (isSecondary) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.button, styles.secondary, (disabled || loading) && styles.disabled, style]}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} size="small" />
        ) : (
          <View style={styles.row}>
            {icon && <Text style={styles.icon}>{icon}</Text>}
            <Text style={styles.secondaryText}>{title}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  if (isOutline) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.button, styles.outline, (disabled || loading) && styles.disabled, style]}
        activeOpacity={0.85}
      >
        <View style={styles.row}>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={styles.outlineText}>{title}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  button: {
    height: 54,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  secondary: {
    backgroundColor: '#FFF0F5',
    borderWidth: 1,
    borderColor: '#FFD6E5',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  disabled: { opacity: 0.5 },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  secondaryText: { color: colors.primary, fontSize: 16, fontWeight: '600' },
  outlineText: { color: colors.primary, fontSize: 16, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icon: { fontSize: 18 },
});
