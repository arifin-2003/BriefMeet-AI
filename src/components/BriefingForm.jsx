import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  User, 
  Calendar, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  AlertCircle,
  HelpCircle,
  Zap,
  Info,
  Target
} from 'lucide-react';
import { DEMO_PRESETS } from '../data/mockBriefings';

/**
 * BriefingForm Component
 * 
 * Pre-meeting input form with real-time field validation,
 * quick demo presets, entity switcher, and smooth interaction states.
 */
export default function BriefingForm({ 
  onSubmit, 
  isLoading, 
  onSelectPreset,
  initialValues = {} 
}) {
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    targetName: initialValues.targetName || '',
    meetingDate: initialValues.meetingDate || today,
    meetingTime: initialValues.meetingTime || '10:00',
    entityType: initialValues.entityType || 'company',
    meetingContext: initialValues.meetingContext || ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Sidebar presets can change while this form remains mounted.
  useEffect(() => {
    if (!initialValues.targetName) return;
    setFormData(previous => ({ ...previous, ...initialValues }));
    setErrors({});
    setTouched({});
  }, [initialValues]);

  // Field change handler
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Blur validation
  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const validateField = (field, value) => {
    let error = null;
    if (field === 'targetName') {
      if (!value || !value.trim()) {
        error = 'Please enter a company name or person name.';
      } else if (value.trim().length < 2) {
        error = 'Name must be at least 2 characters long.';
      }
    }
    if (field === 'meetingDate') {
      if (!value) {
        error = 'Please select the scheduled meeting date.';
      }
    }
    if (field === 'meetingTime') {
      if (!value) {
        error = 'Please specify the meeting time.';
      }
    }
    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const isTargetValid = validateField('targetName', formData.targetName);
    const isDateValid = validateField('meetingDate', formData.meetingDate);
    const isTimeValid = validateField('meetingTime', formData.meetingTime);

    setTouched({
      targetName: true,
      meetingDate: true,
      meetingTime: true
    });

    if (isTargetValid && isDateValid && isTimeValid) {
      onSubmit({
        targetName: formData.targetName.trim(),
        meetingDate: formData.meetingDate,
        meetingTime: formData.meetingTime,
        entityType: formData.entityType,
        meetingContext: formData.meetingContext.trim()
      });
    }
  };

  const applyPreset = (preset) => {
    setFormData({
      targetName: preset.name,
      meetingDate: today,
      meetingTime: '10:30',
      entityType: preset.type,
      meetingContext: `Initial exploratory discussion with ${preset.name}`
    });
    setErrors({});
    if (onSelectPreset) {
      onSelectPreset(preset);
    }
  };

  return (
    <div className="generator-layout w-full mx-auto space-y-5">
      {/* Introduction Hero Card */}
      <div className="intro-card bg-white rounded-2xl border border-warm-border p-6 sm:p-8 shadow-warm relative overflow-hidden transition-all duration-200">
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-softbrown via-gold-muted to-softbrown" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-gold-light border border-gold-muted/40 text-softbrown-dark text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-gold-muted" />
              <span>Phase 1 Prototype</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 tracking-tight leading-tight">
              Prepare for your next meeting
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-600 mt-1 max-w-xl leading-relaxed">
              Enter any company or executive name to generate an executive one-page briefing with 30-day developments, leadership hires, and intelligent questions.
            </p>
          </div>
        </div>

        {/* 1-Click Demo Preset Buttons */}
        <div className="pt-3 border-t border-warm-border/60">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-charcoal-500 flex items-center gap-1.5 mr-1 select-none">
              <Zap className="w-3.5 h-3.5 text-gold-muted" />
              Try Demo Presets:
            </span>
            {DEMO_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(preset)}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-white border border-warm-border hover:border-gold-muted text-charcoal-700 hover:text-charcoal-900 transition-all duration-200 ease-out flex items-center gap-1.5 shadow-warm-sm hover:shadow-warm hover:-translate-y-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-muted cursor-pointer"
              >
                {preset.type === 'person' ? (
                  <User className="w-3 h-3 text-softbrown" />
                ) : (
                  <Building2 className="w-3 h-3 text-softbrown" />
                )}
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Generation Form Card */}
      <form onSubmit={handleSubmit} className="briefing-form bg-white rounded-2xl border border-warm-border p-6 sm:p-8 shadow-warm space-y-6">
        {/* Entity Type Selector */}
        <div>
          <label className="block text-xs font-bold text-charcoal-600 uppercase tracking-wider mb-2">
            Target Type
          </label>
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            <button
              type="button"
              aria-pressed={formData.entityType === 'company'}
              onClick={() => handleChange('entityType', 'company')}
              className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-muted cursor-pointer ${
                formData.entityType === 'company'
                  ? 'bg-charcoal-900 text-beige-50 border-charcoal-900 shadow-warm'
                  : 'bg-warm-surface text-charcoal-700 border-warm-border hover:bg-beige-100 hover:text-charcoal-900 hover:border-warm-borderMuted'
              }`}
            >
              <Building2 className="w-4 h-4 text-gold-muted" />
              <span>Company / Organization</span>
            </button>
            <button
              type="button"
              aria-pressed={formData.entityType === 'person'}
              onClick={() => handleChange('entityType', 'person')}
              className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-muted cursor-pointer ${
                formData.entityType === 'person'
                  ? 'bg-charcoal-900 text-beige-50 border-charcoal-900 shadow-warm'
                  : 'bg-warm-surface text-charcoal-700 border-warm-border hover:bg-beige-100 hover:text-charcoal-900 hover:border-warm-borderMuted'
              }`}
            >
              <User className="w-4 h-4 text-gold-muted" />
              <span>Executive / Person</span>
            </button>
          </div>
        </div>

        {/* Target Name Input */}
        <div>
          <label htmlFor="targetName" className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
            {formData.entityType === 'person' ? 'Person / Executive Name' : 'Company or Organization Name'}
            <span className="text-amber-800 ml-1">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-400">
              {formData.entityType === 'person' ? (
                <User className="w-4 h-4 text-softbrown" />
              ) : (
                <Building2 className="w-4 h-4 text-softbrown" />
              )}
            </div>
            <input
              id="targetName"
              type="text"
              value={formData.targetName}
              onChange={(e) => handleChange('targetName', e.target.value)}
              onBlur={() => handleBlur('targetName')}
              placeholder={formData.entityType === 'person' ? "e.g. Dr. Elena Vance" : "e.g. Acme Robotics or Solis Energy AI"}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-[#FAF7F2]/60 text-charcoal-900 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold-muted/50 ${
                errors.targetName && touched.targetName
                  ? 'border-red-400 focus:border-red-500 bg-red-50/20'
                  : 'border-warm-border focus:border-gold-muted focus:bg-white'
              }`}
            />
          </div>
          {errors.targetName && touched.targetName && (
            <p className="mt-1.5 text-xs text-red-600 flex items-center space-x-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.targetName}</span>
            </p>
          )}
          <p className="mt-1 text-[11px] text-charcoal-500">
            Tip: You can also enter "EmptyCorp" to test empty-state handling, or "error" to test simulated gateway error.
          </p>
        </div>

        {/* Meeting Date & Time Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Meeting Date Picker */}
          <div>
            <label htmlFor="meetingDate" className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
              Meeting Date <span className="text-amber-800">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-400">
                <Calendar className="w-4 h-4 text-softbrown" />
              </div>
              <input
                id="meetingDate"
                type="date"
                value={formData.meetingDate}
                onChange={(e) => handleChange('meetingDate', e.target.value)}
                onBlur={() => handleBlur('meetingDate')}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-[#FAF7F2]/60 text-charcoal-900 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold-muted/50 ${
                  errors.meetingDate && touched.meetingDate
                    ? 'border-red-400 focus:border-red-500 bg-red-50/20'
                    : 'border-warm-border focus:border-gold-muted focus:bg-white'
                }`}
              />
            </div>
            {errors.meetingDate && touched.meetingDate && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center space-x-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.meetingDate}</span>
              </p>
            )}
          </div>

          {/* Meeting Time Input */}
          <div>
            <label htmlFor="meetingTime" className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
              Meeting Time <span className="text-amber-800">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-400">
                <Clock className="w-4 h-4 text-softbrown" />
              </div>
              <input
                id="meetingTime"
                type="time"
                value={formData.meetingTime}
                onChange={(e) => handleChange('meetingTime', e.target.value)}
                onBlur={() => handleBlur('meetingTime')}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-[#FAF7F2]/60 text-charcoal-900 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold-muted/50 ${
                  errors.meetingTime && touched.meetingTime
                    ? 'border-red-400 focus:border-red-500 bg-red-50/20'
                    : 'border-warm-border focus:border-gold-muted focus:bg-white'
                }`}
              />
            </div>
            {errors.meetingTime && touched.meetingTime && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center space-x-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.meetingTime}</span>
              </p>
            )}
          </div>
        </div>

        {/* Meeting Objective / Goal Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="meetingContext" className="block text-xs font-bold uppercase tracking-wider text-charcoal-700">
              Meeting Goal / Objective <span className="text-charcoal-400 font-normal lowercase">(optional)</span>
            </label>
          </div>
          <div className="relative">
            <textarea
              id="meetingContext"
              rows="2"
              value={formData.meetingContext}
              onChange={(e) => handleChange('meetingContext', e.target.value)}
              placeholder="e.g. Sales discovery call, partner integration review, or investor briefing..."
              className="w-full px-4 py-2.5 rounded-xl border border-warm-border bg-[#FAF7F2]/60 text-charcoal-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gold-muted/50 focus:border-gold-muted focus:bg-white transition-all duration-200"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-warm-border/60">
          <div className="text-xs text-charcoal-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-gold-muted shrink-0" />
            <span>Simulates 30-day Tavily search and Gemini executive briefing synthesis</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto min-w-[210px] flex items-center justify-center space-x-2 bg-charcoal-900 hover:bg-charcoal-800 text-beige-50 font-semibold py-3 px-6 rounded-xl shadow-warm hover:shadow-warm-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-muted"
          >
            <Sparkles className="w-4 h-4 text-gold-muted transition-transform duration-200 group-hover:rotate-12" />
            <span>{isLoading ? 'Generating Briefing...' : 'Generate Briefing'}</span>
            <ArrowRight className="w-4 h-4 text-beige-300 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>
      </form>
    </div>
  );
}
