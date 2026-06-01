(function() {
  const registerSW = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.register('/service-worker.js');
        console.log('SW Registered');
      } catch (e) { console.error('SW Fail', e); }
    }
  };

  const setupNetworkListener = () => {
    const banner = document.getElementById('network-status');
    window.addEventListener('online', () => { banner.classList.remove('visible'); TimeFlowNotify.toast('تم استعادة الاتصال', 'success'); });
    window.addEventListener('offline', () => { banner.classList.add('visible'); TimeFlowNotify.toast('وضع عدم الاتصال', 'info'); });
  };

  const handleInstall = () => {
    if ('beforeinstallprompt' in window) {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        const btn = document.createElement('button');
        btn.textContent = '📲 تثبيت التطبيق';
        btn.className = 'btn primary';
        btn.onclick = () => e.prompt();
        document.querySelector('.top-actions').prepend(btn);
      });
    }
  };

  window.TimeFlowPWA = { registerSW, setupNetworkListener, handleInstall };
})();