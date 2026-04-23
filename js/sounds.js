/**
 * FocusForge — Sound System
 * Web Audio API-based sound generation (no external files needed)
 */

const Sounds = (() => {
  let ctx = null;
  let masterGain = null;
  let bgGain = null;
  let bgNode = null;
  let bgType = null;
  let bgRunning = false;
  let currentVolume = 0.7;
  let isMuted = false;

  function getCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = isMuted ? 0 : currentVolume;
      masterGain.connect(ctx.destination);

      bgGain = ctx.createGain();
      bgGain.gain.value = 0.3;
      bgGain.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function setVolume(vol) {
    currentVolume = Math.max(0, Math.min(1, vol));
    if (masterGain) masterGain.gain.value = isMuted ? 0 : currentVolume;
  }

  function setMuted(mute) {
    isMuted = mute;
    if (masterGain) masterGain.gain.value = isMuted ? 0 : currentVolume;
  }

  function setBgVolume(vol) {
    if (bgGain) bgGain.gain.value = Math.max(0, Math.min(1, vol));
  }

  // ─── Bell ────────────────────────────────────────────────────────────────
  function playBell() {
    const c = getCtx();
    const freqs = [830, 1046, 1318];
    freqs.forEach((freq, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(masterGain);
      const t = c.currentTime + i * 0.1;
      gain.gain.setValueAtTime(0.5 / freqs.length, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 2);
      osc.start(t);
      osc.stop(t + 2);
    });
  }

  // ─── Chime ───────────────────────────────────────────────────────────────
  function playChime() {
    const c = getCtx();
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(masterGain);
      const t = c.currentTime + i * 0.2;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.4, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
      osc.start(t);
      osc.stop(t + 1.5);
    });
  }

  // ─── Alarm ───────────────────────────────────────────────────────────────
  function playAlarm() {
    const c = getCtx();
    for (let i = 0; i < 3; i++) {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'square';
      osc.frequency.value = 880;
      osc.connect(gain);
      gain.connect(masterGain);
      const t = c.currentTime + i * 0.4;
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.setValueAtTime(0, t + 0.3);
      osc.start(t);
      osc.stop(t + 0.3);
    }
  }

  // ─── Soft Bell ───────────────────────────────────────────────────────────
  function playSoftBell() {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(330, c.currentTime + 1);
    osc.connect(gain);
    gain.connect(masterGain);
    gain.gain.setValueAtTime(0, c.currentTime);
    gain.gain.linearRampToValueAtTime(0.6, c.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 2.5);
    osc.start();
    osc.stop(c.currentTime + 2.5);
  }

  // ─── Background: Rain ────────────────────────────────────────────────────
  function createRainNode(c) {
    const bufferSize = c.sampleRate * 2;
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const source = c.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = c.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 0.5;

    const filter2 = c.createBiquadFilter();
    filter2.type = 'lowpass';
    filter2.frequency.value = 3000;

    source.connect(filter);
    filter.connect(filter2);
    filter2.connect(bgGain);
    return source;
  }

  // ─── Background: Forest ──────────────────────────────────────────────────
  function createForestNode(c) {
    const bufferSize = c.sampleRate * 2;
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    // Pink-ish noise
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      data[i] = (b0 + b1 + b2 + b3 + b4 + white * 0.5362) * 0.11;
    }
    const source = c.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    source.connect(filter);
    filter.connect(bgGain);
    return source;
  }

  // ─── Background: White Noise ─────────────────────────────────────────────
  function createWhiteNoiseNode(c) {
    const bufferSize = c.sampleRate * 2;
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
    const source = c.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(bgGain);
    return source;
  }

  // ─── Background: Lo-fi ───────────────────────────────────────────────────
  function createLofiNode(c) {
    // Lo-fi: low-pass noise + subtle rhythm
    const bufferSize = c.sampleRate * 4;
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + white * 0.0990460;
      b1 = 0.96300 * b1 + white * 0.2965164;
      b2 = 0.57000 * b2 + white * 1.0526913;
      data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.1;
    }
    const source = c.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    const filter2 = c.createBiquadFilter();
    filter2.type = 'highpass';
    filter2.frequency.value = 80;
    source.connect(filter);
    filter.connect(filter2);
    filter2.connect(bgGain);
    return source;
  }

  function startBackground(type, vol = 0.3) {
    stopBackground();
    const c = getCtx();
    bgGain.gain.value = vol;
    let node;
    switch (type) {
      case 'rain': node = createRainNode(c); break;
      case 'forest': node = createForestNode(c); break;
      case 'whitenoise': node = createWhiteNoiseNode(c); break;
      case 'lofi': node = createLofiNode(c); break;
      default: return;
    }
    node.start();
    bgNode = node;
    bgType = type;
    bgRunning = true;
  }

  function stopBackground() {
    if (bgNode) {
      try { bgNode.stop(); } catch (_) {}
      bgNode = null;
      bgRunning = false;
      bgType = null;
    }
  }

  function isBackgroundRunning() { return bgRunning; }
  function getCurrentBgType() { return bgType; }

  const SOUND_MAP = {
    bell: playBell,
    chime: playChime,
    alarm: playAlarm,
    soft: playSoftBell,
  };

  function play(soundId) {
    if (isMuted) return;
    const fn = SOUND_MAP[soundId];
    if (fn) fn();
  }

  return {
    play,
    setVolume,
    setMuted,
    setBgVolume,
    startBackground,
    stopBackground,
    isBackgroundRunning,
    getCurrentBgType,
    init: getCtx,
  };
})();
