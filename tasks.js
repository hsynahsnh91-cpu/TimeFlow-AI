(function() {
  let tasksCache = [];

  const create = async (data) => {
    const task = {
      id: crypto.randomUUID(),
      ...data,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subtasks: data.subtasks || [],
      notes: data.notes || '',
      attachments: data.attachments || [],
      timeSpent: 0
    };
    await TimeFlowDB.add('tasks', task);
    tasksCache.push(task);
    return task;
  };

  const getAll = async (userId) => {
    if (userId) tasksCache = await TimeFlowDB.getAll('tasks', 'userId', userId);
    else tasksCache = await TimeFlowDB.getAll('tasks');
    return tasksCache;
  };

  const update = async (id, data) => {
    const t = await TimeFlowDB.get('tasks', id);
    if (!t) return;
    Object.assign(t, data, { updatedAt: new Date().toISOString() });
    await TimeFlowDB.update('tasks', t);
    const idx = tasksCache.findIndex(x => x.id === id);
    if (idx !== -1) tasksCache[idx] = t;
    return t;
  };

  const remove = async (id) => await TimeFlowDB.delete('tasks', id);
  const duplicate = async (id) => {
    const orig = await TimeFlowDB.get('tasks', id);
    if (!orig) return;
    return create({ ...orig, id: crypto.randomUUID(), title: orig.title + ' (نسخة)', status: 'active', subtasks: [...orig.subtasks] });
  };

  window.TimeFlowTasks = { create, getAll, update, remove, duplicate, getCache: () => tasksCache };
})();