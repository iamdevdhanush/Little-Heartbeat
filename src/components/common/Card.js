import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { colors, radius, shadows } from '../../theme/colors';

export default function Card({ children, style, onPress, variant = 'default' }) {
  const cardStyle = [
    styles.card,
    variant === 'elevated' && styles.elevated,
    variant === 'colored' && styles.colored,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.92}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 16,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  elevated: {
    ...shadows.lg,
    backgroundColor: '#FFFBFD',
  },
  colored: {
    backgroundColor: '#FFF0F5',
    borderColor: '#FFD6E5',
  },
});
