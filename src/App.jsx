import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BriefingForm from './components/BriefingForm';
import LoadingState from './components/LoadingState';
import ErrorMessage from './components/ErrorMessage';
import EmptyState from './components/EmptyState';
import BriefingResults from './components/BriefingResults';
import GeneratedBriefing, { ResearchSources } from './components/GeneratedBriefing';
import ResearchOnly from './components/ResearchOnly';
import BriefingHistory from './components/BriefingHistory';
import LiveResearchTest from './components/LiveResearchTest';
import { generateBriefing } from './services/briefingService';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import { createBriefingDatabase, databaseMessage } from './services/briefingDatabase';

const database = createBriefingDatabase(supabase);

/**
 * App Component
 * 
 * Central state orchestrator and layout container for BriefMeet AI.
 */
export default function App() {
  const { user } = useAuth();
  return <Dashboard key={user.id} user={user} />;
}

function Dashboard({ user }) {
  const [databaseError, setDatabaseError] = useState('');
  const [databaseBusy, setDatabaseBusy] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyVersion, setHistoryVersion] = useState(0);
  const [saveState, setSaveState] = useState('draft');
  const [recentBriefings, setRecentBriefings] = useState([]);
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

  // Legacy local demo history is deliberately left untouched and never uploaded.
  useEffect(() => {
    let active = true;
    setHistoryLoading(true);
    setRecentBriefings([]);
    database.list().then(items => {
      if (active) setRecentBriefings(items);
    }).catch(err => {
      if (active) setDatabaseError(databaseMessage(err));
    }).finally(() => { if (active) setHistoryLoading(false); });
    return () => { active = false; };
  }, [user.id, historyVersion]);

  const handleSave = async () => {
    if (databaseBusy || !briefing) return;
    setDatabaseBusy(true);
    setDatabaseError('');
    try {
      const draft = { ...briefing, sources: briefing.sourceSnapshot || briefing.sources };
      const saved = await database.save(draft);
      setBriefing(saved);
      setSaveState('saved');
      setHistoryVersion(v => v + 1);
    } catch (err) {
      setSaveState('retry');
      setDatabaseError(err.code === 'SOURCES_INCOMPLETE'
        ? `Report saved, but source rows are incomplete. Retry saving to finish. ${databaseMessage(err.cause)}`
        : databaseMessage(err));
      setHistoryVersion(v => v + 1);
    } finally { setDatabaseBusy(false); }
  };

  const handleDelete = async (item) => {
    if (databaseBusy || !window.confirm(`Delete saved briefing for ${item.targetName} and its sources? This cannot be undone.`)) return;
    setDatabaseBusy(true);
    setDatabaseError('');
    try {
      await database.remove(item.id);
      setRecentBriefings(items => items.filter(row => row.id !== item.id));
      if (briefing?.databaseId === item.id) { setBriefing(null); setCurrentView('history'); }
    } catch (err) { setDatabaseError(databaseMessage(err)); }
    finally { setDatabaseBusy(false); }
  };

  // Main Generation Handler
  const handleGenerateBriefing = async (formData) => {
    if (databaseBusy || isLoading) return;
    setIsLoading(true);
    setError(null);
    setDatabaseError('');
    setSaveState('draft');
    setLoadingStep(1);
    setLastSearchParams(formData);

    try {
      const result = await generateBriefing(
        {
          targetName: formData.targetName,
          targetType: formData.entityType,
          meetingDate: formData.meetingDate,
          meetingTime: formData.meetingTime,
          meetingContext: formData.meetingContext || '',
          simulateError: simulateError
        },
        (progress) => {
          setLoadingStep(progress.step);
        }
      );

      setBriefing({ ...result, targetName: formData.targetName.trim(), targetType: formData.entityType,
        databaseId: crypto.randomUUID(),
        sources: (result.sources || []).map(source => ({ ...source, databaseSourceId: crypto.randomUUID() })),
      });
      setCurrentView('results');

    } catch (err) {
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

  // Reopen the persisted snapshot, never regenerate research from its target name.
  const handleSelectHistoryItem = async (item) => {
    if (databaseBusy || isLoading) return;
    setDatabaseBusy(true);
    setDatabaseError('');
    setError(null);
    try {
      const saved = await database.get(item.id);
      setBriefing(saved);
      setSaveState(saved.sourcesIncomplete ? 'retry' : 'saved');
      setCurrentView('results');
      if (saved.sourcesIncomplete) setDatabaseError('Some source rows are missing. Retry saving to restore the saved citations.');
    } catch (err) { setDatabaseError(databaseMessage(err)); }
    finally { setDatabaseBusy(false); }
  };

  const handleNewBriefing = () => {
    if (databaseBusy || isLoading) return;
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
          {import.meta.env.DEV && user && <LiveResearchTest />}
          <div className="mb-4 rounded-xl border border-warm-border bg-gold-pale px-4 py-3 text-sm text-charcoal-900">
            Live research uses Tavily and Gemini. Review the linked evidence before your meeting. Save explicitly to keep a snapshot in your account.
          </div>
          {databaseError && <div role="alert" className="mb-4 rounded-xl border border-warm-border bg-white p-4 text-sm text-charcoal-900">
            {databaseError}
            <button type="button" disabled={databaseBusy || historyLoading} className="ml-3 underline disabled:opacity-50" onClick={() => { setDatabaseError(''); setHistoryVersion(v => v + 1); }}>Refresh history</button>
          </div>}
          {databaseBusy && <p role="status" className="mb-4 text-sm text-charcoal-700">Saving, opening, or deleting your briefing...</p>}
          {currentView === 'results' && briefing?.hasData && briefing.status !== 'research_only' && <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-charcoal-900 no-print">
            <button type="button" onClick={handleSave} disabled={databaseBusy || saveState === 'saved'} className="rounded-xl bg-charcoal-900 px-4 py-2 text-beige-50 disabled:opacity-60">
              {saveState === 'saved' ? 'Saved to your account' : saveState === 'retry' ? 'Retry saving briefing' : 'Save briefing'}
            </button>
            <span>{briefing.isDemo ? 'Saved demo research (unverified).' : 'AI research with source citations; review for accuracy.'}</span>
          </div>}
          {/* Loading View */}
          {isLoading ? (
            <LoadingState 
              currentStep={loadingStep} 
              targetName={lastSearchParams?.targetName || "Target"} 
            />
          ) : error ? (
            /* Error View */
            <>
            <ErrorMessage
              error={error}
              onRetry={handleRetry}
              onReset={handleNewBriefing}
              onSelectPreset={handleSelectPreset}
            />
            {error.sources?.length > 0 && <ResearchSources sources={error.sources} />}
            </>
          ) : currentView === 'history' && historyLoading ? (
            <p role="status" className="text-charcoal-700">Loading saved briefings...</p>
          ) : currentView === 'history' ? (
            /* History View */
            <BriefingHistory
              history={recentBriefings}
              onSelectBriefing={handleSelectHistoryItem}
              onNewBriefing={handleNewBriefing}
              onDeleteBriefing={handleDelete}
              busy={databaseBusy}
            />
          ) : currentView === 'results' && briefing ? (
            /* Results or Empty View */
            briefing.hasData === false ? (
              <EmptyState
                targetName={briefing.targetName}
                onReset={handleNewBriefing}
                onSelectPreset={handleSelectPreset}
              />
            ) : briefing.status === 'research_only' ? (
              <ResearchOnly briefing={briefing} onBackToGenerator={handleNewBriefing} />
            ) : briefing.researchMode === 'live' ? (
              <GeneratedBriefing briefing={briefing} onBackToGenerator={handleNewBriefing} />
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
              isLoading={isLoading || databaseBusy}
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
              <span>Tavily + Gemini research</span>
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
