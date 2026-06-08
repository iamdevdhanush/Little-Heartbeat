import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import PwaInstallCard from '../pwa/PwaInstallCard.jsx';

export default function AppLayout() {
  return (
    <div className="app-shell">
      <main className="page-content">
        <Outlet />
      </main>
      <BottomNav />
      <PwaInstallCard />
    </div>
  );
}
