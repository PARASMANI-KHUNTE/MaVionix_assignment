import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { LeadsPage } from '../features/leads/LeadsPage';
import { LeadProfilePage } from '../features/leads/LeadProfilePage';
import { PipelinePage } from '../features/pipeline/PipelinePage';
import { FollowUpsPage } from '../features/follow-ups/FollowUpsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'dashboard',
        element: <Navigate to="/" replace />,
      },
      {
        path: 'leads',
        element: <LeadsPage />,
      },
      {
        path: 'leads/:id',
        element: <LeadProfilePage />,
      },
      {
        path: 'pipeline',
        element: <PipelinePage />,
      },
      {
        path: 'follow-ups',
        element: <FollowUpsPage />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
