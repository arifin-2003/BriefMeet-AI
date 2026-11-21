import React from 'react';
import { 
  History, 
  Calendar, 
  Clock, 
  Building2, 
  User, 
  ArrowRight, 
  PlusCircle, 
  BookOpen, 
  Sparkles
} from 'lucide-react';

/**
 * BriefingHistory Component
 * 
 * Displays historical session briefings with 1-click reloading,
 * smooth hover elevation, and accessible controls.
 */
export default function BriefingHistory({ 
  history = [], 
  onSelectBriefing, 
  onNewBriefing,
  onDeleteBriefing,
  busy = false,
}) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-warm-border p-6 sm:p-8 shadow-warm flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-softbrown via-gold-muted to-softbrown" />

        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-beige-200 text-charcoal-700 text-xs font-bold mb-2">
            <History className="w-3.5 h-3.5 text-softbrown" />
            <span>Workspace Archive</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-charcoal-900">
            Briefing History
          </h2>
          <p className="text-xs text-charcoal-500 mt-1">
            Reopen saved reports from your account. Older demo snapshots remain labeled.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={onNewBriefing}
            className="flex items-center space-x-1.5 bg-charcoal-900 hover:bg-charcoal-800 text-beige-50 px-4 py-2 rounded-xl text-xs font-semibold shadow-warm hover:shadow-warm-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-muted cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-gold-muted" />
            <span>Generate New</span>
          </button>
        </div>
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <div className="bg-white rounded-2xl border border-warm-border p-12 text-center shadow-warm">
          <div className="w-12 h-12 rounded-xl bg-beige-100 text-charcoal-400 flex items-center justify-center mx-auto mb-3 border border-warm-border">
            <History className="w-6 h-6 text-softbrown" />
          </div>
          <h3 className="font-serif text-lg font-bold text-charcoal-800 mb-1">
            No briefings in history yet
          </h3>
          <p className="text-xs text-charcoal-500 mb-6 max-w-sm mx-auto">
            Create a briefing, then choose Save briefing to store it in your account.
          </p>
          <button
            onClick={onNewBriefing}
            className="inline-flex items-center space-x-2 bg-charcoal-900 hover:bg-charcoal-800 text-beige-50 px-5 py-2.5 rounded-xl text-xs font-semibold shadow-warm hover:shadow-warm-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-muted cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold-muted" />
            <span>Generate First Briefing</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectBriefing(item)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onSelectBriefing(item);
                }
              }}
              className="bg-white rounded-xl border border-warm-border p-4 sm:p-5 shadow-warm-sm hover:shadow-warm hover:border-gold-muted hover:-translate-y-0.5 transition-all duration-200 ease-out cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-muted"
            >
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-beige-100 group-hover:bg-gold-light text-charcoal-700 group-hover:text-softbrown-dark flex items-center justify-center shrink-0 transition-colors duration-200 border border-warm-border/60">
                  {item.targetType === 'person' ? (
                    <User className="w-5 h-5" />
                  ) : (
                    <Building2 className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm sm:text-base font-bold text-charcoal-900 group-hover:text-charcoal-900">
                      {item.targetName}
                    </h3>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-beige-200 text-charcoal-700">
                      {item.targetType}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-charcoal-500 mt-1">
                    <span>{item.researchMode === 'mock' ? 'Saved demo (unverified)' : item.researchMode === 'live' ? 'Saved AI research (review sources)' : 'Saved report'} · {item.status}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-softbrown" />
                      Meeting: {item.meetingDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-softbrown" />
                      {item.meetingTime}
                    </span>
                    {item.sourcesCount && (
                      <span className="flex items-center gap-1 text-charcoal-400">
                        <BookOpen className="w-3.5 h-3.5" />
                        {item.sourcesCount} citations
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-warm-border/50">
                <button type="button" disabled={busy} aria-label={`Delete briefing for ${item.targetName}`}
                  onClick={e => { e.stopPropagation(); onDeleteBriefing(item); }}
                  className="rounded-lg border border-warm-border px-3 py-2 text-xs text-charcoal-700 hover:bg-beige-100 disabled:opacity-50">Delete</button>
                <span className="text-[11px] text-charcoal-400 font-medium">
                  {item.generatedAt || 'Recent'}
                </span>
                <span className="inline-flex items-center space-x-1 text-xs font-bold text-softbrown group-hover:text-charcoal-900 group-hover:translate-x-1 transition-all duration-200">
                  <span>View Briefing</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
