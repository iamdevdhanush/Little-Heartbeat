import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const useWebGeolocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] = useState('prompt');

  const getCurrentPosition = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (isWeb) {
        if (!navigator.geolocation) {
          setError('Geolocation is not supported');
          reject(new Error('Geolocation is not supported'));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const locationData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude,
              timestamp: position.timestamp,
            };
            setLocation(locationData);
            resolve(locationData);
          },
          (err) => {
            setError(err.message);
            reject(err);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
            ...options,
          }
        );
      } else {
        getNativeLocation().then(resolve).catch(reject);
      }
    });
  }, [options]);

  const requestPermission = useCallback(async () => {
    if (isWeb) {
      try {
        const result = await new Promise((resolve) => {
          navigator.permissions.query({ name: 'geolocation' }).then((permResult) => {
            setPermission(permResult.state);
            resolve(permResult.state);
          }).catch(() => {
            setPermission('granted');
            resolve('granted');
          });
        });
        return result;
      } catch (e) {
        setPermission('granted');
        return 'granted';
      }
    }
    return 'granted';
  }, []);

  const watchPosition = useCallback((onSuccess, onError) => {
    if (isWeb) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          setLocation(locationData);
          if (onSuccess) onSuccess(locationData);
        },
        (err) => {
          setError(err.message);
          if (onError) onError(err);
        },
        options
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
    return () => {};
  }, [options]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await requestPermission();
      setLoading(false);
    };
    init();
  }, []);

  return {
    location,
    error,
    loading,
    permission,
    getCurrentPosition,
    requestPermission,
    watchPosition,
    isWeb,
  };
};

const getNativeLocation = async () => {
  try {
    const expoLocation = require('expo-location');
    const hasPermission = await expoLocation.requestForegroundPermissionsAsync();
    if (hasPermission.status !== 'granted') {
      throw new Error('Permission denied');
    }
    const position = await expoLocation.getCurrentPositionAsync({
      accuracy: expoLocation.Accuracy.High,
    });
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
    };
  } catch (e) {
    throw e;
  }
};

export default useWebGeolocation;
