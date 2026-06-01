(function() {
  const boot = async () => {
    await TimeFlowDB.init();
    const settings = await TimeFlowSettings.load();
    TimeFlowNotify.init();

    const user = await TimeFlowAuth.autoLogin();
    document.getElementById('loader').classList.add('hidden');

    if (!user) {
      document.getElementById('auth-views').classList.remove('hidden');
      setupAuthEvents();
      return;
    }

    document.getElementById('app-layout').classList.remove('hidden');
    setupUI();
    await TimeFlowTasks.getAll(user.id);
    TimeFlowCharts.init();
    TimeFlowAnalytics.aggregate();
    TimeFlowPWA.registerSW();
    TimeFlowPWA.setupNetworkListener();
    startClock();
    
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('user-avatar').textContent = user.avatar || 'U';
    if (user.role === 'guest') document.getElementById('user-role').textContent = 'زائر';
  };

  const setupAuthEvents = () => {
    document.getElementById('login-form').onsubmit = async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const pass = document.getElementById('login-pass').value;
      const rem = document.getElementById('remember-me').checked;
      try { await TimeFlowAuth.login(email, pass, rem); location.reload(); }
      catch(err) { TimeFlowNotify.toast(err.message, 'error'); }
    };
    document.getElementById('register-form').onsubmit = async (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value;
      const email = document.getElementById('reg-email').value;
      const pass = document.getElementById('reg-pass').value;
      try { await TimeFlowAuth.register(name, email, pass); location.reload(); }
      catch(err) { TimeFlowNotify.toast(err.message, 'error'); }
    };
    document.getElementById('guest-login').onclick = async () => {
      await TimeFlowAuth.loginAsGuest(); location.reload();
    };
    document.querySelectorAll('[data-view]').forEach(btn => btn.onclick = (e) => {      document.querySelectorAll('.auth-card').forEach(c => c.classList.add('hidden'));
      document.getElementById('auth-'+e.target.dataset.view).classList.remove('hidden');
    });
  };

  const setupUI = () => {
    document.querySelectorAll('.nav-item').forEach(btn => btn.onclick = () => TimeFlowUI.router(btn.dataset.page));
    document.getElementById('theme-toggle').onclick = () => TimeFlowSettings.toggleTheme();
    document.getElementById('lang-toggle').onclick = () => TimeFlowSettings.toggleLang();
    document.getElementById('modal-close').onclick = () => TimeFlowUI.closeModal();
    document.getElementById('logout-btn').onclick = async () => { await TimeFlowAuth.logout(); location.reload(); };

    // Task Events
    document.getElementById('add-task-btn').onclick = () => {
      TimeFlowUI.openModal(`<h3>مهمة جديدة</h3>
        <input type="text" id="new-title" placeholder="العنوان" style="width:100%;margin:10px 0"><input type="date" id="new-deadline" style="width:100%;margin:5px 0">
        <select id="new-pri" style="width:100%;margin:5px 0"><option value="1">عالية</option><option value="2">متوسطة</option><option value="3">منخفضة</option></select>
        <button id="save-task" class="btn primary full">حفظ</button>`);
      document.getElementById('save-task').onclick = async () => {
        await TimeFlowTasks.create({ title: document.getElementById('new-title').value, deadline: document.getElementById('new-deadline').value, priority: parseInt(document.getElementById('new-pri').value) });
        TimeFlowUI.closeModal(); TimeFlowUI.renderTasks();
      };
    };
    document.getElementById('task-search').oninput = TimeFlowUI.renderTasks;
    document.getElementById('task-filter').onchange = TimeFlowUI.renderTasks;
    document.getElementById('task-sort').onchange = TimeFlowUI.renderTasks;

    // Timer Events
    document.getElementById('timer-start').onclick = () => TimeFlowTimer.start(null, false);
    document.getElementById('timer-pause').onclick = TimeFlowTimer.pause;
    document.getElementById('timer-reset').onclick = TimeFlowTimer.reset;
    document.getElementById('timer-pomodoro').onclick = () => TimeFlowTimer.start(null, true);

    // Location Events
    document.getElementById('loc-start-track').onclick = () => {
      if (watching) TimeFlowLocation.stopTracking(), watching = false;
      else TimeFlowLocation.startTracking(), watching = true;
    };
    let watching = false;

    // Settings Events
    document.getElementById('profile-form').onsubmit = async (e) => {
      e.preventDefault();
      const file = document.getElementById('set-avatar').files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async () => {
          const u = await TimeFlowAuth.updateProfile(document.getElementById('set-name').value, reader.result);
          document.getElementById('user-avatar').textContent = '👤';
        };        reader.readAsDataURL(file);
      }
    };
    document.getElementById('clear-data').onclick = async () => { if(confirm('هل أنت متأكد؟')) { await TimeFlowDB.clearAll(); location.reload(); }};
  };

  const startClock = () => {
    setInterval(() => document.getElementById('live-clock').textContent = new Date().toLocaleTimeString('ar-EG'), 1000);
    document.getElementById('live-clock').textContent = new Date().toLocaleTimeString('ar-EG');
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();