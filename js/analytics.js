/**
 * FocusForge — Analytics Module
 * Session tracking, daily/weekly stats, canvas charts
 */

const Analytics = (() => {
  function getSessions() {
    return Storage.getSessions();
  }

  function getTodayString() {
    return new Date().toISOString().slice(0, 10);
  }

  function getDateString(date) {
    return new Date(date).toISOString().slice(0, 10);
  }

  function getTodayStats() {
    const today = getTodayString();
    const sessions = getSessions().filter(s => getDateString(s.date) === today);
    const totalSeconds = sessions.reduce((a, s) => a + (s.focusSeconds || 0), 0);
    return {
      sessions: sessions.length,
      totalSeconds,
      totalMinutes: Math.round(totalSeconds / 60),
    };
  }

  function getWeekStats() {
    const now = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }

    const sessions = getSessions();
    return days.map(day => {
      const daySessions = sessions.filter(s => getDateString(s.date) === day);
      const totalSeconds = daySessions.reduce((a, s) => a + (s.focusSeconds || 0), 0);
      return {
        day,
        label: new Date(day + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short' }),
        sessions: daySessions.length,
        totalSeconds,
        totalMinutes: Math.round(totalSeconds / 60),
      };
    });
  }

  function getOverallStats() {
    const sessions = getSessions();
    const totalSeconds = sessions.reduce((a, s) => a + (s.focusSeconds || 0), 0);
    const avgSeconds = sessions.length ? Math.round(totalSeconds / sessions.length) : 0;
    return {
      totalSessions: sessions.length,
      totalSeconds,
      totalHours: (totalSeconds / 3600).toFixed(1),
      avgSessionMinutes: Math.round(avgSeconds / 60),
    };
  }

  function drawWeekChart(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const week = getWeekStats();
    const maxMin = Math.max(...week.map(d => d.totalMinutes), 1);
    const W = canvas.width;
    const H = canvas.height;
    const pad = { top: 20, right: 10, bottom: 40, left: 40 };
    const chartW = W - pad.left - pad.right;
    const chartH = H - pad.top - pad.bottom;
    const barW = Math.floor(chartW / week.length) - 8;

    ctx.clearRect(0, 0, W, H);

    // Background grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + chartH - (i / 4) * chartH;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + chartW, y);
      ctx.stroke();
    }

    // Y-axis label
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + chartH - (i / 4) * chartH;
      const val = Math.round((i / 4) * maxMin);
      ctx.fillText(val + 'm', pad.left - 5, y + 4);
    }

    // Bars
    week.forEach((d, i) => {
      const x = pad.left + i * (chartW / week.length) + 4;
      const barH = d.totalMinutes > 0 ? Math.max(4, (d.totalMinutes / maxMin) * chartH) : 0;
      const y = pad.top + chartH - barH;
      const today = getTodayString();
      const isToday = d.day === today;

      // Bar gradient
      const grad = ctx.createLinearGradient(x, y, x, y + barH);
      if (isToday) {
        grad.addColorStop(0, '#6c63ff');
        grad.addColorStop(1, '#a78bfa');
      } else {
        grad.addColorStop(0, 'rgba(108,99,255,0.6)');
        grad.addColorStop(1, 'rgba(167,139,250,0.4)');
      }

      ctx.fillStyle = grad;
      const radius = Math.min(4, barW / 2);
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + barW - radius, y);
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + radius);
      ctx.lineTo(x + barW, y + barH);
      ctx.lineTo(x, y + barH);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();

      // Day label
      ctx.fillStyle = isToday ? '#a78bfa' : 'rgba(255,255,255,0.5)';
      ctx.font = isToday ? 'bold 11px Inter, sans-serif' : '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.label, x + barW / 2, H - 10);
    });
  }

  return { getTodayStats, getWeekStats, getOverallStats, drawWeekChart, getSessions };
})();
