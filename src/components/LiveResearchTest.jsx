import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Temporary Phase 2F diagnostic panel. Remove this file and its App import/render.
export default function LiveResearchTest() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sources, setSources] = useState(null);

  if (!import.meta.env.DEV || !user) return null;

  async function testResearch() {
    if (loading) return;
    setLoading(true);
    setError('');
    setSources(null);
    try {
      // Read the latest session so the token can refresh before invocation.
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const session = sessionData?.session;
      if (sessionError || !session?.access_token || session.user.id !== user.id) {
        setError('Authentication required. Please sign out and sign in again.');
        return;
      }
      const { data, error: invokeError } = await supabase.functions.invoke('research-briefing', {
        body: { targetName: 'Microsoft', targetType: 'company' },
        // Never fall back to an API key for this user-authenticated endpoint.
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (invokeError) {
        const status = invokeError.context?.status;
        let code;
        try {
          const payload = await invokeError.context?.clone().json();
          code = payload?.code || payload?.error?.code || payload?.error;
        } catch { /* Non-JSON error bodies are intentionally not displayed. */ }
        if (status === 401 || status === 403 || code === 'UNUSABLE_CREDENTIAL') {
          setError(`Authentication rejected${status ? ` (HTTP ${status})` : ''}. Please sign out and sign in again. If it persists, check the function's user-auth configuration.`);
        } else if (status) {
          setError(`Research request failed (HTTP ${status}). Try again or inspect the Edge Function logs.`);
        } else {
          setError('Unable to reach the function. Check your connection, function availability, and CORS configuration.');
        }
        return;
      }
      if (data?.error || data?.code === 'UNUSABLE_CREDENTIAL') {
        setError('The function returned an application error. Check the Edge Function logs; no response credentials are displayed.');
        return;
      }
      const returned = data?.sources ?? data?.results ?? data?.data?.sources;
      if (!Array.isArray(returned)) {
        setError('The function responded, but no sources array was found (sources, results, or data.sources).');
        return;
      }
      // Allowlist source fields instead of rendering arbitrary JSON or error bodies.
      const safeText = value => typeof value === 'string'
        ? value.replaceAll(session.access_token, '[redacted]')
          .replace(/\b(?:sb_(?:publishable|secret)_[A-Za-z0-9_-]+|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)\b/g, '[redacted]')
        : '';
      setSources(returned.map(source => ({
        title: safeText(source?.title), url: safeText(source?.url),
        publisher: safeText(source?.publisher), snippet: safeText(source?.snippet ?? source?.content),
      })));
    } catch {
      setError('The test could not complete. Check your connection and sign in again if your session expired.');
    } finally { setLoading(false); }
  }

  return <section className="mb-4 rounded-xl border border-warm-border bg-white p-4 text-charcoal-900 no-print" aria-label="Development live research test">
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" disabled={loading} onClick={testResearch}
        className="rounded-xl bg-charcoal-900 px-4 py-2 text-sm font-semibold text-beige-50 disabled:opacity-60">
        {loading ? 'Testing live research...' : 'Test Live Research'}
      </button>
      <span className="text-xs text-charcoal-500">Development only · Microsoft (company) · Results are not saved to history.</span>
    </div>
    {loading && <p role="status" className="mt-3 text-sm">Waiting for research-briefing...</p>}
    {error && <p role="alert" className="mt-3 text-sm">{error}</p>}
    {sources && <div role="status" className="mt-3 text-sm">Function succeeded. Returned {sources.length} sources.</div>}
    {sources?.length > 0 && <ol className="mt-3 space-y-3 list-decimal pl-5">
      {sources.map((source, index) => <li key={index} className="text-sm break-words">
        <p className="font-semibold">{source.title || 'Untitled source'}</p>
        {source.publisher && <p className="text-charcoal-500">{source.publisher}</p>}
        {source.url && <p className="text-xs text-softbrown-dark break-all">{source.url}</p>}
        {source.snippet && <p className="mt-1 text-charcoal-700">{source.snippet}</p>}
      </li>)}
    </ol>}
  </section>;
}
