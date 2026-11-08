import React from 'react';
import { 
  FileText, 
  History, 
  Sparkles, 
  Database, 
  ChevronRight, 
  X, 
  Building2, 
  UserCheck,
  Zap
} from 'lucide-react';
import Logo from './Logo';
import UserProfileMenu from './UserProfileMenu';
import { DEMO_PRESETS } from '../data/mockBriefings';

/**
 * Sidebar Component
 * 
 * Features premium interactive hover effects, animated active indicators,
 * accessible keyboard focus, and mock user profile dropdown.
 */
export default function Sidebar({ 
  currentView, 
  setCurrentView, 
  onSelectPreset,
  recentBriefings = [],
  onSelectHistoryItem,
  isOpen,
  setIsOpen 
}) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-charcoal-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        premium-sidebar fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#F7F3EB] border-r border-warm-border
        flex flex-col transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand / Logo Header */}
        <div className="sidebar-brand p-5 border-b border-warm-border flex items-center justify-between">
          <Logo size="lg" showTagline={true} />
          
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 text-charcoal-500 hover:text-charcoal-900 rounded-xl hover:bg-beige-200 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-muted"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Phase 1 Prototype Badge */}
        <div className="sidebar-phase px-5 py-2.5 bg-[#EFE9DC]/80 border-b border-warm-border/60">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-charcoal-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gold-muted animate-pulse" />
              Phase 1: Frontend Prototype
            </span>
            <span className="text-[10px] uppercase font-bold text-softbrown-dark tracking-wide bg-gold-light/90 border border-gold-muted/30 px-1.5 py-0.2 rounded shadow-warm-sm">
              Mock Engine
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav flex-1 overflow-y-auto px-4 py-4 space-y-6">
          <div>
            <p className="px-3 text-[11px] font-bold text-charcoal-400 uppercase tracking-wider mb-2">
              Main Navigation
            </p>
            <div className="space-y-1.5">
              {/* Briefing Generator Navigation */}
              <button
                onClick={() => {
                  setCurrentView('generator');
                  setIsOpen(false);
                }}
                className={`relative w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ease-out group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-muted ${
                  currentView === 'generator'
                    ? 'bg-charcoal-900 text-beige-50 shadow-warm'
                    : 'text-charcoal-700 hover:bg-[#EAE2D2] hover:text-charcoal-900 hover:translate-x-0.5'
                }`}
              >
                {/* Active Indicator Bar */}
                {currentView === 'generator' && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-gold-muted animate-fade-in" />
                )}

                <div className="flex items-center space-x-3">
                  <FileText className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${currentView === 'generator' ? 'text-gold-muted' : 'text-softbrown'}`} />
                  <span>Briefing Generator</span>
                </div>
                {currentView === 'generator' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-muted shadow-sm" />
                )}
              </button>

              {/* Briefing History Navigation */}
              <button
                onClick={() => {
                  setCurrentView('history');
                  setIsOpen(false);
                }}
                className={`relative w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ease-out group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-muted ${
                  currentView === 'history'
                    ? 'bg-charcoal-900 text-beige-50 shadow-warm'
                    : 'text-charcoal-700 hover:bg-[#EAE2D2] hover:text-charcoal-900 hover:translate-x-0.5'
                }`}
              >
                {/* Active Indicator Bar */}
                {currentView === 'history' && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-gold-muted animate-fade-in" />
                )}

                <div className="flex items-center space-x-3">
                  <History className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${currentView === 'history' ? 'text-gold-muted' : 'text-charcoal-500'}`} />
                  <span>Briefing History</span>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                  currentView === 'history' ? 'bg-charcoal-800 text-gold-muted' : 'bg-beige-200 text-charcoal-700'
                }`}>
                  {recentBriefings.length}
                </span>
              </button>
            </div>
          </div>

          {/* Quick Demo Presets */}
          <div>
            <div className="px-3 flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold text-charcoal-400 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3 text-gold-muted" />
                Quick Demo Presets
              </p>
              <span className="text-[10px] text-gold-hover font-semibold">1-Click Test</span>
            </div>
            <div className="space-y-1.5">
              {DEMO_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onSelectPreset(preset);
                    setIsOpen(false);
                  }}
                  className="sidebar-preset w-full text-left p-2.5 rounded-xl border border-warm-border/80 bg-warm-surface hover:bg-white hover:border-gold-muted hover:-translate-y-0.5 hover:shadow-warm transition-all duration-200 ease-out text-xs group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-muted cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-charcoal-800 group-hover:text-charcoal-900 flex items-center gap-1.5 transition-colors">
                      {preset.type === 'person' ? (
                        <UserCheck className="w-3.5 h-3.5 text-softbrown group-hover:text-gold-muted transition-colors" />
                      ) : (
                        <Building2 className="w-3.5 h-3.5 text-softbrown group-hover:text-gold-muted transition-colors" />
                      )}
                      {preset.label}
                    </span>
                    <span className="text-[10px] font-medium px-1.5 py-0.2 bg-beige-200 group-hover:bg-gold-light group-hover:text-softbrown-dark text-charcoal-600 rounded transition-colors">
                      {preset.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-charcoal-500 line-clamp-1">
                    {preset.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Integration Roadmap Box */}
          <div className="p-3.5 rounded-xl bg-beige-200/50 border border-warm-border/80">
            <div className="flex items-center space-x-2 text-xs font-bold text-charcoal-800 mb-1">
              <Database className="w-3.5 h-3.5 text-softbrown" />
              <span>Future Integrations</span>
            </div>
            <p className="text-[11px] text-charcoal-600 leading-relaxed mb-2.5">
              Phase 2 connects Supabase DB, Tavily Search API, and Google Gemini API.
            </p>
            <div className="flex flex-wrap gap-1">
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/90 border border-warm-border text-charcoal-700">Supabase</span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/90 border border-warm-border text-charcoal-700">Tavily</span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/90 border border-warm-border text-charcoal-700">Gemini</span>
            </div>
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="sidebar-profile p-3 border-t border-warm-border bg-[#F4EFE5]">
          <UserProfileMenu />
        </div>
      </aside>
    </>
  );
}
