import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppProvider } from './src/context/AppContext';
import { DemoModeProvider } from './src/hooks/useDemoMode';
import AppNavigator from './src/navigation/AppNavigator';
import DemoModePanel from './src/components/common/DemoModePanel';

const isWeb = Platform.OS === 'web';

function AppContent() {
  return (
    <View style={styles.container}>
      <AppNavigator />
      <DemoModePanel />
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <DemoModeProvider>
            <StatusBar style="dark" />
            <AppContent />
          </DemoModeProvider>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
