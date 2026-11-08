import React, { useState } from 'react';
import { useTutorial } from './TutorialContext';
import {
  Compass,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Lightbulb,
  Sparkles,
  Minimize2,
  Maximize2,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const TutorialTour: React.FC = () => {
  const {
    isOpen,
    currentStepIndex,
    currentStep,
    totalSteps,
    closeTutorial,
    nextStep,
    prevStep,
    goToStep,
  } = useTutorial();

  const [isMinimized, setIsMinimized] = useState(false);

  if (!isOpen) return null;

  const isLastStep = currentStepIndex === totalSteps - 1;

  if (isMinimized) {
    return (
      <div className="fixed bottom-5 right-5 z-50 animate-bounce">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-full shadow-lg border border-indigo-400/50 text-xs font-semibold transition-all"
        >
          <Compass className="h-4 w-4 animate-spin-slow" />
          <span>Resume Tutorial (Step {currentStepIndex + 1}/{totalSteps})</span>
          <Maximize2 className="h-3.5 w-3.5 ml-1 opacity-80" />
        </button>
      </div>
    );
  }

  return (
    <aside aria-label="Interactive Tutorial Guide" className="fixed bottom-5 right-5 z-50 max-w-md w-[calc(100vw-2.5rem)] sm:w-[420px] shadow-2xl rounded-2xl bg-white border border-indigo-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 px-5 py-3 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/20 rounded-lg">
            <Compass className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-100">
              Interactive Walkthrough
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold">
                Step {currentStepIndex + 1} of {totalSteps}
              </span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-medium">
                {currentStep.badge}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            title="Minimize tutorial"
          >
            <Minimize2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={closeTutorial}
            className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            title="Exit tutorial"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 space-y-3.5">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            {currentStep.title}
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {currentStep.description}
          </p>
        </div>

        {/* Pro Tip Box */}
        {currentStep.tip && (
          <div className="flex items-start gap-2.5 bg-amber-50/70 border border-amber-200/80 p-2.5 rounded-xl text-amber-900 text-xs">
            <Lightbulb className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-800">Pro Tip: </span>
              <span className="text-amber-900/90">{currentStep.tip}</span>
            </div>
          </div>
        )}

        {/* Step Progress Dots */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToStep(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentStepIndex
                  ? 'w-6 bg-indigo-600'
                  : idx < currentStepIndex
                  ? 'w-2 bg-indigo-300'
                  : 'w-2 bg-slate-200 hover:bg-slate-300'
              }`}
              title={`Go to step ${idx + 1}`}
            />
          ))}
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <Button
            size="sm"
            variant="ghost"
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            icon={<ChevronLeft className="h-3.5 w-3.5" />}
          >
            Back
          </Button>

          <div className="flex items-center gap-2">
            <button
              onClick={closeTutorial}
              className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 font-medium transition-colors"
            >
              Skip
            </button>

            <Button
              size="sm"
              variant="primary"
              onClick={nextStep}
              className="bg-indigo-600 hover:bg-indigo-700"
              icon={
                isLastStep ? (
                  <CheckCircle className="h-3.5 w-3.5 text-white" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-white" />
                )
              }
            >
              {isLastStep ? 'Finish Tour' : 'Next Step'}
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
};
