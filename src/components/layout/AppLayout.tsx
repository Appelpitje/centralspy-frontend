import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const AppLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-sand-100 text-ink flex flex-col font-sans">
      <Header onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex-1 flex min-h-0">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
