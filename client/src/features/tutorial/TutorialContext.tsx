import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TUTORIAL_STEPS, TutorialStep } from './tutorialSteps';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';

interface TutorialContextType {
  isOpen: boolean;
  currentStepIndex: number;
  currentStep: TutorialStep;
  totalSteps: number;
  startTutorial: () => void;
  closeTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

const STORAGE_KEY = 'nexus_crm_tutorial_active';
const STEP_KEY = 'nexus_crm_tutorial_step';

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(() => {
    const saved = localStorage.getItem(STEP_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Fetch leads to know the first lead ID for profile/AI steps
  const { data: leadsData } = useQuery({
    queryKey: ['leads', { limit: 1 }],
    queryFn: () => api.getLeads({ limit: 1 }),
  });

  const firstLeadId = leadsData?.data?.[0]?.id;

  const navigateToStepRoute = (index: number) => {
    const step = TUTORIAL_STEPS[index];
    if (!step) return;

    if (step.id === 'profile-timeline' || step.id === 'ai-intelligence') {
      if (firstLeadId) {
        navigate(`/leads/${firstLeadId}`);
      } else {
        navigate('/leads');
      }
    } else {
      if (location.pathname !== step.route) {
        navigate(step.route);
      }
    }
  };

  const startTutorial = () => {
    setIsOpen(true);
    setCurrentStepIndex(0);
    localStorage.setItem(STORAGE_KEY, 'true');
    localStorage.setItem(STEP_KEY, '0');
    navigateToStepRoute(0);
  };

  const closeTutorial = () => {
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, 'false');
  };

  const nextStep = () => {
    if (currentStepIndex < TUTORIAL_STEPS.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      localStorage.setItem(STEP_KEY, nextIdx.toString());
      navigateToStepRoute(nextIdx);
    } else {
      closeTutorial();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      localStorage.setItem(STEP_KEY, prevIdx.toString());
      navigateToStepRoute(prevIdx);
    }
  };

  const goToStep = (index: number) => {
    if (index >= 0 && index < TUTORIAL_STEPS.length) {
      setCurrentStepIndex(index);
      localStorage.setItem(STEP_KEY, index.toString());
      navigateToStepRoute(index);
    }
  };

  // Keyboard navigation (Escape to close, Left/Right for steps)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeTutorial();
      } else if (e.key === 'ArrowRight') {
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        prevStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex]);

  const currentStep = TUTORIAL_STEPS[currentStepIndex] || TUTORIAL_STEPS[0];

  return (
    <TutorialContext.Provider
      value={{
        isOpen,
        currentStepIndex,
        currentStep,
        totalSteps: TUTORIAL_STEPS.length,
        startTutorial,
        closeTutorial,
        nextStep,
        prevStep,
        goToStep,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};
