import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CreateLeadModal } from '../../features/leads/CreateLeadModal';
import { TutorialProvider } from '../../features/tutorial/TutorialContext';
import { TutorialTour } from '../../features/tutorial/TutorialTour';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createLeadOpen, setCreateLeadOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <TutorialProvider>
      <div className="min-h-screen bg-slate-50 flex">
        {/* Sidebar navigation */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main app viewport */}
        <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
          <Header
            onMenuClick={() => setSidebarOpen(true)}
            onOpenCreateLead={() => setCreateLeadOpen(true)}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>

        {/* Interactive Tutorial Tour overlay */}
        <TutorialTour />

        {/* Global create lead modal */}
        <CreateLeadModal
          isOpen={createLeadOpen}
          onClose={() => setCreateLeadOpen(false)}
          onSuccess={(id) => navigate(`/leads/${id}`)}
        />
      </div>
    </TutorialProvider>
  );
};
