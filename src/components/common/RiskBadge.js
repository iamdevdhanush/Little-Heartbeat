import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../../theme/colors';

export default function RiskBadge({ risk, size = 'md' }) {
  const config = {
    Low: { bg: colors.riskLowBg, text: colors.riskLow, label: '✅ Low Risk' },
    Medium: { bg: colors.riskMediumBg, text: colors.riskMedium, label: '⚠️ Medium Risk' },
    High: { bg: colors.riskHighBg, text: colors.riskHigh, label: '🚨 High Risk' },
  };

  const c = config[risk] || config.Low;
  const isLarge = size === 'lg';

  return (
    <View style={[styles.badge, { backgroundColor: c.bg }, isLarge && styles.large]}>
      <Text style={[styles.text, { color: c.text }, isLarge && styles.largeText]}>{c.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 13, fontWeight: '700' },
  large: { paddingHorizontal: 20, paddingVertical: 10 },
  largeText: { fontSize: 16 },
});
