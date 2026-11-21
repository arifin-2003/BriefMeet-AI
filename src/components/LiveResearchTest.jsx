import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { requestBriefing } from '../services/researchClient';
import GeneratedBriefing, { ResearchSources } from './GeneratedBriefing';

export default function LiveResearchTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  if (!import.meta.env.DEV) return null;
  async function testResearch() {
    setLoading(true); setResult(null); setError(null);
    try {
      setResult(await requestBriefing(supabase, { targetName: 'Microsoft', targetType: 'company',
        meetingDate: new Date().toISOString().slice(0, 10), meetingTime: '10:00' }));
    } catch (failure) { setError(failure); } finally { setLoading(false); }
  }
  return <section className="mb-4 rounded-xl border border-warm-border bg-white p-4 no-print">
    <button disabled={loading} onClick={testResearch} className="rounded-xl bg-charcoal-900 px-4 py-2 text-sm text-beige-50 disabled:opacity-60">{loading ? 'Testing Tavily + Gemini...' : 'Test Live Research + Gemini'}</button>
    <p className="mt-2 text-xs text-charcoal-500">Development only · Microsoft · Not saved to history.</p>
    {error && <><p role="alert" className="my-3 text-sm">{error.message}</p><ResearchSources sources={error.sources} /></>}
    {result?.hasData && <GeneratedBriefing briefing={result} onBackToGenerator={() => setResult(null)} />}
    {result?.hasData === false && <p role="status">No research sources found.</p>}
  </section>;
}
