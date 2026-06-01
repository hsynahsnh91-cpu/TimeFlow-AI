(function() {
  const DB_NAME = 'TimeFlowDB';
  const DB_VERSION = 1;
  const STORES = ['users', 'tasks', 'settings', 'sessions', 'statistics', 'locations', 'activityLogs', 'notifications'];
  let db = null;

  const openDB = () => new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const dbInst = e.target.result;
      if (!dbInst.objectStoreNames.contains('users')) {
        const userStore = dbInst.createObjectStore('users', { keyPath: 'id' });
        userStore.createIndex('email', 'email', { unique: true });
        userStore.createIndex('role', 'role', { unique: false });
      }
      if (!dbInst.objectStoreNames.contains('tasks')) {
        const taskStore = dbInst.createObjectStore('tasks', { keyPath: 'id' });
        taskStore.createIndex('userId', 'userId', { unique: false });
        taskStore.createIndex('status', 'status', { unique: false });
        taskStore.createIndex('category', 'category', { unique: false });
        taskStore.createIndex('priority', 'priority', { unique: false });
        taskStore.createIndex('deadline', 'deadline', { unique: false });
      }
      if (!dbInst.objectStoreNames.contains('sessions')) {
        const sessStore = dbInst.createObjectStore('sessions', { keyPath: 'id' });
        sessStore.createIndex('taskId', 'taskId', { unique: false });
        sessStore.createIndex('startTime', 'startTime', { unique: false });
        sessStore.createIndex('duration', 'duration', { unique: false });
      }
      if (!dbInst.objectStoreNames.contains('locations')) {
        const locStore = dbInst.createObjectStore('locations', { keyPath: 'id' });
        locStore.createIndex('taskId', 'taskId', { unique: false });
        locStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      if (!dbInst.objectStoreNames.contains('statistics')) {
        const statStore = dbInst.createObjectStore('statistics', { keyPath: 'id' });
        statStore.createIndex('date', 'date', { unique: false });
        statStore.createIndex('type', 'type', { unique: false });
      }
      if (!dbInst.objectStoreNames.contains('activityLogs')) {
        const actStore = dbInst.createObjectStore('activityLogs', { keyPath: 'id' });
        actStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      if (!dbInst.objectStoreNames.contains('notifications')) {
        dbInst.createObjectStore('notifications', { keyPath: 'id' });
      }
      if (!dbInst.objectStoreNames.contains('settings')) {
        dbInst.createObjectStore('settings', { keyPath: 'key' });
      }
    };    request.onsuccess = (e) => { db = e.target.result; resolve(db); };
    request.onerror = (e) => reject('DB Open Error: ' + e.target.errorCode);
  });

  const tx = (storeName, mode = 'readonly') => {
    if (!db) throw new Error('Database not initialized');
    return db.transaction(storeName, mode).objectStore(storeName);
  };

  const sanitize = (str) => String(str || '').replace(/[&<>"']/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'": '&#039;' }[m] || m));
  const validate = (data, rules) => {
    for (let k in rules) if (rules[k].required && (data[k] === undefined || data[k] === '')) return false;
    if (rules.password && data.password && data.password.length < 6) return false;
    return true;
  };

  window.TimeFlowDB = {
    async init() {
      if (!db) await openDB();
      return db;
    },
    async add(store, item) {
      if (item.text && item.text !== undefined) item.text = sanitize(item.text);
      return new Promise((res, rej) => {
        const req = tx(store, 'readwrite').add(item);
        req.onsuccess = () => res(req.result);
        req.onerror = () => rej(req.error);
      });
    },
    async get(store, key) {
      return new Promise((res, rej) => {
        const req = tx(store, 'readonly').get(key);
        req.onsuccess = () => res(req.result);
        req.onerror = () => rej(req.error);
      });
    },
    async getAll(store, indexName, value) {
      return new Promise((res, rej) => {
        const st = tx(store, 'readonly');
        let req;
        if (indexName) req = st.index(indexName).getAll(value);
        else req = st.getAll();
        req.onsuccess = () => res(req.result || []);
        req.onerror = () => rej(req.error);
      });
    },
    async update(store, item) {
      return new Promise((res, rej) => {
        const req = tx(store, 'readwrite').put(item);
        req.onsuccess = () => res();        req.onerror = () => rej(req.error);
      });
    },
    async delete(store, key) {
      return new Promise((res, rej) => {
        const req = tx(store, 'readwrite').delete(key);
        req.onsuccess = () => res();
        req.onerror = () => rej(req.error);
      });
    },
    async clearAll() {
      for (const s of STORES) {
        await new Promise((res) => { tx(s, 'readwrite').clear().onsuccess = () => res(); });
      }
    }
  };
})();