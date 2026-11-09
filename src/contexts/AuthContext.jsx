import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);
const callbackUrl = new URL(window.location.href);
const callbackHash = new URLSearchParams(callbackUrl.hash.slice(1));
const isCallback = callbackUrl.pathname === '/auth/callback';
const callbackFailed = callbackHash.has('error') || callbackUrl.searchParams.has('error');

// Never render or log the raw callback, which can contain credentials.
function cleanCallback() {
  if (isCallback) window.history.replaceState({}, '', '/');
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      cleanCallback();
      return;
    }
    let active = true;
    let authChanged = false;
    // Keep this callback synchronous: SDK calls inside it can deadlock auth.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;
      authChanged = true;
      setSession(nextSession);
      if (event === 'SIGNED_OUT') setNotice('You have signed out.');
    });
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (!authChanged) setSession(data.session);
      if (callbackFailed || sessionError) {
        setError(isCallback
          ? 'This confirmation link is invalid or expired. Request a new confirmation email below.'
          : 'Unable to restore your session. Please sign in again.');
      } else if (isCallback) {
        setNotice(data.session
          ? 'Email confirmed. You are signed in.'
          : 'Return from email confirmation received. Please sign in; if your email is still unconfirmed, request a new link.');
      }
    }).catch(() => {
      if (active) setError('Unable to restore your session. Check your connection and try again.');
    }).finally(() => {
      if (active) {
        cleanCallback();
        setLoading(false);
      }
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  return <AuthContext.Provider value={{ session, user: session?.user ?? null, loading,
    notice, error, setNotice, setError }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
