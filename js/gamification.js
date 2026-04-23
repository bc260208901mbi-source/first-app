/**
 * FocusForge — Gamification Module
 * Points, levels, streaks, theme unlocks
 */

const Gamification = (() => {
  // Points required to reach each level (cumulative)
  const LEVEL_THRESHOLDS = [
    0,      // Level 1
    1800,   // Level 2  (~30 min focus)
    5400,   // Level 3  (~90 min)
    10800,  // Level 4  (~3 hr)
    21600,  // Level 5  (~6 hr)
    43200,  // Level 6  (~12 hr)
    86400,  // Level 7  (~24 hr)
    172800, // Level 8  (~48 hr)
    345600, // Level 9  (~96 hr)
    604800, // Level 10 (~168 hr)
  ];

  const MS_PER_DAY = 86400000;

  const THEME_UNLOCK_LEVELS = {
    dark: 1,
    light: 1,
    neon: 3,
    minimal: 5,
  };

  let data = null;

  function load() {
    data = Storage.getGamification();
    checkStreak();
    return data;
  }

  function save() {
    Storage.saveGamification(data);
  }

  function checkStreak() {
    const today = getTodayString();
    if (!data.lastActiveDate) return;
    const last = new Date(data.lastActiveDate);
    const now = new Date(today);
    const diffDays = Math.floor((now - last) / MS_PER_DAY);
    if (diffDays > 1) {
      data.streak = 0;
      save();
    }
  }

  function markActiveToday() {
    const today = getTodayString();
    if (data.lastActiveDate === today) return false; // already marked

    const yesterday = getYesterdayString();
    if (data.lastActiveDate === yesterday) {
      data.streak += 1;
    } else if (!data.lastActiveDate) {
      data.streak = 1;
    } else {
      data.streak = 1; // reset streak, start fresh
    }

    data.lastActiveDate = today;
    save();
    return true;
  }

  function addPoints(seconds) {
    data.points += seconds;
    data.totalFocusSeconds = (data.totalFocusSeconds || 0) + seconds;
    const newLevel = computeLevel(data.points);
    const leveledUp = newLevel > data.level;
    data.level = newLevel;

    // Unlock themes based on level
    Object.entries(THEME_UNLOCK_LEVELS).forEach(([theme, lvl]) => {
      if (data.level >= lvl && !data.unlockedThemes.includes(theme)) {
        data.unlockedThemes.push(theme);
      }
    });

    save();
    return { leveledUp, newLevel };
  }

  function computeLevel(points) {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (points >= LEVEL_THRESHOLDS[i]) return i + 1;
    }
    return 1;
  }

  function getLevelProgress() {
    const lvlIdx = data.level - 1;
    const current = LEVEL_THRESHOLDS[lvlIdx] || 0;
    const next = LEVEL_THRESHOLDS[lvlIdx + 1];
    if (!next) return { pct: 100, pointsToNext: 0 };
    const progress = data.points - current;
    const required = next - current;
    return {
      pct: Math.min(100, Math.floor((progress / required) * 100)),
      pointsToNext: Math.max(0, required - progress),
      current,
      next,
    };
  }

  function isThemeUnlocked(theme) {
    return data.unlockedThemes && data.unlockedThemes.includes(theme);
  }

  function getData() { return data; }

  function getTodayString() {
    return new Date().toISOString().slice(0, 10);
  }

  function getYesterdayString() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }

  return { load, markActiveToday, addPoints, getLevelProgress, isThemeUnlocked, getData };
})();
