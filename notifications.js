(function() {
  let audioCtx = null;
  
  const initAudio = () => {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  };

  const playSound = (freq = 800, type = 'sine', dur = 0.1) => {
    if (!TimeFlowSettings.load().then(s => s.sound).catch(() => true)) return;
    try {
      initAudio();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type; osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start(); osc.stop(audioCtx.currentTime + dur);
    } catch(e) { console.warn('Audio error', e); }
  };

  const toast = (msg, type = 'info') => {
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 4000);
  };

  const notifyDesktop = (title, body) => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') new Notification(title, { body, icon: '📱' });
    else Notification.requestPermission();
  };

  window.TimeFlowNotify = { playSound, toast, notifyDesktop, init: () => { if ('Notification' in window) Notification.requestPermission(); } };
})();