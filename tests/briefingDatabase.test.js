import test from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { createBriefingDatabase, databaseMessage } from '../src/services/briefingDatabase.js';

// Real supabase-js query builder against an in-memory HTTP fixture, never the live database.
function fixture() {
  const rows = new Map();
  const sources = new Map();
  const calls = [];
  let actor = 'user-a';
  let sourceFailure = false;
  let failure = null;
  let offline = false;
  const response = (body, status = 200) => new Response(JSON.stringify(body), {
    status, headers: { 'Content-Type': 'application/json' },
  });
  const client = createClient('https://example.supabase.co', 'sb_publishable_test', {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: async (input, init) => {
      const url = new URL(input);
      if (offline) throw new TypeError('Failed to fetch');
      calls.push({ url, method: init.method, body: init.body && JSON.parse(init.body) });
      if (failure) return response(failure, 403);
      const table = url.pathname.split('/').at(-1);
      const id = url.searchParams.get('id')?.replace('eq.', '');
      if (table === 'briefing_sources') {
        if (sourceFailure) return response({ code: '42501', message: 'fixture denied' }, 403);
        for (const source of JSON.parse(init.body)) {
          if (rows.get(source.briefing_id)?.user_id !== actor) return response({ code: '42501' }, 403);
          if (!sources.has(source.id)) sources.set(source.id, source);
        }
        return response(null, 201);
      }
      if (init.method === 'POST') {
        const row = JSON.parse(init.body);
        if (row.user_id !== actor) return response({ code: '42501' }, 403);
        if (rows.has(row.id)) return response({ code: '23505' }, 409);
        rows.set(row.id, { ...row, created_at: new Date().toISOString() });
        return response(null, 201);
      }
      const owner = url.searchParams.get('user_id')?.replace('eq.', '');
      const visible = [...rows.values()].filter(row => row.user_id === actor && row.user_id === owner && (!id || row.id === id));
      if (init.method === 'DELETE') {
        visible.forEach(row => {
          rows.delete(row.id);
          for (const [key, source] of sources) if (source.briefing_id === row.id) sources.delete(key);
        });
        return response(visible.map(row => ({ id: row.id })));
      }
      return response(visible.reverse().map(row => ({ ...row, researchMode: row.report.researchMode,
        briefing_sources: url.searchParams.get('select').includes('(count)')
          ? [{ count: [...sources.values()].filter(s => s.briefing_id === row.id).length }]
          : [...sources.values()].filter(s => s.briefing_id === row.id),
      })));
    } },
  });
  const database = createBriefingDatabase({ from: client.from.bind(client),
    auth: { getUser: async () => ({ data: { user: actor ? { id: actor } : null }, error: null }) } });
  return { database, rows, sources, calls, actor: value => { actor = value; },
    sourceFailure: value => { sourceFailure = value; }, failure: value => { failure = value; },
    offline: value => { offline = value; } };
}

function draft(id = 'briefing-1') {
  return { databaseId: id, targetName: 'Test company', targetType: 'company', meetingDate: '2026-11-10',
    meetingTime: '10:30', meetingContext: 'Discovery', hasData: true,
    executiveSummary: ['Fictional report'], newsLast30Days: [{ citationId: 'cite-1' }],
    sources: [{ id: 'cite-1', databaseSourceId: `source-${id}`, title: 'Demo article',
      url: 'https://example.com/demo', publisher: 'Mock publisher', publishDate: 'Nov 9, 2026', refNumber: 1 }] };
}

test('create → save → reload → reopen → delete preserves report and citation IDs', async () => {
  const f = fixture();
  await f.database.saveDemo(draft());
  const row = f.rows.get('briefing-1');
  assert.equal(row.user_id, 'user-a');
  assert.equal(row.meeting_goal, 'Discovery');
  assert.equal(row.status, 'completed');
  assert.equal(row.report.researchMode, 'mock');
  assert.equal(row.report.verified, false);
  assert.equal(f.sources.size, 1);
  const history = await f.database.list();
  assert.equal(history[0].sourcesCount, 1);
  const report = await f.database.get(history[0].id);
  assert.equal(report.sources[0].id, report.newsLast30Days[0].citationId);
  assert.deepEqual(report.executiveSummary, ['Fictional report']);
  assert.equal(report.sourcesIncomplete, false);
  const listCall = f.calls.find(call => call.url.searchParams.get('order'));
  assert.equal(listCall.url.searchParams.get('order'), 'created_at.desc,id.desc');
  await f.database.remove(history[0].id);
  assert.deepEqual(await f.database.list(), []);
  assert.equal(f.sources.size, 0);
});

test('source failure preserves report; retries do not duplicate or overwrite it', async () => {
  const f = fixture();
  f.sourceFailure(true);
  await assert.rejects(f.database.saveDemo(draft()), { code: 'SOURCES_INCOMPLETE' });
  assert.equal(f.rows.size, 1);
  assert.equal((await f.database.get('briefing-1')).sourcesIncomplete, true);
  f.sourceFailure(false);
  await f.database.saveDemo(draft());
  await f.database.saveDemo({ ...draft(), targetName: 'Must not overwrite' });
  assert.equal(f.rows.size, 1);
  assert.equal(f.sources.size, 1);
  assert.equal(f.rows.get('briefing-1').target_name, 'Test company');
});

test('account filtering blocks other-user list, reopen and delete in the fixture', async () => {
  const f = fixture();
  await f.database.saveDemo(draft());
  f.actor('user-b');
  assert.deepEqual(await f.database.list(), []);
  await assert.rejects(f.database.get('briefing-1'), { code: 'NOT_FOUND' });
  await assert.rejects(f.database.remove('briefing-1'), { code: 'NOT_FOUND' });
  assert.equal(f.rows.size, 1);
  // The fixture models RLS; this does not verify deployed Supabase policies.
});

test('missing session and permission failures are actionable and do not leak raw server details', async () => {
  const f = fixture();
  f.actor(null);
  await assert.rejects(f.database.list(), { code: 'AUTH_REQUIRED' });
  assert.match(databaseMessage({ code: 'AUTH_REQUIRED' }), /session has expired/);
  assert.match(databaseMessage({ name: 'AuthSessionMissingError' }), /session has expired/);
  f.actor('user-a');
  f.failure({ code: '42501', message: 'internal private server details' });
  await assert.rejects(f.database.list(), { code: '42501' });
  assert.match(databaseMessage({ code: '42501' }), /permission denied/);
  assert.doesNotMatch(databaseMessage(new Error('private details')), /private details/);
});

test('network failures retain saved data and permit a later retry', async () => {
  const f = fixture();
  await f.database.saveDemo(draft());
  f.offline(true);
  await assert.rejects(f.database.list());
  f.offline(false);
  assert.equal((await f.database.list()).length, 1);
});

test('invalid dates become null and empty sources are valid', async () => {
  const f = fixture();
  const value = draft();
  value.sources[0].publishDate = 'unknown';
  await f.database.saveDemo(value);
  assert.equal([...f.sources.values()][0].published_at, null);
  await f.database.saveDemo({ ...draft('empty'), sources: [] });
  assert.deepEqual((await f.database.get('empty')).sources, []);
});

test('live reports save and reopen with all generated sections and stable citation IDs', async () => {
  const f = fixture();
  const value = { ...draft('live-1'), isDemo: false, researchMode: 'live', status: 'completed', provider: 'tavily+gemini',
    briefing: { executiveSummary: [{ text: 'Sourced fact', kind: 'fact', sourceIds: ['cite-1'] }],
      keyDevelopments: [], leadershipInsights: [], opportunities: [], risks: [], meetingQuestions: [] } };
  const saved = await f.database.save(value);
  assert.equal(saved.isDemo, false);
  assert.equal(saved.researchMode, 'live');
  assert.equal(saved.verified, false);
  assert.deepEqual(saved.briefing, value.briefing);
  assert.equal(saved.sources[0].id, saved.briefing.executiveSummary[0].sourceIds[0]);
  assert.equal((await f.database.list())[0].researchMode, 'live');
  await assert.rejects(f.database.save({ ...value, databaseId: 'failed-live', status: 'failed' }), /incomplete AI briefing/);
});
