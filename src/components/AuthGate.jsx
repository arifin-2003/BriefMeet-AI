import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

function authError(error) {
  switch (error?.code) {
    case 'invalid_credentials': return 'Email or password is incorrect.';
    case 'email_not_confirmed': return 'Please confirm your email before signing in. You can resend the confirmation below.';
    case 'user_already_exists': return 'Unable to create this account. Try signing in instead.';
    case 'weak_password': return 'Choose a stronger password that meets your project’s password requirements.';
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit': return 'Too many attempts. Please wait a few minutes and try again.';
    case 'signup_disabled': return 'New account registration is currently unavailable.';
    default: return 'Unable to complete the request. Check your connection and details, then try again.';
  }
}

export default function AuthGate({ children }) {
  const { user, loading, notice, error, setNotice, setError } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const signup = mode === 'signup';

  async function submit(event, resend = false) {
    event.preventDefault();
    if (busy || !supabase) return;
    setError(''); setNotice('');
    const address = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
      setError('Enter a valid email address.'); return;
    }
    if (!resend && signup && (password.length < 8 || password !== confirmation)) {
      setError(password.length < 8 ? 'Use at least 8 characters for your password.' : 'Passwords do not match.'); return;
    }
    setBusy(true);
    try {
      const emailRedirectTo = `${window.location.origin}/auth/callback`;
      const result = resend
        ? await supabase.auth.resend({ type: 'signup', email: address, options: { emailRedirectTo } })
        : signup
          ? await supabase.auth.signUp({ email: address, password, options: { emailRedirectTo } })
          : await supabase.auth.signInWithPassword({ email: address, password });
      if (result.error) { setError(authError(result.error)); return; }
      setPassword(''); setConfirmation('');
      if (resend || (signup && !result.data.session)) {
        setNotice('Check your inbox and spam folder for a confirmation link. If this address already has an account, sign in instead.');
      }
    } catch { setError('Unable to connect. Please check your connection and try again.'); }
    finally { setBusy(false); }
  }

  if (loading) return <main className="min-h-screen bg-beige-100 flex items-center justify-center text-charcoal-900" role="status">Restoring your session…</main>;
  if (user) return <>
    {(notice || error) && <div className="bg-gold-pale text-charcoal-900 border-b border-warm-border px-4 py-3 flex items-center justify-between gap-4 no-print" role={error ? 'alert' : 'status'}>
      <span>{error || notice}</span><button type="button" onClick={() => { setNotice(''); setError(''); }} aria-label="Dismiss authentication message">Dismiss</button>
    </div>}
    {children}
  </>;

  return <main className="min-h-screen bg-beige-100 text-charcoal-900 px-4 py-8 flex flex-col items-center justify-center">
    <div className="w-full max-w-md flex items-center justify-between gap-4 mb-8"><Logo showTagline /><ThemeToggle /></div>
    <section className="w-full max-w-md bg-white border border-warm-border rounded-2xl shadow-warm p-6 sm:p-8" aria-labelledby="auth-heading">
      <h1 id="auth-heading" className="font-serif text-3xl font-bold">{signup ? 'Create your account' : 'Welcome back'}</h1>
      <p className="text-sm text-charcoal-500 mt-2 mb-6">Sign in to prepare for your next conversation.</p>
      {!supabase && <p role="alert" className="mb-4 text-sm">Authentication is unavailable. Check VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY, then restart Vite.</p>}
      {error && <p role="alert" className="mb-4 p-3 border border-warm-border rounded-xl text-sm text-charcoal-900">{error}</p>}
      {notice && <p role="status" className="mb-4 p-3 bg-gold-pale rounded-xl text-sm">{notice}</p>}
      <form onSubmit={submit} className="space-y-4">
        <fieldset disabled={busy || !supabase} className="space-y-4 disabled:opacity-60">
          <label className="block text-sm font-medium">Email
            <input type="email" autoComplete="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-warm-border bg-beige-50 px-3 py-3 text-charcoal-900" />
          </label>
          <label className="block text-sm font-medium">Password
            <input type="password" autoComplete={signup ? 'new-password' : 'current-password'} required minLength={signup ? 8 : undefined} value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-warm-border bg-beige-50 px-3 py-3 text-charcoal-900" />
          </label>
          {signup && <><p className="text-xs text-charcoal-500">Use at least 8 characters. Your workspace may require a stronger password.</p><label className="block text-sm font-medium">Confirm password
            <input type="password" autoComplete="new-password" required value={confirmation} onChange={e => setConfirmation(e.target.value)} className="mt-1 w-full rounded-xl border border-warm-border bg-beige-50 px-3 py-3 text-charcoal-900" />
          </label></>}
          <button type="submit" className="w-full bg-charcoal-900 text-beige-50 rounded-xl px-4 py-3 font-semibold">{busy ? 'Please wait…' : signup ? 'Create account' : 'Sign in'}</button>
        </fieldset>
      </form>
      <div className="mt-5 space-y-3 text-sm">
        <button type="button" disabled={busy} className="text-softbrown-dark underline disabled:opacity-50" onClick={() => { setMode(signup ? 'login' : 'signup'); setPassword(''); setConfirmation(''); setError(''); setNotice(''); }}>{signup ? 'Already have an account? Sign in' : 'New to BriefMeet? Create an account'}</button>
        <button type="button" disabled={busy || !supabase} className="block text-softbrown-dark underline disabled:opacity-50" onClick={e => submit(e, true)}>Resend confirmation email</button>
      </div>
    </section>
  </main>;
}
