import React, { useState } from 'react';
import { Menu, Plus, Sparkles, Compass, Cloud } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTutorial } from '../../features/tutorial/TutorialContext';
import { NeonCloudModal } from '../neon/NeonCloudModal';

interface HeaderProps {
  onMenuClick: () => void;
  onOpenCreateLead: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, onOpenCreateLead }) => {
  const { startTutorial, isOpen } = useTutorial();
  const [neonModalOpen, setNeonModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </button>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/60">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              AI Lead Intelligence Active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNeonModalOpen(true)}
            className="border-emerald-300 text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100 shadow-2xs font-medium"
            icon={<span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />}
          >
            Neon Cloud
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={startTutorial}
            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50/80 shadow-xs"
            icon={<Compass className="h-4 w-4 text-indigo-600" />}
          >
            {isOpen ? 'Tour Active' : 'Tutorial Mode'}
          </Button>

          <Button
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={onOpenCreateLead}
          >
            Add New Lead
          </Button>
        </div>
      </header>

      <NeonCloudModal isOpen={neonModalOpen} onClose={() => setNeonModalOpen(false)} />
    </>
  );
};
