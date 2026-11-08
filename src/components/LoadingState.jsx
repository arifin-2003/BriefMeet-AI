import React from 'react';
import BriefingProgress from './BriefingProgress';

/**
 * LoadingState Component (Backwards compatible wrapper for BriefingProgress)
 */
export default function LoadingState({ currentStep = 1, targetName = "Target" }) {
  return <BriefingProgress currentStep={currentStep} targetName={targetName} />;
}
