import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [preference, setPreference] = useState(() => window.briefmeetTheme.getPreference());
  useEffect(() => {
    const sync = () => setPreference(window.briefmeetTheme.getPreference());
    window.addEventListener('briefmeet-theme-change', sync);
    return () => window.removeEventListener('briefmeet-theme-change', sync);
  }, []);
  const dark = preference === 'dark';
  const label = dark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  const Icon = dark ? Sun : Moon;
  return (
    <button type="button" onClick={() => window.briefmeetTheme.setPreference(dark ? 'light' : 'dark')}
      aria-label={label} title={label}
      className="theme-toggle flex items-center justify-center shrink-0 w-10 h-10 rounded-xl border border-warm-border bg-white text-softbrown-dark hover:bg-beige-100 hover:border-gold-muted shadow-warm-sm transition-colors focus-visible:ring-2 focus-visible:ring-gold-muted">
      <Icon className="w-4 h-4" aria-hidden="true" />
    </button>
  );
}
