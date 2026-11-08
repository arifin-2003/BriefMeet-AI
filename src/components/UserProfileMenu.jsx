import React, { useState, useEffect, useRef } from 'react';
import { User, Settings, HelpCircle, ChevronUp, Sparkles, Check, Shield } from 'lucide-react';
import { MOCK_USER } from '../data/mockUser';

/**
 * UserProfileMenu Component
 * 
 * Elegant SaaS user profile dropdown with click-outside dismissal,
 * escape key handling, status badge, and smooth popup micro-interactions.
 */
export default function UserProfileMenu({ user = MOCK_USER }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeNotice, setActiveNotice] = useState(null);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        if (triggerRef.current) triggerRef.current.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleMenuItemClick = (label, note) => {
    setActiveNotice({ label, note });
    setIsOpen(false);
    setTimeout(() => setActiveNotice(null), 3200);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Toast notification banner for clicked placeholder items */}
      {activeNotice && (
        <div className="absolute bottom-full mb-2 left-0 right-0 p-3 bg-charcoal-900 text-beige-50 text-[11px] rounded-xl shadow-warm-lg animate-fade-in z-50 border border-warm-border/30">
          <div className="flex items-center space-x-1.5 font-bold text-gold-muted">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{activeNotice.label}</span>
          </div>
          <p className="text-[10px] text-charcoal-300 mt-1 leading-snug">
            {activeNotice.note}
          </p>
        </div>
      )}

      {/* Dropdown Menu Popup */}
      {isOpen && (
        <div 
          role="dialog"

          aria-labelledby="user-profile-button"
          className="absolute bottom-full mb-2.5 left-0 right-0 bg-white rounded-2xl border border-warm-border shadow-warm-lg p-2 z-50 animate-fade-in text-xs font-semibold text-charcoal-800"
        >
          {/* User info card */}
          <div className="px-3 py-2.5 bg-[#FAF7F2] rounded-xl border border-warm-border/60 mb-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-charcoal-900 text-xs">{user.name}</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                Active
              </span>
            </div>
            <p className="text-[10px] text-charcoal-500 font-normal truncate mt-0.5">{user.email}</p>
          </div>

          <button
            type="button"
            onClick={() => handleMenuItemClick("My Profile", "Phase 2 Supabase Auth will load user preferences and connected workspace.")}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-beige-100 hover:text-charcoal-900 text-charcoal-700 transition-all duration-180 text-left group"
          >
            <User className="w-4 h-4 text-softbrown group-hover:text-gold-muted transition-colors" />
            <span>My Profile</span>
            <span className="text-[9px] uppercase font-bold text-gold-muted ml-auto bg-gold-light px-1.5 py-0.2 rounded border border-gold-muted/30">
              Demo
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleMenuItemClick("Settings", "Settings will allow configuring custom Tavily search depth and Gemini prompts.")}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-beige-100 hover:text-charcoal-900 text-charcoal-700 transition-all duration-180 text-left group"
          >
            <Settings className="w-4 h-4 text-softbrown group-hover:text-gold-muted transition-colors" />
            <span>Settings</span>
            <span className="text-[9px] uppercase font-bold text-gold-muted ml-auto bg-gold-light px-1.5 py-0.2 rounded border border-gold-muted/30">
              Demo
            </span>
          </button>

          <div className="my-1 border-t border-warm-border/60" />

          <button
            type="button"
            onClick={() => handleMenuItemClick("Help & Support", "View Phase 1 documentation and Phase 2 backend roadmap in README.md.")}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-beige-100 hover:text-charcoal-900 text-charcoal-700 transition-all duration-180 text-left group"
          >
            <HelpCircle className="w-4 h-4 text-softbrown group-hover:text-gold-muted transition-colors" />
            <span>Help & Documentation</span>
          </button>
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        ref={triggerRef}
        id="user-profile-button"
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="profile-trigger w-full p-2.5 rounded-xl border border-warm-border/80 bg-[#F4EFE5] hover:bg-white hover:border-gold-muted/70 hover:shadow-warm transition-all duration-200 ease-out flex items-center justify-between group shadow-warm-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-muted cursor-pointer"
      >
        <div className="flex items-center space-x-2.5 min-w-0">
          {/* Avatar with Initials & Active Dot */}
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-charcoal-900 group-hover:bg-charcoal-800 text-gold-muted flex items-center justify-center font-bold text-xs shadow-warm-sm border border-gold-muted/40 shrink-0 transition-colors">
              {user.initials}
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0 shadow-sm" />
          </div>

          <div className="text-left min-w-0">
            <p className="text-xs font-bold text-charcoal-900 group-hover:text-charcoal-900 truncate leading-snug">
              {user.name}
            </p>
            <p className="text-[10px] text-charcoal-500 font-medium truncate leading-tight">
              {user.workspace}
            </p>
          </div>
        </div>

        <ChevronUp className={`w-3.5 h-3.5 text-charcoal-400 group-hover:text-charcoal-700 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-gold-muted' : ''}`} />
      </button>
    </div>
  );
}
