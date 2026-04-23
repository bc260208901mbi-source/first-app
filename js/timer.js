/**
 * FocusForge — Timer Module
 * High-accuracy timer using performance.now() + requestAnimationFrame
 */

const Timer = (() => {
  let startTimestamp = null;
  let totalDurationMs = 0;
  let remainingAtPause = 0;
  let rafId = null;
  let running = false;
  let paused = false;

  // Callbacks
  let onTickCb = null;
  let onCompleteCb = null;

  function start(durationSeconds, onTick, onComplete) {
    stop();
    totalDurationMs = durationSeconds * 1000;
    remainingAtPause = totalDurationMs;
    onTickCb = onTick;
    onCompleteCb = onComplete;
    running = true;
    paused = false;
    startTimestamp = performance.now();
    rafId = requestAnimationFrame(tick);
  }

  function tick(now) {
    if (!running || paused) return;
    const elapsed = now - startTimestamp;
    const remaining = remainingAtPause - elapsed;

    if (remaining <= 0) {
      running = false;
      if (onTickCb) onTickCb(0, totalDurationMs);
      if (onCompleteCb) onCompleteCb();
      return;
    }

    if (onTickCb) onTickCb(remaining, totalDurationMs);
    rafId = requestAnimationFrame(tick);
  }

  function pause() {
    if (!running || paused) return;
    paused = true;
    const elapsed = performance.now() - startTimestamp;
    remainingAtPause = Math.max(0, remainingAtPause - elapsed);
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function resume() {
    if (!running || !paused) return;
    paused = false;
    startTimestamp = performance.now();
    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    paused = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    startTimestamp = null;
    remainingAtPause = 0;
  }

  function isRunning() { return running && !paused; }
  function isPaused() { return running && paused; }
  function isStopped() { return !running; }
  function getRemainingMs() {
    if (!running) return 0;
    if (paused) return remainingAtPause;
    return Math.max(0, remainingAtPause - (performance.now() - startTimestamp));
  }

  return { start, pause, resume, stop, isRunning, isPaused, isStopped, getRemainingMs };
})();
