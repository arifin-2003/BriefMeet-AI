// Run before styles paint; storage can be unavailable in private/restricted contexts.
(() => {
  const key = 'briefmeet_theme';
  const valid = value => ['light', 'dark'].includes(value) ? value : 'light';
  let preference = 'light';
  try { preference = valid(localStorage.getItem(key)); } catch {}
  const apply = () => {
    document.documentElement.dataset.theme = preference;
    window.dispatchEvent(new Event('briefmeet-theme-change'));
  };
  window.briefmeetTheme = {
    getPreference: () => preference,
    setPreference: value => {
      preference = valid(value);
      try { localStorage.setItem(key, preference); } catch {}
      apply();
    },
  };
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) { preference = valid(event.newValue); apply(); }
  });
  apply();
})();
