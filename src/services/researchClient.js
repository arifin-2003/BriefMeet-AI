// Inject the browser client so success and failure paths can be tested offline.
export async function requestBriefing(client, params, onProgress = () => {}) {
  if (!params.targetName?.trim() || !params.meetingDate || !params.meetingTime) {
    throw new Error('Target name, meeting date, and meeting time are required.');
  }
  if (import.meta.env?.DEV && params.simulateError) throw new Error('Development error simulation is enabled. Turn it off to run live research.');
  if (!client) throw new Error('Research is unavailable. Check your configuration.');
  let sessionData, sessionError;
  try {
    ({ data: sessionData, error: sessionError } = await client.auth.getSession());
  } catch { throw new Error('Unable to check your session. Please sign in again.'); }
  if (sessionError || !sessionData?.session?.access_token) throw new Error('Please sign in again to generate a briefing.');
  onProgress({ step: 1 });
  // The server performs both stages; do not simulate completed research progress.
  let data, error;
  try {
    ({ data, error } = await client.functions.invoke('research-briefing', {
      body: { targetName: params.targetName.trim(), targetType: params.targetType || 'company' },
      headers: { Authorization: `Bearer ${sessionData.session.access_token}` },
    }));
  } catch { throw new Error('Unable to reach research. Check your connection and try again.'); }
  if (error) {
    let payload;
    try { payload = await error.context?.clone().json(); } catch { /* Never display raw provider responses. */ }
    const message = [401, 403].includes(error.context?.status)
      ? 'Authentication rejected. Please sign out and sign in again.'
      : failureMessage(payload?.code);
    throw Object.assign(new Error(message), { sources: safeSources(payload?.sources), code: payload?.code });
  }
  const sources = safeSources(data?.sources);
  if (data?.status === 'empty') return { ...params, ...data, sources, hasData: false, researchMode: 'live', isDemo: false };
  if (data?.status !== 'completed' || data?.provider !== 'tavily+gemini' || !data?.briefing || !sources.length ||
      !validBriefing(data.briefing, sources)) {
    throw Object.assign(new Error('AI did not return a complete briefing. Please retry.'), { sources });
  }
  onProgress({ step: 3 });
  return { ...params, ...data, sources, hasData: true, researchMode: 'live', isDemo: false, verified: false };
}

export function safeSources(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 5).flatMap((source, index) => {
    try {
      const url = new URL(source.url);
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return [];
      return [{ id: typeof source.id === 'string' ? source.id : `source-${index + 1}`, url: url.href,
        title: typeof source.title === 'string' ? source.title.slice(0, 200) : url.hostname,
        publisher: url.hostname, refNumber: index + 1,
        publishDate: typeof source.publishedDate === 'string' ? source.publishedDate.slice(0, 80) : null,
        snippet: typeof source.content === 'string' ? source.content.slice(0, 2400) : '' }];
    } catch { return []; }
  });
}

function validBriefing(briefing, sources) {
  const keys = ['executiveSummary', 'keyDevelopments', 'leadershipInsights', 'opportunities', 'risks', 'meetingQuestions'];
  const ids = new Set(sources.map(s => s.id));
  return keys.every(key => Array.isArray(briefing[key]) && briefing[key].every(item =>
    item && typeof (key === 'meetingQuestions' ? item.question : item.text) === 'string' &&
    (key === 'meetingQuestions' ? typeof item.rationale === 'string' : ['fact', 'analysis'].includes(item.kind)) &&
    Array.isArray(item.sourceIds) && item.sourceIds.length > 0 && item.sourceIds.every(id => ids.has(id)))) &&
    briefing.executiveSummary.length > 0 && briefing.meetingQuestions.length === 5;
}

function failureMessage(code) {
  const messages = {
    GEMINI_CONFIG: 'AI briefing generation is not configured. Research sources remain available.',
    GEMINI_TIMEOUT: 'AI briefing generation timed out. Please retry; research sources remain available.',
    GEMINI_RATE_LIMIT: 'AI quota or rate limit reached. Try again later; research sources remain available.',
    GEMINI_INVALID: 'AI returned an invalid or incomplete briefing. Please retry; research sources remain available.',
    GEMINI_UNAVAILABLE: 'AI briefing generation is unavailable. Please retry; research sources remain available.',
    GEMINI_NETWORK: 'AI briefing generation could not connect. Please retry; research sources remain available.',
    RESEARCH_CONFIG: 'Research service is not configured.',
    RESEARCH_RATE_LIMIT: 'Research quota or rate limit reached. Please try again later.',
    RESEARCH_TIMEOUT: 'Research timed out. Please try again.',
    RESEARCH_UNAVAILABLE: 'Research provider is unavailable. Please try again.',
    RESEARCH_NETWORK: 'Research could not connect. Please try again.',
    RESEARCH_INVALID: 'Research provider returned an invalid response. Please try again.',
  };
  return messages[code] || 'Briefing generation failed. Please try again.';
}
