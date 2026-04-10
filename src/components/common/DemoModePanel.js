import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, shadows } from '../../theme/colors';
import { useDemoMode, DEMO_PRESET_SCENARIOS } from '../../hooks/useDemoMode';

const isWeb = Platform.OS === 'web';

export default function DemoModePanel() {
  const {
    isDemoMode,
    enableDemoMode,
    disableDemoMode,
    simulateLocation,
    simulateHealthRisk,
    triggerSOS,
    currentLocation,
    currentHealth,
    alertMessage,
    setAlertMessage,
  } = useDemoMode();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (alertMessage) {
      setShowAlert(true);
    }
  }, [alertMessage]);

  if (!isDemoMode) {
    return (
      <TouchableOpacity style={styles.enableButton} onPress={enableDemoMode}>
        <Text style={styles.enableButtonText}>🎭 Demo Mode</Text>
      </TouchableOpacity>
    );
  }

  const handleScenarioSelect = (scenario) => {
    simulateLocation(scenario.location);
    simulateHealthRisk(scenario.health);
  };

  const handleTriggerSOS = () => {
    triggerSOS({ name: 'Demo User', pregnancyMonth: 7 });
  };

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.floatingButton}
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <Text style={styles.floatingButtonText}>
            {isExpanded ? '✕' : '🎭'}
          </Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={[styles.panel, shadows.lg]}>
            <LinearGradient colors={['#FFE4EE', '#E8F4FF']} style={styles.panelHeader}>
              <Text style={styles.panelTitle}>🎭 Demo Mode</Text>
              <TouchableOpacity onPress={disableDemoMode}>
                <Text style={styles.exitText}>Exit Demo</Text>
              </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={styles.panelContent} showsVerticalScrollIndicator={false}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📍 Current Status</Text>
                <View style={styles.statusRow}>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: currentLocation.safe ? colors.riskLowBg : colors.riskHighBg }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: currentLocation.safe ? colors.riskLow : colors.riskHigh }
                    ]}>
                      {currentLocation.safe ? 'Safe Zone' : 'Risk Area'}
                    </Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: currentHealth.risk === 'High' ? colors.riskHighBg : 
                                     currentHealth.risk === 'Medium' ? colors.riskMediumBg : colors.riskLowBg }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: currentHealth.risk === 'High' ? colors.riskHigh :
                               currentHealth.risk === 'Medium' ? colors.riskMedium : colors.riskLow }
                    ]}>
                      {currentHealth.risk} Risk
                    </Text>
                  </View>
                </View>
                <Text style={styles.locationText}>📍 {currentLocation.name}</Text>
                <Text style={styles.vitalsText}>
                  🩺 BP: {currentHealth.bp} | 🍬 Sugar: {currentHealth.sugar}
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🎬 Quick Scenarios</Text>
                <View style={styles.scenarioGrid}>
                  {DEMO_PRESET_SCENARIOS.map((scenario) => (
                    <TouchableOpacity
                      key={scenario.id}
                      style={[styles.scenarioCard, shadows.sm]}
                      onPress={() => handleScenarioSelect(scenario)}
                    >
                      <Text style={styles.scenarioName}>{scenario.name}</Text>
                      <Text style={styles.scenarioDesc}>{scenario.description}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🚨 Actions</Text>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.emergency }]}
                  onPress={handleTriggerSOS}
                >
                  <Text style={styles.actionButtonText}>🆘 Trigger SOS</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🧪 Custom Simulation</Text>
                
                <Text style={styles.subsectionTitle}>Location:</Text>
                <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.chipButton} onPress={() => simulateLocation('safe')}>
                    <Text style={styles.chipText}>🟢 Safe</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.chipButton} onPress={() => simulateLocation('moderate')}>
                    <Text style={styles.chipText}>🟡 Moderate</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.chipButton} onPress={() => simulateLocation('danger')}>
                    <Text style={styles.chipText}>🔴 Danger</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.chipButton} onPress={() => simulateLocation('hospital')}>
                    <Text style={styles.chipText}>🏥 Hospital</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.subsectionTitle}>Health Risk:</Text>
                <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.chipButton} onPress={() => simulateHealthRisk('normal')}>
                    <Text style={styles.chipText}>✅ Normal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.chipButton} onPress={() => simulateHealthRisk('elevated')}>
                    <Text style={styles.chipText}>⚠️ Elevated</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.chipButton} onPress={() => simulateHealthRisk('high')}>
                    <Text style={styles.chipText}>🚨 High</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.infoBox]}>
                <Text style={styles.infoTitle}>💡 Demo Tips</Text>
                <Text style={styles.infoText}>
                  • Use this panel to simulate different scenarios{'\n'}
                  • Watch how the app responds to each situation{'\n'}
                  • Perfect for hackathon demonstrations{'\n'}
                  • Location and health data are simulated
                </Text>
              </View>
            </ScrollView>
          </View>
        )}
      </View>

      <Modal
        visible={showAlert}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowAlert(false);
          setAlertMessage(null);
        }}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowAlert(false);
            setAlertMessage(null);
          }}
        >
          <View style={[styles.alertCard, shadows.xl]}>
            <View style={[
              styles.alertIcon,
              { backgroundColor: alertMessage?.type === 'danger' ? colors.riskHighBg :
                               alertMessage?.type === 'warning' ? colors.riskMediumBg : colors.riskLowBg }
            ]}>
              <Text style={styles.alertIconText}>
                {alertMessage?.type === 'danger' ? '🚨' :
                 alertMessage?.type === 'warning' ? '⚠️' : '✅'}
              </Text>
            </View>
            <Text style={styles.alertTitle}>{alertMessage?.title}</Text>
            <Text style={styles.alertMessage}>{alertMessage?.message}</Text>
            <TouchableOpacity 
              style={styles.alertButton}
              onPress={() => {
                setShowAlert(false);
                setAlertMessage(null);
              }}
            >
              <Text style={styles.alertButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: isWeb ? 80 : 20,
    right: 20,
    zIndex: 9999,
  },
  enableButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.full,
    ...shadows.md,
  },
  enableButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  floatingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  floatingButtonText: {
    fontSize: 24,
  },
  panel: {
    position: 'absolute',
    bottom: 70,
    right: 0,
    width: 320,
    maxHeight: 500,
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: 10,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  exitText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  panelContent: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  locationText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  vitalsText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  scenarioGrid: {
    gap: 8,
  },
  scenarioCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scenarioName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  scenarioDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  actionButton: {
    padding: 14,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  subsectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chipButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.background,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  infoBox: {
    backgroundColor: '#F0F7FF',
    padding: 12,
    borderRadius: radius.lg,
    marginTop: 8,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accentDark,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: colors.accentDark,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  alertIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  alertIconText: {
    fontSize: 32,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  alertButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: radius.full,
  },
  alertButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
