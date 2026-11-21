import React from 'react';
import { 
  PlusCircle, 
  AlertTriangle, 
  Menu,
  Sparkles
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { BrandIcon } from './Logo';

/**
 * Header Component
 * 
 * Features consistent branding, accessible button controls,
 * simulated error test toggle, and responsive drawer toggles.
 */
export default function Header({ 
  onNewBriefing, 
  onToggleSidebar, 
  simulateError, 
  setSimulateError,
  currentBriefing 
}) {
  return (
    <header className="dashboard-header no-print sticky top-0 z-30 bg-[#F5F0E6]/95 backdrop-blur-md border-b border-warm-border px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left: Mobile hamburger & Breadcrumbs */}
        <div className="header-identity flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-charcoal-700 hover:text-charcoal-900 rounded-xl hover:bg-beige-200/80 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-muted"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile brand emblem */}
          <div className="lg:hidden">
            <BrandIcon size={28} />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif font-bold text-lg text-charcoal-900 tracking-tight sm:text-xl">
                BriefMeet <span className="text-gold-muted font-serif text-lg sm:text-2xl font-semibold">AI</span>
              </span>
              <span className="hidden xl:inline-block header-context text-charcoal-300">/</span>
              <span className="hidden sm:inline-block header-context text-sm font-medium text-charcoal-900">
                {currentBriefing ? `Briefing: ${currentBriefing.targetName}` : 'Pre-Meeting Research Dashboard'}
              </span>
            </div>
            <p className="header-description hidden md:block text-[11px] text-charcoal-500 font-medium">
              Sourced developments, leadership insights & high-impact meeting questions
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="header-actions flex items-center space-x-2 sm:space-x-3">
          <ThemeToggle />
          {/* Error Simulation Toggle for Testing */}
          {import.meta.env.DEV && <button
            type="button"
            aria-pressed={simulateError}
            onClick={() => setSimulateError(!simulateError)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-muted cursor-pointer shadow-warm-sm ${
              simulateError
                ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200 hover:border-amber-400'
                : 'bg-white text-charcoal-600 border-warm-border hover:bg-beige-100 hover:text-charcoal-900'
            }`}
            title="Toggle to test error state handling as required in specification"
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${simulateError ? 'text-amber-700' : 'text-charcoal-400'}`} />
            <span className="hidden sm:inline">Simulate Error:</span>
            <span className={`font-bold ${simulateError ? 'text-amber-800' : 'text-charcoal-500'}`}>
              {simulateError ? 'ON' : 'OFF'}
            </span>
          </button>}

          {/* New Briefing Button */}
          <button
            onClick={onNewBriefing}
            className="flex items-center space-x-1.5 bg-charcoal-900 hover:bg-charcoal-800 text-beige-50 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-warm hover:shadow-warm-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-muted group"
          >
            <PlusCircle className="w-4 h-4 text-gold-muted transition-transform duration-200 group-hover:rotate-90" />
            <span>New Briefing</span>
          </button>
        </div>
      </div>
    </header>
  );
}
