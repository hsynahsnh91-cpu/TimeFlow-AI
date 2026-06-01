(function() {
  const defaults = { theme: 'light', lang: 'ar', dir: 'rtl', pomodoro: 25, notifications: true, sound: true };
  
  const save = async (data) => {
    const settings = { ...defaults, ...data };
    for (let k in settings) {
      await TimeFlowDB.update('settings', { key: k, value: settings[k] });
    }
    apply(settings);
    return settings;
  };

  const load = async () => {
    const data = await TimeFlowDB.getAll('settings');
    const settings = {};
    data.forEach(s => settings[s.key] = s.value);
    const merged = { ...defaults, ...settings };
    apply(merged);
    return merged;
  };

  const apply = (s) => {
    document.documentElement.setAttribute('data-theme', s.theme);
    document.documentElement.setAttribute('lang', s.lang);
    document.documentElement.setAttribute('dir', s.dir);
    localStorage.setItem('tf_pref_theme', s.theme);
    localStorage.setItem('tf_pref_lang', s.lang);
    localStorage.setItem('tf_pref_dir', s.dir);
  };

  const toggleTheme = async () => {
    const current = localStorage.getItem('tf_pref_theme') || 'light';
    await save({ theme: current === 'dark' ? 'light' : 'dark' });
  };

  const toggleLang = async () => {
    const current = localStorage.getItem('tf_pref_lang') || 'ar';
    await save({ lang: current === 'ar' ? 'en' : 'ar', dir: current === 'ar' ? 'ltr' : 'rtl' });
  };

  window.TimeFlowSettings = { save, load, toggleTheme, toggleLang, apply };
})();