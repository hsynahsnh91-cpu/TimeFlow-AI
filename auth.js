(function() {
  let currentUser = null;

  const hashPassword = async (pass) => {
    const enc = new TextEncoder();
    const data = enc.encode(pass + 'tf_salt_2026_secure');
    const hashBuf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2,'0')).join('');
  };

  const login = async (email, password, remember) => {
    const users = await TimeFlowDB.getAll('users', 'email', email);
    const user = users[0];
    if (!user) throw new Error('بريد غير مسجل');
    const hash = await hashPassword(password);
    if (user.passwordHash !== hash) throw new Error('كلمة مرور غير صحيحة');
    
    const session = { id: crypto.randomUUID(), userId: user.id, expires: Date.now() + (remember ? 2592000000 : 86400000) };
    await TimeFlowDB.add('sessions', session);
    currentUser = { ...user, sessionId: session.id };
    localStorage.setItem('tf_session_id', session.id);
    return currentUser;
  };

  const register = async (name, email, password) => {
    const exists = await TimeFlowDB.getAll('users', 'email', email);
    if (exists.length > 0) throw new Error('البريد مسجل بالفعل');
    const hash = await hashPassword(password);
    const user = { id: crypto.randomUUID(), name, email, passwordHash: hash, avatar: 'U', role: 'member', createdAt: new Date().toISOString() };
    await TimeFlowDB.add('users', user);
    const sess = { id: crypto.randomUUID(), userId: user.id, expires: Date.now() + 86400000 };
    await TimeFlowDB.add('sessions', sess);
    localStorage.setItem('tf_session_id', sess.id);
    currentUser = { ...user, sessionId: sess.id };
    return currentUser;
  };

  const autoLogin = async () => {
    const sid = localStorage.getItem('tf_session_id');
    if (!sid) return null;
    const session = await TimeFlowDB.get('sessions', sid);
    if (!session || session.expires < Date.now()) {
      localStorage.removeItem('tf_session_id');
      return null;
    }
    const user = await TimeFlowDB.get('users', session.userId);
    currentUser = { ...user, sessionId: session.id };
    return currentUser;
  };

  const logout = async () => {
    if (currentUser?.sessionId) await TimeFlowDB.delete('sessions', currentUser.sessionId);
    localStorage.removeItem('tf_session_id');
    currentUser = null;
  };

  const updateProfile = async (name, avatarBase64) => {
    if (!currentUser) return;
    if (name) currentUser.name = name;
    if (avatarBase64) currentUser.avatar = avatarBase64;
    await TimeFlowDB.update('users', currentUser);
    return currentUser;
  };

  const loginAsGuest = async () => {
    const guest = { id: 'guest_' + Date.now(), name: 'زائر', email: 'guest@local', avatar: 'G', role: 'guest', createdAt: new Date().toISOString() };
    await TimeFlowDB.add('users', guest);
    const sess = { id: 'guest_sess', userId: guest.id, expires: Date.now() + 3600000 };
    await TimeFlowDB.add('sessions', sess);
    localStorage.setItem('tf_session_id', 'guest_sess');
    currentUser = { ...guest, sessionId: sess.id };
    return currentUser;
  };

  window.TimeFlowAuth = { login, register, logout, autoLogin, updateProfile, loginAsGuest, getCurrentUser: () => currentUser };
})();