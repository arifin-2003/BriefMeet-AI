import React from 'react';
import { 
  Building2, 
  User, 
  Calendar, 
  Clock, 
  Target, 
  Sparkles, 
  Newspaper, 
  UserPlus, 
  Rocket, 
  HelpCircle, 
  BookOpen,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { BrandIcon } from './Logo';
import CitationBadge from './CitationBadge';

/**
 * OnePageBriefing Component
 * 
 * An executive, compact one-page briefing document designed specifically
 * for executive review and clean single-page A4 printing.
 */
export default function OnePageBriefing({ 
  briefing, 
  onCitationClick, 
  activeCitationId 
}) {
  if (!briefing) return null;

  const {
    targetName,
    targetType,
    tagline,
    industry,
    headquarters,
    fundingStage,
    meetingDate,
    meetingTime,
    meetingContext,
    executiveSummary = [],
    newsLast30Days = [],
    keyHires = [],
    productLaunches = [],
    suggestedQuestions = [],
    sources = []
  } = briefing;

  // Helper map: citationId -> source object with refNumber
  const sourceMap = React.useMemo(() => {
    const map = {};
    sources.forEach((s, idx) => {
      const refNum = s.refNumber || idx + 1;
      map[s.id] = { ...s, refNumber: refNum };
    });
    return map;
  }, [sources]);

  // Concise items for one-page layout (top 2 news, top 2 hires, top 2 launches, top 3 questions)
  const topNews = newsLast30Days.slice(0, 2);
  const topHires = keyHires.slice(0, 2);
  const topLaunches = productLaunches.slice(0, 2);
  const topQuestions = suggestedQuestions.slice(0, 3);

  return (
    <article className="executive-document w-full max-w-4xl mx-auto bg-white rounded-2xl border border-warm-border p-6 sm:p-8 md:p-10 shadow-warm print:p-0 print:border-none print:shadow-none print:rounded-none print:max-w-none text-charcoal-900 transition-all font-sans print-page-document">
      
      {/* Document Top Header Banner */}
      <header className="border-b-2 border-charcoal-900 pb-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <BrandIcon size={22} />
              <span className="font-serif text-xs font-bold uppercase tracking-widest text-gold-hover">
                BriefMeet AI • Executive Briefing
              </span>
              <span className="text-charcoal-300">•</span>
              <span className="text-[11px] font-bold text-charcoal-600 bg-beige-100 px-2 py-0.5 rounded border border-warm-border">
                {targetType === 'person' ? 'Executive Profile' : 'Enterprise Brief'}
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-charcoal-900 leading-tight">
              {targetName}
            </h1>

            {tagline && (
              <p className="text-xs sm:text-sm text-charcoal-600 font-medium mt-1 leading-snug">
                {tagline}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-charcoal-500 mt-2">
              {industry && <span>Industry: <strong className="text-charcoal-700">{industry}</strong></span>}
              {headquarters && <span>HQ: <strong className="text-charcoal-700">{headquarters}</strong></span>}
              {fundingStage && <span>Stage: <strong className="text-charcoal-700">{fundingStage}</strong></span>}
            </div>
          </div>

          {/* Meeting Schedule Box */}
          <div className="bg-[#FAF7F2] border border-warm-border rounded-xl p-3 sm:p-4 text-xs shrink-0 sm:text-right min-w-[210px] shadow-warm-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500 mb-1">
              Scheduled Meeting
            </p>
            <div className="flex items-center sm:justify-end space-x-1.5 text-xs font-bold text-charcoal-900">
              <Calendar className="w-3.5 h-3.5 text-softbrown shrink-0" />
              <span>{meetingDate}</span>
              <span className="text-charcoal-300">at</span>
              <Clock className="w-3.5 h-3.5 text-softbrown shrink-0" />
              <span>{meetingTime}</span>
            </div>
            {meetingContext && (
              <div className="mt-2 pt-2 border-t border-warm-border/60 text-[11px] text-charcoal-600">
                <span className="font-semibold text-charcoal-800">Goal: </span>
                <span>{meetingContext}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Section 1: Executive Summary */}
      <section className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-2.5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-gold-muted" />
          <span>Executive Summary & Strategic Context</span>
        </h2>
        <div className="bg-[#FAF7F2] rounded-xl border border-warm-border/80 p-4 space-y-2">
          {executiveSummary.map((item, idx) => (
            <div key={idx} className="flex items-start space-x-2 text-xs leading-relaxed text-charcoal-800">
              <span className="text-gold-muted font-bold text-[13px] leading-tight select-none">•</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: Two-Column Top Developments & Hires/Launches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {/* Left Column: Top 30-Day News */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Newspaper className="w-3.5 h-3.5 text-softbrown" />
              Top News (Last 30 Days)
            </span>
            <span className="text-[10px] text-charcoal-400 font-normal">Recent Verified</span>
          </h2>
          <div className="space-y-3">
            {topNews.length === 0 ? (
              <p className="text-xs text-charcoal-500 italic p-3 bg-[#FAF7F2] rounded-lg">No recent news available.</p>
            ) : (
              topNews.map((item) => {
                const src = sourceMap[item.citationId];
                return (
                  <div key={item.id} className="p-3 bg-white rounded-xl border border-warm-border shadow-warm-sm text-xs">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <span className="font-bold text-charcoal-900 leading-snug">
                        {item.title}
                      </span>
                      {src && (
                        <CitationBadge
                          refNumber={src.refNumber}
                          citationId={item.citationId}
                          sourceInfo={src}
                          onClick={onCitationClick}
                        />
                      )}
                    </div>
                    <p className="text-[11px] text-charcoal-600 leading-relaxed mb-1.5">
                      {item.summary}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-charcoal-400 pt-1 border-t border-warm-border/50">
                      <span>{item.date}</span>
                      <span className="italic">{item.sourceName}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Right Column: Leadership Hires & Product Launches */}
        <section className="space-y-4">
          {/* Key Hires */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-2 flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-softbrown" />
              Key Leadership Moves
            </h2>
            <div className="space-y-2">
              {topHires.length === 0 ? (
                <p className="text-xs text-charcoal-500 italic p-2 bg-[#FAF7F2] rounded-lg">No leadership changes recorded.</p>
              ) : (
                topHires.map((hire) => {
                  const src = sourceMap[hire.citationId];
                  return (
                    <div key={hire.id} className="p-2.5 bg-white rounded-xl border border-warm-border text-xs">
                      <div className="flex items-baseline justify-between gap-1">
                        <div>
                          <span className="font-bold text-charcoal-900">{hire.name}</span>
                          <span className="text-softbrown text-[11px] ml-1.5 font-medium">— {hire.role}</span>
                        </div>
                        {src && (
                          <CitationBadge
                            refNumber={src.refNumber}
                            citationId={hire.citationId}
                            sourceInfo={src}
                            onClick={onCitationClick}
                          />
                        )}
                      </div>
                      <p className="text-[10px] text-charcoal-500 italic mt-0.5">
                        Prior: {hire.previousCompany} ({hire.dateAnnounced})
                      </p>
                      <p className="text-[11px] text-charcoal-700 mt-1 leading-snug">
                        {hire.significance}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Product Releases */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-2 flex items-center gap-1.5">
              <Rocket className="w-3.5 h-3.5 text-softbrown" />
              Recent Product Releases
            </h2>
            <div className="space-y-2">
              {topLaunches.length === 0 ? (
                <p className="text-xs text-charcoal-500 italic p-2 bg-[#FAF7F2] rounded-lg">No product releases recorded.</p>
              ) : (
                topLaunches.map((prod) => {
                  const src = sourceMap[prod.citationId];
                  return (
                    <div key={prod.id} className="p-2.5 bg-white rounded-xl border border-warm-border text-xs">
                      <div className="flex items-baseline justify-between gap-1">
                        <span className="font-bold text-charcoal-900">{prod.name} ({prod.type})</span>
                        {src && (
                          <CitationBadge
                            refNumber={src.refNumber}
                            citationId={prod.citationId}
                            sourceInfo={src}
                            onClick={onCitationClick}
                          />
                        )}
                      </div>
                      <p className="text-[11px] text-charcoal-600 mt-0.5 leading-snug">
                        {prod.description}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Section 3: High-Impact Meeting Questions */}
      <section className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-2.5 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-gold-muted" />
          <span>Recommended Meeting Questions</span>
        </h2>
        <div className="space-y-2.5">
          {topQuestions.map((q) => (
            <div key={q.id} className="p-3 bg-[#FAF7F2] rounded-xl border border-warm-border/80 text-xs">
              <div className="flex items-baseline space-x-2">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-beige-200 text-charcoal-700 uppercase shrink-0">
                  {q.category}
                </span>
                <p className="font-serif font-bold text-xs sm:text-sm text-charcoal-900 leading-snug">
                  "{q.question}"
                </p>
              </div>
              {q.context && (
                <p className="text-[11px] text-charcoal-600 mt-1 pl-1 border-l-2 border-gold-muted/50 leading-snug">
                  <span className="font-semibold text-charcoal-700">Rationale: </span>
                  {q.context}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: Numbered Source Citations & References Table */}
      <section className="border-t border-warm-border pt-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-charcoal-500 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-softbrown" />
            <span>Numbered Source References & Verification Citations</span>
          </h2>
          <span className="text-[10px] text-charcoal-400 font-medium">
            Demo Sources (Phase 1)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-charcoal-600">
          {sources.map((s, idx) => {
            const refNum = s.refNumber || idx + 1;
            const isHighlighted = activeCitationId === s.id;
            return (
              <div 
                key={s.id}
                id={`onepage-source-${s.id}`}
                className={`p-2 rounded-lg border transition-all ${
                  isHighlighted 
                    ? 'bg-amber-100/70 border-gold-muted ring-2 ring-gold-muted/40 font-semibold' 
                    : 'bg-[#FAF7F2]/60 border-warm-border/60 hover:bg-white'
                }`}
              >
                <div className="flex items-start space-x-1.5">
                  <span className="font-mono font-bold text-charcoal-900 shrink-0">
                    [{refNum}]
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-charcoal-800 truncate">
                      {s.title}
                    </p>
                    <p className="text-charcoal-400 text-[9px]">
                      {s.publisher} • <span className="font-semibold text-charcoal-600">{s.publishDate}</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Document Footer */}
      <footer className="mt-6 pt-3 border-t border-warm-border/60 flex items-center justify-between text-[10px] text-charcoal-400">
        <span className="flex items-center gap-1.5">
          <BrandIcon size={14} />
          <span>Prepared by BriefMeet AI</span>
        </span>
        <span>Generated: {new Date(briefing.generatedAt).toLocaleDateString()}</span>
      </footer>
    </article>
  );
}
