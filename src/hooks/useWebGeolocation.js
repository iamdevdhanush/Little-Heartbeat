// useWebGeolocation.js — Pure browser Geolocation API
import { useState, useEffect, useCallback } from 'react';

export const useWebGeolocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] = useState('prompt');

  const getCurrentPosition = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const err = new Error('Geolocation is not supported');
        setError(err.message);
        reject(err);
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
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0, ...options }
      );
    });
  }, [options]);

  const requestPermission = useCallback(async () => {
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      setPermission(result.state);
      result.addEventListener('change', () => setPermission(result.state));
      return result.state;
    } catch {
      return 'granted';
    }
  }, []);

  const watchPosition = useCallback((onSuccess, onError) => {
    if (!navigator.geolocation) return () => {};
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
      (err) => { setError(err.message); if (onError) onError(err); },
      options
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [options]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await requestPermission();
      setLoading(false);
    };
    init();
  }, []);

  return { location, error, loading, permission, getCurrentPosition, requestPermission, watchPosition, isWeb: true };
};

export default useWebGeolocation;
