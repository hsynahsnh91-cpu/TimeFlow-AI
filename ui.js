(function() {
  const router = (hash) => {
    const target = document.querySelector(`#view-${hash}`);
    if (!target) return;
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    target.classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === hash));
    document.getElementById('current-page-title').textContent = target.closest('.view-wrapper') ? target.previousElementSibling?.textContent || hash : hash;
    
    if (hash === 'location') setTimeout(() => TimeFlowLocation.initMap(), 100);
    if (hash === 'analytics') TimeFlowAnalytics.aggregate();
    if (hash === 'tasks') renderTasks();
    if (hash === 'timer') TimeFlowUI.renderSessions();
  };

  const escapeHtml = (unsafe) => String(unsafe || '').replace(/[&<>"']/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'": '&#039;' }[m] || m));

  const openModal = (contentHTML) => {
    document.getElementById('modal-body').innerHTML = contentHTML;
    document.getElementById('modal-overlay').classList.remove('hidden');
  };

  const closeModal = () => document.getElementById('modal-overlay').classList.add('hidden');

  const renderTasks = async () => {
    const filter = document.getElementById('task-filter').value;
    const sort = document.getElementById('task-sort').value;
    const search = document.getElementById('task-search').value.toLowerCase();
    let tasks = await TimeFlowTasks.getAll(TimeFlowAuth.getCurrentUser()?.id);
    if (filter !== 'all') tasks = tasks.filter(t => t.status === filter);
    if (search) tasks = tasks.filter(t => t.title.toLowerCase().includes(search));
    
    tasks.sort((a,b) => {
      if (sort === 'priority') return b.priority - a.priority;
      if (sort === 'deadline') return new Date(a.deadline) - new Date(b.deadline);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const container = document.getElementById('tasks-list');
    container.innerHTML = tasks.map(t => `
      <div class="task-card ${t.status === 'completed' ? 'completed' : ''}" data-id="${t.id}">
        <div class="priority-bar priority-${t.priority}"></div>
        <div>
          <h3>${escapeHtml(t.title)}</h3>
          <div class="meta"><span>📅 ${t.deadline}</span><span>🏷️ ${t.category}</span></div>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-top:6px;">${escapeHtml(t.notes || '').substring(0,50)}...</p>
        </div>
        <div class="task-actions">
          <button class="task-btn" onclick="TimeFlowTasks.update('${t.id}', {status:'${t.status==='completed'?'active':'completed'}'}); ui.renderTasks();">✅</button>
          <button class="task-btn" onclick="TimeFlowTasks.duplicate('${t.id}')">📋</button>
          <button class="task-btn" style="color:var(--danger)" onclick="TimeFlowTasks.remove('${t.id}'); ui.renderTasks();">🗑️</button>
        </div>
      </div>
    `).join('') || '<p class="empty">لا توجد مهام</p>';
  };

  const renderSessions = async () => {
    const user = TimeFlowAuth.getCurrentUser();
    const sessions = await TimeFlowDB.getAll('sessions', 'taskId', null); // simplified for demo
    const list = sessions.slice(-5).reverse().map(s => `<li><span>⏱ ${TimeFlowTimer.format(s.duration)}</span> <span>${new Date(s.startTime).toLocaleTimeString()}</span></li>`).join('');
    document.getElementById('sessions-list').innerHTML = list || '<li class="empty">لا جلسات بعد</li>';
  };

  window.TimeFlowUI = { router, openModal, closeModal, renderTasks, renderSessions };
})();