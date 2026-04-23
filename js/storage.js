/**
 * FocusForge — Storage Module
 * Handles all localStorage persistence
 */

const STORAGE_KEYS = {
  SETTINGS: 'ff_settings',
  GAMIFICATION: 'ff_gamification',
  SESSIONS: 'ff_sessions',
  ANALYTICS: 'ff_analytics',
};

const DEFAULT_SETTINGS = {
  workDuration: 25,
  breakDuration: 5,
  cycles: 4,
  preset: 'pomodoro',
  workSound: 'bell',
  breakSound: 'chime',
  volume: 0.7,
  muted: false,
  bgSound: null,
  bgVolume: 0.3,
  wellnessEnabled: true,
  wellnessActivities: {
    water: { enabled: true, duration: 2 },
    stretch: { enabled: true, duration: 3 },
    eyes: { enabled: true, duration: 1 },
  },
  notificationsEnabled: true,
  focusModeAuto: false,
  smartBehavior: true,
  theme: 'dark',
};

const DEFAULT_GAMIFICATION = {
  points: 0,
  level: 1,
  streak: 0,
  lastActiveDate: null,
  unlockedThemes: ['dark', 'light'],
  totalFocusSeconds: 0,
};

const Storage = {
  getSettings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!saved) return { ...DEFAULT_SETTINGS };
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  },

  saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('FocusForge: Could not save settings', e);
    }
  },

  getGamification() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GAMIFICATION);
      if (!saved) return { ...DEFAULT_GAMIFICATION };
      return { ...DEFAULT_GAMIFICATION, ...JSON.parse(saved) };
    } catch {
      return { ...DEFAULT_GAMIFICATION };
    }
  },

  saveGamification(data) {
    try {
      localStorage.setItem(STORAGE_KEYS.GAMIFICATION, JSON.stringify(data));
    } catch (e) {
      console.warn('FocusForge: Could not save gamification', e);
    }
  },

  getSessions() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (!saved) return [];
      return JSON.parse(saved);
    } catch {
      return [];
    }
  },

  saveSessions(sessions) {
    try {
      // Keep last 500 sessions
      const trimmed = sessions.slice(-500);
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(trimmed));
    } catch (e) {
      console.warn('FocusForge: Could not save sessions', e);
    }
  },

  addSession(session) {
    const sessions = this.getSessions();
    sessions.push(session);
    this.saveSessions(sessions);
  },

  clearAll() {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
  },
};
