import React from 'react';

const sections = [
  ['executiveSummary', 'Executive Summary'], ['keyDevelopments', 'Key Developments'],
  ['leadershipInsights', 'Leadership Insights'], ['opportunities', 'Business Opportunities'],
  ['risks', 'Risks and Challenges'], ['meetingQuestions', 'Suggested Meeting Questions'],
];

export function ResearchSources({ sources = [] }) {
  return <section className="rounded-2xl border border-warm-border bg-white p-5 sm:p-7">
    <h2 className="font-serif text-xl font-bold text-charcoal-900">Research Sources</h2>
    <ol className="mt-4 space-y-3 text-sm">
      {sources.map((source, index) => <li key={source.id} id={`source-${source.id}`} className="break-words">
        <a href={source.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-softbrown-dark underline">[{index + 1}] {source.title}</a>
        {source.publishDate && <p className="text-xs text-charcoal-500">Published: {source.publishDate}</p>}
        {source.snippet && <p className="mt-1 text-charcoal-700">{source.snippet}</p>}
      </li>)}
    </ol>
  </section>;
}

// Live reports share the dashboard's existing visual theme; legacy demos keep their renderer.
export default function GeneratedBriefing({ briefing, onBackToGenerator }) {
  const sourceMap = Object.fromEntries(briefing.sources.map((s, index) => [s.id, { ...s, number: index + 1 }]));
  return <article className="w-full max-w-5xl mx-auto space-y-5 pb-16 text-charcoal-900">
    <div className="flex flex-wrap gap-3 no-print">
      <button onClick={onBackToGenerator} className="rounded-xl border border-warm-border bg-white px-4 py-2 text-sm">Back to Generator</button>
      <button onClick={() => window.print()} className="rounded-xl bg-charcoal-900 px-4 py-2 text-beige-50 text-sm">Print / Save PDF</button>
    </div>
    <header className="rounded-2xl border border-warm-border bg-gold-pale p-5 sm:p-7">
      <p className="text-xs uppercase tracking-wide text-softbrown-dark">Tavily research + Gemini briefing</p>
      <h1 className="font-serif text-3xl font-bold mt-2 break-words">{briefing.targetName}</h1>
      <p className="mt-2 text-sm">{briefing.targetType} · Meeting: {briefing.meetingDate} {briefing.meetingTime}</p>
      {briefing.meetingContext && <p className="mt-2 text-sm">Meeting goal: {briefing.meetingContext}</p>}
      <p className="mt-2 text-xs text-charcoal-600">Generated {new Date(briefing.generatedAt).toLocaleString()}. AI findings require review against the linked sources. Analysis and questions are suggestions.</p>
    </header>
    {sections.map(([key, label]) => <section key={key} className="rounded-2xl border border-warm-border bg-white p-5 sm:p-7">
      <h2 className="font-serif text-xl font-bold">{label}</h2>
      {!briefing.briefing[key].length && <p className="mt-3 text-sm text-charcoal-500">Insufficient supporting research for this section.</p>}
      <ul className="mt-4 space-y-4">
        {briefing.briefing[key].map((item, index) => <li key={index} className="text-sm leading-relaxed">
          <span className="mr-2 rounded bg-beige-100 px-2 py-1 text-xs font-semibold">{key === 'meetingQuestions' ? 'Suggested question' : item.kind === 'fact' ? 'Factual finding' : 'Analysis / suggestion'}</span>
          <span>{item.text || item.question}</span>
          {item.rationale && <p className="mt-1 text-charcoal-600">Rationale: {item.rationale}</p>}
          <span className="ml-2 inline-flex flex-wrap gap-2">{item.sourceIds.map(id => sourceMap[id] && <a key={id} href={sourceMap[id].url} target="_blank" rel="noopener noreferrer" aria-label={`Source ${sourceMap[id].number}: ${sourceMap[id].title}`} className="text-softbrown-dark underline">[{sourceMap[id].number}]</a>)}</span>
        </li>)}
      </ul>
    </section>)}
    <ResearchSources sources={briefing.sources} />
  </article>;
}
