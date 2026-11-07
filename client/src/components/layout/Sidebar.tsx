import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  CalendarClock,
  Sparkles,
  X,
  Database,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { data: health } = useQuery({
    queryKey: ['systemHealth'],
    queryFn: () => api.getHealth(),
    staleTime: 60000,
  });

  const navItems = [
    { name: 'Dashboard', to: '/', icon: LayoutDashboard },
    { name: 'Leads', to: '/leads', icon: Users },
    { name: 'Pipeline', to: '/pipeline', icon: KanbanSquare },
    { name: 'Follow-ups', to: '/follow-ups', icon: CalendarClock },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 border-r border-slate-800">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">NexusCRM</h1>
            <p className="text-[11px] font-medium text-blue-400">AI Sales Intelligence</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <p className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Main Menu
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* System Status Pill / Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="rounded-lg bg-slate-800/80 p-3 border border-slate-700/60 text-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-200">System Live</span>
            </div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wide">
              {health?.environment || 'dev'}
            </span>
          </div>

          <div className="space-y-1 text-[11px] text-slate-400">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-slate-400">
                <Database className="h-3 w-3" /> Database
              </span>
              <span className="text-slate-300 font-medium">PostgreSQL</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-slate-400">
                <Sparkles className="h-3 w-3 text-amber-400" /> AI Provider
              </span>
              <span
                className={cn(
                  'font-medium uppercase text-[10px] px-1.5 py-0.5 rounded',
                  health?.aiProvider === 'gemini'
                    ? 'bg-blue-900/60 text-blue-300 border border-blue-700'
                    : 'bg-amber-900/40 text-amber-300 border border-amber-700/60'
                )}
              >
                {health?.aiProvider || 'mock'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile drawer backdrop and sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-y-0 left-0 w-64 z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
