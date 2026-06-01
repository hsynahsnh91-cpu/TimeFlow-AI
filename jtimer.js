(function() {
  let interval = null;
  let startTime = 0, elapsed = 0, isRunning = false, currentTaskId = null, mode = 'stopwatch';
  let settings = { pomodoro: 25, alerts: true, autoComplete: true };

  const format = (ms) => {
    const h = Math.floor(ms / 3600000).toString().padStart(2,'0');
    const m = Math.floor((ms % 3600000) / 60000).toString().padStart(2,'0');
    const s = Math.floor((ms % 60000) / 1000).toString().padStart(2,'0');
    return `${h}:${m}:${s}`;
  };

  const tick = () => {
    elapsed = Date.now() - startTime;
    document.getElementById('timer-display').textContent = format(elapsed);
    if (mode === 'countdown' && elapsed >= settings.pomodoro * 60000) {
      complete(true);
    }
  };

  const start = (taskId = null, isPomodoro = false) => {
    if (isRunning) return;
    isRunning = true; currentTaskId = taskId; mode = isPomodoro ? 'countdown' : 'stopwatch';
    startTime = Date.now();
    document.getElementById('timer-start').classList.add('hidden');
    document.getElementById('timer-pause').classList.remove('hidden');
    interval = setInterval(tick, 500);
    if (taskId) document.getElementById('timer-task-title').textContent = `مهمة: ${taskId.substring(0,8)}...`;
  };

  const pause = () => {
    if (!isRunning) return;
    isRunning = false; clearInterval(interval);
    document.getElementById('timer-start').classList.remove('hidden');
    document.getElementById('timer-pause').classList.add('hidden');
  };

  const reset = () => { pause(); elapsed = 0; document.getElementById('timer-display').textContent = '00:00:00'; };

  const complete = (auto = false) => {
    pause();
    TimeFlowNotify.playSound(1200, 'square', 0.3);
    TimeFlowNotify.notifyDesktop('TimeFlow', 'انتهت الجلسة بنجاح!');
    logSession(elapsed);
    if (auto && currentTaskId) TimeFlowTasks.update(currentTaskId, { status: 'completed', timeSpent: elapsed });
    TimeFlowDB.add('statistics', { id: crypto.randomUUID(), type: 'focus', value: elapsed, date: new Date().toISOString().split('T')[0] });
    elapsed = 0; document.getElementById('timer-display').textContent = '00:00:00';
    document.getElementById('timer-task-title').textContent = 'جاهز للبدء';
    currentTaskId = null; mode = 'stopwatch';
  };

  const logSession = async (duration) => {
    const sess = { id: crypto.randomUUID(), taskId: currentTaskId, startTime: new Date(Date.now() - duration).toISOString(), duration, completed: true, date: new Date().toISOString().split('T')[0] };
    await TimeFlowDB.add('sessions', sess);
    TimeFlowUI.renderSessions();
  };

  window.TimeFlowTimer = { start, pause, reset, complete, format };
})();