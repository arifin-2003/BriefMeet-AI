import React, { useState } from 'react';
import { 
  Download, 
  Printer, 
  Copy, 
  Check, 
  X, 
  FileText, 
  AlertCircle,
  ExternalLink,
  Info
} from 'lucide-react';

/**
 * ExportModal Component
 * 
 * Provides accessible, transparent export options:
 * 1. Clean A4 Print/Save-as-PDF workflow (configured for One-Page Briefing)
 * 2. Formatted Markdown / Plaintext copying
 * Transparently describes Phase 1 prototype vs Phase 2 automated serverless generation.
 */
export default function ExportModal({ 
  isOpen, 
  onClose, 
  briefing,
  onSwitchToOnePagePrint 
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !briefing) return null;

  const handleCopyText = () => {
    const text = `
BRIEFMEET AI — PRE-MEETING EXECUTIVE BRIEFING
==================================================
Target: ${briefing.targetName} (${briefing.targetType.toUpperCase()})
Scheduled Meeting: ${briefing.meetingDate} at ${briefing.meetingTime}
${briefing.meetingContext ? `Meeting Goal: ${briefing.meetingContext}\n` : ''}Generated: ${new Date(briefing.generatedAt).toLocaleString()}
Status: DEMO PROTOTYPE

EXECUTIVE SUMMARY
--------------------------------------------------
${briefing.executiveSummary.map((item, idx) => `[${idx + 1}] ${item}`).join('\n')}

TOP DEVELOPMENTS & NEWS (LAST 30 DAYS)
--------------------------------------------------
${briefing.newsLast30Days.map(n => `• [${n.date}] ${n.title}\n  ${n.summary} (Source: ${n.sourceName})`).join('\n\n')}

KEY LEADERSHIP HIRES
--------------------------------------------------
${briefing.keyHires.map(h => `• ${h.name} — ${h.role}\n  Prior: ${h.previousCompany} (${h.dateAnnounced})\n  Significance: ${h.significance}`).join('\n\n')}

PRODUCT LAUNCHES
--------------------------------------------------
${briefing.productLaunches.map(p => `• ${p.name} (${p.type}) [${p.date}]\n  ${p.description}`).join('\n\n')}

HIGH-IMPACT MEETING QUESTIONS
--------------------------------------------------
${briefing.suggestedQuestions.map(q => `• [${q.category}] "${q.question}"\n  Rationale: ${q.context}`).join('\n\n')}

NUMBERED SOURCE CITATIONS
--------------------------------------------------
${briefing.sources.map(s => `[${s.refNumber || 1}] ${s.title} — ${s.publisher} (${s.publishDate})`).join('\n')}
==================================================
*Generated via BriefMeet AI (Phase 1 Frontend Prototype)*
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    if (onSwitchToOnePagePrint) {
      onSwitchToOnePagePrint();
    }
    onClose();
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/50 backdrop-blur-sm animate-fade-in no-print">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-dialog-title"
        className="bg-white rounded-2xl border border-warm-border w-full max-w-lg p-6 sm:p-7 shadow-warm-lg transition-all"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-warm-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gold-light text-softbrown-dark border border-gold-muted/40 flex items-center justify-center shadow-warm-sm">
              <Download className="w-5 h-5 text-gold-muted" />
            </div>
            <div>
              <h3 id="export-dialog-title" className="font-serif text-lg font-bold text-charcoal-900">
                Export Executive Briefing
              </h3>
              <p className="text-xs text-charcoal-500 font-medium">
                {briefing.targetName} • One-Page Ready
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close export dialog"
            className="p-1.5 text-charcoal-400 hover:text-charcoal-900 rounded-lg hover:bg-beige-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Phase 1 Notice Box */}
        <div className="my-4 p-3.5 rounded-xl bg-[#FAF7F2] border border-warm-border text-xs text-charcoal-700 space-y-1.5">
          <div className="flex items-center space-x-1.5 font-bold text-softbrown-dark">
            <Info className="w-4 h-4 text-gold-muted shrink-0" />
            <span>Phase 1 Export Workflow</span>
          </div>
          <p className="text-charcoal-600 leading-relaxed text-[11px]">
            In Phase 1, you can instantly export via your browser's native print engine (configured to cleanly print the <strong>One-Page Briefing</strong> on A4 paper with selectable text) or copy the formatted briefing to your clipboard. Serverless automated PDF generation will be connected in Phase 2.
          </p>
        </div>

        {/* Action Options */}
        <div className="space-y-3">
          {/* Native Print / Save as PDF */}
          <button
            type="button"
            onClick={handlePrint}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-warm-border bg-warm-surface hover:bg-white hover:border-gold-muted hover:-translate-y-0.5 hover:shadow-warm transition-all duration-200 ease-out text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-muted"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-charcoal-900 text-beige-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <Printer className="w-4 h-4 text-gold-muted" />
              </div>
              <div>
                <p className="text-xs font-bold text-charcoal-900 group-hover:text-charcoal-900">
                  Save as A4 PDF / Print Document
                </p>
                <p className="text-[11px] text-charcoal-500">
                  Renders the One-Page Briefing cleanly on A4 paper (Destination: "Save as PDF")
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-gold-hover group-hover:translate-x-1 transition-transform duration-200 shrink-0">
              Print →
            </span>
          </button>

          {/* Copy Plaintext / Markdown */}
          <button
            type="button"
            onClick={handleCopyText}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-warm-border bg-warm-surface hover:bg-white hover:border-gold-muted hover:-translate-y-0.5 hover:shadow-warm transition-all duration-200 ease-out text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-muted"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-beige-200 text-charcoal-800 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4 text-softbrown" />}
              </div>
              <div>
                <p className="text-xs font-bold text-charcoal-900">
                  {copied ? 'Copied to Clipboard!' : 'Copy Formatted Briefing Text'}
                </p>
                <p className="text-[11px] text-charcoal-500">
                  Paste straight into Google Docs, Notion, or meeting invitations
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-softbrown group-hover:translate-x-1 transition-transform duration-200 shrink-0">
              {copied ? 'Copied' : 'Copy →'}
            </span>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-warm-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-beige-200/80 hover:bg-beige-300 text-charcoal-800 text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-muted"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
