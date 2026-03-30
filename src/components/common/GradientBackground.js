import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';

export default function GradientBackground({ children, style, colors: customColors }) {
  return (
    <LinearGradient
      colors={customColors || ['#FFF8FA', '#F0F7FF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
