import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEMO_MODE_KEY = '@lh_demo_mode';
const DEMO_LOCATIONS = {
  safe: { latitude: 28.6139, longitude: 77.2090, name: 'New Delhi, India', safe: true },
  moderate: { latitude: 28.6304, longitude: 77.2177, name: 'Connaught Place', safe: false },
  danger: { latitude: 28.6508, longitude: 77.2373, name: ' Paharganj Area', safe: false },
  hospital: { latitude: 28.6172, longitude: 77.2065, name: 'AIIMS Hospital', safe: true, isHospital: true },
};

const SIMULATED_HEALTH_DATA = {
  normal: {
    bp: '120/80',
    sugar: '95',
    symptoms: [],
    risk: 'Low',
    emoji: '✅',
  },
  elevated: {
    bp: '135/88',
    sugar: '110',
    symptoms: ['mild_headache'],
    risk: 'Medium',
    emoji: '⚠️',
  },
  high: {
    bp: '158/102',
    sugar: '145',
    symptoms: ['severe_headache', 'blurred_vision', 'swollen_feet'],
    risk: 'High',
    emoji: '🚨',
  },
};

const DEMO_SMS_HISTORY = [];

export const DemoModeContext = createContext({
  isDemoMode: false,
  enableDemoMode: () => {},
  disableDemoMode: () => {},
  simulateLocation: (locationType) => {},
  simulateHealthRisk: (riskType) => {},
  triggerSOS: () => {},
  getCurrentSimulatedData: () => {},
});

export const useDemoMode = () => {
  const context = useContext(DemoModeContext);
  return context;
};

export const DemoModeProvider = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(DEMO_LOCATIONS.safe);
  const [currentHealth, setCurrentHealth] = useState(SIMULATED_HEALTH_DATA.normal);
  const [sosHistory, setSosHistory] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null);

  useEffect(() => {
    loadDemoMode();
  }, []);

  const loadDemoMode = async () => {
    try {
      const saved = await AsyncStorage.getItem(DEMO_MODE_KEY);
      if (saved === 'true') {
        setIsDemoMode(true);
      }
    } catch (e) {
      console.log('Error loading demo mode');
    }
  };

  const enableDemoMode = async () => {
    setIsDemoMode(true);
    await AsyncStorage.setItem(DEMO_MODE_KEY, 'true');
  };

  const disableDemoMode = async () => {
    setIsDemoMode(false);
    await AsyncStorage.setItem(DEMO_MODE_KEY, 'false');
  };

  const simulateLocation = useCallback((locationType) => {
    const locations = {
      safe: DEMO_LOCATIONS.safe,
      moderate: DEMO_LOCATIONS.moderate,
      danger: DEMO_LOCATIONS.danger,
      hospital: DEMO_LOCATIONS.hospital,
    };
    const newLocation = locations[locationType] || DEMO_LOCATIONS.safe;
    setCurrentLocation(newLocation);
    
    if (!newLocation.safe && !newLocation.isHospital) {
      setAlertMessage({
        type: 'warning',
        title: '📍 Location Safety Alert',
        message: `You are in ${newLocation.name}. This area may have limited access to hospitals. Consider moving to a safer location.`,
      });
    }
    
    return newLocation;
  }, []);

  const simulateHealthRisk = useCallback((riskType) => {
    const healthData = {
      normal: SIMULATED_HEALTH_DATA.normal,
      elevated: SIMULATED_HEALTH_DATA.elevated,
      high: SIMULATED_HEALTH_DATA.high,
    };
    const newHealth = healthData[riskType] || SIMULATED_HEALTH_DATA.normal;
    setCurrentHealth(newHealth);
    
    if (newHealth.risk === 'High') {
      setAlertMessage({
        type: 'danger',
        title: '🚨 High Risk Detected!',
        message: 'Your symptoms indicate high risk. In a real scenario, this would automatically trigger emergency protocols.',
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
        message: `Location: ${currentLocation.name}\nRisk Level: ${currentHealth.risk}\n\nIn production, this would send SMS to emergency contacts.`,
      });
    }
    
    return sosEvent;
  }, [currentLocation, currentHealth, isDemoMode]);

  const getCurrentSimulatedData = useCallback(() => {
    return {
      location: currentLocation,
      health: currentHealth,
      sosHistory,
    };
  }, [currentLocation, currentHealth, sosHistory]);

  const value = {
    isDemoMode,
    enableDemoMode,
    disableDemoMode,
    simulateLocation,
    simulateHealthRisk,
    triggerSOS,
    getCurrentSimulatedData,
    currentLocation,
    currentHealth,
    alertMessage,
    setAlertMessage,
  };

  return (
    <DemoModeContext.Provider value={value}>
      {children}
    </DemoModeContext.Provider>
  );
};

export const DEMO_PRESET_SCENARIOS = [
  {
    id: 'scenario1',
    name: 'Normal Day',
    description: 'Safe location, healthy vitals',
    location: 'safe',
    health: 'normal',
  },
  {
    id: 'scenario2',
    name: 'Feeling Unwell',
    description: 'Elevated blood pressure',
    location: 'safe',
    health: 'elevated',
  },
  {
    id: 'scenario3',
    name: 'Emergency Alert',
    description: 'High risk symptoms in risky area',
    location: 'danger',
    health: 'high',
  },
  {
    id: 'scenario4',
    name: 'On the Way to Hospital',
    description: 'Contractions starting, heading to hospital',
    location: 'hospital',
    health: 'elevated',
  },
];

export default useDemoMode;
