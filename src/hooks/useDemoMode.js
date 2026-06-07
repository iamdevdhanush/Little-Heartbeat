// useDemoMode.js — localStorage replacement for AsyncStorage
import { useState, useEffect, useCallback, createContext, useContext } from 'react';

const DEMO_MODE_KEY = '@lh_demo_mode';

const DEMO_LOCATIONS = {
  safe: { latitude: 28.6139, longitude: 77.2090, name: 'New Delhi, India', safe: true },
  moderate: { latitude: 28.6304, longitude: 77.2177, name: 'Connaught Place', safe: false },
  danger: { latitude: 28.6508, longitude: 77.2373, name: 'Paharganj Area', safe: false },
  hospital: { latitude: 28.6172, longitude: 77.2065, name: 'AIIMS Hospital', safe: true, isHospital: true },
};

const SIMULATED_HEALTH_DATA = {
  normal: { bp: '120/80', sugar: '95', symptoms: [], risk: 'Low', emoji: '✅' },
  elevated: { bp: '135/88', sugar: '110', symptoms: ['mild_headache'], risk: 'Medium', emoji: '⚠️' },
  high: { bp: '158/102', sugar: '145', symptoms: ['severe_headache', 'blurred_vision', 'swollen_feet'], risk: 'High', emoji: '🚨' },
};

export const DemoModeContext = createContext({
  isDemoMode: false,
  enableDemoMode: () => {},
  disableDemoMode: () => {},
  simulateLocation: () => {},
  simulateHealthRisk: () => {},
  triggerSOS: () => {},
  getCurrentSimulatedData: () => {},
});

export const useDemoMode = () => useContext(DemoModeContext);

export const DemoModeProvider = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(DEMO_LOCATIONS.safe);
  const [currentHealth, setCurrentHealth] = useState(SIMULATED_HEALTH_DATA.normal);
  const [sosHistory, setSosHistory] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(DEMO_MODE_KEY);
    if (saved === 'true') setIsDemoMode(true);
  }, []);

  const enableDemoMode = async () => {
    setIsDemoMode(true);
    localStorage.setItem(DEMO_MODE_KEY, 'true');
  };

  const disableDemoMode = async () => {
    setIsDemoMode(false);
    localStorage.setItem(DEMO_MODE_KEY, 'false');
  };

  const simulateLocation = useCallback((locationType) => {
    const newLocation = DEMO_LOCATIONS[locationType] || DEMO_LOCATIONS.safe;
    setCurrentLocation(newLocation);
    if (!newLocation.safe && !newLocation.isHospital) {
      setAlertMessage({
        type: 'warning',
        title: '📍 Location Safety Alert',
        message: `You are in ${newLocation.name}. This area may have limited access to hospitals.`,
      });
    }
    return newLocation;
  }, []);

  const simulateHealthRisk = useCallback((riskType) => {
    const newHealth = SIMULATED_HEALTH_DATA[riskType] || SIMULATED_HEALTH_DATA.normal;
    setCurrentHealth(newHealth);
    if (newHealth.risk === 'High') {
      setAlertMessage({
        type: 'danger',
        title: '🚨 High Risk Detected!',
        message: 'Your symptoms indicate high risk. In a real scenario, this would trigger emergency protocols.',
      });
    }
    return newHealth;
  }, []);

  const triggerSOS = useCallback((profile) => {
    const sosEvent = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      location: currentLocation,
      health: currentHealth,
      profile,
    };
    setSosHistory((prev) => [...prev, sosEvent]);
    if (isDemoMode) {
      setAlertMessage({
        type: 'success',
        title: '✅ Demo: SOS Triggered',
        message: `Location: ${currentLocation.name}\nRisk Level: ${currentHealth.risk}\n\nIn production, this would send WhatsApp emergency message.`,
      });
    }
    return sosEvent;
  }, [currentLocation, currentHealth, isDemoMode]);

  const getCurrentSimulatedData = useCallback(() => ({
    location: currentLocation,
    health: currentHealth,
    sosHistory,
  }), [currentLocation, currentHealth, sosHistory]);

  const value = {
    isDemoMode, enableDemoMode, disableDemoMode,
    simulateLocation, simulateHealthRisk, triggerSOS, getCurrentSimulatedData,
    currentLocation, currentHealth, alertMessage, setAlertMessage,
  };

  return <DemoModeContext.Provider value={value}>{children}</DemoModeContext.Provider>;
};

export const DEMO_PRESET_SCENARIOS = [
  { id: 'scenario1', name: 'Normal Day', description: 'Safe location, healthy vitals', location: 'safe', health: 'normal' },
  { id: 'scenario2', name: 'Feeling Unwell', description: 'Elevated blood pressure', location: 'safe', health: 'elevated' },
  { id: 'scenario3', name: 'Emergency Alert', description: 'High risk symptoms in risky area', location: 'danger', health: 'high' },
  { id: 'scenario4', name: 'On the Way to Hospital', description: 'Contractions starting', location: 'hospital', health: 'elevated' },
];

export default useDemoMode;
