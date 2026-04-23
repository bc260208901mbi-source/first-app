/**
 * FocusForge — Main Application Controller
 */

// ─── App State ────────────────────────────────────────────────────────────────
const App = (() => {
  let settings = null;
  let gameData = null;

  // Timer state
  let phase = 'idle';          // 'idle' | 'work' | 'break' | 'wellness'
  let currentCycle = 0;
  let totalCycles = 4;
  let sessionStartTime = null;
  let sessionFocusSeconds = 0;
  let accumulatedFocusSec = 0;  // focus seconds in this session so far
  let phaseStartSec = 0;        // how many seconds at phase start
  let currentTaskName = '';
  let wellnessActivity = null;
  let wellnessQueue = [];
  let notifPerm = 'default';

  // Visibility / distraction tracking
  let hiddenSince = null;
  let distractedWarningShown = false;

  // ─── DOM refs (cached on init) ─────────────────────────────────────────────
  const $ = id => document.getElementById(id);
  const $$ = sel => document.querySelectorAll(sel);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  function fmtTime(ms) {
    const totalSec = Math.ceil(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function fmtDuration(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }

  // ─── Theme ────────────────────────────────────────────────────────────────
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    settings.theme = theme;
    Storage.saveSettings(settings);
    // Update theme buttons
    $$('.theme-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === theme);
      const locked = !Gamification.isThemeUnlocked(btn.dataset.theme);
      btn.classList.toggle('locked', locked);
      btn.querySelector('.lock-icon').style.display = locked ? 'inline' : 'none';
    });
  }

  // ─── Notification helpers ─────────────────────────────────────────────────
  async function requestNotifPerm() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') { notifPerm = 'granted'; return; }
    if (Notification.permission !== 'denied') {
      notifPerm = await Notification.requestPermission();
    }
  }

  function sendNotif(title, body) {
    if (!settings.notificationsEnabled) return;
    if (notifPerm !== 'granted') return;
    new Notification(title, { body, icon: 'data:image/svg+xml,' + encodeURIComponent(logoSVG()) });
  }

  function logoSVG() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="32" fill="#6c63ff"/>
      <text x="32" y="42" font-size="28" text-anchor="middle" fill="white" font-family="Arial">⚡</text>
    </svg>`;
  }

  // ─── Ring progress ────────────────────────────────────────────────────────
  function updateRing(pct) {
    const ring = $('progress-ring-fill');
    if (!ring) return;
    const r = parseFloat(ring.getAttribute('r'));
    const circumference = 2 * Math.PI * r;
    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = circumference * (1 - pct / 100);
  }

  // ─── Timer Display ────────────────────────────────────────────────────────
  function updateTimerDisplay(remainingMs, totalMs) {
    const timeEl = $('timer-display');
    if (timeEl) timeEl.textContent = fmtTime(remainingMs);
    const pct = totalMs > 0 ? ((totalMs - remainingMs) / totalMs) * 100 : 0;
    updateRing(pct);
  }

  // ─── Phase management ─────────────────────────────────────────────────────
  function startWorkPhase() {
    phase = 'work';
    currentCycle += 1;
    phaseStartSec = 0;
    $('phase-label').textContent = 'Work';
    $('phase-label').className = 'phase-label work';
    $('cycle-indicator').textContent = `Cycle ${currentCycle} / ${totalCycles}`;
    $('timer-display').classList.remove('break-mode');
    $('timer-display').classList.add('work-mode');
    updateRing(0);

    const dur = settings.workDuration * 60;
    phaseStartSec = dur;
    let secondsThisPhase = 0;
    let lastSecond = 0;

    Timer.start(dur, (remaining, total) => {
      updateTimerDisplay(remaining, total);
      const elapsed = Math.floor((total - remaining) / 1000);
      if (elapsed > lastSecond) {
        const diff = elapsed - lastSecond;
        accumulatedFocusSec += diff;
        secondsThisPhase += diff;
        lastSecond = elapsed;
      }
    }, () => {
      // Work phase complete
      sessionFocusSeconds += secondsThisPhase;
      updateTimerDisplay(0, dur * 1000);
      Sounds.play(settings.workSound);
      sendNotif('⏰ Work Session Complete!', `Great job! Time for a break. Cycle ${currentCycle}/${totalCycles} done.`);

      if (settings.wellnessEnabled) {
        buildWellnessQueue();
        if (wellnessQueue.length > 0) {
          startWellnessPhase();
          return;
        }
      }
      startBreakPhase();
    });
  }

  function startBreakPhase() {
    phase = 'break';
    $('phase-label').textContent = 'Break';
    $('phase-label').className = 'phase-label break';
    $('timer-display').classList.remove('work-mode');
    $('timer-display').classList.add('break-mode');

    const dur = settings.breakDuration * 60;
    Timer.start(dur, (remaining, total) => {
      updateTimerDisplay(remaining, total);
    }, () => {
      updateTimerDisplay(0, dur * 1000);
      Sounds.play(settings.breakSound);
      sendNotif('🌿 Break Over!', 'Time to get back to work!');

      if (currentCycle >= totalCycles) {
        finishSession();
      } else {
        startWorkPhase();
      }
    });
  }

  function buildWellnessQueue() {
    const acts = settings.wellnessActivities;
    wellnessQueue = [];
    if (acts.water && acts.water.enabled) wellnessQueue.push({ id: 'water', label: '💧 Drink Water', duration: acts.water.duration });
    if (acts.stretch && acts.stretch.enabled) wellnessQueue.push({ id: 'stretch', label: '🧘 Stretch Neck', duration: acts.stretch.duration });
    if (acts.eyes && acts.eyes.enabled) wellnessQueue.push({ id: 'eyes', label: '👀 Look Away from Screen', duration: acts.eyes.duration });
    // Pick one randomly
    if (wellnessQueue.length > 0) {
      const pick = Math.floor(Math.random() * wellnessQueue.length);
      wellnessQueue = [wellnessQueue[pick]];
    }
  }

  function startWellnessPhase() {
    phase = 'wellness';
    wellnessActivity = wellnessQueue.shift();
    const dur = wellnessActivity.duration * 60;

    $('phase-label').textContent = 'Wellness';
    $('phase-label').className = 'phase-label wellness';
    showWellnessOverlay(wellnessActivity.label, dur);

    Timer.start(dur, (remaining) => {
      updateWellnessTimer(remaining);
    }, () => {
      hideWellnessOverlay();
      if (wellnessQueue.length > 0) {
        startWellnessPhase();
      } else {
        startBreakPhase();
      }
    });
  }

  function showWellnessOverlay(label, dur) {
    const ov = $('wellness-overlay');
    ov.querySelector('.wellness-title').textContent = label;
    ov.querySelector('.wellness-timer').textContent = fmtTime(dur * 1000);
    ov.classList.add('visible');
    ov.classList.remove('hidden');
  }

  function updateWellnessTimer(remainingMs) {
    const ov = $('wellness-overlay');
    ov.querySelector('.wellness-timer').textContent = fmtTime(remainingMs);
  }

  function hideWellnessOverlay() {
    const ov = $('wellness-overlay');
    ov.classList.remove('visible');
    ov.classList.add('hidden');
  }

  function finishSession() {
    phase = 'idle';
    Timer.stop();

    // Award points
    const result = Gamification.addPoints(accumulatedFocusSec);
    Gamification.markActiveToday();

    // Save session
    const session = {
      task: currentTaskName || 'Untitled Session',
      focusSeconds: accumulatedFocusSec,
      cycles: totalCycles,
      date: new Date().toISOString(),
    };
    Storage.addSession(session);

    // Update UI
    updateGamificationUI();
    updateControls();
    showCompletionModal(session, result);
    $('phase-label').textContent = 'Complete!';
    $('phase-label').className = 'phase-label complete';
    updateRing(100);
  }

  function showCompletionModal(session, result) {
    const modal = $('completion-modal');
    modal.querySelector('.comp-task').textContent = session.task;
    modal.querySelector('.comp-time').textContent = fmtDuration(session.focusSeconds);
    modal.querySelector('.comp-cycles').textContent = session.cycles;
    modal.querySelector('.comp-points').textContent = `+${session.focusSeconds} pts`;
    modal.querySelector('.comp-level').textContent = result.leveledUp
      ? `🎉 Level Up! Now Level ${result.newLevel}`
      : `Level ${Gamification.getData().level}`;
    modal.classList.add('visible');
  }

  // ─── Controls ─────────────────────────────────────────────────────────────
  function updateControls() {
    const startBtn = $('btn-start');
    const pauseBtn = $('btn-pause');
    const resumeBtn = $('btn-resume');
    const resetBtn = $('btn-reset');

    if (phase === 'idle') {
      startBtn.style.display = 'flex';
      pauseBtn.style.display = 'none';
      resumeBtn.style.display = 'none';
      resetBtn.style.display = 'none';
    } else if (Timer.isRunning()) {
      startBtn.style.display = 'none';
      pauseBtn.style.display = 'flex';
      resumeBtn.style.display = 'none';
      resetBtn.style.display = 'flex';
    } else if (Timer.isPaused()) {
      startBtn.style.display = 'none';
      pauseBtn.style.display = 'none';
      resumeBtn.style.display = 'flex';
      resetBtn.style.display = 'flex';
    } else {
      startBtn.style.display = 'flex';
      pauseBtn.style.display = 'none';
      resumeBtn.style.display = 'none';
      resetBtn.style.display = 'none';
    }
  }

  function resetSession() {
    Timer.stop();
    phase = 'idle';
    currentCycle = 0;
    accumulatedFocusSec = 0;
    sessionFocusSeconds = 0;
    hideWellnessOverlay();
    $('timer-display').textContent = formatInitialTime();
    $('timer-display').className = 'timer-display';
    $('phase-label').textContent = 'Ready';
    $('phase-label').className = 'phase-label';
    $('cycle-indicator').textContent = `Cycle 0 / ${totalCycles}`;
    updateRing(0);
    updateControls();
  }

  function formatInitialTime() {
    const m = settings.workDuration;
    return `${String(m).padStart(2, '0')}:00`;
  }

  // ─── Gamification UI ──────────────────────────────────────────────────────
  function updateGamificationUI() {
    const gd = Gamification.getData();
    const prog = Gamification.getLevelProgress();

    $('level-display').textContent = `Lv.${gd.level}`;
    $('streak-display').textContent = `🔥 ${gd.streak}`;
    $('points-display').textContent = `⚡ ${gd.points.toLocaleString()} pts`;

    const bar = $('level-progress-bar');
    if (bar) bar.style.width = `${prog.pct}%`;
    const label = $('level-progress-label');
    if (label) {
      label.textContent = prog.pointsToNext > 0
        ? `${prog.pointsToNext.toLocaleString()} pts to Level ${gd.level + 1}`
        : 'Max Level!';
    }
  }

  // ─── Navigation ───────────────────────────────────────────────────────────
  function showScreen(name) {
    $$('.screen').forEach(s => s.classList.remove('active'));
    $$('.nav-btn').forEach(b => b.classList.remove('active'));
    const screen = $(name + '-screen');
    if (screen) screen.classList.add('active');
    const btn = $('nav-' + name);
    if (btn) btn.classList.add('active');

    if (name === 'analytics') refreshAnalytics();
    if (name === 'history') refreshHistory();
  }

  // ─── Analytics ────────────────────────────────────────────────────────────
  function refreshAnalytics() {
    const today = Analytics.getTodayStats();
    const overall = Analytics.getOverallStats();

    $('stat-today-time').textContent = fmtDuration(today.totalSeconds);
    $('stat-today-sessions').textContent = today.sessions;
    $('stat-total-time').textContent = fmtDuration(overall.totalSeconds);
    $('stat-total-sessions').textContent = overall.totalSessions;
    $('stat-avg-session').textContent = fmtDuration(overall.avgSessionMinutes * 60);

    const canvas = $('week-chart');
    if (canvas) {
      resizeCanvas(canvas);
      Analytics.drawWeekChart(canvas);
    }
  }

  function resizeCanvas(canvas) {
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth || 600;
    canvas.height = 200;
  }

  // ─── History ──────────────────────────────────────────────────────────────
  function refreshHistory() {
    const sessions = Analytics.getSessions().slice().reverse();
    const container = $('history-list');
    if (!container) return;

    if (sessions.length === 0) {
      container.innerHTML = '<div class="history-empty">No sessions yet. Start your first focus session!</div>';
      return;
    }

    container.innerHTML = sessions.slice(0, 50).map(s => {
      const d = new Date(s.date);
      const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const timeStr = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      return `
        <div class="history-item">
          <div class="history-task">${escapeHtml(s.task)}</div>
          <div class="history-meta">
            <span class="history-time">${fmtDuration(s.focusSeconds || 0)}</span>
            <span class="history-date">${dateStr} · ${timeStr}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ─── Settings ─────────────────────────────────────────────────────────────
  function loadSettingsUI() {
    $('setting-work').value = settings.workDuration;
    $('setting-break').value = settings.breakDuration;
    $('setting-cycles').value = settings.cycles;
    $('setting-work-sound').value = settings.workSound;
    $('setting-break-sound').value = settings.breakSound;
    $('setting-volume').value = Math.round(settings.volume * 100);
    $('setting-muted').checked = settings.muted;
    $('setting-bg-sound').value = settings.bgSound || 'none';
    $('setting-bg-volume').value = Math.round(settings.bgVolume * 100);
    $('setting-wellness').checked = settings.wellnessEnabled;
    $('setting-wellness-water').checked = settings.wellnessActivities.water.enabled;
    $('setting-wellness-stretch').checked = settings.wellnessActivities.stretch.enabled;
    $('setting-wellness-eyes').checked = settings.wellnessActivities.eyes.enabled;
    $('setting-water-dur').value = settings.wellnessActivities.water.duration;
    $('setting-stretch-dur').value = settings.wellnessActivities.stretch.duration;
    $('setting-eyes-dur').value = settings.wellnessActivities.eyes.duration;
    $('setting-notifications').checked = settings.notificationsEnabled;
    $('setting-smart').checked = settings.smartBehavior;
    $('setting-focus-auto').checked = settings.focusModeAuto;
    updateWellnessActivityVisibility();
  }

  function saveSettingsFromUI() {
    settings.workDuration = parseInt($('setting-work').value) || 25;
    settings.breakDuration = parseInt($('setting-break').value) || 5;
    settings.cycles = parseInt($('setting-cycles').value) || 4;
    settings.workSound = $('setting-work-sound').value;
    settings.breakSound = $('setting-break-sound').value;
    settings.volume = parseInt($('setting-volume').value) / 100;
    settings.muted = $('setting-muted').checked;
    settings.bgSound = $('setting-bg-sound').value === 'none' ? null : $('setting-bg-sound').value;
    settings.bgVolume = parseInt($('setting-bg-volume').value) / 100;
    settings.wellnessEnabled = $('setting-wellness').checked;
    settings.wellnessActivities.water.enabled = $('setting-wellness-water').checked;
    settings.wellnessActivities.stretch.enabled = $('setting-wellness-stretch').checked;
    settings.wellnessActivities.eyes.enabled = $('setting-wellness-eyes').checked;
    settings.wellnessActivities.water.duration = parseInt($('setting-water-dur').value) || 2;
    settings.wellnessActivities.stretch.duration = parseInt($('setting-stretch-dur').value) || 3;
    settings.wellnessActivities.eyes.duration = parseInt($('setting-eyes-dur').value) || 1;
    settings.notificationsEnabled = $('setting-notifications').checked;
    settings.smartBehavior = $('setting-smart').checked;
    settings.focusModeAuto = $('setting-focus-auto').checked;

    totalCycles = settings.cycles;

    Storage.saveSettings(settings);
    Sounds.setVolume(settings.volume);
    Sounds.setMuted(settings.muted);
    Sounds.setBgVolume(settings.bgVolume);

    // Apply bg sound
    if (settings.bgSound) {
      if (Sounds.getCurrentBgType() !== settings.bgSound) {
        Sounds.startBackground(settings.bgSound, settings.bgVolume);
      }
    } else {
      Sounds.stopBackground();
    }

    // Update initial display if idle
    if (phase === 'idle') {
      $('timer-display').textContent = formatInitialTime();
      $('cycle-indicator').textContent = `Cycle 0 / ${totalCycles}`;
    }

    showToast('Settings saved!');

    if (settings.notificationsEnabled && notifPerm !== 'granted') {
      requestNotifPerm();
    }
  }

  function updateWellnessActivityVisibility() {
    const enabled = $('setting-wellness').checked;
    $$('.wellness-activities').forEach(el => {
      el.style.display = enabled ? 'block' : 'none';
    });
  }

  // ─── Preset modes ─────────────────────────────────────────────────────────
  function applyPreset(preset) {
    if (preset === 'pomodoro') {
      $('setting-work').value = 25;
      $('setting-break').value = 5;
      $('setting-cycles').value = 4;
    } else if (preset === 'deepwork') {
      $('setting-work').value = 50;
      $('setting-break').value = 10;
      $('setting-cycles').value = 2;
    }
    $$('.preset-btn').forEach(b => b.classList.toggle('active', b.dataset.preset === preset));
  }

  // ─── Focus Mode ───────────────────────────────────────────────────────────
  function enterFocusMode() {
    document.body.classList.add('focus-mode');
    $('btn-focus-exit').style.display = 'flex';
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }

  function exitFocusMode() {
    document.body.classList.remove('focus-mode');
    $('btn-focus-exit').style.display = 'none';
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }

  // ─── Toast ────────────────────────────────────────────────────────────────
  function showToast(msg, duration = 2500) {
    const toast = $('toast');
    toast.textContent = msg;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), duration);
  }

  // ─── Visibility change (smart behavior) ───────────────────────────────────
  function handleVisibilityChange() {
    if (!settings.smartBehavior) return;
    if (document.hidden) {
      hiddenSince = Date.now();
      distractedWarningShown = false;
    } else {
      if (hiddenSince && phase === 'work' && Timer.isRunning()) {
        const awayMs = Date.now() - hiddenSince;
        if (awayMs > 10000 && !distractedWarningShown) {
          distractedWarningShown = true;
          showDistractedWarning(awayMs);
        }
      }
      hiddenSince = null;
    }
  }

  function showDistractedWarning(awayMs) {
    const secs = Math.round(awayMs / 1000);
    showToast(`⚠️ You got distracted for ${secs}s!`, 4000);
    // Flash the timer
    const td = $('timer-display');
    td.classList.add('distracted');
    setTimeout(() => td.classList.remove('distracted'), 2000);
  }

  // ─── Init ─────────────────────────────────────────────────────────────────
  function init() {
    settings = Storage.getSettings();
    gameData = Gamification.load();
    totalCycles = settings.cycles;

    applyTheme(settings.theme);
    loadSettingsUI();
    updateGamificationUI();
    updateControls();
    $('timer-display').textContent = formatInitialTime();
    $('cycle-indicator').textContent = `Cycle 0 / ${totalCycles}`;
    $('phase-label').textContent = 'Ready';

    Sounds.setVolume(settings.volume);
    Sounds.setMuted(settings.muted);
    Sounds.setBgVolume(settings.bgVolume);

    if (settings.bgSound) {
      Sounds.startBackground(settings.bgSound, settings.bgVolume);
    }

    if (settings.notificationsEnabled) {
      requestNotifPerm();
    }

    bindEvents();
  }

  function bindEvents() {
    // Navigation
    $$('[data-nav]').forEach(btn => {
      btn.addEventListener('click', () => showScreen(btn.dataset.nav));
    });

    // Timer controls
    $('btn-start').addEventListener('click', () => {
      Sounds.init(); // Unlock audio context on first interaction
      currentTaskName = $('task-input').value.trim();
      accumulatedFocusSec = 0;
      sessionFocusSeconds = 0;
      currentCycle = 0;
      startWorkPhase();
      updateControls();
      if (settings.focusModeAuto) enterFocusMode();
    });

    $('btn-pause').addEventListener('click', () => {
      Timer.pause();
      updateControls();
    });

    $('btn-resume').addEventListener('click', () => {
      Timer.resume();
      updateControls();
    });

    $('btn-reset').addEventListener('click', () => {
      if (confirm('Reset the current session?')) {
        resetSession();
        exitFocusMode();
      }
    });

    $('btn-focus').addEventListener('click', () => {
      Sounds.init();
      enterFocusMode();
    });

    $('btn-focus-exit').addEventListener('click', exitFocusMode);

    // Preset buttons
    $$('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
    });

    // Theme buttons
    $$('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        if (!Gamification.isThemeUnlocked(theme)) {
          showToast(`🔒 Reach the required level to unlock this theme!`, 3000);
          return;
        }
        applyTheme(theme);
        showToast(`Theme: ${theme}`);
      });
    });

    // Settings: save
    $('btn-save-settings').addEventListener('click', saveSettingsFromUI);

    // Settings: wellness toggle
    $('setting-wellness').addEventListener('change', updateWellnessActivityVisibility);

    // Settings: volume preview
    $('setting-volume').addEventListener('input', e => {
      Sounds.setVolume(parseInt(e.target.value) / 100);
    });

    $('setting-muted').addEventListener('change', e => {
      Sounds.setMuted(e.target.checked);
    });

    $('setting-bg-volume').addEventListener('input', e => {
      Sounds.setBgVolume(parseInt(e.target.value) / 100);
    });

    // Settings: bg sound preview
    $('setting-bg-sound').addEventListener('change', e => {
      const val = e.target.value;
      if (val === 'none') {
        Sounds.stopBackground();
      } else {
        Sounds.init();
        Sounds.startBackground(val, settings.bgVolume);
      }
    });

    // Completion modal close
    $('btn-close-modal').addEventListener('click', () => {
      $('completion-modal').classList.remove('visible');
      resetSession();
    });
    $('btn-new-session').addEventListener('click', () => {
      $('completion-modal').classList.remove('visible');
      resetSession();
      showScreen('timer');
    });

    // Wellness overlay skip
    $('btn-skip-wellness').addEventListener('click', () => {
      Timer.stop();
      hideWellnessOverlay();
      startBreakPhase();
    });

    // Notifications toggle
    $('setting-notifications').addEventListener('change', e => {
      if (e.target.checked) requestNotifPerm();
    });

    // Visibility API
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Fullscreen change
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement) {
        document.body.classList.remove('focus-mode');
        $('btn-focus-exit').style.display = 'none';
      }
    });

    // Clear data button
    $('btn-clear-data').addEventListener('click', () => {
      if (confirm('Clear ALL FocusForge data? This cannot be undone.')) {
        Storage.clearAll();
        location.reload();
      }
    });

    // Work/break duration live preview in timer header
    $('setting-work').addEventListener('input', () => {
      if (phase === 'idle') {
        const m = parseInt($('setting-work').value) || 25;
        $('timer-display').textContent = `${String(m).padStart(2, '0')}:00`;
      }
    });

    // Analytics resize
    window.addEventListener('resize', () => {
      const canvas = $('week-chart');
      if (canvas && $('analytics-screen').classList.contains('active')) {
        resizeCanvas(canvas);
        Analytics.drawWeekChart(canvas);
      }
    });
  }

  return { init };
})();

// ─── Bootstrap ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => App.init());
