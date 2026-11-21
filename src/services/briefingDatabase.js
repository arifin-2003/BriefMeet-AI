// Browser-client dependency is injected so mappings and failure paths can be tested offline.
export function databaseMessage(error) {
  if (['AUTH_REQUIRED', 'PGRST301', 'PGRST303', 'session_not_found', 'session_expired', 'refresh_token_not_found', 'refresh_token_already_used', 'bad_jwt'].includes(error?.code)
    || error?.status === 401 || error?.name === 'AuthSessionMissingError') {
    return 'Your session has expired. Please sign out and sign in again.';
  }
  if (error?.code === '42501' || error?.status === 403) {
    return 'Database permission denied. Your account may not have access to this record.';
  }
  if (error?.code === 'NOT_FOUND') return 'This briefing is unavailable or you do not have access to it. Refresh history.';
  return 'Database request failed. Check your connection and try again.';
}

function fail(error) { if (error) throw error; }
function unavailable() { return Object.assign(new Error('Record unavailable'), { code: 'NOT_FOUND' }); }

export function historyItem(row) {
  return {
    id: row.id, targetName: row.target_name, targetType: row.target_type,
    meetingDate: row.meeting_date, meetingTime: row.meeting_time,
    meetingContext: row.meeting_goal, status: row.status,
    generatedAt: new Date(row.created_at).toLocaleString(),
    sourcesCount: row.briefing_sources?.[0]?.count || 0,
    researchMode: row.researchMode,
  };
}

export function restoreReport(row) {
  const report = row.report && typeof row.report === 'object' && !Array.isArray(row.report) ? row.report : {};
  const savedSources = Array.isArray(report.sources) ? report.sources : [];
  // Preserve report citation IDs (e.g. cite-1); the table uses independent UUIDs.
  const sources = (row.briefing_sources || []).map((source, index) => {
    const original = savedSources.find(s => s.databaseSourceId === source.id);
    return { ...original, id: original?.id || source.id, databaseSourceId: source.id,
      refNumber: original?.refNumber || index + 1, title: source.title, url: source.url,
      publisher: source.publisher, publishDate: original?.publishDate || source.published_at };
  });
  return { executiveSummary: [], newsLast30Days: [], keyHires: [], productLaunches: [], suggestedQuestions: [],
    ...report, sources, databaseId: row.id, targetName: row.target_name, targetType: row.target_type,
    meetingDate: row.meeting_date, meetingTime: row.meeting_time, meetingContext: row.meeting_goal,
    generatedAt: report.generatedAt || row.created_at, hasData: !!row.report,
    sourcesIncomplete: savedSources.some(s => !sources.some(found => found.databaseSourceId === s.databaseSourceId)),
    sourceSnapshot: savedSources,
  };
}

export function createBriefingDatabase(client) {
  async function identity() {
    if (!client) throw Object.assign(new Error('Authentication unavailable'), { code: 'AUTH_REQUIRED' });
    const { data, error } = await client.auth.getUser();
    fail(error);
    if (!data.user) throw Object.assign(new Error('Sign in required'), { code: 'AUTH_REQUIRED' });
    return data.user.id;
  }

  async function rawRecord(id, userId) {
    const { data, error } = await client.from('briefings').select('*, briefing_sources(*)')
      .eq('user_id', userId).eq('id', id).maybeSingle();
    fail(error);
    return data;
  }

  return {
    async list() {
      const userId = await identity();
      const { data, error } = await client.from('briefings')
        .select('id,target_name,target_type,meeting_date,meeting_time,meeting_goal,status,created_at,researchMode:report->>researchMode,briefing_sources(count)')
        .eq('user_id', userId).order('created_at', { ascending: false }).order('id', { ascending: false });
      fail(error);
      return (data || []).map(historyItem);
    },
    async get(id) {
      const row = await rawRecord(id, await identity());
      if (!row) throw unavailable();
      return restoreReport(row);
    },
    async saveDemo(draft) { return this.save({ ...draft, isDemo: true, researchMode: 'mock', verified: false }); },
    async save(draft) {
      const userId = await identity();
      if (!draft.databaseId || !['company', 'person'].includes(draft.targetType) || !draft.targetName?.trim() || !draft.meetingDate) {
        throw new Error('Invalid briefing fields');
      }
      // Stable IDs make retries safe even if a response is lost after a successful write.
      let row = await rawRecord(draft.databaseId, userId);
      if (!row) {
        if (draft.researchMode === 'live' && (draft.status !== 'completed' || !draft.briefing)) throw new Error('Cannot save an incomplete AI briefing');
        const report = { ...draft, isDemo: draft.researchMode !== 'live', researchMode: draft.researchMode === 'live' ? 'live' : 'mock', verified: false };
        delete report.sourceSnapshot;
        delete report.sourcesIncomplete;
        const { error } = await client.from('briefings').insert({ id: draft.databaseId, user_id: userId,
          target_type: draft.targetType, target_name: draft.targetName.trim(), meeting_date: draft.meetingDate,
          meeting_time: draft.meetingTime || null, meeting_goal: draft.meetingContext || null,
          status: 'completed', report });
        // A concurrent retry can insert the same ID first; never overwrite that row.
        if (error && error.code !== '23505') throw error;
        row = await rawRecord(draft.databaseId, userId);
        if (!row) throw unavailable();
      }
      const missing = (row.report?.sources || []).filter(s => !(row.briefing_sources || []).some(existing => existing.id === s.databaseSourceId));
      if (missing.length) {
        const payload = missing.map(s => {
          const timestamp = Date.parse(s.publishDate);
          return { id: s.databaseSourceId, briefing_id: row.id, title: s.title || 'Untitled source',
            url: s.url || '', publisher: s.publisher || null,
            published_at: Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString() };
        });
        try {
          const { error } = await client.from('briefing_sources').upsert(payload, { onConflict: 'id', ignoreDuplicates: true });
          fail(error);
        } catch (cause) {
          throw Object.assign(new Error('Report saved, sources incomplete'), { code: 'SOURCES_INCOMPLETE', cause });
        }
      }
      return restoreReport(await rawRecord(row.id, userId));
    },
    async remove(id) {
      const userId = await identity();
      const { data, error } = await client.from('briefings').delete().eq('user_id', userId).eq('id', id).select('id');
      fail(error);
      if (!data?.length) throw unavailable();
      // briefing_sources are deleted by the existing ON DELETE CASCADE foreign key.
    },
  };
}
