import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  User, 
  Calendar, 
  Clock, 
  Sparkles, 
  Download, 
  ArrowLeft, 
  Newspaper, 
  UserPlus, 
  Rocket, 
  HelpCircle, 
  BookOpen, 
  Copy, 
  Check, 
  Printer, 
  Info,
  Target
} from 'lucide-react';
import NewsCard from './NewsCard';
import SourceCitation from './SourceCitation';
import ExportModal from './ExportModal';
import BriefingViewToggle from './BriefingViewToggle';
import OnePageBriefing from './OnePageBriefing';
import CitationBadge from './CitationBadge';

/**
 * BriefingResults Component
 * 
 * Supports two distinct display modes:
 * 1. Detailed View: Comprehensive SaaS results dashboard
 * 2. One-Page View: Compact executive briefing document suitable for single-page A4 printing
 */
export default function BriefingResults({ 
  briefing, 
  onBackToGenerator 
}) {
  const [activeCitationId, setActiveCitationId] = useState(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [copiedQuestionId, setCopiedQuestionId] = useState(null);
  const [displayMode, setDisplayMode] = useState('detailed'); // 'detailed' | 'onepage'

  if (!briefing) return null;

  const {
    targetName,
    targetType,
    tagline,
    industry,
    headquarters,
    founded,
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

  // Build citation lookup dictionary: id -> { ...source, refNumber }
  const sourceMap = useMemo(() => {
    const map = {};
    sources.forEach((s, idx) => {
      const refNum = s.refNumber || idx + 1;
      map[s.id] = { ...s, refNumber: refNum };
    });
    return map;
  }, [sources]);

  const scrollToCitation = (citationId) => {
    setActiveCitationId(citationId);
    
    // In one-page view, scroll to onepage-source; in detailed view, scroll to source
    const targetId = displayMode === 'onepage' 
      ? `onepage-source-${citationId}` 
      : `source-${citationId}`;
    
    const element = document.getElementById(targetId) || document.getElementById(`source-${citationId}`);
    if (element) {
      element.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' });
    }
  };

  const copyQuestion = (q) => {
    navigator.clipboard.writeText(q.question);
    setCopiedQuestionId(q.id);
    setTimeout(() => setCopiedQuestionId(null), 2000);
  };

  return (
    <div className="briefing-results w-full max-w-5xl mx-auto space-y-6 pb-16 print-page">
      {/* Top Action & View Switcher Bar (Hidden in Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print bg-white/80 backdrop-blur-md p-3.5 rounded-2xl border border-warm-border shadow-warm-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToGenerator}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-charcoal-700 hover:text-charcoal-900 bg-white hover:bg-beige-100 px-3 py-2 rounded-xl border border-warm-border hover:border-gold-muted transition-all duration-200 ease-out shadow-warm-sm hover:-translate-y-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-muted cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span>Back to Generator</span>
          </button>

          {/* View Toggle (Detailed vs One-Page) */}
          <BriefingViewToggle
            activeView={displayMode}
            onViewChange={setDisplayMode}
          />
        </div>

        {/* Export & Print Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              // Ensure one-page view is active when direct print is triggered for optimal 1-page paper output
              setDisplayMode('onepage');
              setTimeout(() => window.print(), 120);
            }}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-charcoal-700 bg-white hover:bg-beige-100 hover:border-gold-muted px-3.5 py-2 rounded-xl border border-warm-border transition-all duration-200 ease-out shadow-warm-sm hover:-translate-y-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-muted cursor-pointer"
            title="Print one-page briefing directly"
          >
            <Printer className="w-3.5 h-3.5 text-softbrown" />
            <span className="hidden sm:inline">Print Document</span>
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-beige-50 bg-charcoal-900 hover:bg-charcoal-800 px-4 py-2 rounded-xl shadow-warm hover:shadow-warm-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-muted cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-gold-muted" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Demo Prototype Watermark Notice */}
      <div className="bg-[#FAF3E0] border border-gold-muted/40 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-softbrown-dark no-print shadow-warm-sm">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-gold-muted shrink-0" />
          <span>
            <strong>Demo Data Notice:</strong> All metrics, recent developments, leadership hires, and citations shown below are mock demonstration data for Phase 1 prototype evaluation.
          </span>
        </div>
        <span className="hidden md:inline-block text-[10px] font-mono uppercase bg-gold-light px-2 py-0.5 rounded font-bold text-softbrown-dark border border-gold-muted/30">
          Mock Verification Mode
        </span>
      </div>

      {/* CONDITIONALLY RENDER WITH SMOOTH ANIMATION WRAPPER */}
      <div key={displayMode} className="animate-fade-in">
        {displayMode === 'onepage' ? (
          <OnePageBriefing
            briefing={briefing}
            onCitationClick={scrollToCitation}
            activeCitationId={activeCitationId}
          />
        ) : (
          /* DETAILED RESULTS DASHBOARD */
          <div className="space-y-6">
            {/* Briefing Header Profile Card */}
            <div className="bg-white rounded-2xl border border-warm-border p-6 sm:p-8 shadow-warm relative overflow-hidden print-break-inside-avoid">
              {/* Top Gold Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-softbrown via-gold-muted to-softbrown" />

              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center space-x-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-gold-light text-softbrown-dark border border-gold-muted/30">
                      {targetType === 'person' ? (
                        <>
                          <User className="w-3.5 h-3.5" />
                          <span>Executive Profile</span>
                        </>
                      ) : (
                        <>
                          <Building2 className="w-3.5 h-3.5" />
                          <span>Enterprise Briefing</span>
                        </>
                      )}
                    </span>

                    {industry && (
                      <span className="text-xs text-charcoal-600 font-semibold bg-beige-100 px-2.5 py-0.5 rounded-full border border-warm-border">
                        {industry}
                      </span>
                    )}

                    {fundingStage && (
                      <span className="text-xs text-charcoal-600 font-semibold bg-beige-100 px-2.5 py-0.5 rounded-full border border-warm-border">
                        {fundingStage}
                      </span>
                    )}
                  </div>

                  <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 tracking-tight leading-tight">
                    {targetName}
                  </h1>

                  {tagline && (
                    <p className="text-sm text-charcoal-600 font-medium max-w-2xl leading-relaxed">
                      {tagline}
                    </p>
                  )}

                  {headquarters && (
                    <p className="text-xs text-charcoal-400 font-medium">
                      HQ: {headquarters} {founded !== 'N/A' && `• Est. ${founded}`}
                    </p>
                  )}
                </div>

                {/* Scheduled Meeting Info Box */}
                <div className="bg-[#FAF7F2] border border-warm-border rounded-xl p-4 min-w-[230px] shrink-0 space-y-2 shadow-warm-sm">
                  <p className="text-[11px] font-bold text-charcoal-400 uppercase tracking-wider">
                    Target Meeting Schedule
                  </p>
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2 text-xs font-bold text-charcoal-800">
                      <Calendar className="w-4 h-4 text-softbrown shrink-0" />
                      <span>{meetingDate}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs font-bold text-charcoal-800">
                      <Clock className="w-4 h-4 text-softbrown shrink-0" />
                      <span>{meetingTime}</span>
                    </div>
                    {meetingContext && (
                      <div className="pt-2 border-t border-warm-border/60 text-[11px] text-charcoal-700">
                        <span className="font-bold text-charcoal-900">Goal: </span>
                        <span>{meetingContext}</span>
                      </div>
                    )}
                  </div>
                  <div className="pt-2 border-t border-warm-border/60 text-[10px] text-charcoal-500">
                    Generated: {new Date(briefing.generatedAt).toLocaleDateString()} at {new Date(briefing.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 1: Executive Summary */}
            <section className="bg-white rounded-2xl border border-warm-border p-6 sm:p-7 shadow-warm print-break-inside-avoid">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gold-light text-softbrown-dark flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-gold-muted" />
                </div>
                <h2 className="font-serif text-xl font-bold text-charcoal-900">
                  Executive Summary
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {executiveSummary.map((point, idx) => (
                  <div 
                    key={idx}
                    className="p-3.5 rounded-xl bg-warm-surface border border-warm-border text-xs text-charcoal-700 leading-relaxed flex items-start space-x-2.5 shadow-warm-sm hover:border-gold-muted/50 hover:bg-white transition-all duration-200"
                  >
                    <span className="w-5 h-5 rounded-full bg-gold-light text-softbrown-dark flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 border border-gold-muted/30">
                      {idx + 1}
                    </span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 2: Important News from the Last 30 Days */}
            <section className="bg-white rounded-2xl border border-warm-border p-6 sm:p-7 shadow-warm print-break-inside-avoid">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-beige-200 text-charcoal-800 flex items-center justify-center">
                    <Newspaper className="w-4 h-4 text-softbrown" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-bold text-charcoal-900">
                      Recent Developments (Last 30 Days)
                    </h2>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 bg-beige-100 text-charcoal-600 rounded-full border border-warm-border">
                  {newsLast30Days.length} items
                </span>
              </div>

              {newsLast30Days.length === 0 ? (
                <p className="text-xs text-charcoal-500 italic py-4">No 30-day news items found for this query.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {newsLast30Days.map((item) => {
                    const src = sourceMap[item.citationId];
                    return (
                      <NewsCard 
                        key={item.id} 
                        item={item} 
                        refNumber={src?.refNumber}
                        sourceInfo={src}
                        onCitationClick={scrollToCitation} 
                      />
                    );
                  })}
                </div>
              )}
            </section>

            {/* Section 3 & 4: Key Hires & Product Launches */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Key Hires and Leadership Changes */}
              <section className="bg-white rounded-2xl border border-warm-border p-6 shadow-warm flex flex-col justify-between print-break-inside-avoid">
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-beige-200 text-charcoal-800 flex items-center justify-center">
                      <UserPlus className="w-4 h-4 text-softbrown" />
                    </div>
                    <h2 className="font-serif text-lg font-bold text-charcoal-900">
                      Key Hires & Leadership Changes
                    </h2>
                  </div>

                  {keyHires.length === 0 ? (
                    <p className="text-xs text-charcoal-500 italic py-4">No recent leadership appointments recorded.</p>
                  ) : (
                    <div className="space-y-3">
                      {keyHires.map((hire) => {
                        const src = sourceMap[hire.citationId];
                        return (
                          <div 
                            key={hire.id}
                            className="p-3.5 rounded-xl border border-warm-border bg-warm-surface hover:bg-white hover:border-gold-muted hover:-translate-y-0.5 transition-all duration-200 ease-out text-xs shadow-warm-sm"
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div>
                                <h4 className="font-bold text-charcoal-900 text-xs sm:text-sm">
                                  {hire.name}
                                </h4>
                                <p className="text-softbrown font-semibold text-xs">
                                  {hire.role}
                                </p>
                              </div>
                              <div className="flex items-center space-x-1.5 shrink-0">
                                <span className="text-[10px] text-charcoal-400">
                                  {hire.dateAnnounced}
                                </span>
                                {src && (
                                  <CitationBadge
                                    refNumber={src.refNumber}
                                    citationId={hire.citationId}
                                    sourceInfo={src}
                                    onClick={scrollToCitation}
                                  />
                                )}
                              </div>
                            </div>

                            <p className="text-[11px] text-charcoal-500 italic mb-2">
                              Prior: {hire.previousCompany}
                            </p>

                            <p className="text-xs text-charcoal-700 leading-relaxed bg-white/80 p-2.5 rounded-lg border border-warm-border/60">
                              <strong className="text-charcoal-900">Strategic Impact:</strong> {hire.significance}
                            </p>

                            <div className="mt-2 text-[10px] text-charcoal-400 flex items-center justify-between">
                              <span>Source: {hire.sourceName}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>

              {/* Product Launches and Announcements */}
              <section className="bg-white rounded-2xl border border-warm-border p-6 shadow-warm flex flex-col justify-between print-break-inside-avoid">
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-beige-200 text-charcoal-800 flex items-center justify-center">
                      <Rocket className="w-4 h-4 text-softbrown" />
                    </div>
                    <h2 className="font-serif text-lg font-bold text-charcoal-900">
                      Product Releases & Launches
                    </h2>
                  </div>

                  {productLaunches.length === 0 ? (
                    <p className="text-xs text-charcoal-500 italic py-4">No recent product releases identified.</p>
                  ) : (
                    <div className="space-y-3">
                      {productLaunches.map((prod) => {
                        const src = sourceMap[prod.citationId];
                        return (
                          <div 
                            key={prod.id}
                            className="p-3.5 rounded-xl border border-warm-border bg-warm-surface hover:bg-white hover:border-gold-muted hover:-translate-y-0.5 transition-all duration-200 ease-out text-xs shadow-warm-sm"
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div>
                                <h4 className="font-bold text-charcoal-900 text-xs sm:text-sm">
                                  {prod.name}
                                </h4>
                                <span className="inline-block text-[10px] font-bold text-softbrown-dark bg-gold-light px-1.5 py-0.2 rounded mt-0.5 border border-gold-muted/30">
                                  {prod.type}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1.5 shrink-0">
                                <span className="text-[10px] text-charcoal-400">
                                  {prod.date}
                                </span>
                                {src && (
                                  <CitationBadge
                                    refNumber={src.refNumber}
                                    citationId={prod.citationId}
                                    sourceInfo={src}
                                    onClick={scrollToCitation}
                                  />
                                )}
                              </div>
                            </div>

                            <p className="text-xs text-charcoal-700 leading-relaxed mb-2">
                              {prod.description}
                            </p>

                            <div className="text-[11px] text-charcoal-600 bg-white/80 p-2 rounded-lg border border-warm-border/60">
                              <strong className="text-charcoal-900">Market Impact:</strong> {prod.marketImpact}
                            </div>

                            <div className="mt-2 text-[10px] text-charcoal-400 flex items-center justify-between">
                              <span>Source: {prod.sourceName}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Section 5: Suggested High-Impact Meeting Questions */}
            <section className="bg-white rounded-2xl border border-warm-border p-6 sm:p-7 shadow-warm print-break-inside-avoid">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gold-light text-softbrown-dark flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 text-gold-muted" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-charcoal-900">
                    Suggested High-Impact Meeting Questions
                  </h2>
                  <p className="text-xs text-charcoal-500 font-medium">
                    Intelligent conversation prompts grounded in recent strategic developments
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {suggestedQuestions.map((q) => {
                  const isCopied = copiedQuestionId === q.id;

                  return (
                    <div 
                      key={q.id}
                      className="p-4 rounded-xl border border-warm-border bg-warm-surface hover:bg-white hover:border-gold-muted hover:-translate-y-0.5 hover:shadow-warm-sm transition-all duration-200 ease-out group"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-beige-200 text-charcoal-700 uppercase tracking-wide">
                          {q.category}
                        </span>

                        <button
                          onClick={() => copyQuestion(q)}
                          className="text-xs text-charcoal-600 hover:text-charcoal-900 inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white border border-warm-border hover:border-gold-muted hover:bg-beige-100 transition-all duration-200 shadow-warm-sm active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-muted"
                          title="Copy question text to clipboard"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 font-bold text-[11px]">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-softbrown" />
                              <span className="text-[11px] font-semibold">Copy Question</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-sm font-serif font-bold text-charcoal-900 leading-snug mb-2">
                        "{q.question}"
                      </p>

                      {q.context && (
                        <div className="text-xs text-charcoal-600 bg-white/90 p-2.5 rounded-lg border border-warm-border/60">
                          <span className="font-bold text-charcoal-800">Strategic Rationale: </span>
                          {q.context}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Section 6: Sources & Citations */}
            <section className="bg-white rounded-2xl border border-warm-border p-6 sm:p-7 shadow-warm print-break-inside-avoid">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-beige-200 text-charcoal-800 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-softbrown" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-bold text-charcoal-900">
                      Verifiable Sources & Citations
                    </h2>
                    <p className="text-xs text-charcoal-500 font-medium">
                      Evidence references, publication timestamps, and citation mapping
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 bg-beige-100 text-charcoal-600 rounded-full border border-warm-border">
                  {sources.length} sources
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {sources.map((source) => (
                  <SourceCitation 
                    key={source.id} 
                    source={source} 
                    isHighlighted={activeCitationId === source.id}
                    onClearHighlight={() => setActiveCitationId(null)}
                  />
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-warm-border text-[11px] text-charcoal-400 flex items-center justify-between">
                <span>* Demo Sources: Phase 1 uses simulated publication references to protect API quotas.</span>
                <span>Phase 2 will link live Tavily Search URLs</span>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Export Modal Dialog */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        briefing={briefing}
        onSwitchToOnePagePrint={() => setDisplayMode('onepage')}
      />
    </div>
  );
}
