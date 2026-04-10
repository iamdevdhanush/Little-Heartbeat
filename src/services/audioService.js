import { Audio } from 'expo-av';

let heartbeatSound = null;
let isPlaying = false;

export const initializeAudio = async () => {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
    return true;
  } catch (error) {
    console.error('Audio initialization error:', error);
    return false;
  }
};

export const playHeartbeat = async () => {
  try {
    if (heartbeatSound) {
      await heartbeatSound.unloadAsync();
    }

    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/audio/heartbeat.mp3'),
      { 
        isLooping: true,
        volume: 0.8,
        rate: 1.0,
        shouldCorrectPitch: true,
      }
    );
    
    heartbeatSound = sound;
    await sound.playAsync();
    isPlaying = true;
    return true;
  } catch (error) {
    console.error('Error playing heartbeat:', error);
    isPlaying = false;
    return false;
  }
};

export const pauseHeartbeat = async () => {
  try {
    if (heartbeatSound) {
      await heartbeatSound.pauseAsync();
      isPlaying = false;
    }
    return true;
  } catch (error) {
    console.error('Error pausing heartbeat:', error);
    return false;
  }
};

export const stopHeartbeat = async () => {
  try {
    if (heartbeatSound) {
      await heartbeatSound.stopAsync();
      isPlaying = false;
    }
    return true;
  } catch (error) {
    console.error('Error stopping heartbeat:', error);
    return false;
  }
};

export const cleanupAudio = async () => {
  try {
    if (heartbeatSound) {
      await heartbeatSound.unloadAsync();
      heartbeatSound = null;
    }
    isPlaying = false;
  } catch (error) {
    console.error('Error cleaning up audio:', error);
  }
};

export const getIsPlaying = () => isPlaying;

export const setHeartbeatRate = async (rate) => {
  try {
    if (heartbeatSound) {
      await heartbeatSound.setRateAsync(rate, true);
    }
    return true;
  } catch (error) {
    console.error('Error setting rate:', error);
    return false;
  }
};

export const setHeartbeatVolume = async (volume) => {
  try {
    if (heartbeatSound) {
      await heartbeatSound.setVolumeAsync(volume);
    }
    return true;
  } catch (error) {
    console.error('Error setting volume:', error);
    return false;
  }
};
