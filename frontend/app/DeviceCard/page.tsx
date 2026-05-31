'use client';

import { useState } from 'react';
import Sidebar from '../../src/component/layout/Sidebar';
import Header from '../../src/component/layout/Header';

// Import các Tabs từ thư mục features
import MonitorTab from '../../src/features/dashboard/MonitorTab';
import ListDevicesTab from '../../src/features/dashboard/ListDevicesTab';
import SettingsTab from '../../src/features/dashboard/SettingsTab';
import AboutTab from '../../src/features/dashboard/AboutTab';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('monitor');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Hàm render nội dung linh hoạt dựa vào Tab đang chọn
  const renderContent = () => {
    switch (activeTab) {
      case 'monitor':
        return <MonitorTab isSidebarOpen={isSidebarOpen} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      case 'list_devices':
        return <ListDevicesTab />;
      case 'settings':
        return <SettingsTab />;
      case 'about':
        return <AboutTab />;
      default:
        return <MonitorTab isSidebarOpen={isSidebarOpen} onOpenSidebar={() => setIsSidebarOpen(true)} />;
    }
  };

  return (
    <div className="h-screen w-screen flex bg-slate-50 overflow-hidden font-sans text-slate-800 relative">
      
      {/* Transparent overlay so the map remains visible while sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-transparent transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* Vùng Main Content */}
      <main className="flex-1 h-full w-full relative overflow-hidden">
        {activeTab !== 'monitor' && <Header onOpenSidebar={() => setIsSidebarOpen(true)} />}
        
        <div className={activeTab === 'monitor' ? 'absolute inset-0 w-full h-full z-10' : 'h-[calc(100vh-72px)] px-4 md:px-8 pb-10 pt-2 overflow-y-auto'}>
          {renderContent()}
        </div>
      </main>

    </div>
  );
}