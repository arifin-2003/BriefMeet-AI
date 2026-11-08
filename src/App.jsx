import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BriefingForm from './components/BriefingForm';
import LoadingState from './components/LoadingState';
import ErrorMessage from './components/ErrorMessage';
import EmptyState from './components/EmptyState';
import BriefingResults from './components/BriefingResults';
import BriefingHistory from './components/BriefingHistory';
import { generateBriefing } from './services/briefingService';
import { INITIAL_RECENT_BRIEFINGS, MOCK_BRIEFINGS } from './data/mockBriefings';

/**
 * App Component
 * 
 * Central state orchestrator and layout container for BriefMeet AI.
 */
export default function App() {
  // Navigation & View State
  const [currentView, setCurrentView] = useState('generator'); // 'generator' | 'results' | 'history'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Briefing Generation State
  const [briefing, setBriefing] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1);
  const [error, setError] = useState(null);
  const [simulateError, setSimulateError] = useState(false);

  // Form State & Presets
  const [lastSearchParams, setLastSearchParams] = useState(null);
  const [formInitialValues, setFormInitialValues] = useState({});

  // History State
  const [recentBriefings, setRecentBriefings] = useState(() => {
    try {
      const saved = localStorage.getItem('briefmeet_history');
      return saved ? JSON.parse(saved) : INITIAL_RECENT_BRIEFINGS;
    } catch {
      return INITIAL_RECENT_BRIEFINGS;
    }
  });

  // Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('briefmeet_history', JSON.stringify(recentBriefings));
    } catch (e) {
      console.warn("Could not write history to localStorage:", e);
    }
  }, [recentBriefings]);

  // Main Generation Handler
  const handleGenerateBriefing = async (formData) => {
    setIsLoading(true);
    setError(null);
    setLoadingStep(1);
    setLastSearchParams(formData);

    try {
      const result = await generateBriefing(
        {
          targetName: formData.targetName,
          meetingDate: formData.meetingDate,
          meetingTime: formData.meetingTime,
          meetingContext: formData.meetingContext || '',
          simulateError: simulateError
        },
        (progress) => {
          setLoadingStep(progress.step);
        }
      );

      setBriefing(result);
      setCurrentView('results');

      // If valid data was found, add to recent history
      if (result.hasData) {
        const historyEntry = {
          id: result.id || `hist-${Date.now()}`,
          targetName: result.targetName,
          targetType: result.targetType,
          meetingDate: result.meetingDate,
          meetingTime: result.meetingTime,
          meetingContext: result.meetingContext,
          generatedAt: 'Just now',
          status: 'Ready',
          sourcesCount: result.sources?.length || 0
        };

        setRecentBriefings(prev => [
          historyEntry,
          ...prev.filter(item => item.targetName.toLowerCase() !== result.targetName.toLowerCase())
        ]);
      }
    } catch (err) {
      console.error("Briefing generation error:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Preset Selection Handler
  const handleSelectPreset = (preset) => {
    setFormInitialValues({
      targetName: preset.name,
      meetingDate: new Date().toISOString().split('T')[0],
      meetingTime: '10:30',
      entityType: preset.type,
      meetingContext: `Initial exploratory discussion with ${preset.name}`
    });
    setError(null);
    setCurrentView('generator');
  };

  // History Item Click Handler
  const handleSelectHistoryItem = async (item) => {
    const key = Object.keys(MOCK_BRIEFINGS).find(k => 
      item.targetName.toLowerCase().includes(k) || k.includes(item.targetName.toLowerCase())
    );

    if (key) {
      setBriefing({
        ...MOCK_BRIEFINGS[key],
        meetingDate: item.meetingDate,
        meetingTime: item.meetingTime,
        meetingContext: item.meetingContext || `Review session with ${item.targetName}`,
        generatedAt: new Date().toISOString(),
        hasData: true
      });
      setCurrentView('results');
    } else {
      handleGenerateBriefing({
        targetName: item.targetName,
        meetingDate: item.meetingDate,
        meetingTime: item.meetingTime,
        meetingContext: item.meetingContext || '',
        entityType: item.targetType
      });
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Clear all recent briefing history?")) {
      setRecentBriefings([]);
      try {
        localStorage.removeItem('briefmeet_history');
      } catch {}
    }
  };

  const handleNewBriefing = () => {
    setBriefing(null);
    setError(null);
    setCurrentView('generator');
  };

  const handleRetry = () => {
    if (lastSearchParams) {
      handleGenerateBriefing(lastSearchParams);
    }
  };

  return (
    <div className="app-shell min-h-screen bg-beige-100 flex flex-col font-sans selection:bg-gold-light selection:text-charcoal-900">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onSelectPreset={handleSelectPreset}
        recentBriefings={recentBriefings}
        onSelectHistoryItem={handleSelectHistoryItem}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="app-content lg:pl-72 flex-1 flex flex-col min-w-0 transition-all">
        {/* Header Bar */}
        <Header
          onNewBriefing={handleNewBriefing}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          simulateError={simulateError}
          setSimulateError={setSimulateError}
          currentBriefing={currentView === 'results' ? briefing : null}
        />

        {/* Dynamic Page Views */}
        <main className="dashboard-main flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Loading View */}
          {isLoading ? (
            <LoadingState 
              currentStep={loadingStep} 
              targetName={lastSearchParams?.targetName || "Target"} 
            />
          ) : error ? (
            /* Error View */
            <ErrorMessage
              error={error}
              onRetry={handleRetry}
              onReset={handleNewBriefing}
              onSelectPreset={handleSelectPreset}
            />
          ) : currentView === 'history' ? (
            /* History View */
            <BriefingHistory
              history={recentBriefings}
              onSelectBriefing={handleSelectHistoryItem}
              onNewBriefing={handleNewBriefing}
              onClearHistory={handleClearHistory}
            />
          ) : currentView === 'results' && briefing ? (
            /* Results or Empty View */
            briefing.hasData === false ? (
              <EmptyState
                targetName={briefing.targetName}
                onReset={handleNewBriefing}
                onSelectPreset={handleSelectPreset}
              />
            ) : (
              <BriefingResults
                briefing={briefing}
                onBackToGenerator={handleNewBriefing}
              />
            )
          ) : (
            /* Default Generator Form View */
            <BriefingForm
              onSubmit={handleGenerateBriefing}
              isLoading={isLoading}
              onSelectPreset={handleSelectPreset}
              initialValues={formInitialValues}
            />
          )}
        </main>

        {/* Global Footer (No hackathon text, professional SaaS footer) */}
        <footer className="border-t border-warm-border py-4 px-6 text-center text-xs text-charcoal-500 bg-[#EFE9DC]/60 no-print">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="font-medium text-charcoal-600">
              <strong className="text-charcoal-900">BriefMeet AI</strong> — Professional Pre-Meeting Research Assistant
            </span>
            <div className="flex items-center space-x-3 text-[11px] text-charcoal-500 font-medium">
              <span>Phase 1 Prototype</span>
              <span>•</span>
              <span>React + Vite</span>
              <span>•</span>
              <span>Tailwind CSS</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
