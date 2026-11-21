import test from 'node:test';
import assert from 'node:assert/strict';
import { requestBriefing, safeSources } from '../src/services/researchClient.js';
import { transformWithEsbuild } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFile } from 'node:fs/promises';

const params = { targetName: 'Example', targetType: 'company', meetingDate: '2026-11-10', meetingTime: '10:00' };
const source = { id: 'source-1', title: 'New service', url: 'https://example.com/news', content: 'A service launched.' };
const fact = { text: 'A service launched.', kind: 'fact', sourceIds: ['source-1'] };
const briefing = { executiveSummary: [fact], keyDevelopments: [fact], leadershipInsights: [], opportunities: [], risks: [],
  meetingQuestions: Array.from({ length: 5 }, (_, i) => ({ question: `Question ${i + 1}?`, rationale: 'Discuss service launch.', sourceIds: ['source-1'] })) };
const success = () => ({ status: 'completed', provider: 'tavily+gemini', targetName: 'Example', targetType: 'company', generatedAt: '2026-11-10T00:00:00Z', sources: [source], briefing });
function client(result, session = { access_token: 'fixture-user-token' }) {
  return { auth: { getSession: async () => ({ data: { session } }) }, functions: { invoke: async (name, options) => {
    assert.equal(name, 'research-briefing');
    assert.equal(options.headers.Authorization, 'Bearer fixture-user-token');
    assert.deepEqual(options.body, { targetName: 'Example', targetType: 'company' });
    return result;
  } } };
}

test('frontend calls with user access token and preserves live report, metadata and citations', async () => {
  const result = await requestBriefing(client({ data: success() }), params);
  assert.equal(result.researchMode, 'live');
  assert.equal(result.isDemo, false);
  assert.equal(result.meetingDate, params.meetingDate);
  assert.equal(result.sources[0].id, result.briefing.executiveSummary[0].sourceIds[0]);
});

test('frontend requires a session before invoking providers', async () => {
  await assert.rejects(requestBriefing(client({}, null), params), /sign in again/);
  const unavailable = client({}); unavailable.auth.getSession = async () => { throw new Error('private auth detail'); };
  await assert.rejects(requestBriefing(unavailable, params), /Unable to check your session/);
  await assert.rejects(requestBriefing(client({}), { ...params, targetName: '' }), /required/);
});

test('Gemini 404 and 503 return research-only results with safe notices', async () => {
  for (const status of [404, 503]) {
    const error = { context: Response.json({ code: 'GEMINI_UNAVAILABLE', sources: [source], error: 'private detail' }, { status }) };
    const result = await requestBriefing(client({ error }), params);
    assert.equal(result.status, 'research_only');
    assert.equal(result.briefing, null);
    assert.equal(result.hasData, true);
    assert.equal(result.researchMode, 'live');
    assert.equal(result.sources[0].url, source.url);
    assert.match(result.aiNotice, /unavailable/);
    assert.doesNotMatch(result.aiNotice, /private detail/);
  }
});

test('Gemini errors without valid sources and research or authentication failures still throw', async () => {
  for (const sources of [[], [{ ...source, url: 'javascript:alert(1)' }]]) {
    const error = { context: Response.json({ code: 'GEMINI_UNAVAILABLE', sources }, { status: 503 }) };
    await assert.rejects(requestBriefing(client({ error }), params), /unavailable/);
  }
  for (const [status, code, message] of [[502, 'RESEARCH_UNAVAILABLE', /Research provider/], [401, 'GEMINI_UNAVAILABLE', /Authentication rejected/], [403, 'GEMINI_UNAVAILABLE', /Authentication rejected/]]) {
    const error = { context: Response.json({ code, sources: [source] }, { status }) };
    await assert.rejects(requestBriefing(client({ error }), params), message);
  }
});

test('frontend handles empty, malformed, auth and network errors', async () => {
  const result = await requestBriefing(client({ data: { status: 'empty', sources: [] } }), params);
  assert.equal(result.hasData, false);
  for (const data of [{}, { ...success(), status: 'failed' }, { ...success(), briefing: { ...briefing, meetingQuestions: [] } },
    { ...success(), briefing: { ...briefing, executiveSummary: [{ ...fact, sourceIds: ['missing'] }] } }]) {
    await assert.rejects(requestBriefing(client({ data }), params), /complete briefing/);
  }
  await assert.rejects(requestBriefing(client({ error: { context: new Response('', { status: 401 }) } }), params), /Authentication rejected/);
  const offline = client({}); offline.functions.invoke = async () => { throw new Error('private details'); };
  await assert.rejects(requestBriefing(offline, params), /Unable to reach research/);
  assert.equal(safeSources([{ ...source, url: 'javascript:alert(1)' }]).length, 0);
});

async function loadComponent(path) {
  const source = await readFile(path, 'utf8');
  const compiled = await transformWithEsbuild(source, path, { loader: 'jsx', jsx: 'transform' });
  // These components have only React imports; resolve React from this test's dependency.
  const code = compiled.code.replace(/import React from ["']react["'];?/, 'const React = globalThis.__briefmeetTestReact;');
  globalThis.__briefmeetTestReact = React;
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
}

test('React live briefing renders all six sections, citations, missing evidence and suggestions', async () => {
  const { default: GeneratedBriefing } = await loadComponent('src/components/GeneratedBriefing.jsx');
  const result = await requestBriefing(client({ data: success() }), params);
  const html = renderToStaticMarkup(React.createElement(GeneratedBriefing, { briefing: result }));
  for (const label of ['Executive Summary', 'Key Developments', 'Leadership Insights', 'Business Opportunities', 'Risks and Challenges', 'Suggested Meeting Questions']) assert.ok(html.includes(label));
  assert.match(html, /href="https:\/\/example.com\/news"/);
  assert.match(html, /Insufficient supporting research/);
  assert.match(html, /Factual finding/);
  assert.match(html, /Suggested question/);
  assert.doesNotMatch(html, /Demo Source|fixture-user-token/);
});

test('React failure sources remain clickable and source text is escaped', async () => {
  const { ResearchSources } = await loadComponent('src/components/GeneratedBriefing.jsx');
  const html = renderToStaticMarkup(React.createElement(ResearchSources, { sources: safeSources([{ ...source, content: '<script>untrusted</script>' }]) }));
  assert.match(html, /href="https:\/\/example.com\/news"/);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<script>/);
});

test('research-only view shows notice and linked sources without briefing or save controls', async () => {
  const { ResearchSources } = await loadComponent('src/components/GeneratedBriefing.jsx');
  const sourceCode = await readFile('src/components/ResearchOnly.jsx', 'utf8');
  const compiled = await transformWithEsbuild(sourceCode, 'ResearchOnly.jsx', { loader: 'jsx', jsx: 'transform' });
  globalThis.__briefmeetTestResearchSources = ResearchSources;
  const code = compiled.code.replace(/import React from ["']react["'];?/, 'const React = globalThis.__briefmeetTestReact;')
    .replace(/import \{ ResearchSources \} from ["']\.\/GeneratedBriefing["'];?/, 'const ResearchSources = globalThis.__briefmeetTestResearchSources;');
  const { default: ResearchOnly } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
  const error = { context: Response.json({ code: 'GEMINI_UNAVAILABLE', sources: [source] }, { status: 503 }) };
  const result = await requestBriefing(client({ error }), params);
  const html = renderToStaticMarkup(React.createElement(ResearchOnly, { briefing: result }));
  assert.match(html, /Research sources found — AI briefing unavailable/);
  assert.match(html, /href="https:\/\/example.com\/news"/);
  assert.doesNotMatch(html, /Save briefing|Executive Summary|AI-generated/);
});
