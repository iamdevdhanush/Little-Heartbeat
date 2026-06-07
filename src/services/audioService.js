// audioService.js — HTML5 Audio API replacement for expo-av

let heartbeatAudio = null;
let isPlaying = false;

// Try to load from /assets/audio/heartbeat.mp3
// Falls back to a synthesized beat using Web Audio API if file not found
const HEARTBEAT_SRC = '/assets/audio/heartbeat.mp3';

let audioContext = null;
let usingSynth = false;
let synthIntervalId = null;

const getSynthContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
};

const playSynthBeat = () => {
  try {
    const ctx = getSynthContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(80, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);

    gainNode.gain.setValueAtTime(0.6, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  } catch (e) {
    console.warn('Synth beat error:', e);
  }
};

export const initializeAudio = async () => {
  try {
    // Try to load MP3
    const audio = new Audio(HEARTBEAT_SRC);
    await new Promise((resolve, reject) => {
      audio.addEventListener('canplaythrough', resolve, { once: true });
      audio.addEventListener('error', reject, { once: true });
      setTimeout(reject, 3000); // 3s timeout
    });
    heartbeatAudio = audio;
    heartbeatAudio.loop = true;
    heartbeatAudio.volume = 0.8;
    usingSynth = false;
    return true;
  } catch {
    console.info('Heartbeat MP3 not found — using synthesized audio');
    usingSynth = true;
    return true;
  }
};

export const playHeartbeat = async (bpm = 140) => {
  try {
    if (!usingSynth && !heartbeatAudio) await initializeAudio();

    if (usingSynth) {
      if (synthIntervalId) clearInterval(synthIntervalId);
      const interval = (60 / bpm) * 1000;
      // Resume AudioContext if suspended (browser autoplay policy)
      const ctx = getSynthContext();
      if (ctx.state === 'suspended') await ctx.resume();
      playSynthBeat();
      synthIntervalId = setInterval(playSynthBeat, interval);
      isPlaying = true;
      return true;
    }

    await heartbeatAudio.play();
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
    if (usingSynth) {
      if (synthIntervalId) { clearInterval(synthIntervalId); synthIntervalId = null; }
    } else if (heartbeatAudio) {
      heartbeatAudio.pause();
    }
    isPlaying = false;
    return true;
  } catch (error) {
    console.error('Error pausing heartbeat:', error);
    return false;
  }
};

export const stopHeartbeat = async () => {
  try {
    if (usingSynth) {
      if (synthIntervalId) { clearInterval(synthIntervalId); synthIntervalId = null; }
    } else if (heartbeatAudio) {
      heartbeatAudio.pause();
      heartbeatAudio.currentTime = 0;
    }
    isPlaying = false;
    return true;
  } catch (error) {
    console.error('Error stopping heartbeat:', error);
    return false;
  }
};

export const cleanupAudio = async () => {
  await stopHeartbeat();
  heartbeatAudio = null;
};

export const getIsPlaying = () => isPlaying;

export const setHeartbeatRate = async (bpm) => {
  if (!isPlaying) return true;
  await stopHeartbeat();
  await playHeartbeat(bpm);
  return true;
};

export const setHeartbeatVolume = async (volume) => {
  try {
    if (!usingSynth && heartbeatAudio) {
      heartbeatAudio.volume = Math.max(0, Math.min(1, volume));
    }
    return true;
  } catch (error) {
    return false;
  }
};
