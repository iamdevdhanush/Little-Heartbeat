import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ProfileSetupScreen from '../screens/onboarding/ProfileSetupScreen';
import DashboardScreen from '../screens/main/DashboardScreen';
import ChatScreen from '../screens/main/ChatScreen';
import RiskAnalysisScreen from '../screens/main/RiskAnalysisScreen';
import EmergencyScreen from '../screens/main/EmergencyScreen';
import EmergencyContactsScreen from '../screens/main/EmergencyContactsScreen';
import HospitalFinderScreen from '../screens/main/HospitalFinderScreen';
import HeartbeatScreen from '../screens/main/HeartbeatScreen';
import ContractionTimerScreen from '../screens/main/ContractionTimerScreen';
import NotificationSettingsScreen from '../screens/main/NotificationSettingsScreen';
import FamilyDashboardScreen from '../screens/main/FamilyDashboardScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ name, focused }) {
  const icons = {
    Dashboard: focused ? '🏠' : '🏡',
    Chat: focused ? '💬' : '💭',
    RiskAnalysis: focused ? '📊' : '📈',
    Emergency: '🚨',
    Profile: focused ? '👤' : '🙍',
  };
  return (
    <View style={styles.tabIcon}>
      <Text style={styles.tabEmoji}>{icons[name] || '●'}</Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{ tabBarLabel: 'AI Chat' }} />
      <Tab.Screen name="RiskAnalysis" component={RiskAnalysisScreen} options={{ tabBarLabel: 'Health' }} />
      <Tab.Screen
        name="Emergency"
        component={EmergencyScreen}
        options={{
          tabBarLabel: 'Emergency',
          tabBarActiveTintColor: colors.emergency,
          tabBarInactiveTintColor: colors.emergency,
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />
        <Stack.Screen name="HospitalFinder" component={HospitalFinderScreen} />
        <Stack.Screen name="Heartbeat" component={HeartbeatScreen} />
        <Stack.Screen name="ContractionTimer" component={ContractionTimerScreen} />
        <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
        <Stack.Screen name="FamilyDashboard" component={FamilyDashboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0E5F2',
    paddingTop: 6,
    paddingBottom: 6,
    height: 62,
    shadowColor: '#E8517A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  tabLabel: { fontSize: 10, fontWeight: '600', marginTop: 2 },
  tabIcon: { alignItems: 'center' },
  tabEmoji: { fontSize: 20 },
});
